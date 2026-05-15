"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { getCoursesByCreator, toggleCoursePublish } from "@/lib/firestore";
import { Course } from "@/types/firestore";
import Link from "next/link";
import Image from "next/image";
import { 
  Plus, 
  Layout, 
  MoreVertical, 
  ExternalLink, 
  Edit3, 
  Trash2, 
  UserPlus, 
  Sparkles, 
  BookOpen, 
  Settings, 
  BarChart2,
  ChevronRight,
  Eye,
  Globe,
  Lock
} from "lucide-react";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { EnrollStudentModal } from "@/components/creator/EnrollStudentModal";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export default function CreatorCoursesPage() {
  const { user: currentUser, firebaseUser } = useAuth();
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
      const idToken = await firebaseUser?.getIdToken();
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

  const formatCurrency = (paise: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(paise);
  };

  return (
    <div className="space-y-16 pb-32">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.4em] text-blue-600">
            <Sparkles className="w-3.5 h-3.5" />
            Curriculum Studio
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter text-foreground leading-none">
            Manage <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-cyan-500">Masterclasses.</span>
          </h1>
          <p className="text-base text-muted-foreground font-medium max-w-xl leading-relaxed">
            Architect your educational portfolio, monitor node performance, and deploy new content to the global marketplace.
          </p>
        </div>
        <Link href="/creator/courses/add">
          <Button className="h-14 px-10 rounded-2xl bg-linear-to-r from-blue-600 to-cyan-500 text-white font-bold uppercase tracking-widest text-[10px] md:text-[11px] shadow-2xl shadow-blue-500/20 w-full sm:w-auto border-none">
            <Plus className="mr-2.5 w-4.5 h-4.5 transition-transform group-hover:rotate-90" /> Create New Course
          </Button>
        </Link>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {loading ? (
          [1, 2, 3].map((i) => (
            <div key={i} className="h-[480px] bg-muted/20 border border-border/40 rounded-4xl animate-pulse" />
          ))
        ) : courses.length === 0 ? (
          <div className="col-span-full py-32 text-center bg-muted/5 border-2 border-dashed border-border/40 rounded-5xl">
            <BookOpen className="w-16 h-16 mx-auto mb-6 text-muted-foreground/20" />
            <h3 className="text-2xl font-bold text-foreground tracking-tight mb-2">No Courses Found</h3>
            <p className="text-muted-foreground mb-10 max-w-sm mx-auto font-medium">You haven't created any courses yet. Start your journey by creating your first masterclass.</p>
            <Link href="/creator/courses/add">
              <Button variant="primary" className="h-14 px-12 rounded-2xl font-bold uppercase tracking-widest text-[10px]">
                Create Your First Course
              </Button>
            </Link>
          </div>
        ) : (
          courses.map((course, i) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="group flex flex-col h-full bg-surface border border-border/40 rounded-4xl overflow-hidden hover:border-accent/40 transition-all duration-700 shadow-sm hover:shadow-2xl hover:shadow-accent/5">
                {/* Thumbnail Area */}
                <div className="relative aspect-16/10 overflow-hidden">
                  <Image 
                    src={course.thumbnail} 
                    alt={course.title} 
                    fill 
                    className="object-cover transition-transform duration-1000 group-hover:scale-110" 
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  <div className="absolute top-6 left-6">
                    <Badge className={cn(
                      "px-3 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest border-none",
                      course.published ? "bg-emerald-500 text-white shadow-xl shadow-emerald-500/20" : "bg-zinc-800 text-zinc-400"
                    )}>
                      {course.published ? "Published" : "Draft"}
                    </Badge>
                  </div>
                  
                  <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-2 group-hover:translate-y-0">
                    <Link href={`/courses/view?id=${course.id}`}>
                       <Button size="icon" className="h-10 w-10 rounded-xl bg-white/20 backdrop-blur-md border border-white/20 text-white hover:bg-white hover:text-black">
                          <Eye className="w-4 h-4" />
                       </Button>
                    </Link>
                  </div>
                </div>

                {/* Content Area */}
                <div className="p-8 flex flex-col flex-1">
                  <div className="flex-1 space-y-4">
                    <h3 className="text-xl font-bold tracking-tight text-foreground line-clamp-2 leading-tight group-hover:text-accent transition-colors">
                      {course.title}
                    </h3>
                    
                    <div className="flex items-center gap-6 text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">
                       <span className="flex items-center gap-2">
                          <Layout className="w-3.5 h-3.5 text-accent" />
                          {course.lessonCount || 0} Lessons
                       </span>
                       <span className="flex items-center gap-2">
                          <Globe className="w-3.5 h-3.5 text-accent" />
                          INR {course.price}
                       </span>
                    </div>
                  </div>

                  <div className="mt-8 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <Link href={`/creator/courses/edit?id=${course.id}`} className="flex-1">
                        <Button variant="secondary" className="w-full h-12 rounded-xl font-bold uppercase tracking-widest text-[9px]">
                           Edit Details
                        </Button>
                      </Link>
                      <Link href={`/creator/courses/curriculum?id=${course.id}`} className="flex-1">
                        <Button variant="primary" className="w-full h-12 rounded-xl font-bold uppercase tracking-widest text-[9px] shadow-lg shadow-primary/10">
                           Curriculum
                        </Button>
                      </Link>
                    </div>

                    <div className="flex gap-4">
                       <Button 
                         variant="ghost" 
                         onClick={() => handleTogglePublish(course.id, course.published)}
                         disabled={processingId === course.id}
                         className={cn(
                           "flex-1 h-12 rounded-xl font-bold uppercase tracking-widest text-[9px]",
                           course.published ? "text-amber-600 hover:bg-amber-50" : "text-emerald-600 hover:bg-emerald-50"
                         )}
                       >
                          {course.published ? "Unpublish" : "Publish Now"}
                       </Button>
                       <Button 
                         variant="ghost" 
                         size="icon" 
                         onClick={() => handleDeleteRequest(course.id, course.title)}
                         disabled={processingId === course.id}
                         className="h-12 w-12 rounded-xl text-destructive hover:bg-destructive/5"
                       >
                          <Trash2 className="w-4 h-4" />
                       </Button>
                    </div>

                    <div className="pt-4 border-t border-border/40 flex items-center justify-between">
                       <button 
                         onClick={() => setEnrollModal({ isOpen: true, courseId: course.id, title: course.title })}
                         className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/60 hover:text-accent transition-colors flex items-center gap-2"
                       >
                          <UserPlus className="w-3.5 h-3.5" /> Enroll Student
                       </button>
                       <div className="flex gap-1">
                          <div className="h-1.5 w-1.5 rounded-full bg-border" />
                          <div className="h-1.5 w-1.5 rounded-full bg-border" />
                          <div className="h-1.5 w-1.5 rounded-full bg-border" />
                       </div>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
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
