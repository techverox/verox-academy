"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { getCreatorAnalytics, subscribeToCreatorStats } from "@/lib/firestore";
import { CreatorStats } from "@/types/firestore";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownRight,
  Calendar,
  Filter,
  Download,
  Activity,
  Zap,
  Target,
  MousePointer2,
  PieChart as PieChartIcon,
  Sparkles
} from "lucide-react";
import AnalyticsCharts from "@/components/creator/AnalyticsCharts";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export default function CreatorAnalyticsPage() {
  const { user, isCreator, isAdmin } = useAuth();
  const [stats, setStats] = useState<CreatorStats | null>(null);
  const [analytics, setAnalytics] = useState<{revenueData: any[], enrollmentData: any[]}>({
    revenueData: [],
    enrollmentData: []
  });
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("14d");

  useEffect(() => {
    if (!user || (!isCreator && !isAdmin)) return;

    setLoading(true);

    const unsubStats = subscribeToCreatorStats(user.uid, (data) => {
      setStats(data);
    });

    const fetchAnalytics = async () => {
      const data = await getCreatorAnalytics(user.uid);
      setAnalytics(data);
      setLoading(false);
    };
    fetchAnalytics();

    return () => unsubStats();
  }, [user, isCreator, isAdmin]);

  if (loading) {
    return (
      <div className="space-y-12 animate-pulse pb-20">
        <div className="h-10 w-64 bg-muted rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <div key={i} className="h-32 bg-muted rounded-4xl" />)}
        </div>
        <div className="h-[400px] bg-muted rounded-5xl" />
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

  const insights = [
    { label: "Conversion Rate", value: "3.2%", icon: Target, trend: "+0.4%", isPositive: true },
    { label: "Avg. Watch Time", value: "18m", icon: Activity, trend: "+2m", isPositive: true },
    { label: "Click Through Rate", value: "12.5%", icon: MousePointer2, trend: "-1.2%", isPositive: false },
  ];

  return (
    <div className="space-y-12 md:space-y-16 pb-32">
      {/* Analytics Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.4em] text-blue-600">
            <TrendingUp className="w-3.5 h-3.5" />
            Performance Intelligence
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter text-foreground leading-none">
            Growth <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-cyan-500">Insights.</span>
          </h1>
          <p className="text-base text-muted-foreground font-medium max-w-xl leading-relaxed">
            Deep-dive into your studio performance metrics and student engagement velocity.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
           <div className="flex bg-muted/20 p-1 rounded-2xl border border-border/40">
              {["7d", "14d", "30d", "90d"].map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={cn(
                    "px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all",
                    timeRange === range ? "bg-surface text-blue-600 shadow-sm" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {range}
                </button>
              ))}
           </div>
           <Button variant="secondary" className="h-12 w-12 p-0 rounded-2xl border-border/40 shadow-sm">
              <Download className="w-4 h-4" />
           </Button>
        </div>
      </div>

      {/* High-Level Intelligence Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {insights.map((insight, i) => (
          <motion.div
            key={insight.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="p-8 rounded-4xl border border-border/40 bg-surface space-y-6 group hover:border-blue-500/40 transition-all duration-500 shadow-sm">
               <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-muted/40 flex items-center justify-center text-muted-foreground group-hover:bg-blue-600/10 group-hover:text-blue-600 transition-all">
                     <insight.icon className="w-5 h-5" />
                  </div>
                  <div className={cn(
                    "flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-widest",
                    insight.isPositive ? "bg-emerald-500/10 text-emerald-500" : "bg-destructive/10 text-destructive"
                  )}>
                    {insight.isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {insight.trend}
                  </div>
               </div>
               <div className="space-y-1">
                  <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">{insight.label}</p>
                  <h3 className="text-4xl font-bold tracking-tighter text-foreground">{insight.value}</h3>
               </div>
            </Card>
          </motion.div>
        ))}
      </section>

      {/* Main Charts Section */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <Card className="lg:col-span-8 p-8 md:p-12 rounded-5xl border border-border/40 bg-surface space-y-10 shadow-sm">
           <div className="flex items-center justify-between">
              <div className="space-y-1">
                 <h3 className="text-2xl font-bold tracking-tighter">Revenue Momentum</h3>
                 <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Earnings velocity over selected period</p>
              </div>
              <div className="text-right">
                 <p className="text-3xl font-bold tracking-tighter text-blue-600">{formatCurrency(stats?.totalRevenue || 0)}</p>
                 <p className="text-[9px] font-bold uppercase tracking-widest text-emerald-500">Peak Performance</p>
              </div>
           </div>
           <div className="h-[400px] w-full">
              <AnalyticsCharts 
                title="" 
                type="area" 
                color="#2563eb"
                data={analytics.revenueData}
              />
           </div>
        </Card>

        <div className="lg:col-span-4 space-y-8">
           <Card className="p-8 rounded-4xl bg-zinc-950 text-white border border-white/10 shadow-2xl relative overflow-hidden h-full flex flex-col justify-between">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(37,99,235,0.15),transparent_70%)]" />
              <div className="relative z-10 space-y-8">
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                       <Sparkles className="w-5 h-5 text-blue-400" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-blue-400">Smart Forecast</span>
                 </div>
                 <div className="space-y-4">
                    <h4 className="text-2xl font-bold tracking-tighter leading-tight">Projected Growth: <span className="text-blue-400">+24%</span></h4>
                    <p className="text-sm text-zinc-400 font-medium leading-relaxed">Based on current enrollment velocity and course engagement, we project a significant uptick in revenue by Q3.</p>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                       <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 mb-1">Target Revenue</p>
                       <p className="text-lg font-bold">₹5.0L</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                       <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 mb-1">Target Students</p>
                       <p className="text-lg font-bold">2.5K</p>
                    </div>
                 </div>
              </div>
              <Button className="relative z-10 w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold uppercase tracking-widest text-[10px] border-none mt-8">
                 Upgrade Analytics
              </Button>
           </Card>
        </div>
      </section>

      {/* Engagement Distribution */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <Card className="lg:col-span-1 p-8 rounded-4xl border border-border/40 bg-surface space-y-8">
            <div className="flex items-center justify-between">
               <h3 className="text-lg font-bold tracking-tight">Student Retention</h3>
               <PieChartIcon className="w-4 h-4 text-muted-foreground/40" />
            </div>
            <div className="flex items-center justify-center py-8">
               <div className="relative h-48 w-48 rounded-full border-16 border-blue-600/10 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border-16 border-blue-600 border-t-transparent border-r-transparent -rotate-45" />
                  <div className="text-center">
                     <p className="text-3xl font-bold tracking-tighter">78%</p>
                     <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/60">Success Rate</p>
                  </div>
               </div>
            </div>
            <div className="space-y-4">
               <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest">
                  <span className="text-muted-foreground">Active Learners</span>
                  <span>1.2K</span>
               </div>
               <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                  <div className="h-full w-[78%] bg-blue-600 rounded-full" />
               </div>
            </div>
         </Card>

         <Card className="lg:col-span-2 p-8 rounded-4xl border border-border/40 bg-surface space-y-8 overflow-hidden">
            <div className="flex items-center justify-between">
               <div className="space-y-1">
                  <h3 className="text-lg font-bold tracking-tight">Enrollment Velocity</h3>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">New students per cycle</p>
               </div>
               <Badge className="bg-emerald-500/10 text-emerald-500 border-none px-3 py-1 rounded-lg text-[9px] font-bold tracking-widest uppercase">Healthy Velocity</Badge>
            </div>
            <div className="h-[300px] w-full">
               <AnalyticsCharts 
                title="" 
                type="bar" 
                color="#10b981"
                data={analytics.enrollmentData}
              />
            </div>
         </Card>
      </section>
    </div>
  );
}
