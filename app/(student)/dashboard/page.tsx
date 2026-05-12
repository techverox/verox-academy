"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/hooks/use-auth";
import { getUserDashboardStats } from "@/lib/firestore";
import Link from "next/link";
import Image from "next/image";
import {
  Play,
  BookOpen,
  Trophy,
  ArrowRight,
  Search,
  Award,
  ChevronRight,
  TrendingUp,
  CheckCircle,
} from "lucide-react";

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

  const inProgressCourses =
    stats?.enrolledCourses?.filter((c: any) => c.status !== "completed") || [];
  const completedCourses =
    stats?.enrolledCourses?.filter((c: any) => c.status === "completed") || [];
  const lastCourse = inProgressCourses[0] || stats?.enrolledCourses?.[0];

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto space-y-8 animate-pulse">
        <div className="h-16 w-72 bg-secondary/50 rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 bg-secondary/30 rounded-xl border border-border" />
          ))}
        </div>
        <div className="h-60 w-full bg-secondary/20 rounded-xl border border-border" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-16 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Header */}
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-1">Welcome back</p>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {user?.displayName?.split(" ")[0] || "Learner"}'s Dashboard
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            You've completed{" "}
            <span className="text-foreground font-semibold">
              {stats?.totalCompletedLessons || 0} lessons
            </span>{" "}
            so far. Keep it up!
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/courses/">
            <button className="btn-primary-premium h-10 px-5 text-sm">
              Browse Courses
              <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
        </div>
      </header>

      {/* Stats row */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="surface-elevated p-5 rounded-xl">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground">
              <BookOpen className="w-4 h-4" />
            </div>
            <span className="text-xs font-medium text-muted-foreground">In Progress</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{inProgressCourses.length}</p>
          <p className="text-xs text-muted-foreground mt-1">Active courses</p>
        </div>

        <div className="surface-elevated p-5 rounded-xl">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground">
              <Trophy className="w-4 h-4" />
            </div>
            <span className="text-xs font-medium text-muted-foreground">Completed</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{completedCourses.length}</p>
          <p className="text-xs text-muted-foreground mt-1">Courses finished</p>
        </div>

        <div className="surface-elevated p-5 rounded-xl">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground">
              <TrendingUp className="w-4 h-4" />
            </div>
            <span className="text-xs font-medium text-muted-foreground">Lessons Done</span>
          </div>
          <p className="text-2xl font-bold text-foreground">
            {stats?.totalCompletedLessons || 0}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Total lessons completed</p>
        </div>
      </section>

      {/* Continue Learning banner */}
      {lastCourse && lastCourse.status !== "completed" && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Play className="w-4 h-4 text-primary" />
            <h2 className="text-base font-semibold text-foreground">Continue Learning</h2>
          </div>
          <div className="bg-card border border-border rounded-xl overflow-hidden flex flex-col lg:flex-row group hover:shadow-md transition-all duration-200">
            {/* Thumbnail */}
            <div className="relative w-full lg:w-72 h-48 lg:h-auto flex-shrink-0">
              <Image
                src={lastCourse.thumbnail}
                alt={lastCourse.courseTitle}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/30 hidden lg:block" />
            </div>

            {/* Content */}
            <div className="flex-1 p-6 flex flex-col justify-between">
              <div className="space-y-3">
                <p className="text-xs font-medium text-primary uppercase tracking-wide">
                  Continue where you left off
                </p>
                <h3 className="text-lg font-semibold text-foreground leading-snug">
                  {lastCourse.courseTitle}
                </h3>
                <div className="flex items-center gap-5 text-sm text-muted-foreground">
                  <span>{lastCourse.percentage}% complete</span>
                  <span>
                    {lastCourse.completedCount} / {lastCourse.totalLessons} lessons
                  </span>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                {/* Progress bar */}
                <div className="h-1.5 w-full max-w-sm bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-700"
                    style={{ width: `${lastCourse.percentage}%` }}
                  />
                </div>

                <Link href={`/learn/viewer/?id=${lastCourse.courseId}`} className="w-fit block">
                  <button className="btn-primary-premium h-10 px-5 text-sm">
                    Continue Learning
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* In-progress courses grid */}
      {inProgressCourses.length > 0 && (
        <section className="space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-foreground">In Progress</h2>
            <span className="text-xs text-muted-foreground">
              {inProgressCourses.length} course{inProgressCourses.length !== 1 ? "s" : ""}
            </span>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {inProgressCourses.map((course: any) => (
              <div
                key={course.courseId}
                className="group bg-card border border-border rounded-xl overflow-hidden hover:shadow-md hover:border-border/60 transition-all duration-200"
              >
                <div className="relative aspect-video w-full overflow-hidden">
                  <Image
                    src={course.thumbnail}
                    alt={course.courseTitle}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>

                <div className="p-4 space-y-3">
                  <h4 className="text-sm font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                    {course.courseTitle}
                  </h4>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{course.percentage}% complete</span>
                      <span>
                        {course.completedCount}/{course.totalLessons} lessons
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${course.percentage}%` }}
                      />
                    </div>
                  </div>

                  <Link href={`/learn/viewer/?id=${course.courseId}`} className="block">
                    <button className="w-full h-9 text-xs font-medium rounded-lg border border-border text-foreground hover:bg-secondary transition-all">
                      Continue
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Completed courses */}
      {completedCourses.length > 0 && (
        <section className="space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-success" />
              <h2 className="text-base font-semibold text-foreground">Completed Courses</h2>
            </div>
            <span className="text-xs text-muted-foreground">
              {completedCourses.length} completed
            </span>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {completedCourses.map((course: any) => (
              <div
                key={course.courseId}
                className="group bg-card border border-border rounded-xl overflow-hidden hover:shadow-md hover:border-success/30 transition-all duration-200"
              >
                <div className="relative aspect-video w-full overflow-hidden">
                  <Image
                    src={course.thumbnail}
                    alt={course.courseTitle}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-success/10" />
                  <div className="absolute top-3 right-3">
                    <div className="h-8 w-8 rounded-full bg-success flex items-center justify-center shadow-lg">
                      <Trophy className="w-4 h-4 text-success-foreground" />
                    </div>
                  </div>
                </div>

                <div className="p-4 space-y-3">
                  <h4 className="text-sm font-semibold text-foreground line-clamp-1">
                    {course.courseTitle}
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Completed{" "}
                    {course.completedAt
                      ? new Date(course.completedAt.seconds * 1000).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })
                      : "recently"}
                  </p>

                  <div className="flex gap-2">
                    <Link
                      href={`/verify-certificate/${user?.uid}_${course.courseId}`}
                      className="flex-1"
                    >
                      <button className="w-full h-9 rounded-lg bg-success text-success-foreground text-xs font-semibold hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5">
                        <Award className="w-3.5 h-3.5" />
                        View Certificate
                      </button>
                    </Link>
                    <Link href={`/learn/viewer/?id=${course.courseId}`}>
                      <button className="h-9 px-3 rounded-lg border border-border text-xs font-medium text-muted-foreground hover:bg-secondary transition-all">
                        Revisit
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Empty state */}
      {!loading && stats?.enrolledCourses?.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 px-8 text-center rounded-xl border border-dashed border-border bg-card">
          <div className="w-14 h-14 rounded-xl bg-secondary flex items-center justify-center mb-5 text-muted-foreground">
            <Search className="w-7 h-7 opacity-40" />
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">No courses yet</h3>
          <p className="text-sm text-muted-foreground max-w-sm mb-6 leading-relaxed">
            You haven't enrolled in any courses yet. Browse our catalog to find
            something you'd like to learn.
          </p>
          <Link href="/courses/">
            <button className="btn-primary-premium h-10 px-6 text-sm">
              Browse Courses
            </button>
          </Link>
        </div>
      )}
    </div>
  );
}
