"use client";

import { useEffect, useState } from "react";
import { getCourses } from "@/lib/firestore";
import { Course } from "@/types/database";
import CourseCard from "@/components/CourseCard";

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const data = await getCourses(true);
        setCourses(data);
      } catch (error) {
        console.error("Failed to load courses:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  return (
    <div className="container-custom py-16">
      {/* Header Section */}
      <div className="mb-12 text-center md:text-left">
        <h1 className="text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl">
          Browse Our <span className="text-zinc-500 underline decoration-zinc-200 underline-offset-8">Courses</span>
        </h1>
        <p className="mt-4 text-lg text-zinc-600">
          Learn from industry experts and take your skills to the next level.
        </p>
      </div>

      {/* Grid Section */}
      {loading ? (
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="flex flex-col space-y-4">
              <div className="aspect-video w-full animate-pulse rounded-2xl bg-zinc-100" />
              <div className="h-6 w-3/4 animate-pulse rounded bg-zinc-100" />
              <div className="h-4 w-full animate-pulse rounded bg-zinc-100" />
              <div className="flex items-center justify-between pt-4">
                <div className="h-8 w-20 animate-pulse rounded bg-zinc-100" />
                <div className="h-10 w-28 animate-pulse rounded-full bg-zinc-100" />
              </div>
            </div>
          ))}
        </div>
      ) : courses.length > 0 ? (
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-lg text-zinc-500">No courses available at the moment.</p>
        </div>
      )}
    </div>
  );
}
