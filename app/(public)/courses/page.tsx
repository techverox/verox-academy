"use client";

import { useEffect, useState, useCallback } from "react";
import CourseCard from "@/components/CourseCard";
import { getCourses } from "@/lib/firestore";
import { Course } from "@/types/firestore";
import { Search, Sparkles, RefreshCcw, Layers, Filter } from "lucide-react";

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
      setError("Synchronisation with the central registry failed. Verify your neural link.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses, retryCount]);

  return (
    <main className="min-h-screen bg-background pb-32">
      {/* Cinematic Header */}
      <div className="relative pt-40 pb-20 overflow-hidden">
         <div className="absolute inset-0 -z-10 bg-linear-to-b from-primary/5 to-transparent" />
         <div className="container mx-auto px-8 max-w-7xl">
            <div className="space-y-6 max-w-4xl">
               <div className="inline-flex items-center gap-3 px-4 py-2 rounded-2xl bg-primary/10 border border-primary/20 text-[10px] font-black uppercase tracking-[0.3em] text-primary">
                  <Layers className="w-4 h-4" />
                  The Archival Registry
               </div>
               <h1 className="text-7xl md:text-9xl font-black tracking-tight text-foreground leading-[0.9]">
                  CURATED <br />
                  <span className="text-primary italic">INTELLIGENCE.</span>
               </h1>
               <p className="text-xl md:text-2xl font-medium text-muted-foreground leading-relaxed max-w-2xl">
                  Access the world's most sophisticated curriculum. Engineered for those who refuse to settle for mediocrity.
               </p>
            </div>

            {/* Filter Bar */}
            <div className="mt-20 flex flex-col md:flex-row items-center gap-6 border-b border-border/50 pb-10">
               <div className="flex-1 relative w-full group">
                  <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <input 
                    type="text" 
                    placeholder="Search the registry..." 
                    className="w-full h-16 pl-16 pr-8 rounded-2xl bg-secondary/50 border border-border/50 focus:border-primary/50 focus:bg-card transition-all outline-none text-sm font-bold placeholder:text-muted-foreground/60"
                  />
               </div>
               <button className="btn-secondary-premium h-16 px-10">
                  <Filter className="w-4 h-4" />
                  Refine Search
               </button>
            </div>
         </div>
      </div>

      {/* Main Registry Grid */}
      <div className="container mx-auto px-8 max-w-7xl mt-12">
        {loading ? (
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="aspect-4/5 animate-pulse rounded-4xl bg-secondary/50 border border-border/50" />
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center text-center py-32 space-y-8 bg-card rounded-5xl border border-destructive/20 shadow-2xl">
            <div className="w-24 h-24 rounded-3xl bg-destructive/10 flex items-center justify-center text-destructive">
               <RefreshCcw className="w-12 h-12" />
            </div>
            <div className="space-y-4">
               <h3 className="text-3xl font-black tracking-tight">Sync Error</h3>
               <p className="text-muted-foreground font-medium max-w-sm">{error}</p>
            </div>
            <button 
              onClick={() => setRetryCount(c => c + 1)}
              className="btn-premium h-16 px-12 rounded-2xl bg-destructive text-destructive-foreground shadow-xl shadow-destructive/20 hover:scale-105"
            >
              Retry Protocol
            </button>
          </div>
        ) : courses.length > 0 ? (
          <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center py-40 border border-dashed border-border/50 rounded-5xl bg-secondary/20">
            <div className="w-20 h-20 rounded-2xl bg-secondary flex items-center justify-center text-muted-foreground mb-10">
               <Layers className="w-10 h-10" />
            </div>
            <h2 className="text-4xl font-black tracking-tight mb-4">Registry Empty</h2>
            <p className="text-xl text-muted-foreground font-medium max-w-md">
               No courses have been authorized for public release yet. Check back soon.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
