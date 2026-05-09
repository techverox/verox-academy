"use client";

import { useEffect, useState, use } from "react";
import { getLessonsByCourseId, getUserProgress, markLessonComplete, getCourseById } from "@/lib/firestore";
import { Lesson, Course } from "@/types/firestore";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LearnPage({ params: paramsPromise }: { params: Promise<{ courseId: string }> }) {
  const params = use(paramsPromise);
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>([]);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    async function fetchData() {
      if (!user) return;
      try {
        const [courseData, lessonsData, progressData] = await Promise.all([
          getCourseById(params.courseId),
          getLessonsByCourseId(params.courseId),
          getUserProgress(user.uid, params.courseId)
        ]);
        
        if (!courseData) {
          router.push("/courses");
          return;
        }

        setCourse(courseData);
        setLessons(lessonsData);
        setCompletedLessonIds(progressData);
        
        if (lessonsData.length > 0) {
          setActiveLesson(lessonsData[0]);
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [params.courseId, user, router]);

  const handleMarkComplete = async () => {
    if (!user || !activeLesson) return;
    
    setMarking(true);
    try {
      await markLessonComplete(user.uid, params.courseId, activeLesson.id);
      setCompletedLessonIds(prev => [...prev, activeLesson.id]);
    } catch (error) {
      console.error("Failed to mark lesson complete:", error);
    } finally {
      setMarking(false);
    }
  };

  // Helper to get YouTube embed URL
  const getEmbedUrl = (url: string) => {
    try {
      const videoId = url.split("v=")[1]?.split("&")[0] || url.split("/").pop();
      return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`;
    } catch {
      return url;
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-zinc-800 border-t-zinc-50" />
          <p className="text-sm font-medium text-zinc-500 animate-pulse">Initializing your classroom...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-64px)] flex-col bg-zinc-950 text-zinc-50 lg:flex-row overflow-hidden">
      {/* LEFT: Video Player Section */}
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        {/* Cinematic Video Container */}
        <div className="sticky top-0 z-10 bg-black shadow-2xl lg:relative">
          <div className="mx-auto max-w-6xl">
            <div className="relative aspect-video w-full overflow-hidden bg-zinc-900 md:rounded-b-2xl">
              {activeLesson ? (
                <iframe
                  className="h-full w-full"
                  src={getEmbedUrl(activeLesson.videoUrl)}
                  title={activeLesson.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-zinc-500">
                  No lessons available for this course.
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Lesson Info Section */}
        <div className="mx-auto max-w-6xl p-6 md:p-10">
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div className="space-y-2">
              <Link 
                href={`/courses/${course?.id}`}
                className="text-xs font-bold uppercase tracking-widest text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                {course?.title}
              </Link>
              <h1 className="text-3xl font-black tracking-tight md:text-4xl lg:text-5xl">
                {activeLesson?.title || "Welcome to Class"}
              </h1>
            </div>

            <div className="flex shrink-0 items-center gap-3">
              {activeLesson && !completedLessonIds.includes(activeLesson.id) ? (
                <button
                  onClick={handleMarkComplete}
                  disabled={marking}
                  className="flex items-center gap-2 rounded-full bg-white px-8 py-3 text-sm font-bold text-black transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                >
                  {marking ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-900" />
                  ) : (
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                  {marking ? "Syncing..." : "Mark as Completed"}
                </button>
              ) : activeLesson && (
                <div className="flex items-center gap-2 rounded-full bg-green-500/10 border border-green-500/20 px-6 py-3 text-sm font-bold text-green-500">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                  </svg>
                  Lesson Completed
                </div>
              )}
            </div>
          </div>

          <div className="mt-10 grid gap-10 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <h3 className="text-lg font-bold text-zinc-200">About this lesson</h3>
              <p className="mt-4 text-lg leading-relaxed text-zinc-400">
                {activeLesson?.description || "Select a lesson from the sidebar to start learning. Master the concepts through hands-on practice."}
              </p>
            </div>
            
            <div className="rounded-3xl border border-zinc-800 bg-zinc-900/30 p-6 backdrop-blur-sm">
              <h4 className="text-sm font-bold text-zinc-500 uppercase tracking-widest">Instructor</h4>
              <div className="mt-4 flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-900" />
                <div>
                  <p className="font-bold text-zinc-200">Verox Academy</p>
                  <p className="text-xs text-zinc-500">Expert Learning Partner</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT: Lessons Sidebar */}
      <div className="w-full shrink-0 border-t border-zinc-800 bg-zinc-950 lg:w-[450px] lg:border-l lg:border-t-0 flex flex-col h-full overflow-hidden shadow-2xl">
        <div className="border-b border-zinc-800 p-8">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black tracking-tight">Curriculum</h2>
            <div className="rounded-full bg-zinc-900 px-3 py-1 text-xs font-bold text-zinc-500 border border-zinc-800">
              {lessons.length} Modules
            </div>
          </div>
          <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-zinc-900">
            <div 
              className="h-full bg-white transition-all duration-1000 ease-out" 
              style={{ width: `${(completedLessonIds.length / lessons.length) * 100}%` }}
            />
          </div>
          <p className="mt-2 text-xs font-bold text-zinc-600 uppercase tracking-tighter">
            {Math.round((completedLessonIds.length / lessons.length) * 100)}% Course Completed
          </p>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-thin scrollbar-thumb-zinc-800 hover:scrollbar-thumb-zinc-700 transition-colors">
          {lessons.map((lesson) => {
            const isCompleted = completedLessonIds.includes(lesson.id);
            const isActive = activeLesson?.id === lesson.id;
            
            return (
              <button
                key={lesson.id}
                onClick={() => setActiveLesson(lesson)}
                className={`group flex w-full items-start gap-4 rounded-2xl p-5 text-left transition-all duration-300 ${
                  isActive
                    ? "bg-white text-black shadow-2xl scale-[1.02]"
                    : "hover:bg-zinc-900 text-zinc-400"
                }`}
              >
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl transition-all duration-300 ${
                  isActive 
                    ? "bg-black text-white" 
                    : isCompleted 
                      ? "bg-green-500/20 text-green-500" 
                      : "bg-zinc-900 text-zinc-600 group-hover:bg-zinc-800"
                }`}>
                  {isCompleted ? (
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : isActive ? (
                    <svg className="h-6 w-6 animate-pulse" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  ) : (
                    <span className="text-sm font-black">{lesson.order}</span>
                  )}
                </div>
                
                <div className="flex-1 overflow-hidden">
                  <h3 className={`text-sm font-bold leading-snug ${
                    isActive ? "text-black" : "text-zinc-200 group-hover:text-white"
                  }`}>
                    {lesson.title}
                  </h3>
                  <div className={`mt-1.5 flex items-center gap-3 text-xs font-bold ${
                    isActive ? "text-zinc-500" : "text-zinc-600"
                  }`}>
                    <span className="flex items-center gap-1">
                      <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {lesson.duration}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
