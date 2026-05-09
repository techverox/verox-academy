"use client";

import { useState } from "react";
import { adminCreateCourse } from "@/lib/firestore";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AddCoursePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    thumbnail: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3",
    price: "",
    published: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) return alert("Title is required");
    
    setLoading(true);
    try {
      await adminCreateCourse({
        ...formData,
        price: Number(formData.price) || 0,
      });
      router.push("/admin/courses");
    } catch (error) {
      console.error("Failed to create course:", error);
      alert("Error creating course. Check console.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      {/* DEBUG HEADING */}
      <div className="bg-purple-500 text-white px-4 py-1 text-[10px] font-bold uppercase tracking-widest inline-block rounded-md">
        Create Course
      </div>

      <header className="flex items-center justify-between">
        <div>
          <Link href="/admin/courses" className="text-sm font-bold text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors flex items-center gap-2">
            ← Back to Courses
          </Link>
          <h2 className="mt-4 text-4xl font-black tracking-tight">Create New Course</h2>
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
              placeholder="e.g. Master Next.js 15"
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
              placeholder="499"
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
            placeholder="Tell your students what they will learn..."
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
            Publish immediately
          </span>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-zinc-900 py-6 text-lg font-black text-white shadow-2xl transition-all hover:scale-[1.01] active:scale-[0.98] disabled:opacity-50 dark:bg-white dark:text-black"
        >
          {loading ? "Creating Course..." : "Create Course"}
        </button>
      </form>
    </div>
  );
}
