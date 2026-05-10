/**
 * Admin Dashboard Page
 * =====================
 * Platform overview with aggregated metrics.
 *
 * UPGRADE:
 * - Uses `isAdmin` from custom claims (no Firestore role check)
 * - Admin stats still use client-side Firestore reads for now
 *   (will use server aggregation collections once populated)
 * - Recent enrollments use batched reads (optimized in lib/admin.ts)
 */

"use client";

import { useEffect, useState } from "react";
import { getAdminStats, getRecentEnrollments } from "@/lib/admin";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";

interface AdminStatsData {
  totalCourses: number;
  totalEnrollments: number;
  totalLessons: number;
  totalUsers: number;
}

interface RecentActivity {
  id: string;
  userName: string;
  courseTitle: string;
  enrolledAt: { seconds: number } | null;
}

export default function AdminDashboard() {
  const { isAdmin, loading: authLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<AdminStatsData | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      router.replace("/dashboard/");
    }
  }, [isAdmin, authLoading, router]);

  useEffect(() => {
    async function fetchData() {
      if (!isAdmin) return;
      
      setLoading(true);
      setError(null);
      try {
        const [statsData, activityData] = await Promise.all([
          getAdminStats(),
          getRecentEnrollments()
        ]);
        setStats(statsData);
        setRecentActivity(activityData as RecentActivity[]);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
        setError("Failed to load platform analytics.");
      } finally {
        setLoading(false);
      }
    }

    if (!authLoading && isAdmin) {
      fetchData();
    }
  }, [isAdmin, authLoading]);

  if (authLoading || (loading && !stats)) {
    return (
      <div className="space-y-12">
        <div className="h-8 w-48 animate-pulse rounded-md bg-zinc-100 dark:bg-zinc-900" />
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-44 animate-pulse rounded-[2.5rem] bg-zinc-100 dark:bg-zinc-900" />
          ))}
        </div>
        <div className="h-96 animate-pulse rounded-[3rem] bg-zinc-100 dark:bg-zinc-900" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-96 flex-col items-center justify-center rounded-[3rem] border border-dashed border-zinc-200 dark:border-zinc-800">
        <p className="text-zinc-500 font-bold">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 rounded-full bg-zinc-900 px-6 py-2 text-xs font-black uppercase tracking-widest text-white dark:bg-white dark:text-black"
        >
          Retry
        </button>
      </div>
    );
  }

  const statCards = [
    { label: "Total Courses", value: stats?.totalCourses, icon: "📚" },
    { label: "Total Enrollments", value: stats?.totalEnrollments, icon: "🎟️" },
    { label: "Total Lessons", value: stats?.totalLessons, icon: "🎥" },
    { label: "Total Users", value: stats?.totalUsers, icon: "👤" },
  ];

  return (
    <div className="space-y-12">
      {/* DEBUG HEADING */}
      <div className="bg-red-500 text-white px-4 py-1 text-[10px] font-bold uppercase tracking-widest inline-block rounded-md mb-4">
        Admin Dashboard
      </div>

      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">Platform Overview</h2>
          <p className="mt-4 text-xl font-medium text-zinc-500 dark:text-zinc-400">
            Monitor your academy&apos;s growth and engagement metrics in real-time.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/dashboard/")}
            className="h-12 rounded-full border border-zinc-200 bg-white px-8 text-sm font-black text-zinc-900 transition-all hover:bg-zinc-50 dark:border-zinc-800 dark:bg-black dark:text-zinc-50 shadow-sm"
          >
            View Student Dashboard
          </button>
          <button
            onClick={() => router.push("/admin/courses/")}
            className="h-12 rounded-full bg-zinc-900 px-8 text-sm font-black text-white transition-all hover:scale-105 active:scale-95 dark:bg-white dark:text-black shadow-xl"
          >
            Manage All Courses →
          </button>
        </div>
      </header>

      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card, i) => (
          <div 
            key={i} 
            onClick={() => card.label === "Total Courses" && router.push("/admin/courses/")}
            className={`group relative overflow-hidden rounded-[2.5rem] border border-zinc-200 bg-white p-10 shadow-sm transition-all hover:shadow-xl dark:border-zinc-800 dark:bg-zinc-950 ${card.label === "Total Courses" ? "cursor-pointer" : ""}`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400">{card.label}</p>
                <p className="mt-4 text-5xl font-black text-zinc-900 dark:text-zinc-50">{card.value ?? "0"}</p>
              </div>
              <span className="text-4xl grayscale group-hover:grayscale-0 transition-all duration-500">{card.icon}</span>
            </div>
            <div className="absolute bottom-0 left-0 h-1.5 w-full bg-zinc-900 dark:bg-zinc-50 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        ))}
      </div>

      <section className="rounded-[3rem] border border-zinc-200 bg-white p-12 dark:border-zinc-800 dark:bg-zinc-950 shadow-sm">
        <h3 className="text-2xl font-black tracking-tight">Recent Enrollments</h3>
        <div className="mt-8 space-y-4">
          {recentActivity.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-zinc-500 font-medium">No recent activity yet.</p>
            </div>
          ) : (
            recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between rounded-2xl bg-zinc-50 p-6 dark:bg-zinc-900/50">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-200 dark:bg-zinc-800">
                    <span className="text-sm font-black text-zinc-600 dark:text-zinc-400">
                      {activity.userName.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="font-bold text-zinc-900 dark:text-zinc-50">{activity.userName}</p>
                    <p className="text-xs font-medium text-zinc-500">Enrolled in <span className="text-zinc-900 dark:text-zinc-300">{activity.courseTitle}</span></p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-black uppercase tracking-widest text-zinc-400">
                    {activity.enrolledAt ? new Date(activity.enrolledAt.seconds * 1000).toLocaleDateString() : "N/A"}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
