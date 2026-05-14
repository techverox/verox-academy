"use client";

import { useEffect, useState, Suspense, useCallback, useMemo } from "react";
import { getCourseById, getUserProgress, markLessonComplete, getTeacherById, trackLessonAnalytics, isUserEnrolled } from "@/lib/firestore";
import { Lesson, Course, Teacher } from "@/types/firestore";
import { useAuth } from "@/hooks/use-auth";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  ChevronLeft, 
  AlertCircle,
  Loader2,
  ShieldCheck
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { CourseCompletionModal } from "@/components/CourseCompletionModal";
import { VideoPlayer } from "@/components/video/VideoPlayer";
import { VideoHeader } from "@/components/video/VideoHeader";
import { TeacherSection } from "@/components/video/TeacherSection";
import { ActionButtons } from "@/components/video/ActionButtons";
import { DescriptionBox } from "@/components/video/DescriptionBox";
import { LessonPlaylist } from "@/components/video/LessonPlaylist";
import { ResourcesModal } from "@/components/video/ResourcesModal";
import { CommentSection } from "@/components/video/CommentSection";

// Hooks
import { useLessonPlayer } from "@/hooks/use-lesson-player";
import { useVideoProgress } from "@/hooks/use-video-progress";
import { useVideoReaction } from "@/hooks/use-video-reaction";
import { useLessonResources } from "@/hooks/use-lesson-resources";

function LearnViewerContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const courseId = searchParams.get("id");
  const { user, loading: authLoading } = useAuth();

  // 1. Core Data State
  const [course, setCourse] = useState<Course | null>(null);
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>([]);
  const [courseLoading, setCourseLoading] = useState(true);
  const [isEnrolled, setIsEnrolled] = useState<boolean | null>(null);
  const [enrollmentLoading, setEnrollmentLoading] = useState(true);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [isResourcesOpen, setIsResourcesOpen] = useState(false);

  // 1.1 Security Check
  useEffect(() => {
    if (authLoading) return;
    
    if (!user) {
      router.push(`/login/?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`);
      return;
    }

    if (!courseId) {
      router.push("/courses");
      return;
    }

    const checkEnrollment = async () => {
      try {
        const enrolled = await isUserEnrolled(user.uid, courseId);
        setIsEnrolled(enrolled);
        if (!enrolled) {
          router.push(`/courses/view/?id=${courseId}&error=not-enrolled`);
        }
      } catch (error) {
        console.error("Security check failed:", error);
        router.push("/courses");
      } finally {
        setEnrollmentLoading(false);
      }
    };

    checkEnrollment();
  }, [user, authLoading, courseId, router]);

  // 2. Real-time Lesson Management Hook
  const { 
    lessons, 
    activeLesson, 
    loading: lessonsLoading, 
    error: lessonsError, 
    switchLesson 
  } = useLessonPlayer(courseId);

  // 3. Progress Tracking Hook
  const { 
    lastProgress, 
    updateProgress, 
    manualSave 
  } = useVideoProgress(courseId, activeLesson?.id);

  // 4. Reactions Hook
  const { 
    likes, 
    dislikes, 
    userReaction, 
    toggleLike, 
    toggleDislike 
  } = useVideoReaction(activeLesson?.id);

  // 5. Resources Hook
  const { 
    resources, 
    loading: resourcesLoading 
  } = useLessonResources(activeLesson?.id, courseId);

  // Initial Course & Progress Fetch
  useEffect(() => {
    async function fetchCourseAndProgress() {
      if (!courseId || !user) return;
      
      try {
        const courseData = await getCourseById(courseId);
        if (!courseData) {
          router.push("/dashboard");
          return;
        }
        setCourse(courseData);

        if (courseData.creatorId) {
          const teacherData = await getTeacherById(courseData.creatorId);
          setTeacher(teacherData);
        }

        const progressData = await getUserProgress(user.uid, courseId);
        setCompletedLessonIds(progressData);
      } catch (err) {
        console.error("Failed to fetch course/progress:", err);
      } finally {
        setCourseLoading(false);
      }
    }

    if (!authLoading && user && courseId) {
      fetchCourseAndProgress();
    }
  }, [courseId, user, authLoading, router]);

  // Engagement Analytics Tracking
  useEffect(() => {
    if (!user || !activeLesson || !courseId) return;

    const interval = setInterval(() => {
      trackLessonAnalytics({
        id: `${activeLesson.id}_${user.uid}`,
        lessonId: activeLesson.id,
        courseId,
        userId: user.uid,
        watchTime: lastProgress?.watchedSeconds || 0,
        engagements: {
          likes: userReaction === "like" ? 1 : 0,
          comments: 0, // Updated on comment add
          shares: 0
        },
        completionRate: (lastProgress?.watchedSeconds || 0) / (lastProgress?.duration || 1)
      });
    }, 30000); // Track every 30s

    return () => clearInterval(interval);
  }, [user, activeLesson, courseId, lastProgress, userReaction]);

  // Handle Manual Completion
  const [isMarking, setIsMarking] = useState(false);
  const handleMarkComplete = useCallback(async () => {
    if (!user || !activeLesson || !courseId || isMarking) return;
    if (completedLessonIds.includes(activeLesson.id)) return;
    
    setIsMarking(true);
    try {
      await markLessonComplete(user.uid, courseId, activeLesson.id);
      setCompletedLessonIds(prev => [...prev, activeLesson.id]);
      
      const currentIndex = lessons.findIndex(l => l.id === activeLesson.id);
      if (currentIndex < lessons.length - 1) {
        setTimeout(() => {
          switchLesson(lessons[currentIndex + 1]);
        }, 1500);
      } else if (completedLessonIds.length + 1 >= lessons.length) {
        setShowCompletionModal(true);
      }
    } catch (err) {
      console.error("Failed to mark complete:", err);
    } finally {
      setIsMarking(false);
    }
  }, [user, activeLesson, courseId, completedLessonIds, lessons, isMarking, switchLesson]);

  // Optimization: Memoize sections that don't need frequent re-renders
  const memoizedDescription = useMemo(() => (
    <DescriptionBox 
      description={activeLesson?.description || "No description available for this lesson."}
      notes={activeLesson?.notes}
    />
  ), [activeLesson?.description, activeLesson?.notes]);

  const memoizedTeacher = useMemo(() => (
    <TeacherSection 
      id={teacher?.id || course?.creatorId}
      name={teacher?.name || course?.creatorName || "Elite Instructor"}
      bio={teacher?.bio || "Expert in technical systems and rapid digital deployment."}
      avatarUrl={teacher?.avatarUrl || course?.creatorPhoto || ""}
    />
  ), [teacher, course]);

  // Error Fallback
  if (lessonsError) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-background p-6 text-center">
        <div className="p-4 rounded-full bg-red-500/10 mb-6">
          <AlertCircle className="w-12 h-12 text-red-500" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Access Denied or Not Found</h2>
        <p className="text-muted-foreground max-w-md mb-8">{lessonsError}</p>
        <Link href="/dashboard" className="px-8 h-12 flex items-center bg-accent text-white font-bold rounded-2xl hover:scale-105 transition-transform">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  // Loading Screen
  if (authLoading || courseLoading || lessonsLoading || enrollmentLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-8">
          <div className="relative">
            <Loader2 className="w-12 h-12 text-accent animate-spin" />
            <ShieldCheck className="w-5 h-5 text-accent absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <div className="space-y-2 text-center">
            <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-muted-foreground/60">Verifying Enrollment & Access</p>
            <div className="h-0.5 w-48 bg-muted rounded-full overflow-hidden">
              <div className="h-full w-full bg-accent animate-progress origin-left" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!course || !activeLesson || !isEnrolled) return null;

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-accent/10 selection:text-accent scroll-smooth">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-3xl px-4 md:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/courses/view/?id=${course.id}`} className="p-2 hover:bg-muted rounded-xl transition-colors text-muted-foreground hover:text-foreground">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div className="h-4 w-px bg-border/40" />
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground/60 truncate max-w-[200px] md:max-w-none">
            {course.title}
          </span>
        </div>
        
        <div className="flex items-center gap-4">
           <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-emerald-500/5 border border-emerald-500/10 rounded-lg">
             <ShieldCheck className="w-3 h-3 text-emerald-500" />
             <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-500/80">Secured Stream</span>
           </div>
        </div>
      </header>

      <main className="max-w-[1800px] mx-auto px-4 md:px-8 py-8 animate-in fade-in duration-1000">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Main Content Area */}
          <div className="lg:col-span-8 space-y-2">
            <VideoPlayer 
              mediaId={activeLesson.wistiaMediaId || ""} 
              title={activeLesson.title}
              startAt={lastProgress?.watchedSeconds}
              onComplete={handleMarkComplete}
              onTimeUpdate={updateProgress}
            />
            
            <VideoHeader 
              title={activeLesson.title}
              moduleName={`Module ${activeLesson.order || 1}`}
              duration={activeLesson.duration}
              lastUpdated="Verified Content"
            />

            {memoizedTeacher}

            <ActionButtons 
              likes={likes}
              dislikes={dislikes}
              userReaction={userReaction}
              onLike={toggleLike}
              onDislike={toggleDislike}
              onShowResources={() => setIsResourcesOpen(true)}
            />

            {memoizedDescription}

            {/* Engagement Layer */}
            <CommentSection lessonId={activeLesson.id} />
          </div>

          {/* Sidebar Playlist */}
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-24 h-[calc(100vh-120px)] rounded-3xl border border-border/40 shadow-sm bg-zinc-950/20 backdrop-blur-3xl overflow-hidden">
              <LessonPlaylist 
                lessons={lessons}
                activeLessonId={activeLesson.id}
                completedLessonIds={completedLessonIds}
                onLessonClick={(lesson) => {
                  switchLesson(lesson);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onMarkComplete={handleMarkComplete}
                onNextModule={() => {
                  const currentIndex = lessons.findIndex(l => l.id === activeLesson.id);
                  if (currentIndex < lessons.length - 1) {
                    switchLesson(lessons[currentIndex + 1]);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }
                }}
                isMarking={isMarking}
                isLastLesson={lessons.indexOf(activeLesson) === lessons.length - 1}
              />
            </div>
          </div>
        </div>
      </main>

      <ResourcesModal 
        isOpen={isResourcesOpen}
        onClose={() => setIsResourcesOpen(false)}
        resources={resources}
        loading={resourcesLoading}
      />

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
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center bg-background text-foreground">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    }>
      <LearnViewerContent />
    </Suspense>
  );
}
