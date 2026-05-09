"use client";

import { useEffect, useState, useCallback } from "react";
import CourseCard from "@/components/CourseCard";
import { getCourses } from "@/lib/firestore";
import { Course } from "@/types/firestore";
import { Search, Sparkles, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/Button";

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
    <main className="container mx-auto px-6 py-20 lg:px-12 lg:py-32">
      {/* Page Header */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-[0.3em]">
            <Sparkles className="w-4 h-4" />
            Academy Catalog
          </div>
          <h1 className="text-5xl font-black tracking-tight text-white md:text-7xl">
            Explore Courses
          </h1>
          <p className="max-w-2xl text-xl font-medium text-secondary-text">
            Professional Indian creator-style courses designed to turn you into a high-paid professional.
          </p>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="aspect-[4/5] animate-pulse rounded-2xl bg-muted/20 border border-border/50" />
          ))}
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <div className="mt-32 flex flex-col items-center justify-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-danger/10 text-danger border border-danger/20">
             <RefreshCcw className="w-8 h-8" />
          </div>
          <h3 className="mt-8 text-2xl font-bold text-white">Connection Issue</h3>
          <p className="mt-4 max-w-sm text-secondary-text font-medium">{error}</p>
          <Button
            onClick={handleRetry}
            className="mt-10"
            size="lg"
          >
            Retry Connection
          </Button>
        </div>
      )}

      {/* Course Grid */}
      {!loading && !error && courses.length > 0 && (
        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && courses.length === 0 && (
        <div className="mt-32 flex flex-col items-center justify-center text-center py-20 px-4 rounded-3xl border border-dashed border-border bg-muted/5">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-muted text-zinc-500 mb-8">
            <Search className="h-10 w-10" />
          </div>
          <h2 className="text-3xl font-black tracking-tight text-white">Courses Coming Soon</h2>
          <p className="mt-4 max-w-sm text-lg font-medium text-secondary-text">
            We&apos;re currently preparing a selection of world-class courses for you.
          </p>
          <Button className="mt-10" size="lg">
            Notify Me
          </Button>
        </div>
      )}
    </main>
  );
}
