"use client";

import { useEffect, useState, Suspense } from "react";
import { getCourseById, getLessonsByCourseId, adminCreateLesson, adminUpdateLesson, adminDeleteLesson } from "@/lib/firestore";
import { Lesson, Course } from "@/types/firestore";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function LessonsManager() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const courseId = searchParams.get("id");
  
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [newLesson, setNewLesson] = useState({
    title: "",
    videoUrl: "",
    duration: "10:00",
    order: 0
  });

  useEffect(() => {
    async function fetchData() {
      if (!courseId) return router.push("/admin/courses");
      
      try {
        const [courseData, lessonsData] = await Promise.all([
          getCourseById(courseId),
          getLessonsByCourseId(courseId)
        ]);
        setCourse(courseData);
        setLessons(lessonsData);
        setNewLesson(prev => ({ ...prev, order: lessonsData.length + 1 }));
      } catch (error) {
        console.error("Failed to fetch curriculum:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [courseId, router]);

  const handleAddLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseId || !newLesson.title) return;
    
    setSaving(true);
    try {
      await adminCreateLesson({
        ...newLesson,
        courseId
      });
      // Refresh list
      const updatedLessons = await getLessonsByCourseId(courseId);
      setLessons(updatedLessons);
      setShowAddForm(false);
      setNewLesson({ title: "", videoUrl: "", duration: "10:00", order: updatedLessons.length + 1 });
    } catch (error) {
      console.error("Failed to add lesson:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteLesson = async (lessonId: string) => {
    if (!confirm("Are you sure? This will remove the lesson permanently.")) return;
    
    try {
      await adminDeleteLesson(lessonId);
      setLessons(prev => prev.filter(l => l.id !== lessonId));
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-950 text-white">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-zinc-800 border-t-white" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-20">
      <header className="flex items-center justify-between">
        <div>
          <Link href={`/admin/courses/edit?id=${courseId}`} className="text-sm font-bold text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors flex items-center gap-2">
            ← Back to Editor
          </Link>
          <h2 className="mt-4 text-4xl font-black tracking-tight">Curriculum: {course?.title}</h2>
          <p className="mt-2 text-zinc-500 font-medium">Manage modules, videos, and lesson order.</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="inline-flex h-12 items-center justify-center rounded-full bg-zinc-900 px-8 text-sm font-black text-zinc-50 transition-all hover:scale-105 active:scale-95 dark:bg-white dark:text-zinc-900 shadow-lg"
        >
          + Add New Lesson
        </button>
      </header>

      {/* Add Lesson Modal/Form */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-6">
          <div className="w-full max-w-2xl rounded-[3rem] border border-zinc-200 bg-white p-12 dark:border-zinc-800 dark:bg-zinc-950 shadow-2xl">
            <h3 className="text-2xl font-black mb-8">Add New Lesson</h3>
            <form onSubmit={handleAddLesson} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-zinc-400">Lesson Title</label>
                <input
                  type="text"
                  required
                  className="w-full rounded-2xl border border-zinc-100 bg-zinc-50 px-6 py-4 font-bold outline-none focus:border-zinc-900 dark:border-zinc-900 dark:bg-zinc-900/50 dark:focus:border-white"
                  value={newLesson.title}
                  onChange={e => setNewLesson({ ...newLesson, title: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-zinc-400">Video URL (YouTube)</label>
                  <input
                    type="url"
                    required
                    placeholder="https://youtube.com/watch?v=..."
                    className="w-full rounded-2xl border border-zinc-100 bg-zinc-50 px-6 py-4 font-bold outline-none focus:border-zinc-900 dark:border-zinc-900 dark:bg-zinc-900/50 dark:focus:border-white"
                    value={newLesson.videoUrl}
                    onChange={e => setNewLesson({ ...newLesson, videoUrl: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-zinc-400">Duration</label>
                  <input
                    type="text"
                    required
                    placeholder="15:30"
                    className="w-full rounded-2xl border border-zinc-100 bg-zinc-50 px-6 py-4 font-bold outline-none focus:border-zinc-900 dark:border-zinc-900 dark:bg-zinc-900/50 dark:focus:border-white"
                    value={newLesson.duration}
                    onChange={e => setNewLesson({ ...newLesson, duration: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex gap-4 mt-8">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 rounded-full border border-zinc-200 py-4 text-sm font-black dark:border-zinc-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 rounded-full bg-zinc-900 py-4 text-sm font-black text-white dark:bg-white dark:text-black"
                >
                  {saving ? "Saving..." : "Add Lesson"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lesson List */}
      <div className="space-y-4">
        {lessons.length === 0 ? (
          <div className="rounded-[3rem] border border-dashed border-zinc-200 py-20 text-center dark:border-zinc-800">
            <p className="text-zinc-500 font-medium">No lessons added yet. Start building your curriculum!</p>
          </div>
        ) : (
          lessons.map((lesson, idx) => (
            <div key={lesson.id} className="group flex items-center justify-between rounded-3xl border border-zinc-100 bg-white p-8 shadow-sm dark:border-zinc-900 dark:bg-zinc-950 transition-all hover:shadow-lg">
              <div className="flex items-center gap-8">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-50 text-xs font-black text-zinc-400 dark:bg-zinc-900">
                  {idx + 1}
                </div>
                <div>
                  <h4 className="text-xl font-black text-zinc-900 dark:text-zinc-50">{lesson.title}</h4>
                  <p className="text-xs font-bold text-zinc-500 mt-1 uppercase tracking-widest">{lesson.duration} • {lesson.videoUrl}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleDeleteLesson(lesson.id)}
                  className="rounded-full border border-red-100 px-6 py-2 text-xs font-black uppercase tracking-widest text-red-500 hover:bg-red-50 transition-colors"
                >
                  Remove
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default function LessonsClient() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center bg-zinc-950 text-white">Loading...</div>}>
      <LessonsManager />
    </Suspense>
  );
}
