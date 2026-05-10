"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { getArticlesByAuthor, saveArticle } from "@/lib/articles";
import { Article } from "@/types/firestore";
import { 
  Plus, 
  FileText, 
  Eye, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  Clock,
  MoreVertical,
  ExternalLink
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import Image from "next/image";

export default function CreatorArticlesPage() {
  const { user } = useAuth();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadArticles();
    }
  }, [user]);

  async function loadArticles() {
    try {
      const data = await getArticlesByAuthor(user!.uid);
      setArticles(data);
    } catch (error) {
      console.error("Failed to load articles:", error);
    } finally {
      setLoading(false);
    }
  }

  async function togglePublish(article: Article) {
    try {
      await saveArticle({
        id: article.id,
        published: !article.published
      });
      loadArticles();
    } catch (error) {
      console.error("Failed to toggle publish status:", error);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-48 bg-zinc-900 animate-pulse rounded-lg" />
        <div className="grid grid-cols-1 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-zinc-900/50 border border-zinc-800 rounded-3xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight mb-2 uppercase">My Articles</h1>
          <p className="text-zinc-500 font-medium">Manage your educational content and grow your authority.</p>
        </div>
        <Link href="/creator/articles/new">
          <Button className="rounded-full px-8 gap-2">
            <Plus className="w-5 h-5" />
            Write Article
          </Button>
        </Link>
      </div>

      <div className="bg-zinc-900/30 border border-zinc-800 rounded-[2.5rem] overflow-hidden">
        {articles.length === 0 ? (
          <div className="p-20 text-center flex flex-col items-center">
            <div className="w-20 h-20 bg-zinc-800 rounded-full flex items-center justify-center mb-6">
              <FileText className="w-10 h-10 text-zinc-600" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">No articles yet</h2>
            <p className="text-zinc-500 mb-8 max-w-sm">Share your knowledge with the world and attract more students to your courses.</p>
            <Link href="/creator/articles/new">
              <Button variant="outline" className="rounded-full">Create Your First Article</Button>
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-zinc-800">
            {articles.map((article) => (
              <div key={article.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-zinc-800/30 transition-all group">
                <div className="flex items-center gap-6">
                  <div className="relative w-24 h-16 rounded-xl overflow-hidden border border-zinc-800 shrink-0">
                    <Image
                      src={article.coverImage || "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=200&h=150&fit=crop"}
                      alt={article.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white mb-1 group-hover:text-primary transition-colors">{article.title}</h3>
                    <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-zinc-500">
                      <div className="flex items-center gap-1.5">
                        <Badge variant="outline" className="bg-zinc-800 border-zinc-700 text-zinc-400 capitalize">
                          {article.category}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        {article.readingTime || 5} min
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Eye className="w-3.5 h-3.5" />
                        {article.viewCount || 0} views
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Badge className={`px-4 py-1.5 rounded-full font-black uppercase tracking-widest text-[10px] ${
                    article.published 
                      ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" 
                      : "bg-zinc-800 text-zinc-500 border-zinc-700"
                  }`}>
                    {article.published ? "Published" : "Draft"}
                  </Badge>
                  
                  <div className="h-8 w-px bg-zinc-800 mx-2" />

                  <div className="flex items-center gap-2">
                    {article.published && (
                      <Link href={`/blog/${article.slug}`} target="_blank">
                        <button className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-all" title="View Live">
                          <ExternalLink className="w-4 h-4" />
                        </button>
                      </Link>
                    )}
                    <Link href={`/creator/articles/edit/${article.id}`}>
                      <button className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-all" title="Edit">
                        <Edit3 className="w-4 h-4" />
                      </button>
                    </Link>
                    <button 
                      onClick={() => togglePublish(article)}
                      className={`p-3 rounded-xl border transition-all ${
                        article.published 
                          ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/20" 
                          : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-emerald-500"
                      }`}
                      title={article.published ? "Unpublish" : "Publish"}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
