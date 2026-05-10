"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/hooks/use-auth";
import { getUserDashboardStats } from "@/lib/firestore";
import Link from "next/link";
import Image from "next/image";
import { 
  Play, 
  BookOpen, 
  Clock, 
  Trophy, 
  ArrowRight,
  Sparkles,
  Search
} from "lucide-react";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

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

  // Filter courses
  const inProgressCourses = stats?.enrolledCourses?.filter((c: any) => c.status !== "completed") || [];
  const completedCourses = stats?.enrolledCourses?.filter((c: any) => c.status === "completed") || [];

  // Find the most recent active course
  const lastCourse = inProgressCourses[0] || stats?.enrolledCourses?.[0];

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Welcome Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-[0.3em]">
          <Sparkles className="w-4 h-4" />
          Student Hub
        </div>
        <h1 className="text-4xl font-black tracking-tight text-white md:text-5xl">
          Welcome back, {user?.displayName?.split(" ")[0] || "Student"}
        </h1>
        <p className="text-secondary-text font-medium text-lg">
          You have completed <span className="text-white font-bold">{stats?.totalCompletedLessons || 0} lessons</span> so far. Keep it up!
        </p>
      </div>

      {/* Hero: Continue Learning */}
      {lastCourse && lastCourse.status !== "completed" && (
        <section>
          <div className="relative group overflow-hidden rounded-[2.5rem] border border-border bg-[#151B2E] transition-all hover:border-primary/40 shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-r from-[#0B0F19] via-transparent to-transparent z-10" />
            <div className="flex flex-col md:flex-row min-h-[320px]">
              {/* Content */}
              <div className="relative z-20 flex flex-1 flex-col justify-center p-8 md:p-12">
                <Badge variant="success" className="w-fit mb-4">Continue Learning</Badge>
                <h2 className="text-3xl font-black text-white mb-4 leading-tight">
                  {lastCourse.courseTitle}
                </h2>
                <div className="flex items-center gap-6 mb-8">
                  <div className="flex items-center gap-2 text-secondary-text text-sm font-semibold">
                    <BookOpen className="w-4 h-4" />
                    {lastCourse.completedCount}/{lastCourse.totalLessons} Lessons
                  </div>
                  <div className="flex items-center gap-2 text-secondary-text text-sm font-semibold">
                    <Clock className="w-4 h-4" />
                    {lastCourse.percentage}% Complete
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="w-full max-w-md h-1.5 bg-white/5 rounded-full mb-8 overflow-hidden">
                  <div 
                    className="h-full bg-primary shadow-[0_0_15px_var(--primary)] transition-all duration-1000"
                    style={{ width: `${lastCourse.percentage}%` }}
                  />
                </div>

                <Link href={`/learn/viewer/?id=${lastCourse.courseId}`}>
                  <Button size="lg" className="w-fit group/btn rounded-2xl h-14 px-8">
                    Resume Course
                    <ArrowRight className="ml-2 w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>

              {/* Image Preview */}
              <div className="relative w-full md:w-[40%] h-64 md:h-auto overflow-hidden">
                <Image
                  src={lastCourse.thumbnail}
                  alt={lastCourse.courseTitle}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-primary/10 mix-blend-overlay group-hover:bg-transparent transition-colors" />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Stats Grid */}
      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <StatsCard 
          title="Courses Active" 
          value={inProgressCourses.length} 
          icon={BookOpen} 
          trend={inProgressCourses.length > 0 ? "In Progress" : "Start Now"} 
        />
        <StatsCard 
          title="Courses Completed" 
          value={completedCourses.length} 
          icon={Trophy} 
          trend={completedCourses.length > 0 ? "Well done!" : "Keep going"} 
          trendType={completedCourses.length > 0 ? "positive" : "neutral"}
        />
        <StatsCard 
          title="Total Lessons" 
          value={stats?.totalCompletedLessons || 0} 
          icon={Play} 
          trend="Lifetime" 
        />
      </section>

      {/* In Progress Courses */}
      {inProgressCourses.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              In Progress
              <Badge variant="secondary" className="bg-white/5 border-white/10">{inProgressCourses.length}</Badge>
            </h3>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {inProgressCourses.map((course: any) => (
              <Card key={course.courseId} className="group overflow-hidden border-border/50 hover:border-primary/20 bg-[#111827]/50 rounded-[2rem]">
                <div className="relative aspect-video w-full">
                  <Image
                    src={course.thumbnail}
                    alt={course.courseTitle}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F19] to-transparent opacity-60" />
                  <div className="absolute bottom-3 left-4">
                    <Badge variant="default" className="bg-black/50 backdrop-blur-md border-white/10 text-white">
                      {course.percentage}% DONE
                    </Badge>
                  </div>
                </div>
                
                <div className="p-6">
                  <h4 className="text-base font-bold text-white mb-2 line-clamp-1">{course.courseTitle}</h4>
                  <div className="flex items-center gap-4 mb-6 text-xs text-secondary-text font-semibold">
                    <span className="flex items-center gap-1.5"><BookOpen className="w-3 h-3" />{course.totalLessons} Lessons</span>
                  </div>
                  
                  <div className="h-1 w-full bg-white/5 rounded-full mb-6 overflow-hidden">
                    <div className="h-full bg-primary transition-all duration-500" style={{ width: `${course.percentage}%` }} />
                  </div>

                  <Link href={`/learn/viewer/?id=${course.courseId}`}>
                    <Button variant="outline" className="w-full rounded-xl">
                      Continue Learning
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Completed Courses */}
      {completedCourses.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              Completed Courses
              <Badge variant="success" className="bg-success/10 border-success/20">{completedCourses.length}</Badge>
            </h3>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {completedCourses.map((course: any) => (
              <Card key={course.courseId} className="group overflow-hidden border-success/20 bg-success/5 rounded-[2rem]">
                <div className="relative aspect-video w-full grayscale-[50%] group-hover:grayscale-0 transition-all">
                  <Image
                    src={course.thumbnail}
                    alt={course.courseTitle}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-success/10 mix-blend-overlay" />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                     <div className="h-12 w-12 rounded-full bg-success text-white flex items-center justify-center shadow-lg">
                        <Trophy className="w-6 h-6" />
                     </div>
                  </div>
                </div>
                
                <div className="p-6">
                  <h4 className="text-base font-bold text-white mb-2 line-clamp-1">{course.courseTitle}</h4>
                  <p className="text-xs text-secondary-text mb-6 font-medium">Completed on {course.completedAt ? new Date(course.completedAt.seconds * 1000).toLocaleDateString() : 'recently'}</p>
                  
                  <div className="flex flex-col gap-2">
                    <Link href={`/verify-certificate/${user?.uid}_${course.courseId}`} className="w-full">
                      <Button className="w-full rounded-xl gap-2 h-11 bg-success hover:bg-success-hover text-white border-none">
                        <Award className="w-4 h-4" />
                        View Certificate
                      </Button>
                    </Link>
                    <Link href={`/learn/viewer/?id=${course.courseId}`}>
                      <Button variant="ghost" className="w-full rounded-xl h-11 text-secondary-text hover:text-white">
                        Review Lessons
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>
      )}

      {!loading && stats?.enrolledCourses.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 px-6 text-center rounded-[3rem] border border-dashed border-border bg-muted/10">
          <div className="w-20 h-20 rounded-[2rem] bg-muted flex items-center justify-center mb-6 text-zinc-500">
            <Search className="w-10 h-10" />
          </div>
          <h4 className="text-2xl font-black text-white mb-2">Your library is empty</h4>
          <p className="text-lg text-secondary-text max-w-xs mb-8 font-medium">
            Discover our curated paths and start your journey today.
          </p>
          <Link href="/courses/">
            <Button size="lg" className="rounded-2xl px-10">Browse Courses</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
