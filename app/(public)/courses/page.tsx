"use client";

import { useEffect, useState, useCallback } from "react";
import CourseCard from "@/components/CourseCard";
import CourseSkeleton from "@/components/CourseSkeleton";
import { getCourses } from "@/lib/firestore";
import { Course } from "@/types/firestore";

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getCourses();
      setCourses(data);
    } catch (err: any) {
      console.error("Error fetching courses:", err);
      setError("Unable to connect to the classroom. Please check your internet connection.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses, retryCount]);

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
  };

  return (
    <main className="container mx-auto px-4 py-16 md:px-8">
      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 md:text-5xl">
            Explore Courses
          </h1>
          <p className="mt-4 text-xl text-zinc-500 dark:text-zinc-400">
            Professional Indian creator-style courses for the next generation.
          </p>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <CourseSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <div className="mt-20 flex flex-col items-center justify-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-500 dark:bg-red-950/20">
            <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="mt-4 text-lg font-bold text-zinc-900 dark:text-zinc-50">Connection Issue</h3>
          <p className="mt-2 max-w-sm text-zinc-500">{error}</p>
          <button
            onClick={handleRetry}
            className="mt-6 rounded-full bg-zinc-900 px-8 py-2 text-sm font-bold text-zinc-50 transition-all hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900"
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* Course Grid */}
      {!loading && !error && courses.length > 0 && (
        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && courses.length === 0 && (
        <div className="mt-20 flex flex-col items-center justify-center text-center py-20 px-4">
          <div className="flex h-24 w-24 items-center justify-center rounded-[2.5rem] bg-zinc-50 text-zinc-300 dark:bg-zinc-900 dark:text-zinc-700 shadow-inner">
            <svg className="h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h2 className="mt-8 text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">Courses Coming Soon</h2>
          <p className="mt-4 max-w-sm text-lg font-medium text-zinc-500">
            We&apos;re currently preparing a selection of world-class courses for you. Join our newsletter to be notified!
          </p>
          <div className="mt-10 flex gap-4">
            <button className="rounded-full bg-zinc-900 px-8 py-3 text-sm font-black text-zinc-50 transition-all hover:scale-105 active:scale-95 dark:bg-zinc-50 dark:text-zinc-900">
              Notify Me
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
