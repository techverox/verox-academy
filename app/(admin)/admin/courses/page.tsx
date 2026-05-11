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
  MoreVertical
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
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">Content Management</h1>
          <p className="text-zinc-500 font-medium mt-1">Full control over all platform courses and curriculum.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input 
              type="text" 
              placeholder="Search courses..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all w-full md:w-64"
            />
          </div>
          <Link
            href="/admin/courses/add"
            className="h-11 px-6 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-xs font-black uppercase tracking-widest rounded-xl hover:scale-105 active:scale-95 transition-all shadow-lg flex items-center gap-2"
          >
            Create Course
          </Link>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-[2.5rem] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-100 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-900/50">
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400">Course & Instructor</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400">Price</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400">Status</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-900">
              {loading ? (
                [...Array(3)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={4} className="px-8 py-10 h-24 bg-zinc-50/30 dark:bg-zinc-900/30" />
                  </tr>
                ))
              ) : filteredCourses.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-8 py-20 text-center text-zinc-500 font-medium">
                    No courses found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredCourses.map((course) => (
                  <tr key={course.id} className="group hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="relative h-12 w-20 shrink-0 overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800">
                          <Image src={course.thumbnail} alt={course.title} fill className="object-cover" />
                        </div>
                        <div>
                          <p className="font-bold text-zinc-900 dark:text-zinc-50 line-clamp-1">{course.title}</p>
                          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-0.5">By {course.creatorName || "Unknown"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="font-black text-zinc-900 dark:text-zinc-50">₹{course.price}</span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        {course.published ? (
                          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/10 text-green-500 text-[10px] font-black uppercase tracking-widest">
                            <CheckCircle2 className="w-3 h-3" /> Live
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-500/10 text-zinc-500 text-[10px] font-black uppercase tracking-widest">
                            <XCircle className="w-3 h-3" /> Draft
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link
                          href={`/admin/courses/curriculum?id=${course.id}`}
                          title="Manage Curriculum"
                          className="p-2 text-zinc-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
                        >
                          <Layout className="w-5 h-5" />
                        </Link>
                        <Link
                          href={`/admin/courses/edit?id=${course.id}`}
                          title="Edit Details"
                          className="p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-all"
                        >
                          <Edit3 className="w-5 h-5" />
                        </Link>
                        <button
                          onClick={() => handleTogglePublish(course.id, course.published)}
                          disabled={processingId === course.id}
                          className={`p-2 rounded-lg transition-all ${
                            course.published 
                              ? "text-zinc-400 hover:text-amber-500 hover:bg-amber-500/10" 
                              : "text-zinc-400 hover:text-green-500 hover:bg-green-500/10"
                          }`}
                          title={course.published ? "Unpublish" : "Publish"}
                        >
                          {course.published ? <XCircle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
                        </button>
                        <button
                          onClick={() => handleDeleteRequest(course.id, course.title)}
                          disabled={processingId === course.id}
                          className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                          title="Delete Course"
                        >
                          <Trash2 className="w-5 h-5" />
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
