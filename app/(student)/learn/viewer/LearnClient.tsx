"use client";

import { useEffect, useState, Suspense, useCallback, useRef } from "react";
import { getLessonsByCourseId, getCourseById, getUserProgress, markLessonComplete, getResourcesByLessonId, getQuizByLessonId, getLatestQuizAttempt, saveQuizAttempt } from "@/lib/firestore";
import { Lesson, Course, Resource, Quiz, QuizAttempt, Question } from "@/types/firestore";
import { useAuth } from "@/hooks/use-auth";
import WistiaPlayer from "@/components/WistiaPlayer";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { 
  ChevronLeft, 
  Menu, 
  CheckCircle2, 
  Play, 
  PlayCircle,
  ChevronRight, 
  Files,
  Sparkles,
  Award,
  Loader2,
  HelpCircle,
  BrainCircuit,
  Trophy as TrophyIcon,
  Clock,
  Info,
  Maximize2,
  Layout,
  BookOpen,
  Zap,
  Target,
  FileText,
  MessageSquare,
  ChevronDown,
  Lock,
  ArrowLeft,
  ArrowRight,
  Monitor,
  X
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { CourseCompletionModal } from "@/components/CourseCompletionModal";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Default to closed on mobile
  const [activeTab, setActiveTab] = useState<"content" | "resources" | "quiz">("content");
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [resources, setResources] = useState<Resource[]>([]);
  const [resourcesLoading, setResourcesLoading] = useState(false);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [quizLoading, setQuizLoading] = useState(false);
  const [latestAttempt, setLatestAttempt] = useState<QuizAttempt | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<number[]>([]);
  const [quizResult, setQuizResult] = useState<{ score: number; passed: boolean } | null>(null);
  
  const { user, loading: authLoading } = useAuth();
  const sidebarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Auto-open sidebar on desktop
    if (window.innerWidth >= 1024) {
      setIsSidebarOpen(true);
    }
  }, []);

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

  useEffect(() => {
    async function fetchResources() {
      if (!activeLesson || !courseId) return;
      setResourcesLoading(true);
      try {
        const data = await getResourcesByLessonId(activeLesson.id, courseId);
        setResources(data);
      } catch (error) {
        console.error("Failed to fetch resources:", error);
      } finally {
        setResourcesLoading(false);
      }
    }
    fetchResources();
  }, [activeLesson]);

  useEffect(() => {
    async function fetchQuiz() {
      if (!activeLesson || !user || !courseId) return;
      setQuizLoading(true);
      setQuizResult(null);
      setQuizAnswers([]);
      try {
        const [quizData, attemptData] = await Promise.all([
          getQuizByLessonId(activeLesson.id, courseId),
          getLatestQuizAttempt(user.uid, activeLesson.id)
        ]);
        setQuiz(quizData);
        setLatestAttempt(attemptData);
      } catch (error) {
        console.error("Failed to fetch quiz:", error);
      } finally {
        setQuizLoading(false);
      }
    }
    fetchQuiz();
  }, [activeLesson, user]);

  const handleQuizSubmit = async () => {
    if (!quiz || !user || !courseId || !activeLesson) return;
    
    let correctCount = 0;
    quiz.questions.forEach((q, idx) => {
      if (quizAnswers[idx] === q.correctOptionIndex) {
        correctCount++;
      }
    });

    const score = Math.round((correctCount / quiz.questions.length) * 100);
    const passed = score >= (quiz.passingScore || 70);

    setQuizResult({ score, passed });

    try {
      await saveQuizAttempt({
        userId: user.uid,
        quizId: quiz.id,
        score,
        passed,
        answers: quizAnswers
      });
      
      if (passed && !completedLessonIds.includes(activeLesson.id)) {
        await handleMarkComplete();
      }
      
      setLatestAttempt({
        id: "temp",
        userId: user.uid,
        quizId: quiz.id,
        score,
        passed,
        answers: quizAnswers,
        attemptedAt: { seconds: Date.now() / 1000 } as any
      });
    } catch (error) {
      console.error("Failed to save attempt:", error);
    }
  };

  const handleMarkComplete = useCallback(async () => {
    if (!user || !activeLesson || !courseId) return;
    if (completedLessonIds.includes(activeLesson.id)) return;
    
    setMarking(true);
    try {
      await markLessonComplete(user.uid, courseId, activeLesson.id);
      setCompletedLessonIds(prev => [...prev, activeLesson.id]);
      
      const currentIndex = lessons.findIndex(l => l.id === activeLesson.id);
      if (currentIndex < lessons.length - 1) {
        setTimeout(() => {
          setActiveLesson(lessons[currentIndex + 1]);
        }, 2000);
      } else {
        const updatedCompleted = [...completedLessonIds, activeLesson.id];
        if (updatedCompleted.length >= lessons.length) {
          setShowCompletionModal(true);
        }
      }
    } catch (error) {
      console.error("Failed to mark lesson complete:", error);
    } finally {
      setMarking(false);
    }
  }, [user, activeLesson, courseId, completedLessonIds, lessons]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <div className="h-12 w-12 animate-spin rounded-full border-2 border-muted border-t-accent shadow-sm" />
          </div>
          <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-muted-foreground/60">Initializing Environment</p>
        </div>
      </div>
    );
  }

  if (!course || lessons.length === 0) return null;

  const progressPercentage = Math.round((completedLessonIds.length / lessons.length) * 100);

  return (
    <div className="flex h-screen flex-col bg-background text-foreground overflow-hidden font-sans relative">
      {/* Immersive Header - Unified Design */}
      <header className="flex h-20 shrink-0 items-center justify-between border-b border-border/40 bg-background/80 px-8 backdrop-blur-3xl z-40">
        <div className="flex items-center gap-6 min-w-0">
          <Link href={`/courses/view/?id=${course.id}`} className="group h-12 w-12 flex items-center justify-center bg-muted/40 border border-border/40 rounded-2xl text-muted-foreground hover:text-foreground hover:bg-muted transition-all shrink-0">
            <ChevronLeft className="h-6 w-6 group-hover:-translate-x-1 transition-transform" />
          </Link>
          <div className="h-8 w-px bg-border/40 hidden lg:block" />
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-accent leading-none truncate max-w-[120px] md:max-w-none">
                {course.title}
              </span>
              <Badge className="h-4 px-2 text-[8px] font-bold uppercase tracking-widest bg-accent/10 text-accent border-none rounded">Enrolled</Badge>
            </div>
            <h2 className="text-lg font-bold text-foreground truncate max-w-[180px] sm:max-w-[300px] md:max-w-[400px] mt-1 tracking-tight">
              {activeLesson?.title}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-10">
          <div className="hidden lg:flex items-center gap-10">
             <div className="flex flex-col items-end gap-1">
                <span className="text-[9px] font-bold uppercase tracking-[0.4em] text-muted-foreground">Course Progress</span>
                <span className="text-xs font-bold text-foreground">{progressPercentage}% Mastery</span>
             </div>
             <div className="h-1.5 w-48 rounded-full bg-muted overflow-hidden border border-border/40">
                <motion.div 
                   initial={{ width: 0 }}
                   animate={{ width: `${progressPercentage}%` }}
                   transition={{ duration: 1.5, ease: [0.23, 1, 0.32, 1] }}
                   className="h-full bg-linear-to-r from-blue-600 to-cyan-500 shadow-sm"
                />
             </div>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className={cn(
              "h-12 w-12 flex items-center justify-center rounded-2xl transition-all border shrink-0",
              isSidebarOpen ? "bg-accent text-white border-accent shadow-xl shadow-accent/20" : "bg-muted/40 text-muted-foreground border-border/40 hover:bg-muted hover:text-foreground"
            )}
          >
            <Layout className="h-5 w-5" />
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        <main className={cn(
          "flex-1 overflow-y-auto transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] relative pb-12",
          isSidebarOpen ? "lg:mr-[420px]" : "mr-0"
        )}>
          {/* Cinematic Video Player Section */}
          <div className="w-full bg-black relative">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(37,99,235,0.05),transparent)] pointer-events-none" />
            
            <div className="mx-auto max-w-[1600px] aspect-video relative z-10 shadow-2xl">
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

          <div className="mx-auto max-w-5xl p-6 sm:p-10 lg:p-20">
            <div className="space-y-16">
              <div className="flex flex-wrap items-center gap-8">
                <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-muted/40 border border-border/40">
                   <div className="h-6 w-6 rounded-lg bg-accent/20 flex items-center justify-center text-accent text-[10px] font-bold">
                      {lessons.indexOf(activeLesson!) + 1}
                   </div>
                   <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">Current Module</span>
                </div>
                
                {completedLessonIds.includes(activeLesson?.id || "") && (
                  <Badge className="bg-emerald-500/10 text-emerald-500 border-none font-bold text-[10px] py-2 px-5 rounded-xl tracking-widest shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5 mr-2" /> MASTERED
                  </Badge>
                )}
                
                <div className="flex items-center gap-3 text-[10px] font-bold text-muted-foreground uppercase tracking-widest bg-muted/20 px-4 py-2 rounded-xl border border-border/40">
                  <Clock className="w-3.5 h-3.5 text-accent" />
                  {activeLesson?.duration}
                </div>
              </div>

              <div className="space-y-10">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter text-foreground leading-tight text-balance">
                  {activeLesson?.title}
                </h1>
                
                <div className="flex overflow-x-auto bg-muted/40 p-1.5 rounded-2xl border border-border/40 w-fit shadow-sm scrollbar-hide no-scrollbar max-w-full">
                  {[
                    { id: "content", label: "Notes", icon: FileText },
                    { id: "resources", label: "Resources", icon: Files },
                    { id: "quiz", label: "Assessment", icon: Target, hide: !quiz }
                  ].filter(t => !t.hide).map((tab) => (
                    <button 
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={cn(
                        "flex items-center gap-2.5 px-8 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all shrink-0",
                        activeTab === tab.id 
                          ? "bg-background text-foreground shadow-sm border border-border/40" 
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <tab.icon className="w-4 h-4" />
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="min-h-[400px]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                  >
                    {activeTab === "content" && (
                      <div className="prose prose-zinc dark:prose-invert prose-xl max-w-none text-muted-foreground leading-relaxed font-medium">
                        {activeLesson?.notes ? (
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {activeLesson.notes}
                          </ReactMarkdown>
                        ) : (
                          <div className="space-y-6">
                            <p>
                              {activeLesson?.description || "In this lesson, we will explore the professional methodologies behind " + activeLesson?.title + ". Analyze the provided curriculum below and implement these patterns in your next project."}
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {activeTab === "resources" && (
                      <div className="grid gap-6 sm:grid-cols-2">
                        {resourcesLoading ? (
                          [1, 2].map(i => <div key={i} className="h-28 bg-muted rounded-4xl animate-pulse" />)
                        ) : resources.length > 0 ? (
                          resources.map((resource) => (
                            <Card key={resource.id} className="p-8 bg-surface border-border/40 hover:border-accent/40 group cursor-pointer transition-all rounded-4xl shadow-sm">
                              <div className="flex items-center gap-6">
                                <div className="h-16 w-16 rounded-2xl bg-accent/10 flex items-center justify-center text-accent group-hover:bg-accent group-hover:text-white transition-all duration-700 shadow-sm shrink-0">
                                  <Files className="w-7 h-7" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-base font-bold text-foreground truncate tracking-tight">{resource.title}</p>
                                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-1 opacity-60">
                                    {resource.type} • ASSET
                                  </p>
                                </div>
                              </div>
                            </Card>
                          ))
                        ) : (
                          <div className="col-span-full py-28 text-center border-2 border-dashed border-border/40 rounded-[3rem] bg-muted/20">
                            <Files className="w-16 h-16 mx-auto mb-6 text-muted-foreground/20" />
                            <p className="text-[11px] font-bold text-muted-foreground/40 uppercase tracking-[0.4em]">Zero Assets detected</p>
                          </div>
                        )}
                      </div>
                    )}

                    {activeTab === "quiz" && quiz && (
                      <div className="space-y-16">
                         {quizResult ? (
                           <Card className="text-center py-24 space-y-12 bg-surface border-border/40 rounded-[3rem] shadow-2xl relative overflow-hidden px-6">
                              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_100%,rgba(37,99,235,0.05),transparent_50%)]" />
                              <div className={cn(
                                "relative z-10 mx-auto h-28 w-28 rounded-4xl flex items-center justify-center shadow-2xl transition-transform duration-700 animate-in fade-in zoom-in",
                                quizResult.passed ? "bg-emerald-500 text-white" : "bg-destructive text-white"
                              )}>
                                 {quizResult.passed ? <TrophyIcon className="w-14 h-14" /> : <BrainCircuit className="w-14 h-14" />}
                              </div>
                              <div className="relative z-10 space-y-3">
                                 <h4 className="text-5xl font-bold text-foreground tracking-tighter leading-none">{quizResult.passed ? "Assessment Passed" : "Refinement Needed"}</h4>
                                 <p className="text-muted-foreground font-bold uppercase tracking-[0.3em] text-[12px]">Accuracy: <span className={cn("px-2 py-0.5 rounded", quizResult.passed ? "bg-emerald-500/10 text-emerald-500" : "bg-destructive/10 text-destructive")}>{quizResult.score}%</span></p>
                              </div>
                              <Button 
                                variant="outline" 
                                onClick={() => { setQuizResult(null); setQuizAnswers([]); }} 
                                className="relative z-10 rounded-2xl px-12 h-16 font-bold uppercase tracking-widest text-[11px] border-border/40 hover:bg-muted w-full sm:w-auto"
                              >
                                 Retry Evaluation Flow
                              </Button>
                           </Card>
                         ) : (
                           <div className="space-y-20">
                             {quiz.questions.map((q, qIdx) => (
                               <div key={q.id} className="space-y-10">
                                  <div className="flex gap-8 items-start">
                                     <span className="shrink-0 h-12 w-12 rounded-2xl bg-surface border border-border/40 text-foreground flex items-center justify-center text-sm font-bold shadow-sm">
                                        {String(qIdx + 1).padStart(2, '0')}
                                     </span>
                                     <h5 className="text-3xl font-bold text-foreground leading-tight tracking-tight text-balance">{q.text}</h5>
                                  </div>
                                  <div className="grid gap-5 pl-0 sm:pl-20">
                                     {q.options.map((opt, oIdx) => (
                                       <button
                                         key={oIdx}
                                         onClick={() => {
                                           const newAns = [...quizAnswers];
                                           newAns[qIdx] = oIdx;
                                           setQuizAnswers(newAns);
                                         }}
                                         className={cn(
                                           "w-full text-left p-8 rounded-4xl border transition-all duration-500 font-bold group",
                                           quizAnswers[qIdx] === oIdx 
                                             ? "bg-foreground text-background border-foreground shadow-2xl scale-[1.01]" 
                                             : "bg-surface border-border/40 text-muted-foreground hover:border-foreground/20 hover:text-foreground"
                                         )}
                                       >
                                         <div className="flex items-center gap-6">
                                           <div className={cn(
                                             "h-6 w-6 rounded-full border-2 flex items-center justify-center transition-all shrink-0",
                                             quizAnswers[qIdx] === oIdx ? "border-background bg-background" : "border-border group-hover:border-foreground/20"
                                           )}>
                                             {quizAnswers[qIdx] === oIdx && <div className="h-2 w-2 rounded-full bg-foreground" />}
                                           </div>
                                           <span className="text-lg leading-snug">{opt}</span>
                                         </div>
                                       </button>
                                     ))}
                                  </div>
                               </div>
                             ))}
                             <Button 
                               className="w-full h-20 rounded-4xl text-[12px] font-bold uppercase tracking-[0.4em] shadow-2xl shadow-accent/20"
                               disabled={quizAnswers.length < quiz.questions.length || quizAnswers.includes(undefined as any)}
                               onClick={handleQuizSubmit}
                             >
                                 Finalize Evaluation
                             </Button>
                           </div>
                         )}
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>


        </main>

        <aside 
          ref={sidebarRef}
          className={cn(
            "fixed lg:absolute right-0 top-0 bottom-0 z-60 lg:z-30 w-full sm:w-[420px] lg:w-[420px] border-l border-border/40 bg-background shadow-2xl transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)]",
            isSidebarOpen ? "translate-x-0" : "translate-x-full"
          )}
        >
          <div className="flex h-full flex-col">
            <div className="p-10 border-b border-border/40 space-y-4">
              <div className="flex items-center justify-between">
                 <h3 className="text-3xl font-bold text-foreground tracking-tighter">Curriculum</h3>
                 <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2 text-muted-foreground hover:text-foreground bg-muted/40 rounded-xl border border-border/40">
                    <X className="w-6 h-6" />
                 </button>
              </div>
              <div className="flex items-center justify-between">
                 <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.3em]">
                   {lessons.length} Modules total
                 </p>
                 <Badge className="bg-muted text-muted-foreground border-none font-bold text-[9px] px-2">{completedLessonIds.length} / {lessons.length}</Badge>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-3 scrollbar-hide">
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
                    className={cn(
                      "group relative flex w-full items-center gap-5 rounded-4xl p-5 text-left transition-all duration-500 border",
                      isActive 
                        ? "bg-foreground text-background border-foreground shadow-xl scale-[1.02]" 
                        : "bg-transparent border-transparent hover:bg-muted/40 hover:border-border/40"
                    )}
                  >
                    <div className={cn(
                      "shrink-0 flex h-12 w-12 items-center justify-center rounded-2xl border transition-all duration-500 shadow-sm",
                      isActive 
                        ? "bg-background text-foreground border-border/40" 
                        : isCompleted 
                          ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/10" 
                          : "bg-muted text-muted-foreground border-border/40"
                    )}>
                      {isCompleted ? <CheckCircle2 className="h-6 w-6" /> : isActive ? <PlayCircle className="h-6 w-6" /> : <span className="text-xs font-bold">{String(index + 1).padStart(2, '0')}</span>}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className={cn("text-sm font-bold truncate tracking-tight leading-none", isActive ? "text-background" : "text-foreground")}>
                        {lesson.title}
                      </p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className={cn("flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest", isActive ? "text-background/60" : "text-muted-foreground")}>
                          <Clock className="w-3.5 h-3.5" />
                          {lesson.duration}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
            
            {/* Primary Actions - Relocated for better visibility */}
            <div className="p-10 border-t border-border/40 space-y-4 bg-muted/5">
              {!completedLessonIds.includes(activeLesson?.id || "") ? (
                <Button 
                  onClick={handleMarkComplete} 
                  disabled={marking} 
                  className="w-full h-16 rounded-2xl font-bold uppercase tracking-[0.2em] text-[10px] shadow-2xl shadow-accent/40 group px-6 bg-premium-gradient border-none text-white"
                >
                  {marking ? "Processing..." : "Mark mastery complete"}
                  <CheckCircle2 className="ml-3 w-5 h-5 group-hover:rotate-12 transition-transform" />
                </Button>
              ) : (
                <div className="w-full flex items-center justify-center gap-3 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 font-bold text-[10px] uppercase tracking-widest">
                  <CheckCircle2 className="w-5 h-5" /> Mastery Confirmed
                </div>
              )}
              <Button 
                variant="outline" 
                onClick={() => {
                  const currentIndex = lessons.findIndex(l => l.id === activeLesson?.id);
                  if (currentIndex < lessons.length - 1) setActiveLesson(lessons[currentIndex + 1]);
                }} 
                disabled={lessons.indexOf(activeLesson!) === lessons.length - 1} 
                className="w-full h-16 rounded-2xl font-bold uppercase tracking-[0.2em] text-[10px] bg-muted/40 border-border/40 text-foreground hover:bg-muted group px-6"
              >
                Next Module <ChevronRight className="ml-3 w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </div>

            <div className="p-10 border-t border-border/40 flex items-center justify-between mt-auto">
               <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-muted-foreground/40">Secure Stream</p>
               <div className="flex gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
                  <div className="h-1.5 w-1.5 rounded-full bg-muted" />
                  <div className="h-1.5 w-1.5 rounded-full bg-muted" />
               </div>
            </div>
          </div>
        </aside>
      </div>

      {showCompletionModal && course && user && (
        <CourseCompletionModal 
          courseTitle={course.title} 
          courseId={course.id}
          userId={user.uid}
          onClose={() => setShowCompletionModal(false)} 
        />
      )}
    </div>
  );
}

export default function LearnClient() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center bg-background text-foreground font-bold text-[12px] uppercase tracking-[0.6em]">Initializing Mastery Environment...</div>}>
      <LearnViewerContent />
    </Suspense>
  );
}
