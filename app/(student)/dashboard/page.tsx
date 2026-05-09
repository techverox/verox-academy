"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/hooks/use-auth";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { getUserDashboardStats } from "@/lib/firestore";
import Link from "next/link";
import Image from "next/image";

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await getUserDashboardStats(user.uid);
      setStats(data);
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
      setError("Unable to load your progress. Please check your connection.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  if (!user && !loading) return null;

  return (
    <main className="container mx-auto min-h-[calc(100vh-64px)] p-4 md:p-8">
      {/* Header Section */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">
            Welcome back, {user?.displayName?.split(" ")[0] || "Student"}!
          </h1>
          <p className="text-lg font-medium text-zinc-500 dark:text-zinc-400">
            Keep pushing forward. Your progress is looking great!
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => signOut(auth)}
            className="inline-flex h-11 items-center justify-center rounded-full border border-zinc-200 bg-white px-8 py-2 text-sm font-bold text-zinc-900 shadow-sm transition-all hover:bg-zinc-50 active:scale-95 dark:border-zinc-800 dark:bg-black dark:text-zinc-50 dark:hover:bg-zinc-900"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          [...Array(3)].map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-3xl bg-zinc-100 dark:bg-zinc-900" />
          ))
        ) : (
          <>
            <div className="rounded-3xl border border-zinc-100 bg-white p-8 shadow-sm dark:border-zinc-900 dark:bg-zinc-950">
              <p className="text-xs font-black uppercase tracking-widest text-zinc-400">Enrolled Courses</p>
              <p className="mt-4 text-4xl font-black text-zinc-900 dark:text-zinc-50">{stats?.totalEnrolled || 0}</p>
            </div>
            <div className="rounded-3xl border border-zinc-100 bg-white p-8 shadow-sm dark:border-zinc-900 dark:bg-zinc-950">
              <p className="text-xs font-black uppercase tracking-widest text-zinc-400">Completed Lessons</p>
              <p className="mt-4 text-4xl font-black text-zinc-900 dark:text-zinc-50">{stats?.totalCompletedLessons || 0}</p>
            </div>
            <div className="rounded-3xl border border-zinc-100 bg-white p-8 shadow-sm dark:border-zinc-900 dark:bg-zinc-950">
              <p className="text-xs font-black uppercase tracking-widest text-zinc-400">Learning Hours</p>
              <p className="mt-4 text-4xl font-black text-zinc-900 dark:text-zinc-50">{stats?.totalHours || 0}h</p>
            </div>
          </>
        )}
      </div>

      {/* My Learning Section */}
      <div className="mt-16">
        <h2 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">My Learning</h2>
        
        {loading ? (
          <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-64 animate-pulse rounded-[2.5rem] bg-zinc-100 dark:bg-zinc-900" />
            ))}
          </div>
        ) : stats?.enrolledCourses.length > 0 ? (
          <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {stats.enrolledCourses.map((course: any) => (
              <div key={course.courseId} className="group flex flex-col overflow-hidden rounded-[2.5rem] border border-zinc-100 bg-white shadow-sm transition-all hover:shadow-xl dark:border-zinc-900 dark:bg-zinc-950">
                <div className="relative aspect-video w-full overflow-hidden">
                  <Image
                    src={course.thumbnail}
                    alt={course.courseTitle}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-4 left-6">
                    <span className="rounded-full bg-white/20 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white backdrop-blur-md">
                      {course.completedCount}/{course.totalLessons} Lessons
                    </span>
                  </div>
                </div>
                
                <div className="flex flex-1 flex-col p-8">
                  <h3 className="text-xl font-black text-zinc-900 dark:text-zinc-50 line-clamp-1">
                    {course.courseTitle}
                  </h3>
                  
                  {/* Progress Bar */}
                  <div className="mt-6 space-y-2">
                    <div className="flex justify-between text-xs font-black uppercase tracking-widest">
                      <span className="text-zinc-400">Progress</span>
                      <span className="text-zinc-900 dark:text-zinc-50">{course.percentage}%</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-900">
                      <div 
                        className="h-full bg-zinc-900 transition-all duration-1000 ease-out dark:bg-white"
                        style={{ width: `${course.percentage}%` }}
                      />
                    </div>
                  </div>

                  <Link
                    href={`/learn/viewer/?id=${course.courseId}`}
                    className="mt-8 flex items-center justify-center rounded-full bg-zinc-900 py-4 text-sm font-black text-zinc-50 transition-all hover:scale-[1.02] active:scale-95 dark:bg-zinc-50 dark:text-zinc-900 shadow-lg"
                  >
                    Continue Learning
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-8 flex flex-col items-center justify-center rounded-[3rem] border border-zinc-100 bg-white py-24 text-center shadow-sm dark:border-zinc-900 dark:bg-zinc-950/50">
            <div className="flex h-24 w-24 items-center justify-center rounded-[2.5rem] bg-zinc-50 text-zinc-300 dark:bg-zinc-900 dark:text-zinc-700">
              <svg className="h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="mt-8 text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">Ready to start?</h3>
            <p className="mt-4 max-w-sm text-lg font-medium text-zinc-500 dark:text-zinc-400">
              You haven&apos;t enrolled in any courses yet. Pick your first course and start building your future.
            </p>
            <Link 
              href="/courses/"
              className="mt-10 rounded-full bg-zinc-900 px-12 py-4 text-sm font-black text-zinc-50 shadow-xl transition-all hover:scale-105 active:scale-95 dark:bg-zinc-50 dark:text-zinc-900"
            >
              Explore Courses
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
