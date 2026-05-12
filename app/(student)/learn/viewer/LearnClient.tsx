"use client";

import { useEffect, useState, Suspense, useCallback, useRef } from "react";
import { getLessonsByCourseId, getCourseById, getUserProgress, markLessonComplete, getResourcesByLessonId, getQuizByLessonId, getLatestQuizAttempt, saveQuizAttempt } from "@/lib/firestore";
import { Lesson, Course, Resource, Quiz, QuizAttempt, Question } from "@/types/firestore";
import { useAuth } from "@/context/auth-context";
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
  ArrowLeft,
  Files,
  Sparkles,
  Award,
  Loader2,
  HelpCircle,
  BrainCircuit,
  Trophy as TrophyIcon,
  Clock,
  Info,
  Maximize2
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { CourseCompletionModal } from "@/components/CourseCompletionModal";

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

  useEffect(() => {
    async function fetchResources() {
      if (!activeLesson) return;
      setResourcesLoading(true);
      try {
        const data = await getResourcesByLessonId(activeLesson.id);
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
      if (!activeLesson || !user) return;
      setQuizLoading(true);
      setQuizResult(null);
      setQuizAnswers([]);
      try {
        const [quizData, attemptData] = await Promise.all([
          getQuizByLessonId(activeLesson.id),
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
      
      // If passed, we can mark lesson as complete automatically
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
      
      // Auto Progression Logic
      const currentIndex = lessons.findIndex(l => l.id === activeLesson.id);
      if (currentIndex < lessons.length - 1) {
        // Move to next lesson after a short delay
        setTimeout(() => {
          setActiveLesson(lessons[currentIndex + 1]);
        }, 2000);
      } else {
        // Check if all lessons are now completed
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
      <div className="flex h-screen items-center justify-center bg-background text-foreground">
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
          </div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Loading Module...</p>
        </div>
      </div>
    );
  }

  if (!course || lessons.length === 0) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-background text-foreground text-center px-4">
        <div className="w-16 h-16 bg-secondary rounded-xl flex items-center justify-center mb-6">
          <Info className="w-8 h-8 text-muted-foreground" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">No Lessons Found</h1>
        <p className="mt-2 max-w-md text-muted-foreground text-sm">
          This course doesn&apos;t have any published lessons yet.
        </p>
        <Link href="/dashboard/" className="mt-8">
          <Button size="lg" className="rounded-lg px-8">Back to Dashboard</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-background text-foreground overflow-hidden">
      {/* Header Panel */}
      <header className="flex h-20 shrink-0 items-center justify-between border-b border-border bg-card/80 px-6 backdrop-blur-xl z-30">
        <div className="flex items-center gap-6">
          <Link href={`/courses/view/?id=${course.id}`} className="group p-2.5 hover:bg-secondary rounded-2xl text-muted-foreground hover:text-foreground transition-all">
            <ChevronLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
          </Link>
          <div className="hidden h-10 w-px bg-border md:block" />
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary truncate max-w-[200px]">
              {course.title}
            </span>
            <span className="text-sm font-bold text-foreground truncate max-w-[300px] mt-0.5">
              {activeLesson?.title}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden items-center gap-4 md:flex pr-6 border-r border-border">
             <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
               {completedLessonIds.length}/{lessons.length} Modules
             </span>
             <div className="h-2 w-32 rounded-full bg-secondary overflow-hidden shadow-inner">
               <div 
                 className="h-full bg-primary shadow-[0_0_12px_rgba(139,92,246,0.4)] transition-all duration-1000" 
                 style={{ width: `${(completedLessonIds.length / lessons.length) * 100}%` }}
               />
             </div>
          </div>
          <Button 
            variant={isSidebarOpen ? "secondary" : "primary"}
            size="icon"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="rounded-xl"
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
              <div className="flex-1 space-y-8">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest">
                    Module {lessons.indexOf(activeLesson!) + 1}
                  </div>
                  {completedLessonIds.includes(activeLesson?.id || "") && (
                    <div className="px-4 py-1.5 rounded-full bg-success/10 border border-success/20 text-success text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                      <CheckCircle2 className="w-3 h-3" />
                      Completed
                    </div>
                  )}
                  <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest flex items-center gap-2 bg-secondary px-4 py-1.5 rounded-full">
                    <Clock className="w-3.5 h-3.5" />
                    {activeLesson?.duration}
                  </span>
                </div>
                
                <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
                  {activeLesson?.title}
                </h2>

                <div className="flex bg-secondary/50 p-1 rounded-lg border border-border">
                <button 
                  onClick={() => setActiveTab("content")}
                  className={`flex-1 px-4 py-2 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all ${activeTab === "content" ? "bg-card text-foreground shadow-sm border border-border" : "text-muted-foreground hover:text-foreground"}`}
                >
                  Content
                </button>
                <button 
                  onClick={() => setActiveTab("resources")}
                  className={`flex-1 px-4 py-2 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all ${activeTab === "resources" ? "bg-card text-foreground shadow-sm border border-border" : "text-muted-foreground hover:text-foreground"}`}
                >
                  Resources
                </button>
                {quiz && (
                  <button 
                    onClick={() => setActiveTab("quiz")}
                    className={`flex-1 px-4 py-2 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all ${activeTab === "quiz" ? "bg-card text-foreground shadow-sm border border-border" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    Quiz
                  </button>
                )}
              </div>

                <div className="py-6 animate-in fade-in duration-500">
                  {activeTab === "content" ? (
                    <div className="prose prose-zinc dark:prose-invert prose-lg max-w-none text-foreground">
                       {activeLesson?.notes ? (
                         <ReactMarkdown remarkPlugins={[remarkGfm]}>
                           {activeLesson.notes}
                         </ReactMarkdown>
                       ) : (
                         <p className="text-muted-foreground text-lg leading-relaxed font-medium">
                           {activeLesson?.description || "In this lesson, we will cover the core concepts of " + activeLesson?.title + ". Make sure to follow along and take notes."}
                         </p>
                       )}
                    </div>
                  ) : activeTab === "resources" ? (
                    <div className="space-y-4">
                      {resourcesLoading ? (
                        <div className="flex items-center justify-center py-12">
                          <Loader2 className="w-8 h-8 text-primary animate-spin" />
                        </div>
                      ) : resources.length > 0 ? (
                        <div className="grid gap-4 sm:grid-cols-2">
                          {resources.map((resource) => (
                            <a 
                              key={resource.id}
                              href={resource.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-4 p-5 rounded-5xl bg-card border border-border hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5 transition-all group"
                            >
                              <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                                <Files className="w-6 h-6" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-black text-foreground truncate">{resource.title}</p>
                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mt-1">
                                  {resource.type} • {resource.size ? (resource.size / 1024 / 1024).toFixed(2) + " MB" : "View Resource"}
                                </p>
                              </div>
                            </a>
                          ))}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-16 px-6 rounded-7xl bg-secondary/30 border border-dashed border-border">
                           <div className="w-16 h-16 rounded-4xl bg-secondary flex items-center justify-center mb-6">
                             <Files className="w-8 h-8 text-muted-foreground" />
                           </div>
                           <p className="text-sm font-black text-foreground mb-1">No resources available</p>
                           <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Downloadable materials for this lesson will appear here.</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                       {quizLoading ? (
                         <div className="flex items-center justify-center py-20">
                            <Loader2 className="w-10 h-10 text-primary animate-spin" />
                         </div>
                       ) : quiz ? (
                         <div className="space-y-10">
                            {/* Quiz Header */}
                            <div className="flex items-center justify-between p-8 rounded-6xl bg-primary/5 border border-primary/20">
                               <div className="flex items-center gap-6">
                                  <div className="h-16 w-16 rounded-3xl bg-primary text-primary-foreground flex items-center justify-center shadow-lg shadow-primary/20">
                                     <BrainCircuit className="w-8 h-8" />
                                  </div>
                                  <div>
                                     <h3 className="text-xl font-black text-foreground">{quiz.title}</h3>
                                     <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mt-1">Passing Score: {quiz.passingScore}% • {quiz.questions.length} Questions</p>
                                  </div>
                               </div>
                               {latestAttempt && (
                                 <div className={`h-12 px-6 rounded-2xl flex items-center gap-2 border font-black text-[10px] uppercase tracking-widest ${latestAttempt.passed ? "bg-success/10 border-success/20 text-success" : "bg-destructive/10 border-destructive/20 text-destructive"}`}>
                                    Last Result: {latestAttempt.score}%
                                 </div>
                               )}
                            </div>

                            {quizResult ? (
                              <div className="text-center py-16 space-y-8 bg-card rounded-[3.5rem] border border-border shadow-2xl">
                                 <div className={`mx-auto h-24 w-24 rounded-5xl flex items-center justify-center ${quizResult.passed ? "bg-success text-success-foreground shadow-[0_0_40px_rgba(34,197,94,0.3)]" : "bg-destructive text-destructive-foreground shadow-[0_0_40px_rgba(239,68,68,0.3)]"}`}>
                                    {quizResult.passed ? <TrophyIcon className="w-12 h-12" /> : <ArrowLeft className="w-12 h-12 rotate-90" />}
                                 </div>
                                 <div>
                                    <h4 className="text-4xl font-black text-foreground">{quizResult.passed ? "Excellent Performance!" : "Practice Makes Perfect"}</h4>
                                    <p className="text-muted-foreground font-medium mt-3 text-lg">You achieved a score of <span className={`font-black ${quizResult.passed ? "text-success" : "text-destructive"}`}>{quizResult.score}%</span></p>
                                 </div>
                                 <Button 
                                   onClick={() => { setQuizResult(null); setQuizAnswers([]); }}
                                   variant="outline"
                                   className="rounded-2xl px-12 h-14 font-black uppercase tracking-widest text-[10px]"
                                 >
                                    Try Again
                                 </Button>
                              </div>
                            ) : (
                              <div className="space-y-12">
                                {quiz.questions.map((q, qIdx) => (
                                  <div key={q.id} className="space-y-6">
                                     <div className="flex gap-6">
                                        <span className="shrink-0 h-10 w-10 rounded-2xl bg-secondary border border-border text-foreground flex items-center justify-center text-xs font-black shadow-sm">
                                           {qIdx + 1}
                                        </span>
                                        <h5 className="text-xl font-black text-foreground leading-relaxed">{q.text}</h5>
                                     </div>
                                     <div className="grid gap-4 pl-16">
                                        {q.options.map((opt, oIdx) => (
                                          <button
                                            key={oIdx}
                                            onClick={() => {
                                              const newAns = [...quizAnswers];
                                              newAns[qIdx] = oIdx;
                                              setQuizAnswers(newAns);
                                            }}
                                            className={`w-full text-left p-5 rounded-4xl border transition-all font-bold ${
                                              quizAnswers[qIdx] === oIdx 
                                              ? "bg-primary/10 border-primary text-foreground shadow-lg shadow-primary/5 scale-[1.02]" 
                                              : "bg-card border-border text-muted-foreground hover:border-primary/30 hover:text-foreground"
                                            }`}
                                          >
                                            <div className="flex items-center gap-4">
                                              <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center transition-all ${quizAnswers[qIdx] === oIdx ? "border-primary bg-primary" : "border-border"}`}>
                                                {quizAnswers[qIdx] === oIdx && <div className="h-2 w-2 rounded-full bg-primary-foreground" />}
                                              </div>
                                              {opt}
                                            </div>
                                          </button>
                                        ))}
                                     </div>
                                  </div>
                                ))}
                                <div className="pt-10 border-t border-border">
                                   <Button 
                                     size="lg" 
                                     className="w-full h-16 rounded-5xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/20"
                                     disabled={quizAnswers.length < quiz.questions.length || quizAnswers.includes(undefined as any)}
                                     onClick={handleQuizSubmit}
                                   >
                                      Evaluate Knowledge
                                   </Button>
                                </div>
                              </div>
                            )}
                         </div>
                       ) : (
                         <div className="flex flex-col items-center justify-center py-20 px-6 text-center bg-secondary/20 rounded-7xl border border-dashed border-border">
                            <HelpCircle className="w-16 h-16 text-muted-foreground mb-6 opacity-20" />
                            <p className="text-sm font-black text-foreground mb-1">Knowledge Check Offline</p>
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">This lesson doesn&apos;t have an evaluation component.</p>
                         </div>
                       )}
                    </div>
                  )}
                </div>
              </div>

              <div className="shrink-0 flex flex-col gap-4 sticky top-6">
                 {!completedLessonIds.includes(activeLesson?.id || "") ? (
                   <Button 
                     size="lg" 
                     className="w-full md:w-auto min-w-[240px] h-16 rounded-2xl shadow-xl shadow-primary/20 text-[10px] font-black uppercase tracking-widest"
                     onClick={handleMarkComplete}
                     disabled={marking}
                   >
                     {marking ? (
                       <div className="flex items-center gap-3">
                         <Loader2 className="w-4 h-4 animate-spin" />
                         Syncing...
                       </div>
                     ) : "Mark as Completed"}
                   </Button>
                 ) : (
                   <div className="flex items-center gap-4 px-8 py-5 rounded-4xl bg-success/10 border border-success/20 text-success shadow-lg shadow-success/5">
                     <CheckCircle2 className="w-6 h-6" />
                     <span className="text-[10px] font-black uppercase tracking-widest">Module Completed</span>
                   </div>
                 )}
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="w-full md:w-auto min-w-[240px] h-16 rounded-2xl group border-border hover:border-primary/50 text-[10px] font-black uppercase tracking-widest"
                    onClick={() => {
                      const currentIndex = lessons.findIndex(l => l.id === activeLesson?.id);
                      if (currentIndex < lessons.length - 1) {
                        setActiveLesson(lessons[currentIndex + 1]);
                      }
                    }}
                    disabled={lessons.indexOf(activeLesson!) === lessons.length - 1}
                  >
                    Next Lesson
                    <ChevronRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
              </div>
            </div>
          </div>
        </main>

        {/* Completion Celebration Overlay */}
        {showCompletionModal && course && user && (
          <CourseCompletionModal 
            courseTitle={course.title} 
            courseId={course.id}
            userId={user.uid}
            onClose={() => setShowCompletionModal(false)} 
          />
        )}

        {/* Right Sidebar Playlist */}
        <aside 
          ref={sidebarRef}
          className={`absolute right-0 top-0 bottom-0 z-20 w-full md:w-[450px] border-l border-border bg-card/95 backdrop-blur-2xl shadow-2xl transition-all duration-700 ease-in-out transform ${
            isSidebarOpen ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
          }`}
        >
          <div className="flex h-full flex-col">
            <div className="p-10 border-b border-border bg-secondary/30">
              <h3 className="text-2xl font-black text-foreground tracking-tight flex items-center gap-3">
                <Sparkles className="w-6 h-6 text-primary" />
                Curriculum
              </h3>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mt-2">
                {lessons.length} High-Fidelity Modules
              </p>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-3 scrollbar-hide">
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
                    className={`group relative flex w-full items-center gap-4 rounded-xl p-4 text-left transition-all duration-300 border ${
                      isActive 
                        ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/10" 
                        : "bg-transparent border-transparent hover:bg-secondary hover:border-border"
                    }`}
                  >
                    <div className={`shrink-0 flex h-10 w-10 items-center justify-center rounded-lg border transition-all duration-300 ${
                      isActive 
                        ? "bg-white/20 border-white/10 text-white" 
                        : isCompleted 
                          ? "bg-success/10 text-success border-success/10" 
                          : "bg-secondary text-muted-foreground border-border group-hover:bg-card"
                    }`}>
                      {isCompleted ? <CheckCircle2 className="h-5 w-5" /> : isActive ? <PlayCircle className="h-5 w-5" /> : <span className="text-[10px] font-bold">{index + 1}</span>}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-bold truncate ${isActive ? "text-white" : "text-foreground"}`}>
                        {lesson.title}
                      </p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className={`flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider ${isActive ? "text-white/60" : "text-muted-foreground"}`}>
                          <Clock className="w-3 h-3" />
                          {lesson.duration}
                        </span>
                      </div>
                    </div>
                    
                    {isActive && (
                      <div className="h-1.5 w-1.5 rounded-full bg-white shadow-[0_0_8px_white]" />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="p-8 border-t border-border bg-secondary/20">
               <div className="flex items-center justify-center gap-4 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">
                 <div className="h-px w-12 bg-border" />
                 VEROX ACADEMY
                 <div className="h-px w-12 bg-border" />
               </div>
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
