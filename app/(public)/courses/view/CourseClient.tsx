"use client";

import { useEffect, useState, Suspense } from "react";
import { getCourseById, getLessonsByCourseId, isUserEnrolled, enrollUserInCourse } from "@/lib/firestore";
import { Course, Lesson } from "@/types/firestore";
import { useAuth } from "@/context/auth-context";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

function CourseViewContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const courseId = searchParams.get("id");
  
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    async function fetchData() {
      if (!courseId) {
        router.push("/courses/");
        return;
      }
      
      setLoading(true);
      try {
        const [courseData, lessonsData] = await Promise.all([
          getCourseById(courseId),
          getLessonsByCourseId(courseId)
        ]);
        
        setCourse(courseData);
        setLessons(lessonsData);

        if (user) {
          const enrolled = await isUserEnrolled(user.uid, courseId);
          setIsEnrolled(enrolled);
        }
      } catch (error) {
        console.error("Failed to fetch course details:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [courseId, user, router]);

  const handleEnroll = async () => {
    if (!user) {
      router.push("/login/");
      return;
    }
    if (!courseId) return;

    setEnrolling(true);
    try {
      await enrollUserInCourse(user.uid, courseId);
      setIsEnrolled(true);
    } catch (error) {
      console.error("Enrollment failed:", error);
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white dark:bg-black">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-zinc-200 border-t-zinc-900 dark:border-t-zinc-50" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-white dark:bg-black text-center px-4">
        <h1 className="text-4xl font-black text-zinc-900 dark:text-zinc-50">Course Not Found</h1>
        <p className="mt-4 text-zinc-500 max-w-md">The course you are looking for might have been removed or the link is broken.</p>
        <Link href="/courses/" className="mt-8 rounded-full bg-zinc-900 px-8 py-3 text-sm font-black text-white dark:bg-white dark:text-black">
          Back to Courses
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      {/* Hero Section */}
      <div className="relative bg-zinc-900 py-24 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img src={course.thumbnail} alt="" className="h-full w-full object-cover blur-3xl scale-110" />
        </div>
        <div className="container relative mx-auto px-6">
          <div className="max-w-3xl">
            <h1 className="text-5xl font-black tracking-tight md:text-7xl">{course.title}</h1>
            <p className="mt-8 text-xl font-medium text-zinc-400 leading-relaxed">{course.description}</p>
            
            <div className="mt-12 flex flex-wrap items-center gap-8">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-white/10 p-3">
                  <svg className="text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-zinc-500">Duration</p>
                  <p className="font-bold">Approx. 4 Hours</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-white/10 p-3">
                  <svg className="text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-zinc-500">Modules</p>
                  <p className="font-bold">{lessons.length} Lessons</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto grid gap-12 px-6 py-16 lg:grid-cols-3">
        {/* Curriculum */}
        <div className="lg:col-span-2 space-y-12">
          <section>
            <h2 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">Course Curriculum</h2>
            <div className="mt-8 divide-y divide-zinc-100 rounded-[2.5rem] border border-zinc-200 bg-white dark:divide-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 overflow-hidden shadow-sm">
              {lessons.map((lesson, idx) => (
                <div key={lesson.id} className="group flex items-center justify-between p-8 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                  <div className="flex items-center gap-6">
                    <span className="text-xs font-black text-zinc-400 tracking-widest uppercase">Lesson {idx + 1}</span>
                    <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">{lesson.title}</h3>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs font-bold text-zinc-500">{lesson.duration}</span>
                    <svg className="h-5 w-5 text-zinc-300" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
                    </svg>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Sidebar / Enrollment */}
        <div className="lg:col-start-3">
          <div className="sticky top-24 space-y-6">
            <div className="rounded-[3rem] border border-zinc-200 bg-white p-10 shadow-2xl dark:border-zinc-800 dark:bg-zinc-950">
              <div className="mb-8">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400">One-time Investment</p>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-5xl font-black text-zinc-900 dark:text-zinc-50">₹{course.price}</span>
                  <span className="text-sm font-bold text-zinc-500 line-through decoration-red-500 decoration-2">₹1,999</span>
                </div>
              </div>

              {isEnrolled ? (
                <Link
                  href={`/learn/viewer/?id=${course.id}`}
                  className="flex w-full items-center justify-center rounded-full bg-green-500 py-5 text-sm font-black text-white shadow-xl transition-all hover:scale-105 active:scale-95"
                >
                  Continue Learning →
                </Link>
              ) : (
                <button
                  onClick={handleEnroll}
                  disabled={enrolling}
                  className="flex w-full items-center justify-center rounded-full bg-zinc-900 py-5 text-sm font-black text-white shadow-2xl transition-all hover:scale-105 active:scale-95 disabled:opacity-50 dark:bg-white dark:text-black"
                >
                  {enrolling ? "Enrolling..." : "Enroll Now"}
                </button>
              )}

              <p className="mt-8 text-center text-[10px] font-black uppercase tracking-widest text-zinc-400">
                Lifetime Access • Certificate included
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CourseClient() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center bg-zinc-950 text-white">Loading...</div>}>
      <CourseViewContent />
    </Suspense>
  );
}
