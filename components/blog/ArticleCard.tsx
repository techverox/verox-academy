"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Article } from "@/types/firestore";
import { Badge } from "@/components/ui/Badge";
import { Calendar, Clock, ArrowRight } from "lucide-react";

interface ArticleCardProps {
  article: Article;
}

export default function ArticleCard({ article }: ArticleCardProps) {
  const formattedDate = article.publishedAt 
    ? new Date((article.publishedAt as any).seconds * 1000).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    : "Draft";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group flex flex-col h-full glass border-zinc-800/50 hover:border-primary/30 transition-all duration-300 rounded-3xl overflow-hidden"
    >
      <Link href={`/blog/${article.slug}`} className="relative aspect-[16/9] overflow-hidden">
        <Image
          src={article.coverImage || "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&h=450&fit=crop"}
          alt={article.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute top-4 left-4">
          <Badge className="bg-primary/90 backdrop-blur-md border-none text-white font-bold px-3 py-1">
            {article.category}
          </Badge>
        </div>
      </Link>

      <div className="flex flex-col flex-1 p-6">
        <div className="flex items-center gap-4 text-xs text-zinc-500 mb-4 font-medium uppercase tracking-widest">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            {formattedDate}
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            {article.readingTime || 5} min read
          </div>
        </div>

        <Link href={`/blog/${article.slug}`}>
          <h3 className="text-xl font-bold text-white mb-3 group-hover:text-primary transition-colors line-clamp-2">
            {article.title}
          </h3>
        </Link>
        
        <p className="text-zinc-400 text-sm line-clamp-3 mb-6 flex-1">
          {article.excerpt}
        </p>

        <div className="pt-6 border-t border-zinc-800/50 flex items-center justify-between mt-auto">
          <div className="flex items-center gap-2">
            <div className="relative w-8 h-8 rounded-full overflow-hidden border border-zinc-800">
              <Image
                src={article.authorPhoto || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop"}
                alt={article.authorName}
                fill
                className="object-cover"
              />
            </div>
            <span className="text-xs font-bold text-zinc-300">{article.authorName}</span>
          </div>
          <Link href={`/blog/${article.slug}`} className="flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-primary group-hover:gap-2.5 transition-all">
            Read More
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
