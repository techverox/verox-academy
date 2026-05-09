"use client";

import { useEffect, useState, use } from "react";
import Image from "next/image";
import { getCourseById, enrollUserInCourse, isUserEnrolled } from "@/lib/firestore";
import { Course } from "@/types/firestore";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";

export default function CourseDetailPage({ params: paramsPromise }: { params: Promise<{ id: string }> }) {
  const params = use(paramsPromise);
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getCourseById(params.id);
        if (!data) {
          router.push("/courses");
          return;
        }
        setCourse(data);

        // Check enrollment if user is logged in
        if (user) {
          const enrolled = await isUserEnrolled(user.uid, params.id);
          setIsEnrolled(enrolled);
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    }
    if (!authLoading) {
      fetchData();
    }
  }, [params.id, router, user, authLoading]);

  const handleEnroll = async () => {
    if (!user) {
      router.push("/login");
      return;
    }

    if (isEnrolled) {
      router.push(`/learn/${params.id}`);
      return;
    }

    setEnrolling(true);
    try {
      await enrollUserInCourse(user.uid, params.id);
      setIsEnrolled(true);
      router.push(`/learn/${params.id}`);
    } catch (error) {
      console.error("Enrollment failed:", error);
    } finally {
      setEnrolling(false);
    }
  };

  if (loading || authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-zinc-200 border-t-zinc-900 dark:border-t-zinc-50" />
      </div>
    );
  }

  if (!course) return null;

  const dummyLessons = [
    { title: "Introduction to the Course", duration: "10:00" },
    { title: "Setting up your environment", duration: "15:30" },
    { title: "Building your first component", duration: "45:00" },
    { title: "Advanced patterns and best practices", duration: "32:20" },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-black text-zinc-900 dark:text-zinc-50 transition-colors">
      {/* Hero Section */}
      <div className="relative h-[400px] w-full bg-zinc-900 md:h-[500px]">
        <Image
          src={course.thumbnail}
          alt={course.title}
          fill
          className="object-cover opacity-40 blur-sm"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="container mx-auto px-4 md:px-8">
            <div className="max-w-3xl">
              <span className="rounded-full bg-zinc-50/10 px-3 py-1 text-sm font-medium text-zinc-300 backdrop-blur-md border border-zinc-50/10">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {(course as any).category || "Premium Course"}
              </span>
              <h1 className="mt-6 text-4xl font-black text-white sm:text-6xl tracking-tight leading-tight">
                {course.title}
              </h1>
              <p className="mt-6 text-xl text-zinc-300 line-clamp-3 font-medium">
                {course.description}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="container mx-auto px-4 py-16 md:px-8">
        <div className="grid gap-16 lg:grid-cols-3">
          {/* Main Column */}
          <div className="lg:col-span-2">
            <div className="space-y-16">
              {/* Preview Video Placeholder */}
              <section>
                <h2 className="text-3xl font-black tracking-tight">Course Preview</h2>
                <div className="mt-8 aspect-video overflow-hidden rounded-3xl bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center border border-zinc-200 dark:border-zinc-800 shadow-inner">
                  <div className="flex flex-col items-center gap-4">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-zinc-900/10 dark:bg-white/10 backdrop-blur-md hover:scale-110 transition-transform cursor-pointer">
                      <svg className="h-10 w-10 text-zinc-900 dark:text-zinc-50" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                    <span className="text-sm font-bold text-zinc-500 uppercase tracking-widest">Watch Preview</span>
                  </div>
                </div>
              </section>

              {/* Curriculum */}
              <section>
                <h2 className="text-3xl font-black tracking-tight">Curriculum</h2>
                <div className="mt-8 space-y-4">
                  {dummyLessons.map((lesson, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between rounded-2xl border border-zinc-100 bg-white p-5 transition-all hover:bg-zinc-50 dark:border-zinc-900 dark:bg-zinc-950 dark:hover:bg-zinc-900 shadow-sm"
                    >
                      <div className="flex items-center gap-5">
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 text-sm font-black text-zinc-500 dark:bg-zinc-900">
                          {i + 1}
                        </span>
                        <span className="font-bold text-zinc-900 dark:text-zinc-50 text-lg">{lesson.title}</span>
                      </div>
                      <span className="text-sm font-bold text-zinc-400">{lesson.duration}</span>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:sticky lg:top-24 lg:h-fit">
            <div className="rounded-[2.5rem] border border-zinc-200 bg-white p-10 shadow-2xl dark:border-zinc-800 dark:bg-zinc-950">
              <div className="text-center md:text-left flex items-baseline gap-2">
                <span className="text-5xl font-black text-zinc-900 dark:text-zinc-50">₹{course.price}</span>
                <span className="text-lg text-zinc-400 line-through font-bold">₹{course.price + 1000}</span>
              </div>
              
              <div className="mt-10 space-y-4">
                <button 
                  onClick={handleEnroll}
                  disabled={enrolling}
                  className="flex w-full items-center justify-center rounded-full bg-zinc-900 py-5 text-xl font-black text-zinc-50 shadow-xl transition-all hover:scale-[1.03] active:scale-95 disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900"
                >
                  {enrolling ? (
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-500 border-t-zinc-50 dark:border-zinc-400 dark:border-t-zinc-900" />
                  ) : isEnrolled ? (
                    "Go to Course"
                  ) : (
                    "Enroll Now"
                  )}
                </button>
                <p className="text-center text-xs font-bold text-zinc-400 uppercase tracking-widest">
                  30-Day Money-Back Guarantee
                </p>
              </div>

              <div className="mt-10 space-y-6">
                <h4 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400">Included in this course:</h4>
                <ul className="space-y-4 text-sm font-bold text-zinc-600 dark:text-zinc-400">
                  <li className="flex items-center gap-4">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500/10 text-green-500">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    Full lifetime access
                  </li>
                  <li className="flex items-center gap-4">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500/10 text-green-500">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    Access on mobile and TV
                  </li>
                  <li className="flex items-center gap-4">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500/10 text-green-500">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    Certificate of completion
                  </li>
                </ul>
              </div>

              <div className="mt-12 border-t border-zinc-100 pt-10 dark:border-zinc-900">
                <div className="flex items-center gap-5">
                  <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-zinc-700 to-zinc-900 shadow-lg" />
                  <div>
                    <p className="text-lg font-black text-zinc-900 dark:text-zinc-50 leading-tight">Verox Academy</p>
                    <p className="text-sm font-bold text-zinc-500">Master Instructor</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
