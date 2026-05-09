"use client";

import { useEffect, useState, Suspense } from "react";
import { getCourseById, adminUpdateCourse } from "@/lib/firestore";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function EditCourseForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const courseId = searchParams.get("id");
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    thumbnail: "",
    price: "",
    published: false,
  });

  useEffect(() => {
    async function fetchCourse() {
      if (!courseId) {
        router.push("/admin/courses");
        return;
      }
      
      try {
        const data = await getCourseById(courseId);
        if (data) {
          setFormData({
            title: data.title,
            description: data.description,
            thumbnail: data.thumbnail,
            price: data.price.toString(),
            published: data.published,
          });
        }
      } catch (error) {
        console.error("Failed to fetch course:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchCourse();
  }, [courseId, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseId) return;
    
    setSaving(true);
    try {
      await adminUpdateCourse(courseId, {
        ...formData,
        price: Number(formData.price) || 0,
      });
      router.push("/admin/courses");
    } catch (error) {
      console.error("Failed to update course:", error);
      alert("Error updating course.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-zinc-200 border-t-zinc-900 dark:border-t-zinc-50" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <header className="flex items-center justify-between">
        <div>
          <Link href="/admin/courses" className="text-sm font-bold text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors flex items-center gap-2">
            ← Back to Courses
          </Link>
          <h2 className="mt-4 text-4xl font-black tracking-tight">Edit Course</h2>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="space-y-10 rounded-[3rem] border border-zinc-200 bg-white p-12 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <div className="grid gap-10 md:grid-cols-2">
          {/* Title */}
          <div className="space-y-3">
            <label className="text-xs font-black uppercase tracking-widest text-zinc-400">Course Title</label>
            <input
              type="text"
              required
              className="w-full rounded-2xl border border-zinc-100 bg-zinc-50 px-6 py-4 font-bold outline-none focus:border-zinc-900 dark:border-zinc-900 dark:bg-zinc-900/50 dark:focus:border-white transition-all"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          {/* Price */}
          <div className="space-y-3">
            <label className="text-xs font-black uppercase tracking-widest text-zinc-400">Price (INR)</label>
            <input
              type="number"
              required
              className="w-full rounded-2xl border border-zinc-100 bg-zinc-50 px-6 py-4 font-bold outline-none focus:border-zinc-900 dark:border-zinc-900 dark:bg-zinc-900/50 dark:focus:border-white transition-all"
              value={formData.price}
              onChange={e => setFormData({ ...formData, price: e.target.value })}
            />
          </div>
        </div>

        {/* Description */}
        <div className="space-y-3">
          <label className="text-xs font-black uppercase tracking-widest text-zinc-400">Description</label>
          <textarea
            rows={4}
            required
            className="w-full rounded-[2rem] border border-zinc-100 bg-zinc-50 px-6 py-4 font-bold outline-none focus:border-zinc-900 dark:border-zinc-900 dark:bg-zinc-900/50 dark:focus:border-white transition-all resize-none"
            value={formData.description}
            onChange={e => setFormData({ ...formData, description: e.target.value })}
          />
        </div>

        {/* Thumbnail URL */}
        <div className="space-y-3">
          <label className="text-xs font-black uppercase tracking-widest text-zinc-400">Thumbnail Image URL</label>
          <input
            type="url"
            required
            className="w-full rounded-2xl border border-zinc-100 bg-zinc-50 px-6 py-4 font-bold outline-none focus:border-zinc-900 dark:border-zinc-900 dark:bg-zinc-900/50 dark:focus:border-white transition-all"
            value={formData.thumbnail}
            onChange={e => setFormData({ ...formData, thumbnail: e.target.value })}
          />
        </div>

        {/* Publish Toggle */}
        <div className="flex items-center gap-4 py-4">
          <button
            type="button"
            onClick={() => setFormData({ ...formData, published: !formData.published })}
            className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
              formData.published ? "bg-zinc-900 dark:bg-white" : "bg-zinc-200 dark:bg-zinc-800"
            }`}
          >
            <span className={`inline-block h-6 w-6 transform rounded-full bg-white dark:bg-black transition-transform ${
              formData.published ? "translate-x-7" : "translate-x-1"
            }`} />
          </button>
          <span className="text-sm font-black uppercase tracking-widest text-zinc-900 dark:text-zinc-50">
            Course is {formData.published ? "Live" : "Draft"}
          </span>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 rounded-full bg-zinc-900 py-6 text-lg font-black text-white shadow-2xl transition-all hover:scale-[1.01] active:scale-[0.98] disabled:opacity-50 dark:bg-white dark:text-black"
          >
            {saving ? "Saving Changes..." : "Update Course"}
          </button>
          <Link
            href={`/admin/courses/lessons?id=${courseId}`}
            className="flex-1 flex items-center justify-center rounded-full border border-zinc-200 py-6 text-lg font-black shadow-sm transition-all hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900"
          >
            Manage Curriculum →
          </Link>
        </div>
      </form>
    </div>
  );
}

export default function EditClient() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center bg-zinc-950 text-white">Loading...</div>}>
      <EditCourseForm />
    </Suspense>
  );
}
