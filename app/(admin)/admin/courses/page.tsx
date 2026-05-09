"use client";

import { useEffect, useState } from "react";
import { getAllCoursesAdmin, toggleCoursePublish } from "@/lib/firestore";
import { Course } from "@/types/firestore";
import Link from "next/link";
import Image from "next/image";

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourses();
  }, []);

  async function fetchCourses() {
    setLoading(true);
    try {
      const data = await getAllCoursesAdmin();
      setCourses(data);
    } catch (error) {
      console.error("Failed to fetch courses:", error);
    } finally {
      setLoading(false);
    }
  }

  const handleTogglePublish = async (courseId: string, currentStatus: boolean) => {
    try {
      await toggleCoursePublish(courseId, currentStatus);
      setCourses(prev => prev.map(c => 
        c.id === courseId ? { ...c, published: !currentStatus } : c
      ));
    } catch (error) {
      console.error("Toggle failed:", error);
    }
  };

  return (
    <div className="space-y-8">
      {/* DEBUG HEADING */}
      <div className="bg-blue-500 text-white px-4 py-1 text-[10px] font-bold uppercase tracking-widest inline-block rounded-md">
        Course Management
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black tracking-tight">Manage Courses</h2>
          <p className="mt-2 text-zinc-500 font-medium">Create, edit, and publish your content.</p>
        </div>
        <Link
          href="/admin/courses/add"
          className="inline-flex h-12 items-center justify-center rounded-full bg-zinc-900 px-8 text-sm font-black text-zinc-50 transition-all hover:scale-105 active:scale-95 dark:bg-white dark:text-zinc-900 shadow-lg"
        >
          + Create New Course
        </Link>
      </div>

      <div className="rounded-[2.5rem] border border-zinc-200 bg-white overflow-hidden dark:border-zinc-800 dark:bg-zinc-950 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50/50 dark:border-zinc-900 dark:bg-zinc-900/50">
                <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-zinc-400">Course</th>
                <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-zinc-400">Price</th>
                <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-zinc-400">Status</th>
                <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-zinc-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-900">
              {loading ? (
                [...Array(3)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={4} className="px-8 py-10 h-24 bg-zinc-50/30 dark:bg-zinc-900/30" />
                  </tr>
                ))
              ) : courses.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-8 py-20 text-center">
                    <p className="text-zinc-500 font-medium">No courses found. Start by creating one!</p>
                  </td>
                </tr>
              ) : (
                courses.map((course) => (
                  <tr key={course.id} className="group hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-6">
                        <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800">
                          <Image src={course.thumbnail} alt={course.title} fill className="object-cover" />
                        </div>
                        <div>
                          <p className="font-black text-zinc-900 dark:text-zinc-50 line-clamp-1">{course.title}</p>
                          <p className="text-xs font-bold text-zinc-400 mt-1">Updated {new Date(course.updatedAt?.seconds * 1000).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 font-black text-zinc-900 dark:text-zinc-50">
                      ₹{course.price}
                    </td>
                    <td className="px-8 py-6">
                      <span className={`inline-flex rounded-full px-4 py-1.5 text-[10px] font-black uppercase tracking-widest ${
                        course.published 
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" 
                        : "bg-zinc-100 text-zinc-500 dark:bg-zinc-900 dark:text-zinc-500"
                      }`}>
                        {course.published ? "Live" : "Draft"}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <button
                          onClick={() => handleTogglePublish(course.id, course.published)}
                          className="text-xs font-black uppercase tracking-widest text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors"
                        >
                          {course.published ? "Unpublish" : "Publish"}
                        </button>
                        <Link
                          href={`/admin/courses/edit?id=${course.id}`}
                          className="rounded-full border border-zinc-200 bg-white px-5 py-2 text-xs font-black uppercase tracking-widest text-zinc-900 shadow-sm transition-all hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
                        >
                          Edit
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
