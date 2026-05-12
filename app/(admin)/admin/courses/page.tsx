"use client";

import { useEffect, useState } from "react";
import { getAllCoursesAdmin, toggleCoursePublish } from "@/lib/firestore";
import { Course } from "@/types/firestore";
import Link from "next/link";
import Image from "next/image";
import { 
  Trash2, 
  Edit3, 
  Layout, 
  ExternalLink, 
  Search, 
  Filter, 
  BookOpen, 
  CheckCircle2, 
  XCircle,
  MoreVertical,
  Plus
} from "lucide-react";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { useAuth } from "@/context/auth-context";

export default function AdminCoursesPage() {
  const { user: currentUser } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Modal State
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    courseId: string;
    title: string;
  }>({ isOpen: false, courseId: "", title: "" });

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

  const filteredCourses = courses.filter(c => 
    c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.creatorName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Course Management</h1>
          <p className="mt-2 text-sm text-muted-foreground max-w-2xl">Manage all courses and educational content across the platform.</p>
        </div>
        
        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="relative group w-full md:w-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50 group-focus-within:text-primary transition-colors" />
            <input 
              type="text" 
              placeholder="Search Ledger..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-6 py-4 bg-secondary/30 border border-border rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-primary/5 transition-all text-foreground placeholder:text-muted-foreground/30 focus:border-primary/50 w-full md:w-72 shadow-sm"
            />
          </div>
          <Link
            href="/admin/courses/add"
            className="group h-11 px-6 bg-primary text-primary-foreground text-xs font-bold rounded-lg hover:bg-primary/90 transition-all shadow-sm flex items-center gap-2 w-full md:w-auto justify-center"
          >
            <Plus className="w-4 h-4" />
            Add Course
          </Link>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-secondary/20">
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Course & Instructor</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-muted-foreground text-center">Price</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Status</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-muted-foreground text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                [...Array(3)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={4} className="px-8 py-10 h-24 bg-secondary/30" />
                  </tr>
                ))
              ) : filteredCourses.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-8 py-20 text-center text-muted-foreground font-medium">
                    No courses found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredCourses.map((course) => (
                  <tr key={course.id} className="group hover:bg-secondary/50 transition-colors">
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-6">
                        <div className="relative h-14 w-24 shrink-0 overflow-hidden rounded-xl border border-border shadow-inner group/thumb">
                          <Image src={course.thumbnail} alt={course.title} fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
                          <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
                        </div>
                        <div className="flex flex-col gap-2">
                          <p className="font-black text-foreground text-base tracking-tight leading-none group-hover:text-primary transition-colors">{course.title}</p>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] bg-secondary px-2.5 py-1 rounded-md shadow-inner border border-border/50">
                              BY {course.creatorName?.toUpperCase() || "ANONYMOUS"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-8 text-center">
                      <span className="text-sm font-black text-primary bg-primary/5 px-4 py-2 rounded-xl border border-primary/10 inline-block shadow-sm">
                        ₹{course.price}
                      </span>
                    </td>
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-3">
                        <div className={`w-2.5 h-2.5 rounded-full shadow-sm ${
                          course.published ? "bg-success shadow-success/50" : "bg-muted shadow-muted/50"
                        }`} />
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${
                          course.published ? "text-success" : "text-muted-foreground"
                        }`}>
                          {course.published ? "Published" : "Draft"}
                        </span>
                      </div>
                    </td>
                    <td className="px-10 py-8 text-right">
                      <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0">
                        <Link
                          href={`/admin/courses/curriculum?id=${course.id}`}
                          className="p-3 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-xl transition-all border border-border hover:border-primary/30 shadow-sm"
                          title="Syllabus Engineering"
                        >
                          <Layout className="w-4 h-4" />
                        </Link>
                        <Link
                          href={`/admin/courses/edit?id=${course.id}`}
                          className="p-3 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-xl transition-all border border-border shadow-sm"
                          title="Refine Blueprint"
                        >
                          <Edit3 className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleTogglePublish(course.id, course.published)}
                          disabled={processingId === course.id}
                          className={`p-3 rounded-xl transition-all border shadow-sm ${
                            course.published 
                              ? "text-muted-foreground hover:text-warning hover:bg-warning/10 border-border hover:border-warning/30" 
                              : "text-muted-foreground hover:text-success hover:bg-success/10 border-border hover:border-success/30"
                          }`}
                          title={course.published ? "Halt System" : "Activate"}
                        >
                          {course.published ? <XCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => handleDeleteRequest(course.id, course.title)}
                          disabled={processingId === course.id}
                          className="p-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition-all border border-border hover:border-destructive/30 shadow-sm"
                          title="Purge Asset"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

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
