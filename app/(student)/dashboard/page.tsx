"use client";

import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import Image from "next/image";

export default function DashboardPage() {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <div className="container-custom py-12">
      {/* Welcome Section */}
      <div className="mb-12">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
          Welcome back, {user.displayName?.split(" ")[0] || "Student"}!
        </h1>
        <p className="mt-2 text-zinc-600">
          Pick up where you left off or start a new journey today.
        </p>
      </div>

      {/* Courses Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-zinc-900">My Courses</h2>
          <Link
            href="/courses"
            className="text-sm font-medium text-black hover:underline"
          >
            View all
          </Link>
        </div>

        {/* Empty State */}
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-zinc-100 bg-zinc-50/50 py-24 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-zinc-200">
            <svg
              className="h-6 w-6 text-zinc-400"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c1.052 0 2.062.18 3 .512m3-12.47a8.967 8.967 0 016-2.25c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18c-1.052 0-2.062.18-3 .512m-9-11.958V17.25m9-11.958V17.25"
              />
            </svg>
          </div>
          <h3 className="mt-4 text-sm font-semibold text-zinc-900">
            No courses yet
          </h3>
          <p className="mt-1 text-sm text-zinc-500">
            You haven&apos;t enrolled in any courses yet.
          </p>
          <div className="mt-6">
            <Link
              href="/courses"
              className="inline-flex items-center rounded-full bg-black px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-zinc-800"
            >
              Browse Courses
            </Link>
          </div>
        </div>
      </div>

      {/* Account Section (Minimal) */}
      <div className="mt-16 pt-8 border-t border-zinc-100">
        <div className="flex items-center justify-between rounded-xl bg-white p-6 ring-1 ring-zinc-100">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 overflow-hidden rounded-full bg-zinc-100">
              {user.photoURL ? (
                <Image
                  src={user.photoURL}
                  alt={user.displayName || "User"}
                  width={40}
                  height={40}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center font-bold text-zinc-400">
                  {user.displayName?.[0] || user.email?.[0]}
                </div>
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-900">{user.displayName}</p>
              <p className="text-xs text-zinc-500">{user.email}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="text-sm font-medium text-red-600 hover:text-red-700 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
