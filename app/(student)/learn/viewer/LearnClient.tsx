"use client";

import { useEffect, useState, Suspense, useCallback } from "react";
import { getLessonsByCourseId, getCourseById, getUserProgress, markLessonComplete } from "@/lib/firestore";
import { Lesson, Course } from "@/types/firestore";
import { useAuth } from "@/context/auth-context";
import WistiaPlayer from "@/components/WistiaPlayer";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

function LearnViewerContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const courseId = searchParams.get("id");
  
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>([]);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    async function fetchData() {
      if (!courseId) {
        router.push("/dashboard");
        return;
      }
      
      setLoading(true);
      try {
        const [courseData, lessonsData] = await Promise.all([
          getCourseById(courseId),
          getLessonsByCourseId(courseId)
        ]);
        
        setCourse(courseData);
        const publishedLessons = lessonsData.filter(l => l.published !== false);
        setLessons(publishedLessons);
        if (publishedLessons.length > 0) {
          setActiveLesson(publishedLessons[0]);
        }

        if (user) {
          const progressData = await getUserProgress(user.uid, courseId);
          setCompletedLessonIds(progressData);
        }
      } catch (error) {
        console.error("Failed to fetch learning data:", error);
      } finally {
        setLoading(false);
      }
    }
    
    if (!authLoading && courseId) {
      fetchData();
    }
  }, [courseId, user, authLoading, router]);

  const handleMarkComplete = useCallback(async () => {
    if (!user || !activeLesson || !courseId) return;
    
    setMarking(true);
    try {
      await markLessonComplete(user.uid, courseId, activeLesson.id);
      setCompletedLessonIds(prev => [...prev, activeLesson.id]);
    } catch (error) {
      console.error("Failed to mark lesson complete:", error);
    } finally {
      setMarking(false);
    }
  }, [user, activeLesson, courseId]);


  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-950 text-white">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-zinc-800 border-t-white" />
      </div>
    );
  }

  if (!course || lessons.length === 0) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-zinc-950 text-white text-center px-4">
        <h1 className="text-3xl font-black tracking-tight">Curriculum Pending</h1>
        <p className="mt-4 max-w-md text-zinc-500 font-medium text-lg">
          We couldn&apos;t find any lessons for this course yet.
        </p>
        <Link href="/dashboard" className="mt-10 rounded-full bg-white px-10 py-3 text-sm font-black text-black transition-all hover:scale-105 active:scale-95">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-64px)] flex-col bg-zinc-950 text-zinc-50 lg:flex-row overflow-hidden">
      {/* LEFT: Video Player Section */}
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        <div className="sticky top-0 z-10 bg-black shadow-2xl lg:relative">
          <div className="mx-auto max-w-6xl">
            <div className="relative aspect-video w-full overflow-hidden bg-zinc-900 md:rounded-b-2xl">
              {activeLesson && (
                <WistiaPlayer
                  mediaId={activeLesson.wistiaMediaId || ""}
                  title={activeLesson.title}
                  onComplete={handleMarkComplete}
                />
              )}
            </div>
          </div>
        </div>
        
        {/* Lesson Info */}
        <div className="mx-auto max-w-6xl p-6 md:p-10">
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div className="space-y-2">
              <Link href={`/courses/view?id=${course.id}`} className="text-xs font-bold uppercase tracking-widest text-zinc-500 hover:text-zinc-300">
                {course.title}
              </Link>
              <h1 className="text-3xl font-black tracking-tight md:text-4xl lg:text-5xl">
                {activeLesson?.title}
              </h1>
            </div>

            <div className="flex shrink-0 items-center gap-3">
              {activeLesson && !completedLessonIds.includes(activeLesson.id) ? (
                <button
                  onClick={handleMarkComplete}
                  disabled={marking}
                  className="flex items-center gap-2 rounded-full bg-white px-8 py-3 text-sm font-bold text-black transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                >
                  {marking ? "Syncing..." : "Mark as Completed"}
                </button>
              ) : activeLesson && (
                <div className="flex items-center gap-2 rounded-full bg-green-500/10 border border-green-500/20 px-6 py-3 text-sm font-bold text-green-500">
                  Lesson Completed
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT: Sidebar */}
      <div className="w-full shrink-0 border-t border-zinc-800 bg-zinc-950 lg:w-[450px] lg:border-l lg:border-t-0 flex flex-col h-full overflow-hidden shadow-2xl">
        <div className="border-b border-zinc-800 p-8">
          <h2 className="text-xl font-black tracking-tight text-white">Curriculum</h2>
          <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-zinc-900">
            <div 
              className="h-full bg-white transition-all duration-1000" 
              style={{ width: `${(completedLessonIds.length / lessons.length) * 100}%` }}
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {lessons.map((lesson) => (
            <button
              key={lesson.id}
              onClick={() => setActiveLesson(lesson)}
              className={`group flex w-full items-start gap-4 rounded-2xl p-5 text-left transition-all ${
                activeLesson?.id === lesson.id ? "bg-white text-black" : "hover:bg-zinc-900 text-zinc-400"
              }`}
            >
              <div className="flex-1">
                <h3 className={`text-sm font-bold ${activeLesson?.id === lesson.id ? "text-black" : "text-zinc-200"}`}>
                  {lesson.title}
                </h3>
                <span className="text-xs text-zinc-500">{lesson.duration}</span>
              </div>
              {completedLessonIds.includes(lesson.id) && (
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500 text-white">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function LearnClient() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center bg-zinc-950 text-white">Loading...</div>}>
      <LearnViewerContent />
    </Suspense>
  );
}
