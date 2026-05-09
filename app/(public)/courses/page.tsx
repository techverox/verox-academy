"use client";

import { useEffect, useState } from "react";
import { getCourses } from "@/lib/firestore";
import { Course } from "@/types/firestore";
import CourseCard from "@/components/CourseCard";
import CourseSkeleton from "@/components/CourseSkeleton";

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCourses() {
      try {
        const data = await getCourses();
        setCourses(data);
      } catch (error) {
        console.error("Failed to fetch courses:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchCourses();
  }, []);

  return (
    <main className="container mx-auto p-4 py-12 md:p-8 md:py-16">
      <div className="flex flex-col gap-4">
        <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-5xl">
          Explore <span className="text-zinc-500">Courses</span>
        </h1>
        <p className="max-w-2xl text-lg text-zinc-600 dark:text-zinc-400">
          Learn from the best industry experts and master new skills today.
        </p>
      </div>

      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          // Show 6 skeletons while loading
          Array.from({ length: 6 }).map((_, i) => <CourseSkeleton key={i} />)
        ) : courses.length > 0 ? (
          courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center rounded-3xl border border-zinc-200 bg-zinc-50 py-20 text-center dark:border-zinc-800 dark:bg-zinc-950/50">
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">No courses found</h2>
            <p className="mt-2 text-zinc-500 dark:text-zinc-400">
              Check back later for new content!
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
