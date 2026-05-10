"use client";

import { useEffect, useState, use } from "react";
import ArticleForm from "@/components/creator/ArticleForm";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Article } from "@/types/firestore";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function EditArticlePage({ params }: PageProps) {
  const { id } = use(params);
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadArticle() {
      try {
        const docRef = doc(db, "articles", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setArticle({ id: docSnap.id, ...docSnap.data() } as Article);
        }
      } catch (error) {
        console.error("Failed to load article:", error);
      } finally {
        setLoading(false);
      }
    }
    loadArticle();
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-zinc-800 border-t-primary" />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="text-center py-20">
        <h1 className="text-2xl font-black mb-4">Article Not Found</h1>
        <p className="text-zinc-500">The article you are trying to edit does not exist.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <ArticleForm initialData={article} />
    </div>
  );
}
