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
  Plus,
  Sparkles,
  Eye,
  Globe,
  User,
  Clock,
  ArrowRight,
  ShieldCheck
} from "lucide-react";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { useAuth } from "@/context/auth-context";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

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
    <div className="space-y-16 pb-32 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Course Moderation Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.4em] text-blue-600">
            <ShieldCheck className="w-3.5 h-3.5" />
            Content Moderation
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter text-foreground leading-none">
            Course <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-cyan-500">Inventory.</span>
          </h1>
          <p className="text-base text-muted-foreground font-medium max-w-xl leading-relaxed">
            Monitor and manage educational content across the platform. Verify quality standards and oversee global publishing states.
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-foreground/40 group-focus-within:text-accent transition-colors" />
            <input 
              type="text" 
              placeholder="Search course registry..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-14 pl-14 pr-8 bg-surface border border-border/40 rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-accent/5 transition-all text-foreground placeholder:text-muted-foreground/40 w-full md:w-80"
            />
          </div>
          <Button variant="secondary" size="icon" className="h-14 w-14 rounded-2xl border-border/40 hover:border-accent/40">
            <Filter className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Course Matrix Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: "Total Courses", count: courses.length, icon: BookOpen, color: "text-accent", bg: "bg-accent/10" },
          { label: "Live Courses", count: courses.filter(c => c.published).length, icon: Globe, color: "text-emerald-500", bg: "bg-emerald-500/10" },
          { label: "Private Drafts", count: courses.filter(c => !c.published).length, icon: Lock, color: "text-amber-500", bg: "bg-amber-500/10" },
          { label: "Reported Content", count: 0, icon: AlertCircle, color: "text-destructive", bg: "bg-destructive/10" },
        ].map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="p-8 rounded-4xl border border-border/40 bg-surface flex items-center justify-between group hover:border-accent/40 transition-all duration-500 relative overflow-hidden shadow-sm">
              <div className="space-y-1 relative z-10">
                <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-[0.3em]">{card.label}</p>
                <h3 className="text-4xl font-bold text-foreground tracking-tighter">{card.count}</h3>
              </div>
              <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-700 group-hover:scale-110 group-hover:rotate-6 relative z-10", card.bg)}>
                <card.icon className={cn("w-6 h-6", card.color)} />
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Content Moderation Registry */}
      <Card className="rounded-5xl border border-border/40 bg-surface overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border/40 bg-muted/5">
                <th className="px-10 py-6 text-[10px] font-bold uppercase tracking-[0.4em] text-muted-foreground/60">Course Metadata</th>
                <th className="px-10 py-6 text-[10px] font-bold uppercase tracking-[0.4em] text-muted-foreground/60">Creator</th>
                <th className="px-10 py-6 text-[10px] font-bold uppercase tracking-[0.4em] text-muted-foreground/60">State</th>
                <th className="px-10 py-6 text-[10px] font-bold uppercase tracking-[0.4em] text-muted-foreground/60 text-right">Moderation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-10 py-32 text-center">
                    <div className="flex flex-col items-center justify-center gap-4 text-muted-foreground/40">
                      <div className="w-10 h-10 border-4 border-muted-foreground/10 border-t-accent rounded-full animate-spin" />
                      <p className="text-[10px] font-bold uppercase tracking-widest">Scanning Catalog...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredCourses.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-10 py-32 text-center text-muted-foreground/40 font-medium">
                    <div className="flex flex-col items-center justify-center gap-4">
                       <BookOpen className="w-12 h-12 opacity-10" />
                       <p className="text-[10px] font-bold uppercase tracking-widest">No courses found in platform registry.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredCourses.map((course, i) => (
                  <motion.tr 
                    key={course.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="group hover:bg-muted/10 transition-all duration-300"
                  >
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-6">
                        <div className="relative h-14 w-24 shrink-0 overflow-hidden rounded-[1.25rem] border border-border/40 shadow-inner group/thumb">
                          <Image src={course.thumbnail} alt={course.title} fill className="object-cover group-hover:scale-110 transition-transform duration-1000" />
                          <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
                        </div>
                        <div className="flex flex-col">
                          <p className="font-bold text-foreground text-base tracking-tight leading-none group-hover:text-accent transition-colors">{course.title}</p>
                          <div className="flex items-center gap-3 mt-2 text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">
                             <span>₹{(course.price || 0).toLocaleString()}</span>
                             <span className="h-1 w-1 rounded-full bg-border" />
                             <span>{course.lessonCount || 0} Lessons</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-3">
                         <div className="h-9 w-9 rounded-xl bg-muted/40 border border-border/40 flex items-center justify-center text-muted-foreground font-bold text-[10px] shadow-sm">
                            {course.creatorName?.charAt(0)}
                         </div>
                         <span className="text-sm font-bold text-foreground tracking-tight">{course.creatorName || "Anonymous"}</span>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-2.5 h-2.5 rounded-full shadow-sm",
                          course.published ? "bg-emerald-500 shadow-emerald-500/50" : "bg-zinc-700 shadow-zinc-700/50"
                        )} />
                        <span className={cn(
                          "text-[10px] font-bold uppercase tracking-widest",
                          course.published ? "text-emerald-500" : "text-muted-foreground/60"
                        )}>
                          {course.published ? "Published" : "Draft State"}
                        </span>
                      </div>
                    </td>
                    <td className="px-10 py-8 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0">
                        <Link href={`/admin/courses/curriculum?id=${course.id}`}>
                           <Button variant="secondary" size="icon" className="h-10 w-10 rounded-xl" title="Manage Curriculum">
                              <Layout className="w-4.5 h-4.5" />
                           </Button>
                        </Link>
                        <Link href={`/admin/courses/edit?id=${course.id}`}>
                           <Button variant="secondary" size="icon" className="h-10 w-10 rounded-xl" title="Edit Metadata">
                              <Edit3 className="w-4.5 h-4.5" />
                           </Button>
                        </Link>
                        <Button 
                          variant="ghost"
                          size="icon"
                          onClick={() => handleTogglePublish(course.id, course.published)}
                          disabled={processingId === course.id}
                          className={cn(
                            "h-10 w-10 rounded-xl",
                            course.published ? "text-amber-500 bg-amber-500/5 hover:bg-amber-500/10 border border-amber-500/20" : "text-emerald-500 bg-emerald-500/5 hover:bg-emerald-500/10 border border-emerald-500/20"
                          )}
                          title={course.published ? "Unpublish Content" : "Publish to Platform"}
                        >
                          {course.published ? <XCircle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
                        </Button>
                        <Button 
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteRequest(course.id, course.title)}
                          disabled={processingId === course.id}
                          className="h-10 w-10 rounded-xl text-muted-foreground/40 hover:text-destructive hover:bg-destructive/5"
                        >
                          <Trash2 className="w-4.5 h-4.5" />
                        </Button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <ConfirmModal 
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={executeDelete}
        title="Purge Course Content"
        message={`Are you sure you want to permanently erase "${confirmModal.title}"? This will terminate all lesson registries, student progress data, and associated media links. This action is IRREVERSIBLE.`}
        confirmText="Erase Permanently"
        variant="danger"
        isLoading={processingId === confirmModal.courseId}
      />
    </div>
  );
}

import { AlertCircle, Lock } from "lucide-react";
