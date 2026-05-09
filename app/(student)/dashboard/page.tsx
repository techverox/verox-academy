"use client";

import { useAuth } from "@/hooks/use-auth";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function DashboardPage() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <main className="container mx-auto min-h-[calc(100vh-64px)] p-4 md:p-8">
      {/* Header Section */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Welcome back, {user.displayName?.split(" ")[0] || "Student"}!
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400">
            Here's what's happening with your learning journey.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => signOut(auth)}
            className="inline-flex h-10 items-center justify-center rounded-full border border-zinc-200 bg-white px-6 py-2 text-sm font-medium text-zinc-900 shadow-sm transition-all hover:bg-zinc-50 dark:border-zinc-800 dark:bg-black dark:text-zinc-50 dark:hover:bg-zinc-900"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Stats/Quick Info Grid */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Enrolled Courses</p>
          <p className="mt-2 text-3xl font-bold text-zinc-900 dark:text-zinc-50">0</p>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Completed Lessons</p>
          <p className="mt-2 text-3xl font-bold text-zinc-900 dark:text-zinc-50">0</p>
        </div>
        <div className="hidden rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 lg:block">
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Learning Hours</p>
          <p className="mt-2 text-3xl font-bold text-zinc-900 dark:text-zinc-50">0h</p>
        </div>
      </div>

      {/* Empty State Section */}
      <div className="mt-12">
        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">My Courses</h2>
        <div className="mt-4 flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-zinc-200 bg-white py-20 text-center dark:border-zinc-800 dark:bg-zinc-950/50">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-900">
            <svg
              className="h-8 w-8 text-zinc-400 dark:text-zinc-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
          </div>
          <h3 className="mt-4 text-lg font-medium text-zinc-900 dark:text-zinc-50">No courses yet</h3>
          <p className="mt-2 max-w-sm text-zinc-500 dark:text-zinc-400">
            You haven't enrolled in any courses yet. Start your learning journey today!
          </p>
          <button className="mt-8 rounded-full bg-zinc-900 px-8 py-3 text-sm font-semibold text-zinc-50 shadow-md transition-all hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200">
            Browse Courses
          </button>
        </div>
      </div>
    </main>
  );
}
