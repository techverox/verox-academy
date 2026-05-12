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
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <div className="flex items-center gap-3 text-primary font-black text-[10px] uppercase tracking-[0.3em] mb-4">
            <Layout className="w-4 h-4" />
            Inventory Management
          </div>
          <h1 className="text-4xl font-black tracking-tight text-foreground md:text-5xl lg:text-6xl">Your Courses</h1>
          <p className="mt-4 text-muted-foreground font-medium text-lg max-w-xl">Manage and scale your educational portfolio with enterprise-grade tools.</p>
        </div>
        <Link
          href="/creator/courses/add"
          className="flex items-center gap-3 px-10 py-5 bg-primary text-primary-foreground font-black rounded-2xl hover:scale-[1.02] transition-all active:scale-95 shadow-xl shadow-primary/25 text-[10px] uppercase tracking-widest"
        >
          <Plus className="w-5 h-5" />
          Architect New Course
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {loading ? (
          [1, 2, 3].map((i) => (
            <div key={i} className="h-[450px] bg-secondary/30 border border-border rounded-5xl animate-pulse" />
          ))
        ) : courses.length === 0 ? (
          <div className="col-span-full py-24 text-center bg-secondary/20 border border-border rounded-6xl border-dashed">
            <div className="w-20 h-20 bg-secondary rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-inner">
              <Layout className="w-10 h-10 text-muted-foreground opacity-30" />
            </div>
            <h3 className="text-2xl font-black text-foreground mb-3">Your curriculum is vacant</h3>
            <p className="text-muted-foreground mb-10 max-w-md mx-auto font-medium">Start your journey as an industry expert by architecting your first high-fidelity course.</p>
            <Link
              href="/creator/courses/add"
              className="inline-flex px-10 py-4 bg-primary text-primary-foreground font-black rounded-2xl hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 text-[10px] uppercase tracking-widest"
            >
              Begin Architecture
            </Link>
          </div>
        ) : (
          courses.map((course) => (
            <div key={course.id} className="group bg-card border border-border rounded-5xl overflow-hidden hover:border-primary/30 transition-all duration-500 shadow-lg hover:shadow-2xl hover:shadow-primary/5">
              <div className="relative h-56 w-full overflow-hidden">
                <Image 
                  src={course.thumbnail} 
                  alt={course.title} 
                  fill 
                  className="object-cover transition-transform duration-1000 group-hover:scale-110" 
                />
                <div className="absolute inset-0 bg-linear-to-t from-background/80 via-transparent to-transparent" />
                <div className="absolute top-5 left-5">
                  <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] backdrop-blur-md border ${
                    course.published 
                    ? "bg-success/20 text-success border-success/30" 
                    : "bg-secondary/80 text-muted-foreground border-border"
                  }`}>
                    {course.published ? "Live System" : "Draft Mode"}
                  </div>
                </div>
                <div className="absolute top-5 right-5">
                  <button className="p-2.5 bg-background/50 backdrop-blur-md rounded-xl border border-border text-foreground opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="p-8">
                <h3 className="text-xl font-black tracking-tight text-foreground mb-3 line-clamp-2 min-h-14 group-hover:text-primary transition-colors">{course.title}</h3>
                <div className="flex items-center gap-6 mb-8 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                  <div className="flex items-center gap-2 bg-secondary/50 px-3 py-1.5 rounded-lg border border-border">
                    <Layout className="w-3.5 h-3.5" />
                    {course.lessonCount} Modules
                  </div>
                  <div className="flex items-center gap-2 bg-secondary/50 px-3 py-1.5 rounded-lg border border-border">
                    ₹{course.price}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Link
                    href={`/creator/courses/edit?id=${course.id}`}
                    className="flex items-center justify-center gap-2 py-4 bg-secondary text-foreground font-black rounded-2xl hover:bg-secondary/80 border border-border transition-all text-[10px] uppercase tracking-widest"
                  >
                    <Edit3 className="w-4 h-4" />
                    Refine
                  </Link>
                  <Link
                    href={`/creator/courses/curriculum?id=${course.id}`}
                    className="flex items-center justify-center gap-2 py-4 bg-primary/10 text-primary border border-primary/20 font-black rounded-2xl hover:bg-primary/20 transition-all text-[10px] uppercase tracking-widest"
                  >
                    <Layout className="w-4 h-4" />
                    Syllabus
                  </Link>
                </div>
                
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <button
                    onClick={() => handleTogglePublish(course.id, course.published)}
                    disabled={processingId === course.id}
                    className={`flex items-center justify-center gap-2 py-4 font-black rounded-2xl transition-all text-[10px] uppercase tracking-widest ${
                      course.published 
                      ? "bg-warning/10 text-warning hover:bg-warning/20" 
                      : "bg-success/10 text-success hover:bg-success/20"
                    }`}
                  >
                    {course.published ? "Halt System" : "Initialize"}
                  </button>
                  <button
                    onClick={() => handleDeleteRequest(course.id, course.title)}
                    disabled={processingId === course.id}
                    className="flex items-center justify-center gap-2 py-4 bg-destructive/10 text-destructive font-black rounded-2xl hover:bg-destructive/20 transition-all text-[10px] uppercase tracking-widest"
                  >
                    <Trash2 className="w-4 h-4" />
                    Erase
                  </button>
                </div>

                <button
                  onClick={() => setEnrollModal({ isOpen: true, courseId: course.id, title: course.title })}
                  className="mt-4 flex items-center justify-center gap-3 py-4 w-full bg-secondary/50 border border-border text-muted-foreground font-black rounded-2xl hover:bg-secondary hover:text-foreground transition-all text-[10px] uppercase tracking-widest group/btn shadow-sm"
                >
                  <UserPlus className="w-4 h-4 group-hover/btn:text-primary transition-colors" />
                  Provision Free Access
                </button>

                <Link
                  href={`/courses/view?id=${course.id}`}
                  className="mt-4 flex items-center justify-center gap-3 py-4 w-full border border-border text-muted-foreground font-black rounded-2xl hover:bg-secondary/50 hover:text-foreground transition-all text-[10px] uppercase tracking-widest shadow-sm"
                >
                  <ExternalLink className="w-4 h-4" />
                  Inspect Public Registry
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
