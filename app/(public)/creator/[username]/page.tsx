"use client";

import { useEffect, useState, use } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { getUserByUsername } from "@/lib/users";
import { getCoursesByCreator, getCreatorStats } from "@/lib/firestore";
import { getArticlesByAuthor } from "@/lib/articles";
import { User, Course, CreatorStats, Article } from "@/types/firestore";
import CourseCard from "@/components/CourseCard";
import ArticleCard from "@/components/blog/ArticleCard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Users, BookOpen, Star, Globe, Send, Briefcase, Terminal, CheckCircle2 } from "lucide-react";

interface PageProps {
  params: Promise<{ username: string }>;
}

export default function CreatorPublicProfile({ params }: PageProps) {
  const { username } = use(params);
  const [creator, setCreator] = useState<User | null>(null);
  const [stats, setStats] = useState<CreatorStats | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"courses" | "articles">("courses");

  useEffect(() => {
    async function loadCreatorData() {
      try {
        const user = await getUserByUsername(username);
        if (user && user.role === "creator" || user?.role === "admin") {
          setCreator(user);
          const [statsData, coursesData, articlesData] = await Promise.all([
            getCreatorStats(user.uid),
            getCoursesByCreator(user.uid),
            getArticlesByAuthor(user.uid)
          ]);
          setStats(statsData);
          setCourses(coursesData.filter(c => c.published));
          setArticles(articlesData.filter(a => a.published));
        }
      } catch (error) {
        console.error("Failed to load creator data:", error);
      } finally {
        setLoading(false);
      }
    }
    loadCreatorData();
  }, [username]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-32 flex flex-col items-center">
          <div className="w-32 h-32 rounded-full bg-zinc-900 animate-pulse mb-8" />
          <div className="h-10 w-64 bg-zinc-900 animate-pulse rounded-xl mb-4" />
          <div className="h-6 w-96 bg-zinc-900 animate-pulse rounded-lg" />
        </div>
      </div>
    );
  }

  if (!creator) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <div className="flex-1 flex flex-col items-center justify-center">
          <h1 className="text-4xl font-black mb-4">CREATOR NOT FOUND</h1>
          <p className="text-zinc-500 mb-8">This user is not a verified creator on Verox Academy.</p>
          <Link href="/">
            <Button>Back to Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Header */}
      <section className="relative pt-32 pb-20 overflow-hidden border-b border-zinc-800">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-gradient-to-b from-primary/5 to-transparent" />
        </div>

        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative w-32 h-32 md:w-40 md:h-40 rounded-full mb-8"
            >
              <Image
                src={creator.photoURL || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop"}
                alt={creator.name || "Creator"}
                fill
                className="rounded-full object-cover border-4 border-zinc-900 shadow-2xl shadow-primary/20"
              />
              {creator.verified && (
                <div className="absolute bottom-2 right-2 bg-primary p-2 rounded-full border-4 border-zinc-900">
                  <CheckCircle2 className="w-5 h-5 text-white" />
                </div>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-4 uppercase">
                {creator.name}
              </h1>
              <div className="flex items-center justify-center gap-2 text-primary font-bold mb-6">
                <span className="text-sm uppercase tracking-widest">@{username}</span>
                <span className="w-1 h-1 rounded-full bg-zinc-700" />
                <span className="text-sm uppercase tracking-widest">Verified Expert</span>
              </div>
            </motion.div>

            {/* Stats Row */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-wrap items-center justify-center gap-8 md:gap-16 mb-12"
            >
              <div className="text-center">
                <div className="text-2xl font-black text-white">{stats?.totalStudents || 0}</div>
                <div className="text-[10px] uppercase font-black tracking-widest text-zinc-500">Students</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-black text-white">{courses.length}</div>
                <div className="text-[10px] uppercase font-black tracking-widest text-zinc-500">Courses</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-black text-white">4.9</div>
                <div className="text-[10px] uppercase font-black tracking-widest text-zinc-500">Rating</div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex items-center gap-4"
            >
              <Button className="rounded-full px-8">Follow Creator</Button>
              <div className="flex items-center gap-2">
                <button className="p-3 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-white transition-all">
                  <Send className="w-4 h-4" />
                </button>
                <button className="p-3 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-white transition-all">
                  <Briefcase className="w-4 h-4" />
                </button>
                <button className="p-3 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-white transition-all">
                  <Terminal className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-16">
        <div className="flex flex-col lg:flex-row gap-16">
          {/* Sidebar */}
          <aside className="w-full lg:w-80 shrink-0">
            <div className="sticky top-24 space-y-12">
              <div>
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500 mb-6 border-b border-zinc-800 pb-2">About</h3>
                <p className="text-zinc-400 leading-relaxed">
                  Leading expert in scalable digital systems and education architecture. 
                  Focused on helping 10,000+ students master the creator economy.
                </p>
              </div>

              <div>
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500 mb-6 border-b border-zinc-800 pb-2">Top Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {["System Design", "SaaS Growth", "Fullstack", "React"].map(skill => (
                    <Badge key={skill} variant="outline" className="bg-zinc-900 border-zinc-800 text-zinc-400">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="glass p-6 rounded-3xl border-primary/20">
                <h4 className="font-bold text-white mb-2">Subscribe to News</h4>
                <p className="text-xs text-zinc-500 mb-4">Get notified when I publish new courses or articles.</p>
                <div className="flex flex-col gap-2">
                  <input 
                    type="email" 
                    placeholder="Email address"
                    className="bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-primary"
                  />
                  <Button size="sm" className="w-full rounded-xl">Subscribe</Button>
                </div>
              </div>
            </div>
          </aside>

          {/* Content Area */}
          <div className="flex-1">
            <div className="flex items-center gap-8 border-b border-zinc-800 mb-12">
              <button 
                onClick={() => setActiveTab("courses")}
                className={`pb-4 text-sm font-black uppercase tracking-widest transition-all relative ${
                  activeTab === "courses" ? "text-white" : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                Courses ({courses.length})
                {activeTab === "courses" && <motion.div layoutId="tab" className="absolute bottom-0 left-0 w-full h-1 bg-primary" />}
              </button>
              <button 
                onClick={() => setActiveTab("articles")}
                className={`pb-4 text-sm font-black uppercase tracking-widest transition-all relative ${
                  activeTab === "articles" ? "text-white" : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                Articles ({articles.length})
                {activeTab === "articles" && <motion.div layoutId="tab" className="absolute bottom-0 left-0 w-full h-1 bg-primary" />}
              </button>
            </div>

            {activeTab === "courses" ? (
              courses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {courses.map(course => (
                    <CourseCard key={course.id} course={course} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 border-2 border-dashed border-zinc-800 rounded-3xl">
                  <BookOpen className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
                  <p className="text-zinc-500 font-bold">No courses published yet.</p>
                </div>
              )
            ) : (
              articles.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {articles.map(article => (
                    <ArticleCard key={article.id} article={article} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 border-2 border-dashed border-zinc-800 rounded-3xl">
                  <Star className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
                  <p className="text-zinc-500 font-bold">No articles published yet.</p>
                </div>
              )
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
