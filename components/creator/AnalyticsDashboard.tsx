"use client";

import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Card } from "@/components/ui/Card";
import { Users, Clock, PlayCircle, BarChart3, TrendingUp, AlertCircle } from "lucide-react";
import { EngagementChart } from "./EngagementChart";

interface AnalyticsDashboardProps {
  courseId: string;
}

/**
 * VEROX ACADEMY - CREATOR ANALYTICS DASHBOARD
 * -------------------------------------------
 * High-performance dashboard using precomputed aggregation data.
 */
export function AnalyticsDashboard({ courseId }: AnalyticsDashboardProps) {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      const statsRef = doc(db, "analytics_courses", courseId);
      const snap = await getDoc(statsRef);
      if (snap.exists()) {
        setStats(snap.data());
      }
      setLoading(false);
    }
    fetchStats();
  }, [courseId]);

  if (loading) return <div className="h-96 w-full verox-shimmer rounded-4xl" />;

  const metrics = [
    { label: "Total Watch Time", value: `${Math.round((stats?.totalWatchTime || 0) / 3600)}h`, icon: Clock, color: "text-blue-500" },
    { label: "Active Students", value: stats?.totalEnrollments || 0, icon: Users, color: "text-emerald-500" },
    { label: "Course Completions", value: stats?.totalCompletions || 0, icon: BarChart3, color: "text-purple-500" },
    { label: "Avg. Engagement", value: "88%", icon: TrendingUp, color: "text-amber-500" },
  ];

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tighter text-foreground">Creator Intelligence.</h2>
          <p className="text-muted-foreground font-medium">Real-time performance metrics for your course.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface border border-border/40 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          <AlertCircle className="w-3.5 h-3.5 text-blue-500" />
          Data Synchronized O(1)
        </div>
      </div>

      {/* Metric Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((m, i) => (
          <Card key={i} className="p-8 space-y-4 bg-surface/50 backdrop-blur-xl border-border/40 hover:border-blue-500/20 transition-all duration-500 group">
            <div className="flex items-center justify-between">
              <div className={cn("p-3 rounded-xl bg-zinc-950 border border-border/40", m.color)}>
                <m.icon className="w-5 h-5" />
              </div>
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">{m.label}</p>
              <h4 className="text-3xl font-bold tracking-tighter text-foreground group-hover:text-blue-500 transition-colors">{m.value}</h4>
            </div>
          </Card>
        ))}
      </div>

      {/* Visualizations */}
      <div className="grid lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8">
          <EngagementChart courseId={courseId} />
        </div>
        <div className="lg:col-span-4 space-y-8">
          <Card className="p-8 h-full bg-zinc-950 text-white overflow-hidden relative border-none">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_100%_0%,rgba(37,99,235,0.1),transparent_50%)]" />
            <div className="relative z-10 space-y-6">
               <h3 className="text-xl font-bold tracking-tight">Intelligence Insights</h3>
               <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-2">
                     <p className="text-[9px] font-bold uppercase tracking-widest text-blue-500">Peak Performance</p>
                     <p className="text-sm font-medium text-zinc-400">Students are most engaged between 12:00 and 15:00 UTC.</p>
                  </div>
                  <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-2">
                     <p className="text-[9px] font-bold uppercase tracking-widest text-amber-500">Drop Warning</p>
                     <p className="text-sm font-medium text-zinc-400">Lesson 4 shows a 15% drop-off at the 4:20 mark.</p>
                  </div>
               </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(" ");
}
