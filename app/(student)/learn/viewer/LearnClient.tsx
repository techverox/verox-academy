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
  Info
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

                <div className="flex bg-muted/20 p-1.5 rounded-2xl border border-border/50">
                <button 
                  onClick={() => setActiveTab("content")}
                  className={`flex-1 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === "content" ? "bg-white text-black shadow-lg" : "text-secondary-text hover:text-white"}`}
                >
                  Content
                </button>
                <button 
                  onClick={() => setActiveTab("resources")}
                  className={`flex-1 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === "resources" ? "bg-white text-black shadow-lg" : "text-secondary-text hover:text-white"}`}
                >
                  Resources
                </button>
                {quiz && (
                  <button 
                    onClick={() => setActiveTab("quiz")}
                    className={`flex-1 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === "quiz" ? "bg-white text-black shadow-lg" : "text-secondary-text hover:text-white"}`}
                  >
                    Quiz
                  </button>
                )}
              </div>

                <div className="py-6 animate-in fade-in duration-500">
                  {activeTab === "content" ? (
                    <div className="prose prose-invert prose-lg max-w-none">
                       {activeLesson?.notes ? (
                         <ReactMarkdown remarkPlugins={[remarkGfm]}>
                           {activeLesson.notes}
                         </ReactMarkdown>
                       ) : (
                         <p className="text-secondary-text text-lg leading-relaxed font-medium">
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
                              className="flex items-center gap-4 p-4 rounded-2xl bg-muted/20 border border-border/50 hover:border-primary/30 transition-all group"
                            >
                              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                                <Files className="w-6 h-6" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-white truncate">{resource.title}</p>
                                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                                  {resource.type} • {resource.size ? (resource.size / 1024 / 1024).toFixed(2) + " MB" : "Click to View"}
                                </p>
                              </div>
                            </a>
                          ))}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-12 px-6 rounded-2xl bg-muted/20 border border-dashed border-border">
                           <Files className="w-12 h-12 text-zinc-600 mb-4" />
                           <p className="text-sm font-bold text-white mb-1">No resources available</p>
                           <p className="text-xs text-secondary-text">Downloadable materials for this lesson will appear here.</p>
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
                            <div className="flex items-center justify-between p-6 rounded-[2rem] bg-primary/5 border border-primary/20">
                               <div className="flex items-center gap-4">
                                  <div className="h-12 w-12 rounded-xl bg-primary text-white flex items-center justify-center">
                                     <BrainCircuit className="w-6 h-6" />
                                  </div>
                                  <div>
                                     <h3 className="text-lg font-black text-white">{quiz.title}</h3>
                                     <p className="text-xs text-secondary-text font-bold uppercase tracking-widest">Passing Score: {quiz.passingScore}%</p>
                                  </div>
                               </div>
                               {latestAttempt && (
                                 <Badge variant={latestAttempt.passed ? "success" : "danger"} className="h-10 px-4 rounded-xl">
                                    Last Score: {latestAttempt.score}%
                                 </Badge>
                               )}
                            </div>

                            {quizResult ? (
                              <div className="text-center py-12 space-y-6 bg-muted/10 rounded-[3rem] border border-border">
                                 <div className={`mx-auto h-20 w-20 rounded-[2rem] flex items-center justify-center ${quizResult.passed ? "bg-success text-white shadow-[0_0_30px_rgba(34,197,94,0.3)]" : "bg-red-500 text-white shadow-[0_0_30px_rgba(239,68,68,0.3)]"}`}>
                                    {quizResult.passed ? <TrophyIcon className="w-10 h-10" /> : <ArrowLeft className="w-10 h-10 rotate-90" />}
                                 </div>
                                 <div>
                                    <h4 className="text-3xl font-black text-white">{quizResult.passed ? "Great Job!" : "Not Quite Yet"}</h4>
                                    <p className="text-secondary-text font-medium mt-2">You scored <span className={`font-black ${quizResult.passed ? "text-success" : "text-red-500"}`}>{quizResult.score}%</span></p>
                                 </div>
                                 <Button 
                                   onClick={() => { setQuizResult(null); setQuizAnswers([]); }}
                                   variant="outline"
                                   className="rounded-xl px-8"
                                 >
                                    Try Again
                                 </Button>
                              </div>
                            ) : (
                              <div className="space-y-8">
                                {quiz.questions.map((q, qIdx) => (
                                  <div key={q.id} className="space-y-4">
                                     <div className="flex gap-4">
                                        <span className="flex-shrink-0 h-8 w-8 rounded-full bg-zinc-800 text-white flex items-center justify-center text-xs font-black">
                                           {qIdx + 1}
                                        </span>
                                        <h5 className="text-lg font-bold text-white leading-relaxed">{q.text}</h5>
                                     </div>
                                     <div className="grid gap-3 pl-12">
                                        {q.options.map((opt, oIdx) => (
                                          <button
                                            key={oIdx}
                                            onClick={() => {
                                              const newAns = [...quizAnswers];
                                              newAns[qIdx] = oIdx;
                                              setQuizAnswers(newAns);
                                            }}
                                            className={`w-full text-left p-4 rounded-2xl border transition-all font-medium ${
                                              quizAnswers[qIdx] === oIdx 
                                              ? "bg-primary/10 border-primary text-white" 
                                              : "bg-muted/5 border-border/50 text-secondary-text hover:border-zinc-700"
                                            }`}
                                          >
                                            {opt}
                                          </button>
                                        ))}
                                     </div>
                                  </div>
                                ))}
                                <div className="pt-6 border-t border-border/50">
                                   <Button 
                                     size="lg" 
                                     className="w-full h-14 rounded-2xl text-lg"
                                     disabled={quizAnswers.length < quiz.questions.length || quizAnswers.includes(undefined as any)}
                                     onClick={handleQuizSubmit}
                                   >
                                      Submit Quiz
                                   </Button>
                                </div>
                              </div>
                            )}
                         </div>
                       ) : (
                         <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
                            <HelpCircle className="w-12 h-12 text-zinc-600 mb-4" />
                            <p className="text-sm font-bold text-white mb-1">No quiz for this lesson</p>
                            <p className="text-xs text-secondary-text">This lesson doesn&apos;t have an evaluation component.</p>
                         </div>
                       )}
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
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="group"
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
