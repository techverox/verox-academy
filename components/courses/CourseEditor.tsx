"use client";

import { useEffect, useState, Suspense } from "react";
import { getCourseById, adminUpdateCourse } from "@/lib/firestore";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function EditCourseForm({ basePath }: { basePath: string }) {
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
      router.push(basePath);
    } catch (error) {
      console.error("Failed to update course:", error);
      alert("Error updating course.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-16 w-16 animate-spin rounded-full border-[6px] border-secondary border-t-primary shadow-2xl" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <Link href={basePath} className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-primary transition-all flex items-center gap-2 group">
            <div className="p-2 rounded-lg bg-secondary group-hover:bg-primary/10 transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="group-hover:-translate-x-1 transition-transform"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            </div>
            Registry Inventory
          </Link>
          <h2 className="mt-8 text-5xl font-black tracking-tight text-foreground md:text-6xl leading-[1.1]">Refine <span className="text-primary">Masterclass.</span></h2>
          <p className="mt-4 text-muted-foreground font-medium text-lg">Modify the core architectural parameters of this educational asset.</p>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="space-y-12 rounded-[3.5rem] border border-border bg-card p-12 shadow-2xl backdrop-blur-3xl relative overflow-hidden shadow-primary/5">
        <div className="grid gap-10 md:grid-cols-2">
          {/* Title */}
          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground ml-2">Registry Designation</label>
            <input
              type="text"
              required
              className="w-full rounded-[1.5rem] border border-border bg-secondary/30 px-8 py-5 text-xl font-black text-foreground outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all placeholder:text-muted-foreground/30"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          {/* Price */}
          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground ml-2">Market Valuation (INR)</label>
            <div className="relative">
              <span className="absolute left-8 top-1/2 -translate-y-1/2 font-black text-muted-foreground/30 text-xl">₹</span>
              <input
                type="number"
                required
                className="w-full rounded-[1.5rem] border border-border bg-secondary/30 pl-14 pr-8 py-5 text-xl font-black text-foreground outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all"
                value={formData.price}
                onChange={e => setFormData({ ...formData, price: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-4">
          <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground ml-2">Executive Summary</label>
          <textarea
            rows={5}
            required
            className="w-full rounded-[1.5rem] border border-border bg-secondary/30 px-8 py-5 font-bold text-foreground outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all resize-none leading-relaxed"
            value={formData.description}
            onChange={e => setFormData({ ...formData, description: e.target.value })}
          />
        </div>

        {/* Thumbnail URL */}
        <div className="space-y-4">
          <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground ml-2">Identity Blueprint (URL)</label>
          <input
            type="url"
            required
            className="w-full rounded-[1.5rem] border border-border bg-secondary/30 px-8 py-5 font-black text-foreground outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all text-sm"
            value={formData.thumbnail}
            onChange={e => setFormData({ ...formData, thumbnail: e.target.value })}
          />
        </div>

        {/* Publish Toggle */}
        <div className="flex items-center gap-6 py-4 border-t border-border">
          <button
            type="button"
            onClick={() => setFormData({ ...formData, published: !formData.published })}
            className={`relative inline-flex h-10 w-16 items-center rounded-full transition-all duration-500 shadow-inner ${
              formData.published ? "bg-primary shadow-primary/30" : "bg-secondary"
            }`}
          >
            <span className={`inline-block h-8 w-8 transform rounded-full bg-white shadow-md transition-all duration-500 ${
              formData.published ? "translate-x-7" : "translate-x-1"
            }`} />
          </button>
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground">Global Availability</span>
            <span className="text-[10px] font-medium text-muted-foreground">{formData.published ? "Visible in registry catalog" : "Restricted to administrative vault"}</span>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 h-20 rounded-[1.5rem] bg-foreground text-background text-[10px] font-black uppercase tracking-widest shadow-2xl transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
          >
            {saving ? "Synchronizing..." : "Update Blueprint"}
          </button>
          <Link
            href={`${basePath}/curriculum?id=${courseId}`}
            className="flex-1 h-20 flex items-center justify-center rounded-[1.5rem] border border-border bg-secondary/50 text-[10px] font-black uppercase tracking-widest shadow-sm transition-all hover:bg-secondary"
          >
            Engineer Curriculum
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="ml-3"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </Link>
        </div>
      </form>
    </div>
  );
}

export default function CourseEditor({ basePath = "/admin/courses" }: { basePath?: string }) {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center bg-background text-foreground font-black uppercase tracking-[0.5em] animate-pulse">Initializing Blueprint Editor...</div>}>
      <EditCourseForm basePath={basePath} />
    </Suspense>
  );
}
