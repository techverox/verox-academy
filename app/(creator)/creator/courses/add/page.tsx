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
      await adminCreateCourse({
        ...formData,
        price: Number(formData.price) || 0,
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
    <div className="max-w-5xl mx-auto space-y-8">
      <header className="space-y-4">
        <Link href="/creator/courses" className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-zinc-500 hover:text-primary transition-colors">
          <ChevronLeft className="w-4 h-4" />
          Back to Courses
        </Link>
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-5xl font-black tracking-tighter">Draft New <span className="text-primary">Masterclass.</span></h1>
            <p className="mt-2 text-zinc-500 font-medium tracking-tight">Configure your course details to begin your journey.</p>
          </div>
          <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-[10px] font-black uppercase tracking-widest">Premium Creator Mode</span>
          </div>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-[2.5rem] p-10 space-y-8 backdrop-blur-xl">
            <div className="space-y-3">
              <label className="text-xs font-black uppercase tracking-widest text-zinc-500">Course Title</label>
              <input
                type="text"
                required
                placeholder="e.g. Advanced Multi-tenant Architecture"
                className="w-full bg-black border border-zinc-800 rounded-2xl px-6 py-5 text-xl font-black outline-none focus:border-primary transition-all placeholder:text-zinc-700"
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div className="space-y-3">
              <label className="text-xs font-black uppercase tracking-widest text-zinc-500">Course Description</label>
              <textarea
                rows={6}
                required
                placeholder="Deep dive into the curriculum and what students will achieve..."
                className="w-full bg-black border border-zinc-800 rounded-[2rem] px-6 py-5 font-medium outline-none focus:border-primary transition-all resize-none placeholder:text-zinc-700 leading-relaxed"
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Sidebar Settings */}
        <div className="space-y-8">
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-[2.5rem] p-8 space-y-8 backdrop-blur-xl">
            <div className="space-y-3">
              <label className="text-xs font-black uppercase tracking-widest text-zinc-500">Pricing (INR)</label>
              <div className="relative">
                <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-zinc-500">₹</span>
                <input
                  type="number"
                  required
                  placeholder="499"
                  className="w-full bg-black border border-zinc-800 rounded-2xl pl-10 pr-6 py-4 font-black outline-none focus:border-primary transition-all"
                  value={formData.price}
                  onChange={e => setFormData({ ...formData, price: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-black uppercase tracking-widest text-zinc-500">Thumbnail URL</label>
              <div className="relative">
                <ImageIcon className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="url"
                  required
                  className="w-full bg-black border border-zinc-800 rounded-2xl pl-12 pr-6 py-4 text-sm font-bold outline-none focus:border-primary transition-all"
                  value={formData.thumbnail}
                  onChange={e => setFormData({ ...formData, thumbnail: e.target.value })}
                />
              </div>
              <div className="mt-4 aspect-video rounded-2xl border border-zinc-800 overflow-hidden relative group">
                <img src={formData.thumbnail} alt="Preview" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                   <span className="text-[10px] font-black uppercase tracking-widest">Preview</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-800">
              <div className="flex items-center justify-between mb-8">
                <span className="text-xs font-black uppercase tracking-widest text-zinc-500">Publish Draft</span>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, published: !formData.published })}
                  className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
                    formData.published ? "bg-primary" : "bg-zinc-800"
                  }`}
                >
                  <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                    formData.published ? "translate-x-6" : "translate-x-1"
                  }`} />
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-5 bg-white text-black font-black rounded-2xl flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                ) : (
                  <>
                    LAUNCH COURSE
                    <Rocket className="w-5 h-5" />
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
