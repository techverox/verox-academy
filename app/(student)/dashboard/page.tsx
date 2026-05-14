"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/hooks/use-auth";
import { getUserDashboardStats } from "@/lib/firestore";
import Link from "next/link";
import Image from "next/image";
import {
  Play,
  BookOpen,
  Trophy,
  ArrowRight,
  Search,
  Award,
  ChevronRight,
  TrendingUp,
  CheckCircle,
  Zap,
  Clock,
  Sparkles,
  Calendar,
  ExternalLink,
  Download,
  Share2
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
  const { user, profile } = useAuth();
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
      setError("Unable to load your progress.");
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
      <div className="space-y-10 md:space-y-12 animate-pulse">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-4">
            <div className="h-4 w-32 bg-muted rounded-full" />
            <div className="h-10 w-64 bg-muted rounded-xl" />
          </div>
          <div className="h-12 w-full md:w-48 bg-muted rounded-2xl" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {[1, 2, 3, 4].map((i) => <div key={i} className="h-28 bg-muted rounded-4xl border border-border/40" />)}
        </div>
        <div className="h-80 bg-muted rounded-4xl md:rounded-6xl border border-border/40" />
      </div>
    );
  }

  return (
    <div className="space-y-12 md:space-y-16 pb-32">
      {/* Premium Welcome Header - Adaptive Spacing */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 md:gap-8">
        <div className="space-y-2 md:space-y-3">
          <div className="flex items-center gap-2 text-[9px] md:text-[10px] font-bold uppercase tracking-[0.4em] text-blue-600">
            <Sparkles className="w-3.5 h-3.5" />
            Student Dashboard
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tighter text-foreground leading-[1.1]">
            Good morning, <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-cyan-500">{user?.displayName?.split(" ")[0] || "Learner"}.</span>
          </h1>
          <p className="text-sm md:text-base text-muted-foreground font-medium max-w-md leading-relaxed">
            You have {inProgressCourses.length} courses in progress. Ready to continue your mastery?
          </p>
        </div>
        <Link href="/courses" className="w-full md:w-auto">
          <Button className="h-14 px-8 rounded-2xl bg-linear-to-r from-blue-600 to-cyan-500 text-white font-bold uppercase tracking-widest text-[10px] md:text-[11px] group shadow-2xl shadow-blue-500/20 w-full md:w-auto border-none">
            Browse Courses <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </Link>
      </div>

      {/* High-Density Stats Grid - Optimized for Mobile Padding */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {[
          { label: "In Progress", value: inProgressCourses.length, icon: Play, color: "text-blue-600", bg: "bg-blue-600/10" },
          { label: "Completed", value: completedCourses.length, icon: CheckCircle, color: "text-emerald-500", bg: "bg-emerald-500/10" },
          { label: "Modules Done", value: stats?.totalCompletedLessons || 0, icon: BookOpen, color: "text-cyan-500", bg: "bg-cyan-500/10" },
          { label: "Certificates", value: completedCourses.length, icon: Award, color: "text-amber-500", bg: "bg-amber-500/10" },
        ].map((stat, i) => (
          <Card key={i} className="p-6 md:p-8 rounded-4xl border border-border/40 bg-surface hover:border-blue-500/40 transition-all duration-500 group shadow-sm">
             <div className="flex flex-col gap-4 md:gap-6">
                <div className={cn("h-10 w-10 md:h-12 md:w-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110", stat.bg, stat.color)}>
                   <stat.icon className="w-5 h-5 md:w-6 md:h-6" />
                </div>
                <div className="space-y-0.5 md:space-y-1">
                   <p className="text-[8px] md:text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">{stat.label}</p>
                   <p className="text-3xl md:text-4xl font-bold tracking-tighter text-foreground leading-none">{stat.value}</p>
                </div>
             </div>
          </Card>
        ))}
      </div>

      {/* Continue Learning - Hardened Immersive Card */}
      {lastCourse && lastCourse.status !== "completed" && (
        <section className="space-y-6 md:space-y-8">
           <div className="flex items-center justify-between px-2">
              <h2 className="text-lg md:text-xl font-bold tracking-tighter text-foreground">Continue Learning</h2>
              <Link href={`/learn/viewer/?id=${lastCourse.courseId}`} className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-blue-600 hover:underline decoration-2 underline-offset-4">Resume Session</Link>
           </div>
           
           <div className="group relative overflow-hidden rounded-5xl md:rounded-6xl bg-zinc-950 border border-white/5 p-6 sm:p-10 md:p-14 flex flex-col lg:flex-row items-center gap-8 md:gap-12 shadow-2xl shadow-black/40">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_100%_0%,rgba(37,99,235,0.1),transparent_50%)]" />
              
              <div className="relative w-full lg:w-[420px] aspect-video rounded-4xl overflow-hidden border border-white/10 shadow-2xl shrink-0 group-hover:scale-[1.02] transition-transform duration-700 ring-1 ring-white/5">
                <Image src={lastCourse.thumbnail} alt={lastCourse.courseTitle} fill className="object-cover opacity-60 group-hover:opacity-80 transition-opacity" />
                <div className="absolute inset-0 flex items-center justify-center">
                   <div className="h-14 w-14 md:h-20 md:w-20 rounded-full bg-blue-600/20 backdrop-blur-xl border border-blue-600/40 flex items-center justify-center text-white transition-all group-hover:scale-110 group-hover:bg-blue-600 shadow-2xl shadow-blue-600/40">
                      <Play className="w-6 h-6 md:w-8 md:h-8 fill-current ml-1" />
                   </div>
                </div>
              </div>

              <div className="flex-1 space-y-8 md:space-y-10 relative z-10 text-center lg:text-left w-full">
                <div className="space-y-3 md:space-y-4">
                    <Badge className="bg-blue-600/10 text-blue-600 border-blue-600/20 px-3 md:px-4 py-1 md:py-1.5 rounded-xl text-[8px] md:text-[10px] font-bold tracking-widest uppercase">UP NEXT: MODULE {lastCourse.completedCount + 1}</Badge>
                    <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white tracking-tighter leading-[1.1] text-balance">
                      {lastCourse.courseTitle}
                    </h3>
                 </div>

                 <div className="space-y-4 md:space-y-6 max-w-xl mx-auto lg:mx-0">
                    <div className="flex items-center justify-between text-[9px] md:text-[11px] font-bold uppercase tracking-widest text-zinc-500">
                       <span className="flex items-center gap-2"><Clock className="w-3.5 h-3.5 md:w-4 md:h-4 text-blue-600" /> {lastCourse.percentage}% Complete</span>
                       <span>{lastCourse.completedCount} / {lastCourse.totalLessons}</span>
                    </div>
                    <div className="h-1.5 md:h-2 w-full bg-white/5 rounded-full overflow-hidden">
                       <motion.div 
                         initial={{ width: 0 }}
                         animate={{ width: `${lastCourse.percentage}%` }}
                         transition={{ duration: 1.5, ease: [0.23, 1, 0.32, 1] }}
                         className="h-full bg-blue-600 shadow-[0_0_20px_rgba(37,99,235,0.6)]"
                       />
                    </div>
                    <div className="pt-2 md:pt-4">
                       <Link href={`/learn/viewer/?id=${lastCourse.courseId}`} className="block w-full sm:w-auto">
                         <Button className="w-full sm:w-auto h-14 md:h-16 px-10 md:px-12 rounded-2xl bg-linear-to-r from-blue-600 to-cyan-500 text-white font-bold uppercase tracking-[0.2em] text-[10px] md:text-[11px] shadow-2xl shadow-blue-500/20 border-none group">
                            Resume Session <ChevronRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                         </Button>
                       </Link>
                    </div>
                 </div>
              </div>
           </div>
        </section>
      )}

      {/* Main Content Grid - Adaptive Columns */}
      <div className="flex flex-col lg:grid lg:grid-cols-12 gap-12 md:gap-16">
        <div className="lg:col-span-8 space-y-12 md:space-y-16">
          {/* Active Courses Section */}
          <section className="space-y-6 md:space-y-8">
            <div className="flex items-center justify-between px-2">
              <h2 className="text-lg md:text-xl font-bold tracking-tighter text-foreground">Active Catalog</h2>
              <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">{inProgressCourses.length} Items</span>
            </div>
            
            {inProgressCourses.length > 0 ? (
              <div className="grid sm:grid-cols-2 gap-4 md:gap-6">
                {inProgressCourses.map((course: any, i: number) => (
                  <motion.div
                    key={course.courseId}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <Card className="p-5 md:p-6 rounded-4xl border border-border/40 bg-surface hover:border-blue-500/40 transition-all group shadow-sm">
                       <div className="space-y-5 md:space-y-6">
                          <div className="relative aspect-video rounded-3xl overflow-hidden border border-border/40">
                             <Image src={course.thumbnail} alt="" fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
                             <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
                             <div className="absolute top-3 right-3 md:top-4 md:right-4 h-8 w-8 md:h-10 md:w-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/20 group-hover:bg-blue-600 group-hover:border-blue-600 transition-all">
                                <Play className="w-3.5 h-3.5 md:w-4 md:h-4 fill-current" />
                             </div>
                          </div>
                          <div className="space-y-4">
                             <h4 className="text-base md:text-lg font-bold tracking-tight text-foreground truncate leading-tight">{course.courseTitle}</h4>
                             <div className="space-y-2 md:space-y-3">
                                <div className="flex justify-between text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                                   <span>{course.percentage}% Done</span>
                                   <span>{course.completedCount}/{course.totalLessons}</span>
                                </div>
                                <div className="h-1 md:h-1.5 w-full bg-muted/40 rounded-full overflow-hidden">
                                   <div className="h-full bg-blue-600" style={{ width: `${course.percentage}%` }} />
                                </div>
                             </div>
                             <Link href={`/learn/viewer/?id=${course.courseId}`} className="block">
                                <Button variant="secondary" className="w-full h-11 md:h-12 rounded-xl font-bold uppercase tracking-widest text-[9px] md:text-[10px]">Continue Learning</Button>
                             </Link>
                          </div>
                       </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="py-16 md:py-20 text-center rounded-6xl border-2 border-dashed border-border/40 bg-muted/10">
                 <Search className="w-10 h-10 md:w-12 md:h-12 text-muted-foreground/20 mx-auto mb-4" />
                 <p className="text-xs md:text-sm text-muted-foreground font-bold uppercase tracking-widest opacity-40">No active catalog entries</p>
              </div>
            )}
          </section>

          {/* Recently Completed Section */}
          {completedCourses.length > 0 && (
            <section className="space-y-6 md:space-y-8">
               <h2 className="text-lg md:text-xl font-bold tracking-tighter text-foreground px-2">Mastered Modules</h2>
               <div className="grid sm:grid-cols-2 gap-4 md:gap-6">
                  {completedCourses.slice(0, 4).map((course: any) => (
                    <Card key={course.courseId} className="p-4 md:p-6 rounded-4xl border border-emerald-500/20 bg-emerald-500/2 flex items-center gap-4 md:gap-6 group hover:border-emerald-500/40 transition-all shadow-sm">
                       <div className="relative h-16 w-20 md:h-20 md:w-28 rounded-2xl overflow-hidden shrink-0 border border-emerald-500/10">
                          <Image src={course.thumbnail} alt="" fill className="object-cover grayscale group-hover:grayscale-0 transition-all" />
                          <div className="absolute inset-0 flex items-center justify-center bg-emerald-500/10">
                             <CheckCircle className="w-6 h-6 md:w-8 md:h-8 text-white drop-shadow-lg" />
                          </div>
                       </div>
                       <div className="flex-1 min-w-0 space-y-1.5 md:space-y-2">
                          <h4 className="text-sm md:text-base font-bold tracking-tight text-foreground truncate leading-tight">{course.courseTitle}</h4>
                          <Link href={`/verify-certificate/${user?.uid}_${course.courseId}`}>
                             <Button variant="ghost" className="h-8 md:h-9 px-3 md:px-4 rounded-lg font-bold uppercase tracking-widest text-[8px] md:text-[9px] text-emerald-600 hover:bg-emerald-500/10">
                                Certificate <ExternalLink className="ml-1.5 md:ml-2 w-3 h-3" />
                             </Button>
                          </Link>
                       </div>
                    </Card>
                  ))}
               </div>
            </section>
          )}
        </div>

        {/* Right Sidebar: Adaptive Column Order */}
        <div className="lg:col-span-4 space-y-12 md:space-y-16">
           {/* Recent Activity Section */}
           <section className="space-y-6 md:space-y-8 px-2">
              <h2 className="text-lg md:text-xl font-bold tracking-tighter text-foreground">Recent Activity</h2>
              <div className="space-y-5 md:space-y-6">
                 {[
                   { type: "lesson", text: "Advanced SaaS Architecture", time: "2h ago", icon: BookOpen },
                   { type: "enroll", text: "Product Design Masterclass", time: "1d ago", icon: Zap },
                   { type: "award", text: "Earned Vite Certificate", time: "3d ago", icon: Trophy }
                 ].map((activity, i) => (
                   <div key={i} className="flex gap-4 group">
                      <div className="h-10 w-10 rounded-xl bg-surface border border-border/40 flex items-center justify-center shrink-0 group-hover:bg-blue-600/10 group-hover:border-blue-600/40 transition-colors shadow-sm">
                         <activity.icon className="w-4 h-4 text-muted-foreground group-hover:text-blue-600 transition-colors" />
                      </div>
                      <div className="space-y-0.5 md:space-y-1">
                         <p className="text-sm font-bold text-foreground leading-tight">{activity.text}</p>
                         <p className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">{activity.time}</p>
                      </div>
                   </div>
                 ))}
              </div>
           </section>

           {/* Certificates Matrix Section */}
           <section className="space-y-6 md:space-y-8 px-2">
              <div className="flex items-center justify-between">
                <h2 className="text-lg md:text-xl font-bold tracking-tighter text-foreground">Certificates</h2>
                <Badge variant="outline" className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/40 border-border/40 px-2.5 py-0.5">{completedCourses.length}</Badge>
              </div>
              <div className="grid gap-4 md:gap-5">
                 {completedCourses.map((course: any) => (
                   <Card key={course.courseId} className="p-6 md:p-8 rounded-4xl border border-border/40 bg-zinc-950 text-white relative overflow-hidden group shadow-xl">
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_0%_100%,rgba(37,99,235,0.1),transparent_50%)]" />
                      <div className="relative z-10 space-y-6">
                         <div className="flex items-start justify-between">
                            <Award className="w-8 h-8 text-blue-600" />
                            <div className="flex gap-1.5">
                               <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors"><Download className="w-3.5 h-3.5" /></Button>
                               <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors"><Share2 className="w-3.5 h-3.5" /></Button>
                            </div>
                         </div>
                         <div className="space-y-1.5 md:space-y-2">
                            <p className="text-[8px] md:text-[9px] font-bold uppercase tracking-[0.3em] text-zinc-500 leading-none">Verified Credentials</p>
                            <h4 className="text-sm font-bold tracking-tight leading-tight">{course.courseTitle}</h4>
                         </div>
                         <Link href={`/verify-certificate/${user?.uid}_${course.courseId}`} className="block">
                            <Button className="w-full h-10 rounded-xl bg-white text-black hover:bg-zinc-200 font-bold uppercase tracking-widest text-[9px] shadow-lg border-none">Verify Node</Button>
                         </Link>
                      </div>
                   </Card>
                 ))}

                 {completedCourses.length === 0 && (
                    <div className="py-12 md:py-16 rounded-4xl border-2 border-dashed border-border/40 text-center space-y-4 bg-surface/30">
                       <Award className="w-10 h-10 text-muted-foreground/10 mx-auto" />
                       <p className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">Zero earned certificates</p>
                    </div>
                 )}
              </div>
           </section>
        </div>
      </div>
    </div>

  );
}
