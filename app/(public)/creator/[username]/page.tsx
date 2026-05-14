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
import { Users, BookOpen, Star, Globe, Send, Briefcase, Terminal, CheckCircle2, Award } from "lucide-react";
import { SectionWrapper } from "@/components/layout/SectionWrapper";
import { ContentContainer } from "@/components/layout/ContentContainer";

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
          <div className="w-32 h-32 rounded-3xl bg-muted animate-pulse mb-8" />
          <div className="h-10 w-64 bg-muted animate-pulse rounded-xl mb-4" />
          <div className="h-6 w-96 bg-muted animate-pulse rounded-lg" />
        </div>
      </div>
    );
  }

  if (!creator) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <div className="flex-1 flex flex-col items-center justify-center">
          <h1 className="text-4xl font-bold mb-4 tracking-tight">Creator Not Found</h1>
          <p className="text-muted-foreground mb-8">This user is not a verified creator on Verox Academy.</p>
          <Link href="/">
            <Button className="rounded-2xl h-12 px-8 bg-linear-to-r from-blue-600 to-cyan-500 text-white font-semibold border-none">Back to Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Hero Header */}
      <SectionWrapper className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(37,99,235,0.04),transparent_60%)] pointer-events-none" />
        
        <ContentContainer>
          <div className="flex flex-col items-center text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative w-32 h-32 md:w-44 md:h-44 rounded-4xl mb-10 overflow-hidden shadow-2xl shadow-blue-500/10 border-4 border-white"
            >
              <Image
                src={creator.photoURL || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop"}
                alt={creator.name || "Creator"}
                fill
                className="object-cover"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-4"
            >
              <h1 className="text-4xl md:text-6xl font-bold tracking-tighter">
                <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-cyan-500">{creator.name}</span>
              </h1>
              <div className="flex items-center justify-center gap-3 mb-8">
                <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200 font-bold text-[10px] uppercase tracking-widest px-3 py-1">@{username}</Badge>
                <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-200 font-bold text-[10px] uppercase tracking-widest px-3 py-1 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Verified Expert
                </Badge>
              </div>
            </motion.div>

            {/* Stats Row */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-wrap items-center justify-center gap-10 md:gap-20 mb-12"
            >
              <div className="text-center">
                <div className="text-3xl font-bold text-foreground">{stats?.totalStudents.toLocaleString() || 0}</div>
                <div className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground/50">Students</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-foreground">{courses.length}</div>
                <div className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground/50">Courses</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-foreground">4.9</div>
                <div className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground/50">Rating</div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex items-center gap-4"
            >
              <Button className="rounded-2xl h-14 px-10 bg-linear-to-r from-blue-600 to-cyan-500 text-white font-bold shadow-lg shadow-blue-500/20 border-none hover:scale-[1.02] transition-all">
                Follow Creator
              </Button>
              <div className="flex items-center gap-3">
                {[Send, Briefcase, Globe].map((Icon, i) => (
                  <button key={i} className="w-12 h-12 rounded-2xl bg-white border border-border/60 text-muted-foreground hover:text-blue-600 hover:border-blue-200 transition-all flex items-center justify-center shadow-sm">
                    <Icon className="w-5 h-5" />
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        </ContentContainer>
      </SectionWrapper>

      {/* Main Content */}
      <ContentContainer className="py-16">
        <div className="flex flex-col lg:flex-row gap-20">
          {/* Sidebar */}
          <aside className="w-full lg:w-80 shrink-0">
            <div className="sticky top-24 space-y-16">
              <div className="space-y-6">
                <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground/40 pb-4 border-b border-border/60">Professional Bio</h3>
                <p className="text-muted-foreground leading-relaxed font-medium">
                  Leading expert in scalable digital systems and education architecture. 
                  Focused on helping {stats?.totalStudents.toLocaleString() || "thousands of"} students master the digital creator economy.
                </p>
              </div>

              <div className="space-y-6">
                <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground/40 pb-4 border-b border-border/60">Core Expertise</h3>
                <div className="flex flex-wrap gap-3">
                  {["System Design", "SaaS Growth", "Fullstack", "Product Architecture"].map(skill => (
                    <Badge key={skill} variant="outline" className="bg-muted/30 border-border/60 text-muted-foreground font-bold px-4 py-1.5 rounded-xl">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="p-8 rounded-4xl bg-blue-600 text-white relative overflow-hidden shadow-2xl shadow-blue-600/20">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-size-[20px_20px]" />
                <div className="relative z-10">
                  <h4 className="text-xl font-bold mb-2">Weekly Insights</h4>
                  <p className="text-sm text-white/70 mb-6 font-medium leading-relaxed">Join my newsletter to get professional insights on SaaS development.</p>
                  <div className="space-y-3">
                    <input 
                      type="email" 
                      placeholder="Email address"
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-5 py-3.5 text-sm text-white placeholder:text-white/40 focus:outline-none focus:bg-white/20 transition-all"
                    />
                    <Button className="w-full h-12 rounded-xl bg-white text-blue-600 font-bold hover:bg-blue-50 border-none">Subscribe</Button>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Content Area */}
          <div className="flex-1">
            <div className="flex items-center gap-10 border-b border-border/60 mb-16">
              <button 
                onClick={() => setActiveTab("courses")}
                className={`pb-6 text-[10px] font-bold uppercase tracking-[0.3em] transition-all relative ${
                  activeTab === "courses" ? "text-foreground" : "text-muted-foreground/40 hover:text-muted-foreground"
                }`}
              >
                Curriculum ({courses.length})
                {activeTab === "courses" && <motion.div layoutId="tab" className="absolute bottom-0 left-0 w-full h-1 bg-blue-600 rounded-full" />}
              </button>
              <button 
                onClick={() => setActiveTab("articles")}
                className={`pb-6 text-[10px] font-bold uppercase tracking-[0.3em] transition-all relative ${
                  activeTab === "articles" ? "text-foreground" : "text-muted-foreground/40 hover:text-muted-foreground"
                }`}
              >
                Insights ({articles.length})
                {activeTab === "articles" && <motion.div layoutId="tab" className="absolute bottom-0 left-0 w-full h-1 bg-blue-600 rounded-full" />}
              </button>
            </div>

            {activeTab === "courses" ? (
              courses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">
                  {courses.map(course => (
                    <CourseCard key={course.id} course={course} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-32 bg-muted/20 border border-dashed border-border/60 rounded-5xl">
                  <BookOpen className="w-16 h-16 text-muted-foreground/20 mx-auto mb-6" />
                  <p className="text-muted-foreground font-bold uppercase tracking-widest text-[10px]">No active curriculum</p>
                </div>
              )
            ) : (
              articles.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">
                  {articles.map(article => (
                    <ArticleCard key={article.id} article={article} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-32 bg-muted/20 border border-dashed border-border/60 rounded-5xl">
                  <Award className="w-16 h-16 text-muted-foreground/20 mx-auto mb-6" />
                  <p className="text-muted-foreground font-bold uppercase tracking-widest text-[10px]">No published insights</p>
                </div>
              )
            )}
          </div>
        </div>
      </ContentContainer>
    </div>
  );
}
