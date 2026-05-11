"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { getCoursesByCreator, toggleCoursePublish } from "@/lib/firestore";
import { Course } from "@/types/firestore";
import Link from "next/link";
import Image from "next/image";
import { Plus, Layout, MoreVertical, ExternalLink, Edit3, Trash2, UserPlus } from "lucide-react";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { EnrollStudentModal } from "@/components/creator/EnrollStudentModal";

export default function CreatorCoursesPage() {
  const { user: currentUser } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Modal State
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    courseId: string;
    title: string;
  }>({ isOpen: false, courseId: "", title: "" });

  const [enrollModal, setEnrollModal] = useState<{
    isOpen: boolean;
    courseId: string;
    title: string;
  }>({ isOpen: false, courseId: "", title: "" });

  useEffect(() => {
    if (currentUser) fetchCourses();
  }, [currentUser]);

  async function fetchCourses() {
    setLoading(true);
    try {
      const data = await getCoursesByCreator(currentUser!.uid);
      setCourses(data);
    } catch (error) {
      console.error("Failed to fetch courses:", error);
    } finally {
      setLoading(false);
    }
  }

  const handleTogglePublish = async (courseId: string, currentStatus: boolean) => {
    setProcessingId(courseId);
    try {
      await toggleCoursePublish(courseId, currentStatus);
      setCourses(prev => prev.map(c => 
        c.id === courseId ? { ...c, published: !currentStatus } : c
      ));
    } catch (error) {
      console.error("Toggle failed:", error);
    } finally {
      setProcessingId(null);
    }
  };

  const handleDeleteRequest = (courseId: string, title: string) => {
    setConfirmModal({
      isOpen: true,
      courseId,
      title
    });
  };

  const executeDelete = async () => {
    const { courseId } = confirmModal;
    setConfirmModal(prev => ({ ...prev, isOpen: false }));
    setProcessingId(courseId);

    try {
      const idToken = await currentUser?.getIdToken();
      const res = await fetch("/api/courses/delete", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}` 
        },
        body: JSON.stringify({ courseId }),
      });

      if (res.ok) {
        setCourses(prev => prev.filter(c => c.id !== courseId));
      } else {
        const err = await res.json();
        alert(err.error || "Failed to delete course");
      }
    } catch (error) {
      console.error("Delete failed:", error);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tight">Your Courses</h1>
          <p className="mt-2 text-zinc-500 font-medium tracking-tight">Manage and scale your educational content.</p>
        </div>
        <Link
          href="/creator/courses/add"
          className="flex items-center gap-2 px-8 py-4 bg-primary text-black font-black rounded-2xl hover:scale-[1.02] transition-transform active:scale-95 shadow-[0_0_40px_-10px_rgba(var(--primary-rgb),0.5)]"
        >
          <Plus className="w-5 h-5" />
          CREATE NEW COURSE
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {loading ? (
          [1, 2, 3].map((i) => (
            <div key={i} className="h-[400px] bg-zinc-900/50 border border-zinc-800 rounded-[2.5rem] animate-pulse" />
          ))
        ) : courses.length === 0 ? (
          <div className="col-span-full py-20 text-center bg-zinc-900/50 border border-zinc-800 rounded-[2.5rem] border-dashed">
            <Layout className="w-16 h-16 mx-auto mb-4 text-zinc-700" />
            <h3 className="text-xl font-black mb-2">No courses yet</h3>
            <p className="text-zinc-500 mb-8 max-w-md mx-auto">Start your journey as a creator by publishing your first high-quality tech course.</p>
            <Link
              href="/creator/courses/add"
              className="inline-flex px-8 py-3 bg-zinc-800 text-white font-bold rounded-xl hover:bg-zinc-700 transition-colors"
            >
              Get Started
            </Link>
          </div>
        ) : (
          courses.map((course) => (
            <div key={course.id} className="group bg-zinc-900/50 border border-zinc-800 rounded-[2.5rem] overflow-hidden hover:border-zinc-700 transition-all">
              <div className="relative h-48 w-full">
                <Image 
                  src={course.thumbnail} 
                  alt={course.title} 
                  fill 
                  className="object-cover group-hover:scale-105 transition-transform duration-500" 
                />
                <div className="absolute top-4 left-4">
                  <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest backdrop-blur-md ${
                    course.published 
                    ? "bg-green-500/20 text-green-400 border border-green-500/20" 
                    : "bg-zinc-900/80 text-zinc-400 border border-zinc-800"
                  }`}>
                    {course.published ? "LIVE" : "DRAFT"}
                  </span>
                </div>
                <div className="absolute top-4 right-4">
                  <button className="p-2 bg-black/50 backdrop-blur-md rounded-xl border border-white/10 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="p-8">
                <h3 className="text-xl font-black tracking-tight mb-2 line-clamp-2 min-h-[3.5rem]">{course.title}</h3>
                <div className="flex items-center gap-6 mb-8 text-xs font-bold text-zinc-500 uppercase tracking-widest">
                  <div className="flex items-center gap-2">
                    <Layout className="w-4 h-4" />
                    {course.lessonCount} Lessons
                  </div>
                  <div className="flex items-center gap-2">
                    ₹{course.price}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Link
                    href={`/creator/courses/edit?id=${course.id}`}
                    className="flex items-center justify-center gap-2 py-3 bg-zinc-800 text-white font-black rounded-xl hover:bg-zinc-700 transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                    EDIT
                  </Link>
                  <Link
                    href={`/creator/courses/curriculum?id=${course.id}`}
                    className="flex items-center justify-center gap-2 py-3 bg-primary/10 text-primary border border-primary/20 font-black rounded-xl hover:bg-primary/20 transition-all"
                  >
                    <Layout className="w-4 h-4" />
                    CURRICULUM
                  </Link>
                </div>
                
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleTogglePublish(course.id, course.published)}
                    disabled={processingId === course.id}
                    className={`flex items-center justify-center gap-2 py-3 font-black rounded-xl transition-all ${
                      course.published 
                      ? "bg-amber-500/10 text-amber-500 hover:bg-amber-500/20" 
                      : "bg-green-500/10 text-green-500 hover:bg-green-500/20"
                    }`}
                  >
                    {course.published ? "UNPUBLISH" : "PUBLISH"}
                  </button>
                  <button
                    onClick={() => handleDeleteRequest(course.id, course.title)}
                    disabled={processingId === course.id}
                    className="flex items-center justify-center gap-2 py-3 bg-red-500/10 text-red-500 font-black rounded-xl hover:bg-red-500/20 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                    DELETE
                  </button>
                </div>

                <button
                  onClick={() => setEnrollModal({ isOpen: true, courseId: course.id, title: course.title })}
                  className="mt-3 flex items-center justify-center gap-2 py-3 bg-zinc-900 border border-zinc-800 text-zinc-300 font-bold rounded-xl hover:bg-zinc-800 hover:text-white transition-all text-sm group/btn"
                >
                  <UserPlus className="w-4 h-4 group-hover/btn:text-primary transition-colors" />
                  Grant Free Access
                </button>

                <Link
                  href={`/courses/preview?id=${course.id}`}
                  className="mt-3 flex items-center justify-center gap-2 py-3 border border-zinc-800 text-zinc-400 font-bold rounded-xl hover:bg-zinc-800/50 hover:text-white transition-all text-sm"
                >
                  <ExternalLink className="w-4 h-4" />
                  View Public Page
                </Link>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Enroll Student Modal */}
      <EnrollStudentModal 
        isOpen={enrollModal.isOpen}
        onClose={() => setEnrollModal(prev => ({ ...prev, isOpen: false }))}
        courseId={enrollModal.courseId}
        courseTitle={enrollModal.title}
      />

      <ConfirmModal 
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={executeDelete}
        title="Delete Course"
        message={`Are you sure you want to delete "${confirmModal.title}"? This will permanently remove all lessons, resources, and associated data. This action is IRREVERSIBLE.`}
        confirmText="Delete Permanently"
        variant="danger"
        isLoading={processingId === confirmModal.courseId}
      />
    </div>
  );
}
