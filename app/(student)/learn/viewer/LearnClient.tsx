"use client";

import { useEffect, useState, Suspense, useCallback, useRef } from "react";
import { getLessonsByCourseId, getCourseById, getUserProgress, markLessonComplete } from "@/lib/firestore";
import { Lesson, Course } from "@/types/firestore";
import { useAuth } from "@/context/auth-context";
import WistiaPlayer from "@/components/WistiaPlayer";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  ChevronLeft, 
  Menu, 
  CheckCircle2, 
  PlayCircle, 
  Clock, 
  ChevronRight,
  Info,
  Files
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

function LearnViewerContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const courseId = searchParams.get("id");
  
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>([]);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<"content" | "resources">("content");
  
  const { user, loading: authLoading } = useAuth();
  const sidebarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchData() {
      if (!courseId) {
        router.push("/dashboard/");
        return;
      }
      
      setLoading(true);
      try {
        const [courseData, lessonsData] = await Promise.all([
          getCourseById(courseId),
          getLessonsByCourseId(courseId)
        ]);
        
        setCourse(courseData);
        const publishedLessons = lessonsData.filter(l => l.published !== false);
        setLessons(publishedLessons);
        
        // Pick first lesson or look for query param?
        const lessonId = searchParams.get("lesson");
        if (lessonId) {
          const found = publishedLessons.find(l => l.id === lessonId);
          if (found) setActiveLesson(found);
          else setActiveLesson(publishedLessons[0]);
        } else {
          setActiveLesson(publishedLessons[0]);
        }

        if (user) {
          const progressData = await getUserProgress(user.uid, courseId);
          setCompletedLessonIds(progressData);
        }
      } catch (error) {
        console.error("Failed to fetch learning data:", error);
      } finally {
        setLoading(false);
      }
    }
    
    if (!authLoading && courseId) {
      fetchData();
    }
  }, [courseId, user, authLoading, router, searchParams]);

  const handleMarkComplete = useCallback(async () => {
    if (!user || !activeLesson || !courseId) return;
    
    setMarking(true);
    try {
      await markLessonComplete(user.uid, courseId, activeLesson.id);
      setCompletedLessonIds(prev => [...prev, activeLesson.id]);
    } catch (error) {
      console.error("Failed to mark lesson complete:", error);
    } finally {
      setMarking(false);
    }
  }, [user, activeLesson, courseId]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-muted border-t-primary" />
          <p className="text-xs font-black uppercase tracking-[0.3em] text-secondary-text animate-pulse">Initializing Cinema Engine</p>
        </div>
      </div>
    );
  }

  if (!course || lessons.length === 0) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-background text-white text-center px-4">
        <div className="w-20 h-20 bg-muted rounded-3xl flex items-center justify-center mb-8">
          <Info className="w-10 h-10 text-secondary-text" />
        </div>
        <h1 className="text-3xl font-black tracking-tight">Curriculum Pending</h1>
        <p className="mt-4 max-w-md text-secondary-text font-medium text-lg">
          We couldn&apos;t find any lessons for this course yet.
        </p>
        <Link href="/dashboard/" className="mt-10">
          <Button size="lg">Back to Dashboard</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-background text-foreground overflow-hidden">
      {/* Header Panel */}
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-border/50 bg-background/80 px-4 backdrop-blur-xl z-30">
        <div className="flex items-center gap-4">
          <Link href={`/courses/view/?id=${course.id}`} className="p-2 hover:bg-muted rounded-lg text-secondary-text hover:text-white transition-colors">
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <div className="hidden h-6 w-px bg-border/50 md:block" />
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-widest text-primary truncate max-w-[200px]">
              {course.title}
            </span>
            <span className="text-sm font-bold text-white truncate max-w-[300px]">
              {activeLesson?.title}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-2 md:flex pr-4 border-r border-border/50">
             <span className="text-xs font-bold text-secondary-text">
               {completedLessonIds.length}/{lessons.length} Completed
             </span>
             <div className="h-1 w-24 rounded-full bg-muted overflow-hidden">
               <div 
                 className="h-full bg-primary shadow-[0_0_8px_var(--primary)] transition-all duration-1000" 
                 style={{ width: `${(completedLessonIds.length / lessons.length) * 100}%` }}
               />
             </div>
          </div>
          <Button 
            variant={isSidebarOpen ? "secondary" : "primary"}
            size="icon"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="lg:flex"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Main Player Content */}
        <main className={`flex-1 overflow-y-auto scrollbar-hide transition-all duration-500 ${isSidebarOpen ? "lg:mr-[400px]" : "mr-0"}`}>
          <div className="w-full bg-black">
            <div className="mx-auto max-w-6xl aspect-video">
              {activeLesson && (
                <WistiaPlayer
                  key={activeLesson.id}
                  mediaId={activeLesson.wistiaMediaId || ""}
                  title={activeLesson.title}
                  onComplete={handleMarkComplete}
                />
              )}
            </div>
          </div>

          <div className="mx-auto max-w-5xl p-6 lg:p-12">
            <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
              <div className="flex-1 space-y-6">
                <div className="flex flex-wrap items-center gap-3">
                  <Badge variant="outline" className="bg-primary/5 border-primary/20 text-primary">
                    Module {lessons.indexOf(activeLesson!) + 1}
                  </Badge>
                  {completedLessonIds.includes(activeLesson?.id || "") && (
                    <Badge variant="success">Completed</Badge>
                  )}
                  <span className="text-xs text-secondary-text font-bold flex items-center gap-1.5">
                    <Clock className="w-3 h-3" />
                    {activeLesson?.duration}
                  </span>
                </div>
                
                <h2 className="text-3xl font-black tracking-tight text-white md:text-4xl">
                  {activeLesson?.title}
                </h2>

                <div className="flex border-b border-border/50">
                  <button 
                    onClick={() => setActiveTab("content")}
                    className={`pb-4 px-6 text-sm font-bold transition-all relative ${activeTab === "content" ? "text-primary" : "text-secondary-text hover:text-white"}`}
                  >
                    Lesson Content
                    {activeTab === "content" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary shadow-[0_0_8px_var(--primary)]" />}
                  </button>
                  <button 
                    onClick={() => setActiveTab("resources")}
                    className={`pb-4 px-6 text-sm font-bold transition-all relative ${activeTab === "resources" ? "text-primary" : "text-secondary-text hover:text-white"}`}
                  >
                    Resources
                    {activeTab === "resources" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary shadow-[0_0_8px_var(--primary)]" />}
                  </button>
                </div>

                <div className="py-6 animate-in fade-in duration-500">
                  {activeTab === "content" ? (
                    <div className="prose prose-invert prose-sm max-w-none">
                       <p className="text-secondary-text text-lg leading-relaxed font-medium">
                         {activeLesson?.description || "In this lesson, we will cover the core concepts of " + activeLesson?.title + ". Make sure to follow along and take notes."}
                       </p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 px-6 rounded-2xl bg-muted/20 border border-dashed border-border">
                       <Files className="w-12 h-12 text-zinc-600 mb-4" />
                       <p className="text-sm font-bold text-white mb-1">No resources available</p>
                       <p className="text-xs text-secondary-text">Downloadable materials for this lesson will appear here.</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="shrink-0 flex flex-col gap-4">
                 {!completedLessonIds.includes(activeLesson?.id || "") ? (
                   <Button 
                     size="lg" 
                     className="w-full md:w-auto min-w-[200px]"
                     onClick={handleMarkComplete}
                     disabled={marking}
                   >
                     {marking ? "Syncing Progress..." : "Mark as Completed"}
                   </Button>
                 ) : (
                   <div className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-success/10 border border-success/20 text-success">
                     <CheckCircle2 className="w-5 h-5" />
                     <span className="text-sm font-bold">Lesson Completed</span>
                   </div>
                 )}
                 <Button variant="outline" size="lg" className="group">
                   Next Lesson
                   <ChevronRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                 </Button>
              </div>
            </div>
          </div>
        </main>

        {/* Right Sidebar Playlist */}
        <aside 
          ref={sidebarRef}
          className={`absolute right-0 top-0 bottom-0 z-20 w-full md:w-[400px] border-l border-border/50 bg-sidebar shadow-2xl transition-all duration-500 ease-in-out transform ${
            isSidebarOpen ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
          }`}
        >
          <div className="flex h-full flex-col">
            <div className="p-8 border-b border-border/50">
              <h3 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
                Course Curriculum
              </h3>
              <p className="text-xs font-bold text-secondary-text mt-1">
                {lessons.length} Professional Lessons
              </p>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-hide">
              {lessons.map((lesson, index) => {
                const isActive = activeLesson?.id === lesson.id;
                const isCompleted = completedLessonIds.includes(lesson.id);
                
                return (
                  <button
                    key={lesson.id}
                    onClick={() => {
                      setActiveLesson(lesson);
                      if (window.innerWidth < 1024) setIsSidebarOpen(false);
                    }}
                    className={`group relative flex w-full items-start gap-4 rounded-2xl p-4 text-left transition-all duration-200 border ${
                      isActive 
                        ? "bg-primary/10 border-primary/30 shadow-[0_4px_20px_rgba(124,58,237,0.1)]" 
                        : "border-transparent hover:bg-muted/50 hover:border-border/50"
                    }`}
                  >
                    {isActive && (
                      <div className="absolute left-0 top-4 bottom-4 w-1 bg-primary rounded-r-full shadow-[0_0_8px_var(--primary)]" />
                    )}
                    
                    <div className={`mt-0.5 shrink-0 flex h-10 w-10 items-center justify-center rounded-xl border transition-colors ${
                      isActive ? "bg-primary text-white border-primary" : isCompleted ? "bg-success/20 text-success border-success/20" : "bg-muted text-zinc-500 border-border"
                    }`}>
                      {isCompleted ? <CheckCircle2 className="h-5 w-5" /> : isActive ? <PlayCircle className="h-5 w-5" /> : <span className="text-xs font-black">{index + 1}</span>}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-bold truncate ${isActive ? "text-white" : "text-secondary-text group-hover:text-white"}`}>
                        {lesson.title}
                      </p>
                      <div className="flex items-center gap-3 mt-1.5">
                        <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-zinc-600">
                          <Clock className="w-3 h-3" />
                          {lesson.duration}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="p-6 bg-background/50 border-t border-border/50">
               <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 text-center">
                 Premium Experience by Verox Academy
               </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default function LearnClient() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center bg-background text-white">Loading...</div>}>
      <LearnViewerContent />
    </Suspense>
  );
}
