"use client";

import { useEffect, useState, useCallback } from "react";
import CourseCard from "@/components/CourseCard";
import { getCourses } from "@/lib/firestore";
import { Course } from "@/types/firestore";
import { Search, BookOpen, RefreshCcw, SlidersHorizontal } from "lucide-react";

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getCourses();
      setCourses(data);
      setFilteredCourses(data);
    } catch (err: any) {
      console.error("Error fetching courses:", err);
      setError("Unable to load courses. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses, retryCount]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredCourses(courses);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredCourses(
        courses.filter(
          (c) =>
            c.title.toLowerCase().includes(query) ||
            c.description?.toLowerCase().includes(query)
        )
      );
    }
  }, [searchQuery, courses]);

  return (
    <main className="min-h-screen bg-background">
      {/* Page Header */}
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-12 max-w-7xl">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Course Library</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Browse Courses
            </h1>
            <p className="text-muted-foreground text-base leading-relaxed">
              Explore courses from expert creators. Learn at your own pace with
              lifetime access and a certificate on completion.
            </p>
          </div>

          {/* Search & Filter bar */}
          <div className="mt-8 flex flex-col sm:flex-row items-center gap-3 max-w-2xl">
            <div className="relative w-full group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search courses..."
                className="w-full h-11 pl-10 pr-4 rounded-lg bg-background border border-border focus:border-primary focus:ring-2 focus:ring-primary/15 outline-none text-sm text-foreground placeholder:text-muted-foreground transition-all"
              />
            </div>
            <button className="h-11 px-5 rounded-lg border border-border bg-background text-sm font-medium text-foreground hover:bg-secondary transition-all flex items-center gap-2 shrink-0">
              <SlidersHorizontal className="w-4 h-4" />
              Filters
            </button>
          </div>
        </div>
      </div>

      {/* Course Grid */}
      <div className="container mx-auto px-6 py-10 max-w-7xl">
        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="rounded-xl bg-secondary/40 border border-border overflow-hidden">
                <div className="aspect-video w-full bg-secondary/60 animate-pulse" />
                <div className="p-5 space-y-3">
                  <div className="h-3 bg-secondary rounded animate-pulse" />
                  <div className="h-3 bg-secondary rounded animate-pulse w-3/4" />
                  <div className="h-3 bg-secondary rounded animate-pulse w-1/2 mt-4" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center text-center py-24 space-y-5 bg-card rounded-xl border border-destructive/20">
            <div className="w-14 h-14 rounded-xl bg-destructive/10 flex items-center justify-center text-destructive">
              <RefreshCcw className="w-7 h-7" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-foreground">Failed to load courses</h3>
              <p className="text-sm text-muted-foreground max-w-sm">{error}</p>
            </div>
            <button
              onClick={() => setRetryCount((c) => c + 1)}
              className="h-10 px-6 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary-hover transition-all"
            >
              Try Again
            </button>
          </div>
        ) : filteredCourses.length > 0 ? (
          <>
            <p className="text-sm text-muted-foreground mb-6">
              Showing {filteredCourses.length} {filteredCourses.length === 1 ? "course" : "courses"}
              {searchQuery ? ` for "${searchQuery}"` : ""}
            </p>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredCourses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center text-center py-32 border border-dashed border-border rounded-xl bg-secondary/20">
            <div className="w-14 h-14 rounded-xl bg-secondary flex items-center justify-center text-muted-foreground mb-5">
              <BookOpen className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">
              {searchQuery ? "No courses found" : "No courses available yet"}
            </h2>
            <p className="text-sm text-muted-foreground max-w-sm">
              {searchQuery
                ? `No results for "${searchQuery}". Try a different search term.`
                : "Check back soon — new courses are added regularly."}
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="mt-5 h-9 px-5 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-secondary transition-all"
              >
                Clear Search
              </button>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
