"use client";

import { useState } from "react";
import { adminCreateCourse } from "@/lib/firestore";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Sparkles, Rocket, Image as ImageIcon } from "lucide-react";

export default function CreatorAddCoursePage() {
  const router = useRouter();
  const { profile } = useAuth();
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
    if (!profile) return;
    
    setLoading(true);
    try {
      const price = Number(formData.price) || 0;
      if (price > 500000) {
        return alert("Maximum price allowed is ₹5,00,000");
      }
      
      await adminCreateCourse({
        ...formData,
        price,
      }, profile);
      router.push("/creator/courses");
    } catch (error) {
      console.error("Failed to create course:", error);
      alert("Error creating course.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="space-y-6">
        <Link href="/creator/courses" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-primary transition-all group">
          <ChevronLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
          Back to Courses
        </Link>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Create New Course
            </h1>
            <p className="mt-2 text-sm text-muted-foreground max-w-2xl">Configure the core details of your course to begin building your curriculum.</p>
          </div>
          <div className="hidden lg:flex items-center gap-2 px-4 py-2 bg-secondary/50 border border-border rounded-lg">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-foreground">New Course Setup</span>
          </div>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-10">
          <div className="bg-card border border-border rounded-xl p-8 space-y-8 shadow-sm">
            <div className="space-y-3">
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">Course Title</label>
              <input
                type="text"
                required
                placeholder="e.g. Introduction to Design Systems"
                className="w-full bg-secondary/30 border border-border rounded-lg px-6 py-4 text-xl font-bold outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all placeholder:text-muted-foreground/30 text-foreground"
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">Course Description</label>
              <textarea
                rows={6}
                required
                placeholder="Describe what students will learn in this course..."
                className="w-full bg-secondary/30 border border-border rounded-lg px-6 py-4 font-medium outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all resize-none placeholder:text-muted-foreground/30 text-foreground text-base"
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Sidebar Settings */}
        <div className="space-y-8">
          <div className="bg-card border border-border rounded-xl p-8 space-y-8 shadow-sm">
            <div className="space-y-3">
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">Price (INR)</label>
              <div className="relative">
                <span className="absolute left-6 top-1/2 -translate-y-1/2 font-bold text-muted-foreground/50 text-lg">₹</span>
                <input
                  type="number"
                  required
                  placeholder="499"
                  max="500000"
                  className="w-full bg-secondary/30 border border-border rounded-lg pl-12 pr-6 py-4 text-lg font-bold outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all text-foreground"
                  value={formData.price}
                  onChange={e => {
                    const val = Number(e.target.value);
                    if (val > 500000) return;
                    setFormData({ ...formData, price: e.target.value });
                  }}
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">Thumbnail URL</label>
              <div className="relative">
                <ImageIcon className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
                <input
                  type="url"
                  required
                  className="w-full bg-secondary/30 border border-border rounded-lg pl-12 pr-6 py-4 text-sm font-bold outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all text-foreground"
                  value={formData.thumbnail}
                  onChange={e => setFormData({ ...formData, thumbnail: e.target.value })}
                />
              </div>
              <div className="mt-4 aspect-video rounded-lg border border-border overflow-hidden relative group">
                <img src={formData.thumbnail} alt="Preview" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
              </div>
            </div>

            <div className="pt-6 border-t border-border">
              <div className="flex items-center justify-between mb-8">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-foreground">Course Visibility</span>
                  <span className="text-[10px] font-medium text-muted-foreground">Make course available in catalog</span>
                </div>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, published: !formData.published })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all ${
                    formData.published ? "bg-primary" : "bg-secondary"
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-all ${
                    formData.published ? "translate-x-6" : "translate-x-1"
                  }`} />
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-primary text-primary-foreground font-bold rounded-lg flex items-center justify-center gap-2 hover:bg-primary/90 transition-all disabled:opacity-50 shadow-sm text-xs uppercase tracking-wider"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-primary-foreground/20 border-t-primary-foreground rounded-full animate-spin" />
                    Creating...
                  </div>
                ) : (
                  <>
                    Create Course
                    <Rocket className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
