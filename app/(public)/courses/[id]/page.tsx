"use client";

import { useEffect, useState, use } from "react";
import { getCourseById } from "@/lib/firestore";
import { Course } from "@/types/database";
import Image from "next/image";
import Link from "next/link";

export default function CourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const data = await getCourseById(id);
        setCourse(data);
      } catch (error) {
        console.error("Failed to load course:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-900 border-t-transparent" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex min-h-[80vh] flex-col items-center justify-center space-y-4">
        <h1 className="text-2xl font-bold text-zinc-900">Course not found</h1>
        <Link href="/courses" className="text-zinc-600 underline">
          Back to all courses
        </Link>
      </div>
    );
  }

  const dummyCurriculum = [
    { title: "Introduction to the Course", duration: "10:24" },
    { title: "Setting up your Environment", duration: "15:45" },
    { title: "Core Concepts & Fundamentals", duration: "25:10" },
    { title: "Building your First Module", duration: "30:00" },
    { title: "Advanced Techniques & Best Practices", duration: "45:20" },
  ];

  return (
    <div className="container-custom py-12 lg:py-20">
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-10">
          <div>
            <span className="inline-block rounded-full bg-zinc-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-zinc-600">
              {course.category}
            </span>
            <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-zinc-900 sm:text-5xl">
              {course.title}
            </h1>
            <p className="mt-6 text-xl text-zinc-600 leading-relaxed">
              {course.description}
            </p>
          </div>

          {/* Preview Section */}
          <div className="aspect-video w-full overflow-hidden rounded-3xl bg-zinc-900 relative flex items-center justify-center">
             <Image 
                src={course.thumbnail} 
                alt="Preview" 
                fill 
                className="object-cover opacity-40 blur-[2px]"
             />
             <div className="relative z-10 flex flex-col items-center text-center px-4">
                <div className="h-16 w-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center cursor-pointer hover:scale-110 transition-transform border border-white/30">
                    <svg className="h-8 w-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                    </svg>
                </div>
                <p className="mt-4 text-white font-medium">Watch Preview Video</p>
             </div>
          </div>

          {/* Curriculum */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-zinc-900">Course Curriculum</h2>
            <div className="divide-y divide-zinc-100 rounded-2xl border border-zinc-100 bg-white">
              {dummyCurriculum.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-5 hover:bg-zinc-50/50 transition-colors cursor-pointer group">
                  <div className="flex items-center gap-4">
                    <span className="text-xs font-bold text-zinc-400">0{index + 1}</span>
                    <span className="font-medium text-zinc-700 group-hover:text-black transition-colors">{item.title}</span>
                  </div>
                  <span className="text-xs font-medium text-zinc-400">{item.duration}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-28 rounded-3xl border border-zinc-100 bg-white p-8 shadow-sm">
            <div className="space-y-6 text-center lg:text-left">
              <div>
                <p className="text-sm font-bold uppercase tracking-wider text-zinc-400">Total Price</p>
                <h3 className="mt-1 text-4xl font-black text-zinc-900">₹{course.price}</h3>
              </div>

              <button className="w-full rounded-2xl bg-black py-4 text-lg font-bold text-white transition-all hover:bg-zinc-800 hover:scale-[1.02] active:scale-[0.98]">
                Enroll Now
              </button>

              <div className="space-y-4 pt-6 border-t border-zinc-50">
                <div className="flex items-center gap-3 text-sm text-zinc-600">
                  <svg className="h-5 w-5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Lifetime Access</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-zinc-600">
                  <svg className="h-5 w-5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Certificate of Completion</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
