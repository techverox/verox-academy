"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { subscribeToCreatorStats, subscribeToCreatorRecentEnrollments, getCreatorAnalytics } from "@/lib/firestore";
import { CreatorStats } from "@/types/firestore";
import { 
  Users, 
  BookOpen, 
  DollarSign, 
  Clock, 
  ArrowUpRight, 
  ArrowDownRight,
  ChevronRight,
  TrendingUp,
  Plus,
  Zap,
  Sparkles,
  BarChart3,
  Target,
  ArrowRight,
  Layers,
  Wallet,
  Activity,
  Calendar,
  MessageSquare,
  MoreVertical
} from "lucide-react";
import AnalyticsCharts from "@/components/creator/AnalyticsCharts";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export default function CreatorDashboardPage() {
  const { user, profile, isCreator, isAdmin } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<CreatorStats | null>(null);
  const [recentEnrollments, setRecentEnrollments] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<{revenueData: any[], enrollmentData: any[]}>({
    revenueData: [],
    enrollmentData: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || (!isCreator && !isAdmin)) return;

    setLoading(true);

    const unsubStats = subscribeToCreatorStats(user.uid, (data) => {
      setStats(data);
      setLoading(false);
    });

    const unsubEnrollments = subscribeToCreatorRecentEnrollments(user.uid, (data) => {
      setRecentEnrollments(data);
    });

    const fetchAnalytics = async () => {
      const data = await getCreatorAnalytics(user.uid);
      setAnalytics(data);
    };
    fetchAnalytics();

    return () => {
      unsubStats();
      unsubEnrollments();
    };
  }, [user, isCreator, isAdmin]);

  if (loading) {
    return (
      <div className="space-y-10 md:space-y-12 animate-pulse pb-20">
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
           <div className="h-[350px] md:h-[400px] bg-muted rounded-4xl md:rounded-5xl" />
           <div className="h-[350px] md:h-[400px] bg-muted rounded-4xl md:rounded-5xl" />
        </div>
      </div>
    );
  }

  const formatCurrency = (paise: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(paise / 100);
  };

  const statCards = [
    { label: "Revenue", value: formatCurrency(stats?.totalRevenue || 0), icon: DollarSign, trend: "+12%", isPositive: true, color: "text-accent", bg: "bg-accent/10" },
    { label: "Students", value: stats?.totalEnrollments || 0, icon: Users, trend: "+8%", isPositive: true, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Courses", value: stats?.totalCourses || 0, icon: Layers, trend: "Stable", isPositive: true, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { label: "Hours", value: `${stats?.watchHours || 0}h`, icon: Clock, trend: "-2%", isPositive: false, color: "text-amber-500", bg: "bg-amber-500/10" },
  ];

  return (
    <div className="space-y-12 md:space-y-16 pb-32">
      {/* Premium Dashboard Header - Hardened Layout */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 md:gap-8">
        <div className="space-y-2 md:space-y-3">
          <div className="flex items-center gap-2 text-[9px] md:text-[10px] font-bold uppercase tracking-[0.4em] text-blue-600">
            <Sparkles className="w-3.5 h-3.5" />
            Creator Workspace
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tighter text-foreground leading-[1.1]">
            Welcome, <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-cyan-500">{profile?.name?.split(" ")[0] || "Creator"}.</span>
          </h1>
          <p className="text-sm md:text-base text-muted-foreground font-medium max-w-md leading-relaxed">
            Your platform is performing at peak velocity. Ready to scale your impact?
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <Button variant="secondary" onClick={() => router.push("/creator/payouts")} className="h-14 px-6 md:px-8 rounded-2xl font-bold uppercase tracking-widest text-[10px] md:text-[11px] border-border/40 w-full sm:w-auto shrink-0 shadow-sm">
            <Wallet className="mr-2.5 w-4.5 h-4.5" /> Payouts
          </Button>
          <Button className="h-14 px-6 md:px-8 rounded-2xl bg-linear-to-r from-blue-600 to-cyan-500 text-white font-bold uppercase tracking-widest text-[10px] md:text-[11px] shadow-2xl shadow-blue-500/20 w-full sm:w-auto shrink-0 border-none">
            <Plus className="mr-2.5 w-4.5 h-4.5" /> New Course
          </Button>
        </div>
      </div>

      {/* Analytics Summary Grid - Adaptive Padding */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {statCards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="p-6 md:p-8 rounded-4xl border border-border/40 bg-surface hover:border-blue-500/40 transition-all duration-500 group relative overflow-hidden shadow-sm">
              <div className="flex items-start justify-between mb-6 md:mb-8 relative z-10">
                <div className={cn("w-10 h-10 md:w-12 md:h-12 rounded-2xl flex items-center justify-center transition-all duration-700 group-hover:scale-110 shadow-sm", card.bg)}>
                  <card.icon className={cn("w-5 h-5 md:w-6 md:h-6", card.color)} />
                </div>
                <div className={cn(
                  "flex items-center gap-1.5 text-[8px] md:text-[10px] font-bold px-2 md:px-3 py-1 md:py-1.5 rounded-xl uppercase tracking-widest",
                  card.isPositive ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-destructive/10 text-destructive border border-destructive/20'
                )}>
                  {card.isPositive ? <ArrowUpRight className="w-3 h-3 md:w-3.5 md:h-3.5" /> : <ArrowDownRight className="w-3 h-3 md:w-3.5 md:h-3.5" />}
                  {card.trend}
                </div>
              </div>
              <div className="relative z-10 space-y-0.5 md:space-y-1">
                <p className="text-[8px] md:text-[10px] font-bold text-muted-foreground/60 uppercase tracking-[0.3em]">{card.label}</p>
                <h3 className="text-3xl md:text-4xl font-bold text-foreground tracking-tighter">{card.value}</h3>
              </div>
            </Card>
          </motion.div>
        ))}
      </section>

      {/* Analytics Charts - Responsive Proportions */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
        <Card className="p-6 md:p-10 rounded-5xl border border-border/40 bg-surface space-y-8 md:space-y-10 shadow-sm overflow-hidden">
           <div className="flex items-center justify-between">
              <div className="min-w-0">
                <h3 className="text-xl md:text-2xl font-bold tracking-tighter text-foreground truncate">Revenue Flow</h3>
                <p className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 mt-1">Earnings Performance</p>
              </div>
              <div className="h-10 w-10 md:h-12 md:w-12 bg-muted border border-border/40 rounded-2xl flex items-center justify-center text-muted-foreground shrink-0">
                <BarChart3 className="w-5 h-5 md:w-6 md:h-6" />
              </div>
           </div>
           <div className="h-[280px] md:h-[320px] w-full">
             <AnalyticsCharts 
              title="" 
              type="area" 
              color="#2563eb"
              data={analytics.revenueData}
            />
           </div>
        </Card>

        <Card className="p-6 md:p-10 rounded-5xl border border-border/40 bg-surface space-y-8 md:space-y-10 shadow-sm overflow-hidden">
           <div className="flex items-center justify-between">
              <div className="min-w-0">
                <h3 className="text-xl md:text-2xl font-bold tracking-tighter text-foreground truncate">Enrollment Growth</h3>
                <p className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 mt-1">Acquisition Trends</p>
              </div>
              <div className="h-10 w-10 md:h-12 md:w-12 bg-muted border border-border/40 rounded-2xl flex items-center justify-center text-muted-foreground shrink-0">
                <Target className="w-5 h-5 md:w-6 md:h-6" />
              </div>
           </div>
           <div className="h-[280px] md:h-[320px] w-full">
             <AnalyticsCharts 
              title="" 
              type="bar" 
              color="#10b981"
              data={analytics.enrollmentData}
            />
           </div>
        </Card>
      </section>

      {/* Operational Hub: Enrollments & Status */}
      <div className="flex flex-col lg:grid lg:grid-cols-12 gap-10 md:gap-12">
        <div className="lg:col-span-8 space-y-6 md:space-y-8">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-lg md:text-xl font-bold tracking-tighter text-foreground">Recent Activity</h2>
            <Link href="/creator/courses" className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-blue-600 hover:underline decoration-2 underline-offset-4">Manage catalog</Link>
          </div>
          
          <div className="grid gap-4">
            {recentEnrollments.length === 0 ? (
              <div className="py-20 md:py-28 text-center border-2 border-dashed border-border/40 rounded-6xl bg-muted/5">
                <Users className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-4 md:mb-6 text-muted-foreground/20" />
                <p className="text-[10px] md:text-[11px] font-bold text-muted-foreground/40 uppercase tracking-[0.4em]">Zero Activity Identified</p>
              </div>
            ) : (
              recentEnrollments.map((enr, i) => (
                <motion.div
                  key={enr.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card className="p-4 md:p-6 rounded-4xl border border-border/40 bg-surface flex items-center justify-between hover:border-blue-500/40 transition-all group shadow-sm">
                    <div className="flex items-center gap-4 md:gap-6 min-w-0">
                      <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-blue-600/10 border border-blue-600/20 flex items-center justify-center text-blue-600 font-bold text-base md:text-lg shrink-0">
                        {enr.studentName.charAt(0)}
                      </div>
                      <div className="space-y-0.5 md:space-y-1 min-w-0">
                        <p className="text-sm md:text-base font-bold text-foreground leading-tight truncate">{enr.studentName}</p>
                        <p className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 truncate max-w-[200px] sm:max-w-none">
                          Joined <span className="text-foreground">{enr.courseTitle}</span>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 md:gap-8 shrink-0">
                      <div className="text-right hidden sm:block space-y-0.5">
                        <p className="text-sm font-bold text-foreground">{formatCurrency(enr.price || 0)}</p>
                        <p className="text-[9px] font-bold text-muted-foreground/40 uppercase tracking-widest">Today</p>
                      </div>
                      <ChevronRight className="w-4 h-4 md:w-5 md:h-5 text-muted-foreground/40 group-hover:text-blue-600 transition-colors" />
                    </div>
                  </Card>
                </motion.div>
              ))
            )}
          </div>
        </div>

        {/* Right Sidebar: Hardened Operational Status */}
        <div className="lg:col-span-4 space-y-10 md:space-y-12">
           <section className="space-y-6 md:space-y-8 px-2">
              <h2 className="text-lg md:text-xl font-bold tracking-tighter text-foreground">Operational Node</h2>
              <Card className="p-8 md:p-10 rounded-5xl bg-zinc-950 text-white border border-white/10 relative overflow-hidden shadow-2xl">
                 <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(37,99,235,0.1),transparent_70%)]" />
                 
                 <div className="space-y-8 md:space-y-10 relative z-10">
                    <div className="space-y-3">
                       <Badge className="bg-blue-600/20 text-blue-600 border-blue-600/40 rounded-xl text-[8px] md:text-[9px] font-bold tracking-widest uppercase px-2 py-0.5">Node Status</Badge>
                       <p className="text-xl md:text-2xl font-bold text-white leading-tight tracking-tight">"Architecting scalable learning experiences."</p>
                    </div>

                    <div className="space-y-4">
                       <div className="flex items-center justify-between text-[9px] font-bold uppercase tracking-widest text-zinc-500">
                         <span>Platform Velocity</span>
                         <span>92%</span>
                       </div>
                       <div className="h-1 md:h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: "92%" }}
                            transition={{ duration: 2 }}
                            className="h-full bg-blue-600 shadow-[0_0_20px_rgba(37,99,235,0.6)]" 
                          />
                       </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 md:gap-4">
                       <div className="p-3 md:p-4 rounded-2xl bg-white/5 border border-white/5 text-center space-y-0.5">
                          <p className="text-[8px] md:text-[9px] font-bold uppercase tracking-widest text-zinc-600 leading-none mb-1">Uptime</p>
                          <p className="text-base md:text-lg font-bold text-white leading-none">99.9%</p>
                       </div>
                       <div className="p-3 md:p-4 rounded-2xl bg-white/5 border border-white/5 text-center space-y-0.5">
                          <p className="text-[8px] md:text-[9px] font-bold uppercase tracking-widest text-zinc-600 leading-none mb-1">Latency</p>
                          <p className="text-base md:text-lg font-bold text-white leading-none">24ms</p>
                       </div>
                    </div>
                 </div>
              </Card>
           </section>

           <section className="space-y-6 md:space-y-8 px-2">
              <h2 className="text-lg md:text-xl font-bold tracking-tighter text-foreground">Platform Feedback</h2>
              <div className="space-y-4">
                 {[
                   { user: "Sarah L.", rating: 5, text: "The best React masterclass.", time: "2h ago" },
                   { user: "Mike D.", rating: 4, text: "Excellent depth.", time: "5h ago" }
                 ].map((review, i) => (
                   <div key={i} className="flex gap-4 group">
                      <div className="h-10 w-10 md:h-12 md:w-12 rounded-2xl bg-surface border border-border/40 flex items-center justify-center shrink-0 font-bold text-[10px] md:text-xs group-hover:bg-blue-600/10 transition-all shadow-sm">
                         {review.user.charAt(0)}
                      </div>
                      <div className="space-y-0.5 md:space-y-1 min-w-0">
                         <div className="flex items-center gap-2">
                            <p className="text-sm font-bold text-foreground">{review.user}</p>
                            <div className="flex items-center gap-0.5 shrink-0">
                               {[...Array(review.rating)].map((_, i) => <Zap key={i} className="w-2 md:w-2.5 h-2 md:h-2.5 fill-amber-500 text-amber-500" />)}
                            </div>
                         </div>
                         <p className="text-[11px] md:text-xs text-muted-foreground leading-snug line-clamp-1 italic">"{review.text}"</p>
                         <p className="text-[8px] md:text-[9px] font-bold uppercase tracking-widest text-muted-foreground/30">{review.time}</p>
                      </div>
                   </div>
                 ))}
              </div>
              <Button variant="ghost" className="w-full h-11 md:h-12 rounded-xl text-[9px] md:text-[10px] font-bold uppercase tracking-widest border border-border/40 hover:bg-muted/30">
                 View All Feedback
              </Button>
           </section>
        </div>
      </div>
    </div>

  );
}
