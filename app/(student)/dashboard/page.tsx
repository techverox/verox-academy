"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/hooks/use-auth";
import { getUserDashboardStats } from "@/lib/firestore";
import Link from "next/link";
import Image from "next/image";
import { 
  Play, 
  BookOpen, 
  Clock, 
  Trophy, 
  ArrowRight,
  Sparkles,
  Search,
  Award,
  Zap,
  Target,
  ChevronRight,
  Bookmark,
  TrendingUp,
  Layout
} from "lucide-react";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await getUserDashboardStats(user.uid);
      setStats(data);
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
      setError("Unable to load your progress. Please check your connection.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  if (!user && !loading) return null;

  const inProgressCourses = stats?.enrolledCourses?.filter((c: any) => c.status !== "completed") || [];
  const completedCourses = stats?.enrolledCourses?.filter((c: any) => c.status === "completed") || [];
  const lastCourse = inProgressCourses[0] || stats?.enrolledCourses?.[0];

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto space-y-12 animate-pulse">
        <div className="h-24 w-full bg-secondary/50 rounded-5xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
             <div key={i} className="h-32 bg-secondary/30 rounded-4xl" />
          ))}
        </div>
        <div className="h-[400px] w-full bg-secondary/20 rounded-6xl" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-16 pb-24 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Section */}
      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
             <div className="px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-black uppercase tracking-[0.2em] text-primary shadow-sm flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5" />
                Student Intelligence
             </div>
             <div className="px-4 py-1.5 rounded-full bg-success/10 border border-success/20 text-[10px] font-black uppercase tracking-[0.2em] text-success shadow-sm flex items-center gap-2">
                <Target className="w-3.5 h-3.5" />
                Active Mastery
             </div>
          </div>
          <h1 className="text-5xl font-black tracking-tight text-foreground md:text-6xl lg:text-7xl leading-[1.05]">
            Welcome, <span className="text-primary">{user?.displayName?.split(" ")[0] || "Learner"}</span>.
          </h1>
          <p className="text-xl font-medium text-muted-foreground max-w-2xl leading-relaxed">
            Your intellectual capital is expanding. You have successfully synthesized <span className="text-foreground font-bold">{stats?.totalCompletedLessons || 0} modules</span> to date.
          </p>
        </div>
        
        <div className="flex items-center gap-4">
           <button className="btn-secondary-premium h-14 px-8">
             <Bookmark className="w-4 h-4" />
             Saved Paths
           </button>
           <Link href="/courses/">
             <button className="btn-primary-premium h-14">
               Browse Catalog
             </button>
           </Link>
        </div>
      </header>

      {/* Primary Focus: Active Mastery */}
      {lastCourse && lastCourse.status !== "completed" && (
        <section className="relative group">
          <div className="card-premium-lg">
             <div className="flex flex-col lg:flex-row bg-card rounded-6xl overflow-hidden min-h-[460px]">
                {/* Visual Identity */}
                <div className="relative w-full lg:w-1/2 min-h-[300px] lg:min-h-full">
                   <Image
                      src={lastCourse.thumbnail}
                      alt={lastCourse.courseTitle}
                      fill
                      className="object-cover transition-transform duration-1000 group-hover:scale-110"
                   />
                    <div className="absolute inset-0 bg-linear-to-r from-card via-card/20 to-transparent z-10 hidden lg:block" />
                    <div className="absolute inset-0 bg-linear-to-t from-card/80 to-transparent lg:hidden z-10" />
                   <div className="absolute inset-0 bg-primary/5 mix-blend-overlay" />
                </div>
                
                {/* Command Center */}
                <div className="relative z-20 flex-1 flex flex-col justify-center p-10 lg:p-20 space-y-10">
                   <div className="space-y-4">
                      <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">In-Flight Curriculum</p>
                      <h2 className="text-4xl lg:text-6xl font-black tracking-tight text-foreground leading-[1.1]">
                        {lastCourse.courseTitle}
                      </h2>
                   </div>
                   
                   <div className="grid grid-cols-2 gap-10">
                      <div>
                         <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-3 flex items-center gap-2">
                           <Layout className="w-3.5 h-3.5 text-primary" />
                           Progress
                         </p>
                         <div className="flex items-end gap-2">
                            <span className="text-4xl font-black text-foreground leading-none">{lastCourse.percentage}%</span>
                            <span className="text-[10px] font-black text-muted-foreground mb-1 uppercase tracking-widest">Complete</span>
                         </div>
                      </div>
                      <div>
                         <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-3 flex items-center gap-2">
                           <Play className="w-3.5 h-3.5 text-success" />
                           Status
                         </p>
                         <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-success animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                            <span className="text-sm font-black text-foreground uppercase tracking-widest">Active Sync</span>
                         </div>
                      </div>
                   </div>

                   <div className="space-y-6">
                      <div className="h-2 w-full max-w-md bg-secondary rounded-full overflow-hidden shadow-inner">
                         <div 
                           className="h-full bg-primary transition-all duration-1000 ease-out shadow-[0_0_30px_rgba(139,92,246,0.6)]"
                           style={{ width: `${lastCourse.percentage}%` }}
                         />
                      </div>
                      <div className="flex items-center justify-between max-w-md">
                         <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Digital Synthesis</span>
                         <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{lastCourse.completedCount} / {lastCourse.totalLessons} MODULES</span>
                      </div>
                   </div>

                   <Link href={`/learn/viewer/?id=${lastCourse.courseId}`} className="w-fit block">
                      <button className="btn-primary-premium h-18 px-12 rounded-3xl gap-4 shadow-2xl shadow-primary/30">
                        Resume Mastery Path
                        <ChevronRight className="w-5 h-5" />
                      </button>
                   </Link>
                </div>
             </div>
          </div>
        </section>
      )}

      {/* Tactical Grid */}
      <section className="stats-grid">
        <div className="surface-elevated p-10 rounded-5xl group hover:border-primary/40">
           <div className="flex items-center justify-between mb-8">
              <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-500 shadow-inner">
                 <BookOpen className="w-6 h-6" />
              </div>
              <div className="px-3 py-1.5 rounded-full bg-secondary text-[10px] font-black uppercase tracking-widest text-muted-foreground group-hover:text-primary transition-colors">Curated</div>
           </div>
           <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground mb-2">Active Paths</p>
           <h3 className="text-4xl font-black text-foreground tracking-tight">{inProgressCourses.length}</h3>
        </div>
        <div className="surface-elevated p-10 rounded-5xl group hover:border-success/40">
           <div className="flex items-center justify-between mb-8">
              <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center text-muted-foreground group-hover:bg-success group-hover:text-success-foreground transition-all duration-500 shadow-inner">
                 <Trophy className="w-6 h-6" />
              </div>
              <div className="px-3 py-1.5 rounded-full bg-secondary text-[10px] font-black uppercase tracking-widest text-muted-foreground group-hover:text-success transition-colors">Achievements</div>
           </div>
           <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground mb-2">Total Mastered</p>
           <h3 className="text-4xl font-black text-foreground tracking-tight">{completedCourses.length}</h3>
        </div>
        <div className="surface-elevated p-10 rounded-5xl group hover:border-blue-500/40">
           <div className="flex items-center justify-between mb-8">
              <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center text-muted-foreground group-hover:bg-blue-500 group-hover:text-white transition-all duration-500 shadow-inner">
                 <Zap className="w-6 h-6" />
              </div>
              <div className="px-3 py-1.5 rounded-full bg-secondary text-[10px] font-black uppercase tracking-widest text-muted-foreground group-hover:text-blue-500 transition-colors">Momentum</div>
           </div>
           <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground mb-2">Synaptic Pulses</p>
           <h3 className="text-4xl font-black text-foreground tracking-tight">{stats?.totalCompletedLessons || 0}</h3>
        </div>
      </section>

      {/* Multi-Course Progress */}
      {inProgressCourses.length > 0 && (
        <section className="space-y-10">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-3xl font-black tracking-tight text-foreground">In-Progress Mastery</h2>
            <div className="flex items-center gap-2">
               <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Tactical Overview</span>
               <TrendingUp className="w-4 h-4 text-primary" />
            </div>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {inProgressCourses.map((course: any) => (
              <div key={course.courseId} className="group surface-elevated rounded-6xl overflow-hidden hover:border-primary/50">
                <div className="relative aspect-video w-full overflow-hidden">
                  <Image
                    src={course.thumbnail}
                    alt={course.courseTitle}
                    fill
                    className="object-cover transition-transform duration-1000 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-card/90 via-card/20 to-transparent opacity-100" />
                  <div className="absolute bottom-6 left-8">
                    <div className="px-4 py-2 rounded-2xl bg-card/90 backdrop-blur-xl border border-border/50 text-[10px] font-black text-foreground shadow-2xl">
                      {course.percentage}% SYNTHESIZED
                    </div>
                  </div>
                </div>
                
                <div className="p-10 space-y-8">
                  <div>
                    <h4 className="text-xl font-black text-foreground mb-3 line-clamp-1 group-hover:text-primary transition-colors tracking-tight">{course.courseTitle}</h4>
                    <div className="flex items-center gap-3 text-[10px] text-muted-foreground font-black uppercase tracking-widest">
                       <BookOpen className="w-4 h-4 text-primary" />
                       {course.totalLessons} Modules In Curriculum
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                     <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden shadow-inner">
                        <div className="h-full bg-primary transition-all duration-700 shadow-[0_0_15px_rgba(139,92,246,0.4)]" style={{ width: `${course.percentage}%` }} />
                     </div>
                  </div>

                  <Link href={`/learn/viewer/?id=${course.courseId}`} className="block">
                    <button className="w-full h-14 bg-secondary/50 text-foreground text-[10px] font-black uppercase tracking-widest rounded-2xl border border-border group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all shadow-sm">
                      Resume Protocol
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Completed Curriculums */}
      {completedCourses.length > 0 && (
        <section className="space-y-10">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-3xl font-black tracking-tight text-foreground">Synthesis Archive</h2>
            <div className="flex items-center gap-2">
               <span className="text-[10px] font-black text-success uppercase tracking-widest">Verified Credentials</span>
               <Award className="w-4 h-4 text-success" />
            </div>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {completedCourses.map((course: any) => (
              <div key={course.courseId} className="group surface-elevated rounded-6xl overflow-hidden hover:border-success/50">
                <div className="relative aspect-video w-full grayscale-100 group-hover:grayscale-0 transition-all duration-1000">
                  <Image
                    src={course.thumbnail}
                    alt={course.courseTitle}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-success/10 mix-blend-overlay" />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100">
                     <div className="h-20 w-20 rounded-3xl bg-success text-success-foreground flex items-center justify-center shadow-2xl shadow-success/40">
                        <Trophy className="w-10 h-10" />
                     </div>
                  </div>
                </div>
                
                <div className="p-10">
                  <h4 className="text-xl font-black text-foreground mb-2 line-clamp-1 tracking-tight">{course.courseTitle}</h4>
                  <p className="text-[10px] text-muted-foreground mb-10 font-black uppercase tracking-[0.2em]">Validated on {course.completedAt ? new Date(course.completedAt.seconds * 1000).toLocaleDateString() : 'recent cycle'}</p>
                  
                  <div className="flex flex-col gap-4">
                    <Link href={`/verify-certificate/${user?.uid}_${course.courseId}`} className="w-full">
                      <button className="w-full h-16 bg-success text-success-foreground rounded-2xl shadow-xl shadow-success/20 flex items-center justify-center gap-4 text-[10px] font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all">
                        <Award className="w-5 h-5" />
                        Execute Certification
                      </button>
                    </Link>
                    <Link href={`/learn/viewer/?id=${course.courseId}`} className="w-full">
                      <button className="w-full h-14 border border-border text-muted-foreground text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-secondary transition-all">
                        Review Archive
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Empty State */}
      {!loading && stats?.enrolledCourses.length === 0 && (
        <div className="flex flex-col items-center justify-center py-32 px-10 text-center rounded-7xl border border-dashed border-border bg-card/30">
          <div className="w-24 h-24 rounded-4xl bg-secondary flex items-center justify-center mb-8 text-muted-foreground shadow-inner">
            <Search className="w-10 h-10 opacity-20" />
          </div>
          <h4 className="text-3xl font-black text-foreground mb-4">No Curriculum Detected</h4>
          <p className="text-xl text-muted-foreground max-w-md mb-10 font-medium leading-relaxed">
            Your intelligence engine is idle. Explore our high-fidelity curated paths to begin synthesis.
          </p>
          <Link href="/courses/">
            <button className="btn-primary-premium h-18 px-12 rounded-2xl shadow-2xl shadow-primary/30">
               Initialize Discovery Protocol
            </button>
          </Link>
        </div>
      )}
    </div>
  );
}
