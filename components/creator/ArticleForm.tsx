"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { saveArticle } from "@/lib/articles";
import { Article } from "@/types/firestore";
import { useRouter } from "next/navigation";
import { 
  Save, 
  Eye, 
  Image as ImageIcon, 
  Tag, 
  Layout, 
  ChevronLeft,
  X,
  Loader2
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import Image from "next/image";

interface ArticleFormProps {
  initialData?: Article;
}

export default function ArticleForm({ initialData }: ArticleFormProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    slug: initialData?.slug || "",
    content: initialData?.content || "",
    excerpt: initialData?.excerpt || "",
    coverImage: initialData?.coverImage || "",
    category: initialData?.category || "Creator Economy",
    tags: initialData?.tags || [] as string[],
    published: initialData?.published || false,
  });

  const [currentTag, setCurrentTag] = useState("");

  useEffect(() => {
    if (formData.title && !initialData) {
      setFormData(prev => ({
        ...prev,
        slug: formData.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
      }));
    }
  }, [formData.title, initialData]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    
    setLoading(true);
    try {
      const articleId = await saveArticle({
        ...initialData,
        ...formData,
        authorId: user.uid,
        authorName: user.displayName || "Verox Creator",
        authorPhoto: user.photoURL,
        readingTime: Math.ceil(formData.content.split(/\s+/).length / 200), // ~200 words per minute
      });
      
      router.push("/creator/articles");
      router.refresh();
    } catch (error) {
      console.error("Failed to save article:", error);
    } finally {
      setLoading(false);
    }
  }

  function addTag() {
    if (currentTag && !formData.tags.includes(currentTag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, currentTag]
      }));
      setCurrentTag("");
    }
  }

  function removeTag(tagToRemove: string) {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tagToRemove)
    }));
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-12 pb-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/creator/articles">
            <button type="button" className="p-3 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-white transition-all">
              <ChevronLeft className="w-5 h-5" />
            </button>
          </Link>
          <h1 className="text-3xl font-bold uppercase tracking-tighter">
            {initialData ? "Edit Article" : "New Article"}
          </h1>
        </div>
        <div className="flex items-center gap-4">
           <Button 
            type="submit" 
            disabled={loading}
            className="rounded-full px-8 gap-2"
           >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {initialData ? "Update Article" : "Publish Article"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-8">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 ml-1">Article Title</label>
            <input 
              required
              value={formData.title}
              onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="e.g. The Future of SaaS in 2026"
              className="w-full bg-zinc-900/50 border border-zinc-800 rounded-3xl p-6 text-xl font-bold focus:outline-none focus:border-primary/50 transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 ml-1">URL Slug</label>
            <div className="relative">
              <span className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-600 font-medium text-sm">/blog/</span>
              <input 
                required
                value={formData.slug}
                onChange={e => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                className="w-full bg-zinc-900/50 border border-zinc-800 rounded-2xl p-4 pl-20 text-sm font-bold focus:outline-none focus:border-primary/50 transition-all text-primary"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between ml-1">
              <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Content (Markdown)</label>
              <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-600 uppercase tracking-widest">
                <FileText className="w-3 h-3" />
                Supports GFM
              </div>
            </div>
            <textarea 
              required
              rows={20}
              value={formData.content}
              onChange={e => setFormData(prev => ({ ...prev, content: e.target.value }))}
              placeholder="Write your masterpiece here..."
              className="w-full bg-zinc-900/50 border border-zinc-800 rounded-3xl p-8 text-lg leading-relaxed focus:outline-none focus:border-primary/50 transition-all font-mono"
            />
          </div>
        </div>

        {/* Sidebar Settings */}
        <div className="space-y-8">
          {/* Cover Image */}
          <div className="bg-zinc-900/30 border border-zinc-800 rounded-[2rem] p-8 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <ImageIcon className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-bold uppercase tracking-widest text-white">Cover Image</h3>
            </div>
            {formData.coverImage && (
              <div className="relative aspect-video rounded-2xl overflow-hidden border border-zinc-800 mb-4">
                <Image src={formData.coverImage} alt="Cover" fill className="object-cover" />
                <button 
                  type="button" 
                  onClick={() => setFormData(prev => ({ ...prev, coverImage: "" }))}
                  className="absolute top-2 right-2 p-1 bg-black/50 backdrop-blur-md rounded-full text-white hover:bg-red-500 transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
            <input 
              value={formData.coverImage}
              onChange={e => setFormData(prev => ({ ...prev, coverImage: e.target.value }))}
              placeholder="Image URL (e.g. Unsplash)"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-primary"
            />
          </div>

          {/* Excerpt */}
          <div className="bg-zinc-900/30 border border-zinc-800 rounded-[2rem] p-8 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Layout className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-bold uppercase tracking-widest text-white">Excerpt</h3>
            </div>
            <textarea 
              rows={4}
              value={formData.excerpt}
              onChange={e => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
              placeholder="A short summary for search results and social sharing..."
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-xs focus:outline-none focus:border-primary leading-relaxed"
            />
          </div>

          {/* Category & Tags */}
          <div className="bg-zinc-900/30 border border-zinc-800 rounded-[2rem] p-8 space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Category</label>
              <select 
                value={formData.category}
                onChange={e => setFormData(prev => ({ ...prev, category: e.target.value }))}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-primary text-white"
              >
                <option>Creator Economy</option>
                <option>Development</option>
                <option>Design</option>
                <option>Marketing</option>
                <option>SaaS</option>
                <option>Productivity</option>
              </select>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Tags</label>
              <div className="flex items-center gap-2">
                <input 
                  value={currentTag}
                  onChange={e => setCurrentTag(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addTag())}
                  placeholder="Add tag..."
                  className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-primary"
                />
                <Button type="button" onClick={addTag} size="sm" variant="outline" className="rounded-xl border-zinc-800">Add</Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.tags.map(tag => (
                  <span key={tag} className="flex items-center gap-1.5 px-3 py-1 bg-zinc-800 rounded-lg text-xs text-zinc-400 font-bold border border-zinc-700">
                    {tag}
                    <button type="button" onClick={() => removeTag(tag)}>
                      <X className="w-3 h-3 hover:text-red-500" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Visibility */}
          <div className="bg-zinc-900/30 border border-zinc-800 rounded-[2rem] p-8">
            <label className="flex items-center gap-4 cursor-pointer group">
              <div 
                onClick={() => setFormData(prev => ({ ...prev, published: !prev.published }))}
                className={`w-14 h-8 rounded-full border-2 transition-all flex items-center px-1 ${
                  formData.published 
                    ? "bg-primary border-primary justify-end" 
                    : "bg-zinc-950 border-zinc-800 justify-start"
                }`}
              >
                <div className="w-5 h-5 rounded-full bg-white shadow-lg" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold uppercase tracking-widest text-white">Public Visibility</span>
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-tighter">
                  {formData.published ? "Visible on blog" : "Saved as draft"}
                </span>
              </div>
            </label>
          </div>
        </div>
      </div>
    </form>
  );
}

// Minimal FileText icon
const FileText = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
  </svg>
);
