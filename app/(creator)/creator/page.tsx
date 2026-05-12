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
  Layout,
  Plus,
  Zap,
  Sparkles,
  BarChart3,
  PieChart,
  Target,
  ArrowRight
} from "lucide-react";
import AnalyticsCharts from "@/components/creator/AnalyticsCharts";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

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
  }, [user]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto space-y-12 animate-pulse">
        <div className="h-12 w-64 bg-secondary/50 rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-40 bg-secondary/30 border border-border rounded-xl" />
          ))}
        </div>
        <div className="h-[400px] bg-secondary/20 border border-border rounded-xl" />
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
    { 
      label: "Total Revenue", 
      value: formatCurrency(stats?.totalRevenue || 0), 
      icon: DollarSign, 
      trend: "+12.5%",
      isPositive: true,
      sub: "Total earnings to date"
    },
    { 
      label: "Total Students", 
      value: stats?.totalEnrollments || 0, 
      icon: Users, 
      trend: "+8.2%",
      isPositive: true,
      sub: "Active student network"
    },
    { 
      label: "Courses Published", 
      value: stats?.totalCourses || 0, 
      icon: BookOpen, 
      trend: "0%",
      isPositive: true,
      sub: "Active curriculum assets"
    },
    { 
      label: "Watch Time", 
      value: stats?.watchHours || 0, 
      icon: Zap, 
      trend: "-2.4%",
      isPositive: false,
      sub: "Total minutes consumed"
    },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="px-2.5 py-1 rounded-md bg-primary/5 border border-primary/10 text-[10px] font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
              <Sparkles className="w-3 h-3" />
              Creator Studio
            </div>
            <div className="px-2.5 py-1 rounded-md bg-secondary border border-border text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Clock className="w-3 h-3" />
              Active Session
            </div>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Dashboard
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Welcome back, <span className="text-foreground font-semibold">{(profile?.name || user?.displayName || "Creator").split(" ")[0]}</span>. Here's how your courses are performing.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
           <button 
             onClick={() => router.push("/creator/courses/add")}
             className="h-10 px-6 rounded-lg bg-primary text-xs font-bold text-primary-foreground transition-all hover:bg-primary/90 flex items-center gap-2 shadow-sm"
           >
             <Plus className="w-4 h-4" />
             Create Course
           </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {statCards.map((card) => (
          <div key={card.label} className="surface-elevated p-6 rounded-xl relative overflow-hidden">
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground transition-all">
                <card.icon className="w-5 h-5" />
              </div>
              <div className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-md ${card.isPositive ? 'bg-success/10 text-success border border-success/10' : 'bg-destructive/10 text-destructive border border-destructive/10'}`}>
                {card.isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {card.trend}
              </div>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">{card.label}</p>
              <h3 className="text-2xl font-bold text-foreground tracking-tight">{card.value}</h3>
              <p className="mt-2 text-[10px] text-muted-foreground/80">{card.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="surface-elevated rounded-xl p-6 lg:p-8">
           <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold tracking-tight text-foreground">Revenue Trend</h3>
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mt-0.5">Earnings performance</p>
              </div>
              <div className="p-2 bg-secondary rounded-lg text-muted-foreground">
                <BarChart3 className="w-4 h-4" />
              </div>
           </div>
           <AnalyticsCharts 
            title="" 
            type="area" 
            color="var(--primary)"
            data={analytics.revenueData}
          />
        </div>
        <div className="surface-elevated rounded-xl p-6 lg:p-8">
           <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold tracking-tight text-foreground">Enrollment Growth</h3>
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mt-0.5">Student acquisition</p>
              </div>
              <div className="p-2 bg-secondary rounded-lg text-muted-foreground">
                <Target className="w-4 h-4" />
              </div>
           </div>
           <AnalyticsCharts 
            title="" 
            type="bar" 
            color="var(--success)"
            data={analytics.enrollmentData}
          />
        </div>
      </div>

      {/* Activity & Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xl font-bold tracking-tight text-foreground">Recent Enrollments</h2>
            <button className="text-xs font-bold text-primary hover:text-primary-hover transition-colors flex items-center gap-1">
              View All
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          
          <div className="surface-elevated rounded-xl p-2 space-y-1">
            {recentEnrollments.length === 0 ? (
              <div className="p-16 text-center">
                <Layout className="w-10 h-10 mx-auto mb-4 text-muted-foreground opacity-20" />
                <p className="text-xs font-medium text-muted-foreground">No recent enrollments found.</p>
              </div>
            ) : (
              recentEnrollments.map((enr) => (
                <div key={enr.id} className="p-4 flex items-center justify-between hover:bg-secondary/30 transition-all rounded-lg group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center text-foreground font-bold text-sm">
                      {enr.studentName.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground">{enr.studentName}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        Enrolled in <span className="text-foreground/80 font-medium">{enr.courseTitle}</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right hidden sm:block">
                      <p className="text-[10px] font-medium text-muted-foreground">
                        {enr.enrolledAt ? new Date(enr.enrolledAt.seconds * 1000).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold tracking-tight text-foreground px-1">Quick Actions</h2>
          <div className="grid grid-cols-1 gap-4">
            <button 
              className="flex items-center gap-4 p-6 surface-elevated rounded-xl hover:border-border/80 group transition-all"
              onClick={() => router.push("/creator/courses/add")}
            >
              <div className="w-12 h-12 rounded-lg bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all shadow-sm">
                <Plus className="w-6 h-6" />
              </div>
              <div>
                <p className="font-bold text-foreground text-lg">Create Course</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">New Curriculum</p>
              </div>
            </button>
            
            <button 
              className="flex items-center gap-4 p-6 surface-elevated rounded-xl hover:border-border/80 group transition-all"
              onClick={() => router.push("/creator/payouts")}
            >
              <div className="w-12 h-12 rounded-lg bg-success/5 flex items-center justify-center text-success group-hover:bg-success group-hover:text-success-foreground transition-all shadow-sm">
                <DollarSign className="w-6 h-6" />
              </div>
              <div>
                <p className="font-bold text-foreground text-lg">Manage Payouts</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">Withdraw earnings</p>
              </div>
            </button>

            <div className="bg-secondary/20 border border-border p-6 rounded-xl">
               <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-3">Status Overview</p>
               <p className="text-sm font-medium text-foreground leading-relaxed italic mb-6">"Build educational experiences that transform lives."</p>
               <div className="flex items-center gap-3">
                  <div className="h-1.5 grow bg-secondary rounded-full overflow-hidden">
                     <div className="h-full w-[85%] bg-primary" />
                  </div>
                  <span className="text-[10px] shrink-0 font-bold text-primary">85% ACTIVE</span>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

