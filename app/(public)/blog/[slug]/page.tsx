"use client";

import { useEffect, useState, use } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { getArticleBySlug } from "@/lib/articles";
import { Article } from "@/types/firestore";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Calendar, Clock, User, ChevronLeft, Share2, Send, Briefcase, Link as LinkIcon } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function ArticleDetailPage({ params }: PageProps) {
  const { slug } = use(params);
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadArticle() {
      try {
        const data = await getArticleBySlug(slug);
        setArticle(data);
      } catch (error) {
        console.error("Failed to load article:", error);
      } finally {
        setLoading(false);
      }
    }
    loadArticle();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-32 max-w-4xl">
          <div className="h-10 w-32 bg-zinc-900 animate-pulse rounded-full mb-8" />
          <div className="h-20 w-full bg-zinc-900 animate-pulse rounded-2xl mb-12" />
          <div className="aspect-video w-full bg-zinc-900 animate-pulse rounded-3xl mb-12" />
          <div className="space-y-4">
            <div className="h-6 w-full bg-zinc-900 animate-pulse rounded" />
            <div className="h-6 w-5/6 bg-zinc-900 animate-pulse rounded" />
            <div className="h-6 w-4/6 bg-zinc-900 animate-pulse rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <div className="flex-1 flex flex-col items-center justify-center p-4">
          <h1 className="text-4xl font-bold mb-4">ARTICLE NOT FOUND</h1>
          <p className="text-zinc-500 mb-8">The article you're looking for doesn't exist or has been removed.</p>
          <Link href="/blog">
            <Button>Back to Blog</Button>
          </Link>
        </div>
      </div>
    );
  }

  const formattedDate = article.publishedAt 
    ? new Date((article.publishedAt as any).seconds * 1000).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      })
    : "Draft";

  return (
    <div className="min-h-screen bg-background">
      <article className="container mx-auto px-4 py-20 max-w-4xl">
        {/* Back Link */}
        <Link href="/blog" className="inline-flex items-center gap-2 text-zinc-500 hover:text-primary transition-colors mb-12 font-bold uppercase tracking-widest text-xs">
          <ChevronLeft className="w-4 h-4" />
          Back to Blog
        </Link>

        {/* Header */}
        <header className="mb-16">
          <Badge className="bg-primary/10 text-primary border-primary/20 mb-6 px-4 py-1.5 text-xs font-bold uppercase tracking-widest">
            {article.category}
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tighter mb-8 leading-[1.1]">
            {article.title}
          </h1>
          
          <div className="flex flex-wrap items-center gap-6 text-zinc-500 border-y border-zinc-800 py-6">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-full overflow-hidden border border-zinc-800">
                <Image
                  src={article.authorPhoto || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop"}
                  alt={article.authorName}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-white font-bold text-sm leading-tight">{article.authorName}</span>
                <span className="text-xs uppercase tracking-tighter font-medium">Author</span>
              </div>
            </div>
            
            <div className="h-8 w-px bg-zinc-800 hidden sm:block" />
            
            <div className="flex items-center gap-2 text-sm font-medium">
              <Calendar className="w-4 h-4" />
              {formattedDate}
            </div>
            
            <div className="flex items-center gap-2 text-sm font-medium">
              <Clock className="w-4 h-4" />
              {article.readingTime || 5} min read
            </div>

            <div className="flex-grow" />

            <div className="flex items-center gap-3">
              <button className="p-2 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-colors">
                <Send className="w-4 h-4" />
              </button>
              <button className="p-2 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-colors">
                <Briefcase className="w-4 h-4" />
              </button>
              <button className="p-2 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-colors">
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>

        {/* Cover Image */}
        <div className="relative aspect-video w-full rounded-3xl overflow-hidden mb-16 border border-zinc-800">
          <Image
            src={article.coverImage || "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1200&h=675&fit=crop"}
            alt={article.title}
            fill
            priority
            className="object-cover"
          />
        </div>

        {/* Content */}
        <div className="prose prose-invert prose-zinc max-w-none prose-headings:font-bold prose-headings:tracking-tighter prose-p:text-zinc-400 prose-p:leading-relaxed prose-a:text-primary prose-code:text-primary prose-pre:bg-zinc-900/50 prose-pre:border prose-pre:border-zinc-800 prose-img:rounded-3xl">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {article.content}
          </ReactMarkdown>
        </div>

        {/* Footer Info */}
        <footer className="mt-20 pt-10 border-t border-zinc-800">
           <div className="flex flex-wrap gap-2 mb-10">
             {article.tags.map(tag => (
               <span key={tag} className="px-3 py-1 rounded-lg bg-zinc-900 text-zinc-500 text-xs font-bold border border-zinc-800">
                 #{tag}
               </span>
             ))}
           </div>

           <div className="glass p-10 rounded-3xl flex flex-col md:flex-row items-center gap-10">
              <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-primary/20 shrink-0">
                <Image
                  src={article.authorPhoto || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop"}
                  alt={article.authorName}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h4 className="text-xl font-bold text-white mb-2">Written by {article.authorName}</h4>
                <p className="text-zinc-500 mb-6 max-w-xl">
                  Building the future of education on Verox Academy. Expert in creator economy and high-scale SaaS architectures.
                </p>
                <div className="flex items-center justify-center md:justify-start gap-4">
                  <Link href={`/creator/${article.authorId}`}>
                    <Button variant="outline" size="sm" className="rounded-full">View Profile</Button>
                  </Link>
                  <Button variant="ghost" size="sm" className="rounded-full text-zinc-500 hover:text-white">Follow Author</Button>
                </div>
              </div>
           </div>
        </footer>
      </article>
    </div>
  );
}
