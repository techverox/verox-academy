"use client";

import { useEffect, useState, Suspense, useCallback } from "react";
import { 
  getCourseById, 
  getLessonsByCourseId, 
  adminCreateLesson, 
  adminUpdateLesson, 
  adminDeleteLesson, 
  adminUpdateLessonOrder,
  adminDuplicateLesson,
  adminAddResource,
  adminDeleteResource,
  getResourcesByLessonId,
  adminSaveQuiz,
  getQuizByLessonId
} from "@/lib/firestore";
import { Lesson, Course, Resource, Quiz, Question } from "@/types/firestore";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { 
  ChevronLeft, 
  Plus, 
  GripVertical, 
  PlayCircle, 
  Eye, 
  Lock, 
  MoreVertical, 
  Copy, 
  Edit3, 
  Trash2, 
  ArrowRight,
  Sparkles,
  Save,
  CheckCircle2,
  Clock,
  Files,
  Target,
  FileText,
  AlertCircle,
  Video,
  Globe
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

function CurriculumManager({ basePath }: { basePath: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const courseId = searchParams.get("id");
  
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeModalTab, setActiveModalTab] = useState<"general" | "notes" | "quiz">("general");
  const [resources, setResources] = useState<Resource[]>([]);
  const [resLoading, setResLoading] = useState(false);
  const [quizForm, setQuizForm] = useState<Omit<Quiz, "id" | "createdAt">>({
    courseId: "",
    lessonId: "",
    title: "",
    questions: [],
    passingScore: 70,
  });
  const [savingStatus, setSavingStatus] = useState<"idle" | "saving" | "saved" | "failed">("idle");
  
  const [showForm, setShowForm] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    duration: "10:00",
    wistiaMediaId: "",
    isPreviewFree: false,
    published: false,
    notes: "",
  });

  const [fetchingDuration, setFetchingDuration] = useState(false);
  
  const fetchData = useCallback(async () => {
    if (!courseId) return router.push(basePath);
    
    try {
      const [courseData, lessonsData] = await Promise.all([
        getCourseById(courseId),
        getLessonsByCourseId(courseId)
      ]);
      setCourse(courseData);
      setLessons(lessonsData);
    } catch (error) {
      console.error("Failed to fetch curriculum:", error);
    } finally {
      setLoading(false);
    }
  }, [courseId, router, basePath]);

  const fetchWistiaDuration = useCallback(async (wistiaId: string) => {
    if (!wistiaId || wistiaId.length < 5) return;
    
    setFetchingDuration(true);
    try {
      const response = await fetch(`https://fast.wistia.com/embed/medias/${wistiaId}.json`);
      if (!response.ok) throw new Error("Wistia fetch failed");
      const data = await response.json();
      
      if (data?.media?.duration) {
        const totalSeconds = Math.round(data.media.duration);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        const formatted = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        setFormData(prev => ({ ...prev, duration: formatted }));
      }
    } catch (err) {
      console.warn("[WISTIA] Could not fetch duration:", err);
    } finally {
      setFetchingDuration(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Automatic Duration Trigger
  useEffect(() => {
    if (formData.wistiaMediaId && !editingLesson && formData.duration === "10:00") {
      const timer = setTimeout(() => fetchWistiaDuration(formData.wistiaMediaId), 800);
      return () => clearTimeout(timer);
    }
    // For existing lessons, only trigger if Wistia ID changed from original
    if (editingLesson && formData.wistiaMediaId && formData.wistiaMediaId !== editingLesson.wistiaMediaId) {
      const timer = setTimeout(() => fetchWistiaDuration(formData.wistiaMediaId), 800);
      return () => clearTimeout(timer);
    }
  }, [formData.wistiaMediaId, fetchWistiaDuration, editingLesson]);

  const onDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(lessons);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update locally (Optimistic UI)
    const updatedItems = items.map((item, index) => ({
      ...item,
      order: index + 1
    }));
    setLessons(updatedItems);

    // Save to Firestore
    setSavingStatus("saving");
    try {
      await adminUpdateLessonOrder(updatedItems.map(l => ({ id: l.id, order: l.order })));
      setSavingStatus("saved");
      setTimeout(() => setSavingStatus("idle"), 2000);
    } catch (error) {
      console.error("Failed to update order:", error);
      setSavingStatus("failed");
      fetchData(); // Rollback
    }
  };

  const handleOpenAdd = () => {
    setEditingLesson(null);
    setFormData({
      title: "",
      description: "",
      duration: "10:00",
      wistiaMediaId: "",
      isPreviewFree: false,
      published: false,
      notes: "",
    });
    setShowForm(true);
  };

  const handleOpenEdit = async (lesson: Lesson) => {
    setEditingLesson(lesson);
    setFormData({
      title: lesson.title,
      description: lesson.description || "",
      duration: lesson.duration,
      wistiaMediaId: lesson.wistiaMediaId || "",
      isPreviewFree: lesson.isPreviewFree || false,
      published: lesson.published || false,
      notes: lesson.notes || "",
    });
    setActiveModalTab("general");
    
    setResLoading(true);
    try {
      const [resData, quizData] = await Promise.all([
        getResourcesByLessonId(lesson.id, lesson.courseId),
        getQuizByLessonId(lesson.id, lesson.courseId)
      ]);
      setResources(resData);
      if (quizData) {
        setQuizForm({
          courseId: quizData.courseId,
          lessonId: quizData.lessonId,
          title: quizData.title,
          questions: quizData.questions,
          passingScore: quizData.passingScore,
        });
      } else {
        setQuizForm({
          courseId: lesson.courseId,
          lessonId: lesson.id,
          title: `Quiz: ${lesson.title}`,
          questions: [],
          passingScore: 70,
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setResLoading(false);
    }
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseId) return;
    
    setSavingStatus("saving");
    try {
      if (editingLesson) {
        await adminUpdateLesson(editingLesson.id, formData);
      } else {
        await adminCreateLesson({
          ...formData,
          courseId,
          order: lessons.length + 1
        });
      }
      await fetchData();
      setShowForm(false);
      setSavingStatus("saved");
      setTimeout(() => setSavingStatus("idle"), 2000);
    } catch (error) {
      console.error("Save failed:", error);
      setSavingStatus("failed");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this lesson?")) return;
    
    setSavingStatus("saving");
    try {
      await adminDeleteLesson(id);
      setLessons(prev => prev.filter(l => l.id !== id));
      setSavingStatus("saved");
      setTimeout(() => setSavingStatus("idle"), 2000);
    } catch (error) {
      setSavingStatus("failed");
    }
  };

  const handleTogglePublish = async (lesson: Lesson) => {
    setSavingStatus("saving");
    try {
      await adminUpdateLesson(lesson.id, { published: !lesson.published });
      setLessons(prev => prev.map(l => l.id === lesson.id ? { ...l, published: !lesson.published } : l));
      setSavingStatus("saved");
      setTimeout(() => setSavingStatus("idle"), 2000);
    } catch (error) {
      setSavingStatus("failed");
    }
  };

  const handleDuplicate = async (lesson: Lesson) => {
    setSavingStatus("saving");
    try {
      await adminDuplicateLesson(lesson);
      await fetchData();
      setSavingStatus("saved");
      setTimeout(() => setSavingStatus("idle"), 2000);
    } catch (error) {
      setSavingStatus("failed");
    }
  };

  const extractWistiaId = (input: string) => {
    const trimmed = input.trim();
    if (!trimmed) return "";
    if (!trimmed.includes("/")) return trimmed;
    const match = trimmed.match(/(?:medias|iframe)\/([a-zA-Z0-9]+)/);
    return match ? match[1] : trimmed;
  };

  const handleAddResource = async () => {
    if (!editingLesson || !courseId) return;
    const title = prompt("Resource Title (e.g. Source Code)");
    const url = prompt("Resource URL (Link to PDF/ZIP)");
    const type = prompt("Type: pdf, zip, image, doc, link");
    
    if (!title || !url) return;
    
    setResLoading(true);
    try {
      await adminAddResource({
        courseId,
        lessonId: editingLesson.id,
        title,
        url,
        type: (type || "link") as any
      });
      const data = await getResourcesByLessonId(editingLesson.id, courseId);
      setResources(data);
    } catch (err) {
      console.error(err);
    } finally {
      setResLoading(false);
    }
  };

  const handleDeleteResource = async (resId: string) => {
    if (!editingLesson || !confirm("Delete resource?")) return;
    try {
      await adminDeleteResource(resId);
      setResources(prev => prev.filter(r => r.id !== resId));
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddQuestion = () => {
    const newQuestion: Question = {
      id: Math.random().toString(36).substr(2, 9),
      text: "New Question?",
      options: ["Option 1", "Option 2", "Option 3", "Option 4"],
      correctOptionIndex: 0
    };
    setQuizForm({
      ...quizForm,
      questions: [...quizForm.questions, newQuestion]
    });
  };

  const handleSaveQuiz = async () => {
    if (!editingLesson || !courseId) return;
    setSavingStatus("saving");
    try {
      await adminSaveQuiz(quizForm);
      setSavingStatus("saved");
      setTimeout(() => setSavingStatus("idle"), 2000);
    } catch (err) {
      console.error(err);
      setSavingStatus("failed");
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto space-y-12 p-10 animate-pulse">
        <div className="h-12 w-64 bg-muted rounded-xl" />
        <div className="space-y-6">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-24 w-full bg-muted/40 rounded-4xl border border-border/40" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-16 pb-32 px-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-12">
        <div className="space-y-4">
          <Link href={basePath} className="text-[10px] font-bold uppercase tracking-[0.4em] text-muted-foreground/60 hover:text-accent transition-all flex items-center gap-2 group w-fit">
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Courses
          </Link>
          <div className="space-y-2">
             <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.4em] text-accent">
                <Sparkles className="w-3.5 h-3.5" />
                Curriculum Manager
             </div>
             <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter text-foreground leading-none">
               Edit <span className="text-transparent bg-clip-text bg-linear-to-r from-foreground to-foreground/50">Curriculum.</span>
             </h1>
          </div>
          <p className="text-base text-muted-foreground font-medium max-w-xl">
             Design the learning journey for <span className="text-foreground font-bold">{course?.title}</span>. Drag and drop to reorder modules.
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-6">
          <div className={cn(
            "px-5 py-2.5 rounded-xl border text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-2 shadow-sm",
            savingStatus === "saving" ? "bg-amber-500/10 text-amber-500 border-amber-500/20" : 
            savingStatus === "saved" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : 
            savingStatus === "failed" ? "bg-destructive/10 text-destructive border-destructive/20" : "bg-muted/10 text-muted-foreground/40 border-border/40"
          )}>
            <div className={cn(
              "w-2 h-2 rounded-full",
              savingStatus === "saving" ? "bg-amber-500 animate-pulse" : 
              savingStatus === "saved" ? "bg-emerald-500" : 
              savingStatus === "failed" ? "bg-destructive" : "bg-muted-foreground/20"
            )} />
            {savingStatus === "saving" ? "Saving Changes..." : 
             savingStatus === "saved" ? "Changes Saved" : 
             savingStatus === "failed" ? "Save Failed" : "Cloud Synchronized"}
          </div>
          <Button
            onClick={handleOpenAdd}
            className="h-16 px-10 rounded-2xl font-bold uppercase tracking-widest text-[11px] shadow-2xl shadow-primary/20"
          >
            <Plus className="mr-2 w-5 h-5" /> Add New Lesson
          </Button>
        </div>
      </header>

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="lessons">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
              {lessons.map((lesson, index) => (
                <Draggable key={lesson.id} draggableId={lesson.id} index={index}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className={cn(
                        "group flex items-center justify-between rounded-5xl border p-6 transition-all duration-500",
                        snapshot.isDragging 
                        ? "border-accent bg-surface shadow-2xl scale-[1.02] z-50 ring-4 ring-accent/5" 
                        : "border-border/40 bg-surface/40 hover:bg-surface hover:border-accent/40"
                      )}
                    >
                      <div className="flex items-center gap-6">
                        <div {...provided.dragHandleProps} className="cursor-grab active:cursor-grabbing p-2 text-muted-foreground/20 hover:text-accent transition-colors">
                          <GripVertical className="w-5 h-5" />
                        </div>
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted/40 text-xs font-bold text-muted-foreground/60 border border-border/40 shadow-inner">
                          {String(index + 1).padStart(2, '0')}
                        </div>
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-3">
                            <h3 className="text-lg font-bold text-foreground group-hover:text-accent transition-colors leading-none tracking-tight">{lesson.title}</h3>
                            <div className="flex gap-2">
                               {lesson.isPreviewFree && (
                                 <Badge className="bg-blue-500/10 text-blue-500 border-none font-bold text-[8px] uppercase tracking-widest px-2 py-0.5 rounded">Free Preview</Badge>
                               )}
                               {!lesson.published && (
                                 <Badge className="bg-zinc-800 text-zinc-500 border-none font-bold text-[8px] uppercase tracking-widest px-2 py-0.5 rounded">Draft</Badge>
                               )}
                            </div>
                          </div>
                          <p className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest flex items-center gap-3">
                            <span className="flex items-center gap-1.5"><Clock className="w-3 h-3" /> {lesson.duration}</span>
                            <span className="h-1 w-1 rounded-full bg-border" />
                            <span className="flex items-center gap-1.5"><Video className="w-3 h-3" /> {lesson.wistiaMediaId || "No Video"}</span>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0">
                        <Button
                          variant="ghost"
                          onClick={() => handleTogglePublish(lesson)}
                          className={cn(
                            "h-10 px-4 rounded-xl text-[9px] font-bold uppercase tracking-widest",
                            lesson.published ? "text-emerald-500 bg-emerald-500/5 hover:bg-emerald-500/10" : "text-zinc-500 bg-zinc-800/50 hover:bg-zinc-800"
                          )}
                        >
                          {lesson.published ? "Public" : "Private"}
                        </Button>
                        <Button
                          variant="secondary"
                          size="icon"
                          onClick={() => handleDuplicate(lesson)}
                          className="h-10 w-10 rounded-xl"
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="secondary"
                          size="icon"
                          onClick={() => handleOpenEdit(lesson)}
                          className="h-10 w-10 rounded-xl border-accent/20 text-accent hover:bg-accent/10"
                        >
                          <Edit3 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(lesson.id)}
                          className="h-10 w-10 rounded-xl text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {/* Lesson Editor Modal */}
      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 z-100 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowForm(false)}
              className="absolute inset-0 bg-black/90 backdrop-blur-xl"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-4xl rounded-6xl border border-white/10 bg-surface p-12 lg:p-16 shadow-2xl overflow-y-auto max-h-[90vh]"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-12">
                 <div className="space-y-2">
                    <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-accent">Lesson Editor</p>
                    <h2 className="text-4xl font-bold text-foreground tracking-tighter">
                      {editingLesson ? "Refine Lesson" : "New Lesson"}
                    </h2>
                 </div>
                 {editingLesson && (
                   <div className="flex bg-muted/40 rounded-2xl p-1.5 border border-border/40 shadow-inner">
                     {[
                       { id: "general", label: "Details", icon: Edit3 },
                       { id: "notes", label: "Resources", icon: Files },
                       { id: "quiz", label: "Quiz", icon: Target }
                     ].map((tab) => (
                       <button 
                         key={tab.id}
                         onClick={() => setActiveModalTab(tab.id as any)}
                         className={cn(
                           "flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all",
                           activeModalTab === tab.id 
                             ? "bg-accent text-white shadow-xl shadow-accent/20" 
                             : "text-muted-foreground hover:text-foreground"
                         )}
                       >
                         <tab.icon className="w-3.5 h-3.5" />
                         {tab.label}
                       </button>
                     ))}
                   </div>
                 )}
              </div>

              <div className="min-h-[400px]">
                {activeModalTab === "general" ? (
                  <form onSubmit={handleSubmit} className="space-y-10">
                    <div className="grid gap-10">
                      <div className="space-y-4">
                        <label className="text-[10px] font-bold uppercase tracking-[0.4em] text-muted-foreground/60 ml-2">Lesson Title</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Introduction to Advanced SaaS Design"
                          className="w-full rounded-2xl border border-border/40 bg-muted/20 px-8 py-5 text-xl font-bold text-foreground outline-none focus:border-accent/40 focus:ring-4 focus:ring-accent/5 transition-all"
                          value={formData.title}
                          onChange={e => setFormData({ ...formData, title: e.target.value })}
                        />
                      </div>
                      
                      <div className="space-y-4">
                        <label className="text-[10px] font-bold uppercase tracking-[0.4em] text-muted-foreground/60 ml-2">Description</label>
                        <textarea
                          rows={4}
                          placeholder="What will students learn in this lesson?"
                          className="w-full rounded-3xl border border-border/40 bg-muted/20 px-8 py-6 font-medium text-foreground outline-none focus:border-accent/40 transition-all resize-none leading-relaxed"
                          value={formData.description}
                          onChange={e => setFormData({ ...formData, description: e.target.value })}
                        />
                      </div>

                      <div className="grid md:grid-cols-2 gap-10">
                        <div className="space-y-4">
                          <label className="text-[10px] font-bold uppercase tracking-[0.4em] text-muted-foreground/60 ml-2">Duration (MM:SS)</label>
                          <div className="relative">
                            <Clock className={cn("absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors", fetchingDuration ? "text-accent animate-pulse" : "text-muted-foreground/40")} />
                            <input
                              type="text"
                              required
                              placeholder="10:00"
                              className={cn(
                                "w-full rounded-2xl border border-border/40 bg-muted/20 pl-14 pr-8 py-5 font-bold text-foreground outline-none focus:border-accent/40 transition-all",
                                fetchingDuration && "border-accent/20 ring-4 ring-accent/5"
                              )}
                              value={formData.duration}
                              onChange={e => setFormData({ ...formData, duration: e.target.value })}
                            />
                            {fetchingDuration && (
                              <div className="absolute right-6 top-1/2 -translate-y-1/2 text-[8px] font-bold uppercase tracking-widest text-accent animate-pulse">Syncing...</div>
                            )}
                          </div>
                        </div>
                        <div className="space-y-4">
                          <label className="text-[10px] font-bold uppercase tracking-[0.4em] text-muted-foreground/60 ml-2">Wistia Media ID</label>
                          <div className="relative">
                            <Video className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40" />
                            <input
                              type="text"
                              required
                              placeholder="e.g. abc123xyz"
                              className="w-full rounded-2xl border border-border/40 bg-muted/20 pl-14 pr-8 py-5 font-bold text-foreground outline-none focus:border-accent/40 transition-all"
                              value={formData.wistiaMediaId}
                              onChange={e => setFormData({ ...formData, wistiaMediaId: extractWistiaId(e.target.value) })}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-12 pt-8 border-t border-border/40">
                      <label className="flex items-center gap-4 cursor-pointer group">
                        <div 
                          onClick={() => setFormData({ ...formData, isPreviewFree: !formData.isPreviewFree })}
                          className={cn(
                            "h-8 w-14 rounded-full transition-all duration-500 relative flex items-center shadow-inner",
                            formData.isPreviewFree ? "bg-accent" : "bg-muted"
                          )}
                        >
                          <div className={cn(
                            "h-6 w-6 rounded-full bg-white shadow-lg transition-all duration-500",
                            formData.isPreviewFree ? "translate-x-7" : "translate-x-1"
                          )} />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground">Free Preview</span>
                          <span className="text-[9px] font-medium text-muted-foreground/60">Allow guest access</span>
                        </div>
                      </label>

                      <label className="flex items-center gap-4 cursor-pointer group">
                        <div 
                          onClick={() => setFormData({ ...formData, published: !formData.published })}
                          className={cn(
                            "h-8 w-14 rounded-full transition-all duration-500 relative flex items-center shadow-inner",
                            formData.published ? "bg-emerald-500" : "bg-muted"
                          )}
                        >
                          <div className={cn(
                            "h-6 w-6 rounded-full bg-white shadow-lg transition-all duration-500",
                            formData.published ? "translate-x-7" : "translate-x-1"
                          )} />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground">Publish State</span>
                          <span className="text-[9px] font-medium text-muted-foreground/60">Visible to students</span>
                        </div>
                      </label>
                    </div>

                    <div className="flex gap-6 pt-10">
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setShowForm(false)}
                        className="flex-1 h-16 rounded-2xl font-bold uppercase tracking-widest text-[11px]"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        isLoading={savingStatus === "saving"}
                        className="flex-1 h-16 rounded-2xl font-bold uppercase tracking-widest text-[11px] shadow-2xl shadow-accent/20"
                      >
                        {editingLesson ? "Save Changes" : "Create Lesson"}
                      </Button>
                    </div>
                  </form>
                ) : activeModalTab === "notes" ? (
                  <div className="space-y-12">
                    <div className="space-y-8">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                           <Files className="w-5 h-5 text-accent" />
                           <h4 className="text-xl font-bold tracking-tight">Lesson Resources</h4>
                        </div>
                        <Button 
                          variant="secondary" 
                          onClick={handleAddResource}
                          className="h-10 px-6 rounded-xl font-bold text-[9px] uppercase tracking-widest"
                        >
                          + Add Resource
                        </Button>
                      </div>
                      <div className="grid gap-4">
                        {resLoading ? (
                          <div className="py-20 text-center animate-pulse text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">Syncing Assets...</div>
                        ) : resources.length > 0 ? (
                          resources.map(res => (
                            <div key={res.id} className="flex items-center justify-between p-6 rounded-3xl bg-muted/20 border border-border/40 group/res hover:border-accent/40 transition-all">
                              <div className="flex items-center gap-6">
                                <div className="h-12 w-12 rounded-xl bg-surface flex items-center justify-center text-muted-foreground/60 font-bold text-[9px] uppercase shadow-sm border border-border/40">
                                  {res.type}
                                </div>
                                <div>
                                  <p className="text-base font-bold text-foreground leading-none tracking-tight">{res.title}</p>
                                  <p className="text-[10px] text-muted-foreground/40 mt-1.5 truncate max-w-[300px] font-medium">{res.url}</p>
                                </div>
                              </div>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => handleDeleteResource(res.id)}
                                className="h-10 w-10 text-destructive hover:bg-destructive/10 rounded-xl"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          ))
                        ) : (
                          <div className="py-20 text-center rounded-5xl border-2 border-dashed border-border/40 bg-muted/5">
                            <Files className="w-12 h-12 mx-auto mb-4 text-muted-foreground/10" />
                            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">No attached resources</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="flex items-center gap-3">
                         <FileText className="w-5 h-5 text-accent" />
                         <h4 className="text-xl font-bold tracking-tight text-foreground">Lesson Notes</h4>
                      </div>
                      <textarea
                        rows={12}
                        className="w-full rounded-4xl border border-border/40 bg-muted/20 px-8 py-8 font-medium text-foreground outline-none focus:border-accent/40 transition-all font-mono text-sm leading-relaxed"
                        placeholder="# Markdown Content\n\nExplain the core concepts here..."
                        value={formData.notes}
                        onChange={e => setFormData({ ...formData, notes: e.target.value })}
                      />
                    </div>

                    <div className="flex gap-6 pt-10">
                      <Button onClick={() => setShowForm(false)} variant="ghost" className="flex-1 h-16 rounded-2xl font-bold uppercase tracking-widest text-[11px]">Cancel</Button>
                      <Button onClick={handleSubmit} isLoading={savingStatus === "saving"} className="flex-1 h-16 rounded-2xl font-bold uppercase tracking-widest text-[11px] shadow-2xl shadow-accent/20">Commit Changes</Button>
                    </div>
                  </div>
                ) : (
                   <div className="space-y-12">
                      <div className="flex items-center justify-between">
                         <div className="flex items-center gap-3">
                            <Target className="w-5 h-5 text-accent" />
                            <h3 className="text-2xl font-bold text-foreground tracking-tighter">Knowledge Assessment</h3>
                         </div>
                         <Button 
                           variant="primary" 
                           onClick={handleAddQuestion}
                           className="h-12 px-8 rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-xl shadow-primary/20"
                         >
                           + Add Question
                         </Button>
                      </div>

                      <div className="space-y-6">
                        <label className="text-[10px] font-bold uppercase tracking-[0.4em] text-muted-foreground/60 ml-2">Passing Threshold (%)</label>
                        <input 
                          type="number"
                          className="w-full rounded-2xl border border-border/40 bg-muted/20 px-8 py-5 font-bold text-foreground outline-none focus:border-accent/40 transition-all"
                          value={quizForm.passingScore}
                          onChange={e => setQuizForm({...quizForm, passingScore: Number(e.target.value)})}
                        />
                      </div>

                      <div className="space-y-10">
                        {quizForm.questions.map((q, qIdx) => (
                          <Card key={q.id} className="p-10 rounded-6xl border border-border/40 bg-surface/50 space-y-10 relative overflow-hidden group/q">
                             <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold uppercase tracking-[0.5em] text-accent">Question {String(qIdx + 1).padStart(2, '0')}</span>
                                <Button 
                                  variant="ghost" 
                                  onClick={() => {
                                    const newQs = [...quizForm.questions];
                                    newQs.splice(qIdx, 1);
                                    setQuizForm({...quizForm, questions: newQs});
                                  }}
                                  className="h-9 px-4 rounded-lg text-[9px] font-bold text-destructive hover:bg-destructive/10 uppercase tracking-widest"
                                >
                                  Remove
                                </Button>
                             </div>
                             <div className="space-y-4">
                                <textarea 
                                  rows={2}
                                  className="w-full bg-transparent text-2xl font-bold text-foreground outline-none placeholder:text-muted-foreground/20 resize-none leading-tight border-b border-border/40 pb-4 focus:border-accent/40 transition-all"
                                  placeholder="Enter the question here..."
                                  value={q.text}
                                  onChange={e => {
                                    const newQs = [...quizForm.questions];
                                    newQs[qIdx].text = e.target.value;
                                    setQuizForm({...quizForm, questions: newQs});
                                  }}
                                />
                             </div>
                             <div className="grid md:grid-cols-2 gap-6">
                                {q.options.map((opt, oIdx) => (
                                  <div key={oIdx} className="flex items-center gap-5 group/opt">
                                     <input 
                                       type="radio"
                                       name={`correct-${q.id}`}
                                       className="w-6 h-6 accent-accent cursor-pointer"
                                       checked={q.correctOptionIndex === oIdx}
                                       onChange={() => {
                                          const newQs = [...quizForm.questions];
                                          newQs[qIdx].correctOptionIndex = oIdx;
                                          setQuizForm({...quizForm, questions: newQs});
                                       }}
                                     />
                                     <input 
                                       type="text"
                                       className="flex-1 bg-muted/20 rounded-2xl px-6 py-4 text-sm font-bold text-foreground border border-border/40 outline-none focus:border-accent/40 transition-all"
                                       value={opt}
                                       onChange={e => {
                                          const newQs = [...quizForm.questions];
                                          newQs[qIdx].options[oIdx] = e.target.value;
                                          setQuizForm({...quizForm, questions: newQs});
                                       }}
                                     />
                                  </div>
                                ))}
                             </div>
                          </Card>
                        ))}

                        {quizForm.questions.length === 0 && (
                          <div className="py-24 text-center rounded-6xl border-2 border-dashed border-border/40 bg-muted/5">
                             <Target className="w-16 h-16 mx-auto mb-6 text-muted-foreground/10" />
                             <p className="text-[11px] font-bold uppercase tracking-[0.4em] text-muted-foreground/40">No assessment questions configured</p>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-6 pt-10">
                        <Button onClick={() => setShowForm(false)} variant="ghost" className="flex-1 h-16 rounded-2xl font-bold uppercase tracking-widest text-[11px]">Cancel</Button>
                        <Button onClick={handleSaveQuiz} isLoading={savingStatus === "saving"} className="flex-1 h-16 rounded-2xl font-bold uppercase tracking-widest text-[11px] shadow-2xl shadow-accent/20">Save Assessment Engine</Button>
                      </div>
                   </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function CurriculumEditor({ basePath = "/admin/courses" }: { basePath?: string }) {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center bg-zinc-950 text-white font-bold text-[10px] uppercase tracking-[0.5em] animate-pulse">Synchronizing Workspace...</div>}>
      <CurriculumManager basePath={basePath} />
    </Suspense>
  );
}
