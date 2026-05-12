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
import { ChevronLeft } from "lucide-react";

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
  }, [courseId, router]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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
    
    // Fetch resources & Quiz
    setResLoading(true);
    try {
      const [resData, quizData] = await Promise.all([
        getResourcesByLessonId(lesson.id),
        getQuizByLessonId(lesson.id)
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
    if (!confirm("Remove this lesson?")) return;
    
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
      const data = await getResourcesByLessonId(editingLesson.id);
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
      <div className="max-w-6xl mx-auto space-y-10 p-10 animate-pulse">
        <div className="h-14 w-80 bg-secondary/50 rounded-2xl" />
        <div className="space-y-6">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-28 w-full bg-secondary/30 rounded-5xl border border-border" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-32 px-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
        <div>
          <Link href={basePath} className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-primary transition-all flex items-center gap-2 group">
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Registry Return
          </Link>
          <h1 className="mt-6 text-5xl font-black tracking-tight text-foreground md:text-6xl leading-[1.1]">Curriculum <span className="text-primary">Engineering</span></h1>
          <p className="mt-4 text-muted-foreground font-medium text-lg max-w-xl">Architect the learning journey. Drag and drop to refine the sequence of mastery.</p>
        </div>
        <div className="flex flex-wrap items-center gap-6">
          <div className={`px-4 py-2 rounded-full border text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-2 shadow-sm ${
            savingStatus === "saving" ? "bg-warning/10 text-warning border-warning/20" : 
            savingStatus === "saved" ? "bg-success/10 text-success border-success/20" : 
            savingStatus === "failed" ? "bg-destructive/10 text-destructive border-destructive/20" : "bg-secondary text-muted-foreground border-border"
          }`}>
            <div className={`w-2 h-2 rounded-full ${savingStatus === "saving" ? "bg-warning animate-pulse" : savingStatus === "saved" ? "bg-success" : savingStatus === "failed" ? "bg-destructive" : "bg-muted-foreground/30"}`} />
            {savingStatus === "saving" ? "Syncing Logic..." : 
             savingStatus === "saved" ? "Database Synced" : 
             savingStatus === "failed" ? "Sync Breach" : "System Ready"}
          </div>
          <button
            onClick={handleOpenAdd}
            className="h-16 rounded-2xl bg-primary px-10 text-[10px] font-black uppercase tracking-widest text-primary-foreground transition-all hover:scale-[1.02] active:scale-95 shadow-xl shadow-primary/25"
          >
            + Add New Module
          </button>
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
                      className={`group flex items-center justify-between rounded-6xl border p-8 transition-all duration-500 ${
                        snapshot.isDragging 
                        ? "border-primary bg-card shadow-[0_20px_50px_rgba(var(--primary-rgb),0.1)] scale-[1.02] z-50 backdrop-blur-xl" 
                        : "border-border bg-card/40 hover:bg-card hover:border-primary/30 hover:shadow-2xl hover:shadow-primary/5"
                      }`}
                    >
                      <div className="flex items-center gap-8">
                        <div {...provided.dragHandleProps} className="cursor-grab active:cursor-grabbing p-3 text-muted-foreground/30 hover:text-primary transition-colors">
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4">
                            <circle cx="9" cy="5" r="1" /><circle cx="9" cy="12" r="1" /><circle cx="9" cy="19" r="1" />
                            <circle cx="15" cy="5" r="1" /><circle cx="15" cy="12" r="1" /><circle cx="15" cy="19" r="1" />
                          </svg>
                        </div>
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary text-[10px] font-black text-muted-foreground shadow-inner">
                          {lesson.order.toString().padStart(2, '0')}
                        </div>
                        <div>
                          <div className="flex items-center gap-4">
                            <h3 className="text-xl font-black text-foreground group-hover:text-primary transition-colors leading-none">{lesson.title}</h3>
                            {lesson.isPreviewFree && (
                              <span className="rounded-full bg-blue-500/10 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-blue-500 border border-blue-500/20 shadow-sm">
                                Open Preview
                              </span>
                            )}
                            {!lesson.published && (
                              <span className="rounded-full bg-secondary px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground border border-border shadow-sm">
                                Private Draft
                              </span>
                            )}
                          </div>
                          <p className="mt-3 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">
                            {lesson.duration} • <span className="text-primary/50">Wistia ID:</span> {lesson.wistiaMediaId || "UNASSIGNED"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0">
                        <button
                          onClick={() => handleTogglePublish(lesson)}
                          className={`rounded-xl px-5 py-2.5 text-[10px] font-black uppercase tracking-widest transition-all shadow-sm ${
                            lesson.published ? "bg-success/10 text-success border border-success/30" : "bg-secondary text-muted-foreground border border-border"
                          }`}
                        >
                          {lesson.published ? "Live" : "Activate"}
                        </button>
                        <button
                          onClick={() => handleDuplicate(lesson)}
                          className="rounded-xl bg-secondary p-3 text-muted-foreground hover:text-primary border border-border transition-all shadow-sm"
                          title="Clone Module"
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /><rect width="13" height="13" x="9" y="9" rx="2" ry="2" /></svg>
                        </button>
                        <button
                          onClick={() => handleOpenEdit(lesson)}
                          className="rounded-xl bg-secondary p-3 text-muted-foreground hover:text-primary border border-border transition-all shadow-sm"
                          title="Refine Module"
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                        </button>
                        <button
                          onClick={() => handleDelete(lesson.id)}
                          className="rounded-xl bg-destructive/10 p-3 text-destructive hover:bg-destructive hover:text-destructive-foreground transition-all shadow-sm"
                          title="Purge Module"
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 6h18" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                        </button>
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

      {/* Lesson Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-background/80 backdrop-blur-2xl p-6 animate-in fade-in duration-500">
          <div className="w-full max-w-3xl rounded-[3.5rem] border border-border bg-card p-12 shadow-2xl overflow-y-auto max-h-[90vh] relative shadow-primary/10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
               <h2 className="text-3xl font-black text-foreground">
                 {editingLesson ? "Refine Engineering" : "Initialize Module"}
               </h2>
               {editingLesson && (
                 <div className="flex bg-secondary/50 rounded-2xl p-1.5 border border-border shadow-inner">
                   <button 
                     onClick={() => setActiveModalTab("general")}
                     className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeModalTab === "general" ? "bg-primary text-primary-foreground shadow-lg" : "text-muted-foreground hover:text-foreground"}`}
                   >
                     Architecture
                   </button>
                   <button 
                     onClick={() => setActiveModalTab("notes")}
                     className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeModalTab === "notes" ? "bg-primary text-primary-foreground shadow-lg" : "text-muted-foreground hover:text-foreground"}`}
                   >
                     Assets
                   </button>
                   <button 
                     onClick={() => setActiveModalTab("quiz")}
                     className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeModalTab === "quiz" ? "bg-primary text-primary-foreground shadow-lg" : "text-muted-foreground hover:text-foreground"}`}
                   >
                     Assessment
                   </button>
                 </div>
               )}
            </div>

            {activeModalTab === "general" ? (
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground ml-2">Module Designation</label>
                  <input
                    type="text"
                    required
                    placeholder="Module Title"
                    className="w-full rounded-4xl border border-border bg-secondary/30 px-8 py-5 text-xl font-black text-foreground outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all placeholder:text-muted-foreground/30"
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>
                
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground ml-2">Scope of Learning</label>
                  <textarea
                    rows={4}
                    placeholder="Architectural summary of this module..."
                    className="w-full rounded-4xl border border-border bg-secondary/30 px-8 py-5 font-bold text-foreground outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all resize-none leading-relaxed"
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground ml-2">Timeline (MM:SS)</label>
                    <input
                      type="text"
                      required
                      placeholder="10:00"
                      className="w-full rounded-4xl border border-border bg-secondary/30 px-8 py-5 font-black text-foreground outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all"
                      value={formData.duration}
                      onChange={e => setFormData({ ...formData, duration: e.target.value })}
                    />
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground ml-2">Media Identifier (Wistia)</label>
                    <input
                      type="text"
                      required
                      placeholder="ID or URL"
                      className="w-full rounded-4xl border border-border bg-secondary/30 px-8 py-5 font-black text-foreground outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all"
                      value={formData.wistiaMediaId}
                      onChange={e => setFormData({ ...formData, wistiaMediaId: extractWistiaId(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="flex flex-wrap gap-10 pt-6">
                  <label className="flex items-center gap-4 cursor-pointer group">
                    <div 
                      onClick={() => setFormData({ ...formData, isPreviewFree: !formData.isPreviewFree })}
                      className={`h-8 w-14 rounded-full transition-all duration-500 relative flex items-center shadow-inner ${formData.isPreviewFree ? "bg-primary shadow-primary/30" : "bg-secondary"}`}
                    >
                      <div className={`h-6 w-6 rounded-full bg-white shadow-md transition-all duration-500 ${formData.isPreviewFree ? "translate-x-7" : "translate-x-1"}`} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground">Marketing Tier</span>
                      <span className="text-[10px] font-medium text-muted-foreground">Unlock as free preview</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-4 cursor-pointer group">
                    <div 
                      onClick={() => setFormData({ ...formData, published: !formData.published })}
                      className={`h-8 w-14 rounded-full transition-all duration-500 relative flex items-center shadow-inner ${formData.published ? "bg-success shadow-success/30" : "bg-secondary"}`}
                    >
                      <div className={`h-6 w-6 rounded-full bg-white shadow-md transition-all duration-500 ${formData.published ? "translate-x-7" : "translate-x-1"}`} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground">Registry Status</span>
                      <span className="text-[10px] font-medium text-muted-foreground">Live in production system</span>
                    </div>
                  </label>
                </div>

                <div className="flex gap-6 pt-12 border-t border-border">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="flex-1 h-16 rounded-4xl border border-border text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:bg-secondary/50 hover:text-foreground transition-all shadow-sm"
                  >
                    Abort Changes
                  </button>
                  <button
                    type="submit"
                    disabled={savingStatus === "saving"}
                    className="flex-1 h-16 rounded-4xl bg-primary text-[10px] font-black uppercase tracking-widest text-primary-foreground hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 shadow-xl shadow-primary/20"
                  >
                    {savingStatus === "saving" ? "Syncing..." : editingLesson ? "Update Blueprint" : "Initialize Module"}
                  </button>
                </div>
              </form>
            ) : activeModalTab === "notes" ? (
              <div className="space-y-12 animate-in fade-in duration-500">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground ml-2">Digital Assets</label>
                    <button 
                      onClick={handleAddResource}
                      className="text-[10px] font-black text-primary hover:underline uppercase tracking-widest"
                    >
                      + Register Asset
                    </button>
                  </div>
                  <div className="space-y-4">
                    {resLoading ? (
                      <div className="py-10 text-center text-[10px] text-muted-foreground font-black uppercase tracking-widest animate-pulse">Syncing Encrypted Assets...</div>
                    ) : resources.length > 0 ? (
                      resources.map(res => (
                        <div key={res.id} className="flex items-center justify-between p-6 rounded-4xl bg-secondary/30 border border-border shadow-sm group/res">
                          <div className="flex items-center gap-5">
                            <div className="h-12 w-12 rounded-xl bg-secondary flex items-center justify-center text-muted-foreground font-black text-[10px] uppercase shadow-inner group-hover/res:bg-primary/10 group-hover/res:text-primary transition-all">
                              {res.type}
                            </div>
                            <div>
                              <p className="text-base font-black text-foreground leading-none">{res.title}</p>
                              <p className="text-[10px] text-muted-foreground mt-2 truncate max-w-[300px] font-medium">{res.url}</p>
                            </div>
                          </div>
                          <button 
                            onClick={() => handleDeleteResource(res.id)}
                            className="p-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition-all shadow-sm"
                          >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6L6 18M6 6l12 12"/></svg>
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="py-16 text-center rounded-6xl border border-dashed border-border text-muted-foreground bg-secondary/20">
                         <div className="w-16 h-16 bg-secondary/50 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="opacity-20"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/></svg>
                         </div>
                        <p className="text-[10px] font-black uppercase tracking-widest">No assets registered in registry.</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground ml-2">Markdown Engineering Notes</label>
                  <textarea
                    rows={12}
                    className="w-full rounded-4xl border border-border bg-secondary/30 px-8 py-6 font-medium text-foreground outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all font-mono text-sm leading-relaxed"
                    placeholder="# Module Documentation\n\n- Milestone 1\n- Milestone 2"
                    value={formData.notes}
                    onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  />
                  <p className="text-[10px] font-black text-primary/50 uppercase tracking-widest ml-2">Compiled with GFM Intelligence Protocols.</p>
                </div>

                <div className="flex gap-6 pt-12 border-t border-border">
                  <button
                    onClick={() => setShowForm(false)}
                    className="flex-1 h-16 rounded-4xl border border-border text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:bg-secondary/50 transition-all shadow-sm"
                  >
                    Abort
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={savingStatus === "saving"}
                    className="flex-1 h-16 rounded-4xl bg-primary text-[10px] font-black uppercase tracking-widest text-primary-foreground hover:scale-[1.02] transition-all shadow-xl shadow-primary/20"
                  >
                    {savingStatus === "saving" ? "Syncing..." : "Commit Assets & Documentation"}
                  </button>
                </div>
              </div>
            ) : (
               <div className="space-y-10 animate-in fade-in duration-500">
                  <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-black text-foreground">Module Evaluation</h3>
                    <button 
                      onClick={handleAddQuestion}
                      className="h-12 rounded-xl bg-secondary px-6 text-[10px] font-black uppercase tracking-widest text-foreground border border-border hover:border-primary/50 transition-all shadow-sm"
                    >
                      + Add Question
                    </button>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground ml-2">Proficiency Threshold (%)</label>
                    <input 
                      type="number"
                      className="w-full rounded-4xl border border-border bg-secondary/30 px-8 py-5 font-black text-foreground outline-none focus:border-primary/50 transition-all"
                      value={quizForm.passingScore}
                      onChange={e => setQuizForm({...quizForm, passingScore: Number(e.target.value)})}
                    />
                  </div>

                  <div className="space-y-8">
                    {quizForm.questions.map((q, qIdx) => (
                      <div key={q.id} className="p-8 rounded-6xl border border-border bg-secondary/20 space-y-8 shadow-inner">
                         <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Assessment Vector {qIdx + 1}</span>
                            <button 
                              onClick={() => {
                                const newQs = [...quizForm.questions];
                                newQs.splice(qIdx, 1);
                                setQuizForm({...quizForm, questions: newQs});
                              }}
                              className="text-[10px] font-black text-destructive hover:underline uppercase tracking-widest"
                            >
                              Purge Vector
                            </button>
                         </div>
                         <div className="space-y-4">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-2">Vector Description</label>
                            <input 
                              type="text"
                              className="w-full bg-transparent border-b border-border py-4 text-lg font-black text-foreground outline-none focus:border-primary/50 transition-all placeholder:text-muted-foreground/20"
                              placeholder="Enter assessment question..."
                              value={q.text}
                              onChange={e => {
                                const newQs = [...quizForm.questions];
                                newQs[qIdx].text = e.target.value;
                                setQuizForm({...quizForm, questions: newQs});
                              }}
                            />
                         </div>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {q.options.map((opt, oIdx) => (
                              <div key={oIdx} className="flex items-center gap-4 group/opt">
                                 <input 
                                   type="radio"
                                   name={`correct-${q.id}`}
                                   className="w-5 h-5 accent-primary cursor-pointer"
                                   checked={q.correctOptionIndex === oIdx}
                                   onChange={() => {
                                      const newQs = [...quizForm.questions];
                                      newQs[qIdx].correctOptionIndex = oIdx;
                                      setQuizForm({...quizForm, questions: newQs});
                                   }}
                                 />
                                 <input 
                                   type="text"
                                   className="flex-1 bg-secondary/50 rounded-2xl px-6 py-3.5 text-xs font-black text-foreground border border-border outline-none focus:border-primary/50 transition-all"
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
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-6 pt-12 border-t border-border">
                    <button
                      onClick={() => setShowForm(false)}
                      className="flex-1 h-16 rounded-4xl border border-border text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:bg-secondary transition-all shadow-sm"
                    >
                      Abort
                    </button>
                    <button
                      onClick={handleSaveQuiz}
                      disabled={savingStatus === "saving"}
                      className="flex-1 h-16 rounded-4xl bg-primary text-[10px] font-black uppercase tracking-widest text-primary-foreground hover:scale-[1.02] transition-all shadow-xl shadow-primary/20"
                    >
                      {savingStatus === "saving" ? "Syncing..." : "Commit Assessment Engine"}
                    </button>
                  </div>
               </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function CurriculumEditor({ basePath = "/admin/courses" }: { basePath?: string }) {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center bg-background text-foreground font-black uppercase tracking-[0.5em] animate-pulse">Initializing Curriculum Engine...</div>}>
      <CurriculumManager basePath={basePath} />
    </Suspense>
  );
}
