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

function CurriculumManager() {
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
    if (!courseId) return router.push("/admin/courses");
    
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
      <div className="max-w-5xl mx-auto space-y-8 p-8 animate-pulse">
        <div className="h-10 w-64 bg-zinc-800 rounded-lg" />
        <div className="space-y-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-24 w-full bg-zinc-900 rounded-3xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-20 px-6">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <Link href={`/admin/courses/edit?id=${courseId}`} className="text-sm font-bold text-zinc-500 hover:text-white transition-colors flex items-center gap-2">
            ← Back to Course Editor
          </Link>
          <h1 className="mt-4 text-4xl font-black tracking-tight text-white">Curriculum Management</h1>
          <p className="mt-2 text-zinc-500 font-medium">Drag and drop to reorder. Manage lesson visibility and content.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className={`text-xs font-bold uppercase tracking-widest transition-all ${
            savingStatus === "saving" ? "text-yellow-500" : 
            savingStatus === "saved" ? "text-green-500" : 
            savingStatus === "failed" ? "text-red-500" : "text-zinc-600"
          }`}>
            {savingStatus === "saving" && "Saving changes..."}
            {savingStatus === "saved" && "All changes saved"}
            {savingStatus === "failed" && "Sync failed"}
            {savingStatus === "idle" && "System Synced"}
          </div>
          <button
            onClick={handleOpenAdd}
            className="h-12 rounded-full bg-white px-8 text-sm font-black text-black transition-all hover:scale-105 active:scale-95 shadow-xl"
          >
            + Add Lesson
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
                      className={`group flex items-center justify-between rounded-[2rem] border p-6 transition-all ${
                        snapshot.isDragging 
                        ? "border-white bg-zinc-900 shadow-2xl scale-[1.02] z-50" 
                        : "border-zinc-800 bg-zinc-950/50 hover:bg-zinc-900 hover:border-zinc-700"
                      }`}
                    >
                      <div className="flex items-center gap-6">
                        <div {...provided.dragHandleProps} className="cursor-grab active:cursor-grabbing p-2 text-zinc-700 hover:text-zinc-400">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                            <circle cx="9" cy="5" r="1" /><circle cx="9" cy="12" r="1" /><circle cx="9" cy="19" r="1" />
                            <circle cx="15" cy="5" r="1" /><circle cx="15" cy="12" r="1" /><circle cx="15" cy="19" r="1" />
                          </svg>
                        </div>
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-900 text-xs font-black text-zinc-500">
                          {lesson.order}
                        </div>
                        <div>
                          <div className="flex items-center gap-3">
                            <h3 className="text-lg font-black text-white">{lesson.title}</h3>
                            {lesson.isPreviewFree && (
                              <span className="rounded-full bg-blue-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-blue-500 border border-blue-500/20">
                                Preview
                              </span>
                            )}
                            {!lesson.published && (
                              <span className="rounded-full bg-zinc-800 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-zinc-500">
                                Draft
                              </span>
                            )}
                          </div>
                          <p className="mt-1 text-xs font-bold text-zinc-500 uppercase tracking-widest">
                            {lesson.duration} • ID: {lesson.wistiaMediaId || "N/A"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleTogglePublish(lesson)}
                          className={`rounded-full px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-colors ${
                            lesson.published ? "bg-green-500/10 text-green-500 border border-green-500/20" : "bg-zinc-800 text-zinc-400"
                          }`}
                        >
                          {lesson.published ? "Live" : "Publish"}
                        </button>
                        <button
                          onClick={() => handleDuplicate(lesson)}
                          className="rounded-full bg-zinc-800 p-2 text-zinc-400 hover:text-white transition-colors"
                          title="Duplicate"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /><rect width="13" height="13" x="9" y="9" rx="2" ry="2" /></svg>
                        </button>
                        <button
                          onClick={() => handleOpenEdit(lesson)}
                          className="rounded-full bg-zinc-800 p-2 text-zinc-400 hover:text-white transition-colors"
                          title="Edit"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                        </button>
                        <button
                          onClick={() => handleDelete(lesson.id)}
                          className="rounded-full bg-red-500/10 p-2 text-red-500 hover:bg-red-500 hover:text-white transition-colors"
                          title="Delete"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 6h18" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
          <div className="w-full max-w-2xl rounded-[3rem] border border-zinc-800 bg-zinc-950 p-10 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between mb-8">
               <h2 className="text-3xl font-black text-white">
                 {editingLesson ? "Edit Lesson" : "Create New Lesson"}
               </h2>
               {editingLesson && (
                 <div className="flex bg-zinc-900 rounded-2xl p-1">
                   <button 
                     onClick={() => setActiveModalTab("general")}
                     className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeModalTab === "general" ? "bg-white text-black shadow-lg" : "text-zinc-500 hover:text-white"}`}
                   >
                     General
                   </button>
                   <button 
                     onClick={() => setActiveModalTab("notes")}
                     className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeModalTab === "notes" ? "bg-white text-black shadow-lg" : "text-zinc-500 hover:text-white"}`}
                   >
                     Resources & Notes
                   </button>
                   <button 
                     onClick={() => setActiveModalTab("quiz")}
                     className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeModalTab === "quiz" ? "bg-white text-black shadow-lg" : "text-zinc-500 hover:text-white"}`}
                   >
                     Quiz Engine
                   </button>
                 </div>
               )}
            </div>

            {activeModalTab === "general" ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-zinc-500">Title</label>
                  <input
                    type="text"
                    required
                    className="w-full rounded-2xl border border-zinc-800 bg-zinc-900/50 px-6 py-4 font-bold text-white outline-none focus:border-white transition-all"
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-zinc-500">Description</label>
                  <textarea
                    rows={3}
                    className="w-full rounded-2xl border border-zinc-800 bg-zinc-900/50 px-6 py-4 font-bold text-white outline-none focus:border-white transition-all resize-none"
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-zinc-500">Duration (MM:SS)</label>
                    <input
                      type="text"
                      required
                      placeholder="10:00"
                      className="w-full rounded-2xl border border-zinc-800 bg-zinc-900/50 px-6 py-4 font-bold text-white outline-none focus:border-white transition-all"
                      value={formData.duration}
                      onChange={e => setFormData({ ...formData, duration: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-zinc-500">Wistia ID / URL</label>
                    <input
                      type="text"
                      required
                      className="w-full rounded-2xl border border-zinc-800 bg-zinc-900/50 px-6 py-4 font-bold text-white outline-none focus:border-white transition-all"
                      value={formData.wistiaMediaId}
                      onChange={e => setFormData({ ...formData, wistiaMediaId: extractWistiaId(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="flex flex-wrap gap-6 pt-4">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div 
                      onClick={() => setFormData({ ...formData, isPreviewFree: !formData.isPreviewFree })}
                      className={`h-6 w-11 rounded-full transition-colors relative flex items-center ${formData.isPreviewFree ? "bg-blue-600" : "bg-zinc-800"}`}
                    >
                      <div className={`h-4 w-4 rounded-full bg-white transition-transform ${formData.isPreviewFree ? "translate-x-6" : "translate-x-1"}`} />
                    </div>
                    <span className="text-sm font-black uppercase tracking-widest text-zinc-400 group-hover:text-white transition-colors">Free Preview</span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div 
                      onClick={() => setFormData({ ...formData, published: !formData.published })}
                      className={`h-6 w-11 rounded-full transition-colors relative flex items-center ${formData.published ? "bg-green-600" : "bg-zinc-800"}`}
                    >
                      <div className={`h-4 w-4 rounded-full bg-white transition-transform ${formData.published ? "translate-x-6" : "translate-x-1"}`} />
                    </div>
                    <span className="text-sm font-black uppercase tracking-widest text-zinc-400 group-hover:text-white transition-colors">Published</span>
                  </label>
                </div>

                <div className="flex gap-4 pt-8">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="flex-1 rounded-full border border-zinc-800 py-4 text-sm font-black text-zinc-500 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingStatus === "saving"}
                    className="flex-1 rounded-full bg-white py-4 text-sm font-black text-black hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                  >
                    {savingStatus === "saving" ? "Saving..." : editingLesson ? "Update Lesson" : "Create Lesson"}
                  </button>
                </div>
              </form>
            ) : activeModalTab === "notes" ? (
              <div className="space-y-8 animate-in fade-in duration-500">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-black uppercase tracking-widest text-zinc-500">Lesson Resources</label>
                    <button 
                      onClick={handleAddResource}
                      className="text-xs font-black text-blue-500 hover:underline"
                    >
                      + Add Asset
                    </button>
                  </div>
                  <div className="space-y-3">
                    {resLoading ? (
                      <div className="py-4 text-center text-xs text-zinc-600 font-bold">Syncing assets...</div>
                    ) : resources.length > 0 ? (
                      resources.map(res => (
                        <div key={res.id} className="flex items-center justify-between p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-500 font-black text-[10px] uppercase">
                              {res.type}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-white leading-none">{res.title}</p>
                              <p className="text-[10px] text-zinc-600 mt-1 truncate max-w-[200px]">{res.url}</p>
                            </div>
                          </div>
                          <button 
                            onClick={() => handleDeleteResource(res.id)}
                            className="p-2 text-zinc-600 hover:text-red-500 transition-colors"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6L6 18M6 6l12 12"/></svg>
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="py-8 text-center rounded-2xl border border-dashed border-zinc-800 text-zinc-600 text-xs font-medium">
                        No downloadable assets linked yet.
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-xs font-black uppercase tracking-widest text-zinc-500">Markdown Lesson Notes</label>
                  <textarea
                    rows={10}
                    className="w-full rounded-2xl border border-zinc-800 bg-zinc-900/50 px-6 py-4 font-bold text-white outline-none focus:border-white transition-all font-mono text-sm leading-relaxed"
                    placeholder="# Concepts Covered\n\n- Point A\n- Point B"
                    value={formData.notes}
                    onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  />
                  <p className="text-[10px] font-bold text-zinc-600 italic">Supports GitHub Flavored Markdown (GFM).</p>
                </div>

                <div className="flex gap-4 pt-4 border-t border-zinc-900">
                  <button
                    onClick={() => setShowForm(false)}
                    className="flex-1 rounded-full border border-zinc-800 py-4 text-sm font-black text-zinc-500 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={savingStatus === "saving"}
                    className="flex-1 rounded-full bg-white py-4 text-sm font-black text-black hover:scale-[1.02] active:scale-[0.98] transition-all"
                  >
                    {savingStatus === "saving" ? "Syncing..." : "Save Notes & Resources"}
                  </button>
                </div>
              </div>
            ) : (
               <div className="space-y-8 animate-in fade-in duration-500">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-white">Lesson Evaluation</h3>
                    <button 
                      onClick={handleAddQuestion}
                      className="h-10 rounded-full bg-zinc-800 px-6 text-xs font-black text-white border border-zinc-700 hover:border-white transition-colors"
                    >
                      + Add Question
                    </button>
                  </div>

                  <div className="space-y-4">
                    <label className="text-xs font-black uppercase tracking-widest text-zinc-500">Passing Score (%)</label>
                    <input 
                      type="number"
                      className="w-full rounded-2xl border border-zinc-800 bg-zinc-900/50 px-6 py-4 font-bold text-white outline-none focus:border-white transition-all"
                      value={quizForm.passingScore}
                      onChange={e => setQuizForm({...quizForm, passingScore: Number(e.target.value)})}
                    />
                  </div>

                  <div className="space-y-6">
                    {quizForm.questions.map((q, qIdx) => (
                      <div key={q.id} className="p-6 rounded-[2rem] border border-zinc-800 bg-zinc-900/30 space-y-4">
                         <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600">Question {qIdx + 1}</span>
                            <button 
                              onClick={() => {
                                const newQs = [...quizForm.questions];
                                newQs.splice(qIdx, 1);
                                setQuizForm({...quizForm, questions: newQs});
                              }}
                              className="text-xs font-bold text-red-500 hover:underline"
                            >
                              Remove
                            </button>
                         </div>
                         <input 
                           type="text"
                           className="w-full bg-transparent border-b border-zinc-800 py-2 font-bold text-white outline-none focus:border-white"
                           value={q.text}
                           onChange={e => {
                             const newQs = [...quizForm.questions];
                             newQs[qIdx].text = e.target.value;
                             setQuizForm({...quizForm, questions: newQs});
                           }}
                         />
                         <div className="grid grid-cols-2 gap-4">
                            {q.options.map((opt, oIdx) => (
                              <div key={oIdx} className="flex items-center gap-2">
                                 <input 
                                   type="radio"
                                   name={`correct-${q.id}`}
                                   checked={q.correctOptionIndex === oIdx}
                                   onChange={() => {
                                      const newQs = [...quizForm.questions];
                                      newQs[qIdx].correctOptionIndex = oIdx;
                                      setQuizForm({...quizForm, questions: newQs});
                                   }}
                                 />
                                 <input 
                                   type="text"
                                   className="flex-1 bg-zinc-900 rounded-xl px-4 py-2 text-xs font-medium text-white border border-zinc-800"
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

                  <div className="flex gap-4 pt-4 border-t border-zinc-900">
                    <button
                      onClick={() => setShowForm(false)}
                      className="flex-1 rounded-full border border-zinc-800 py-4 text-sm font-black text-zinc-500 hover:text-white transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveQuiz}
                      disabled={savingStatus === "saving"}
                      className="flex-1 rounded-full bg-white py-4 text-sm font-black text-black hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                      {savingStatus === "saving" ? "Syncing..." : "Save Quiz Engine"}
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

export default function CurriculumClient() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center bg-black text-white">Loading Curriculum Engine...</div>}>
      <CurriculumManager />
    </Suspense>
  );
}
