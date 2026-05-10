"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { getCreatorStats, getCreatorRecentEnrollments } from "@/lib/firestore";
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
  Plus
} from "lucide-react";
import AnalyticsCharts from "@/components/creator/AnalyticsCharts";
import { useRouter } from "next/navigation";

export default function CreatorDashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<CreatorStats | null>(null);
  const [recentEnrollments, setRecentEnrollments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      const fetchData = async () => {
        const [statsData, enrollmentsData] = await Promise.all([
          getCreatorStats(user.uid),
          getCreatorRecentEnrollments(user.uid)
        ]);
        setStats(statsData);
        setRecentEnrollments(enrollmentsData);
        setLoading(false);
      };
      fetchData();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 bg-zinc-900/50 border border-zinc-800 rounded-3xl animate-pulse" />
        ))}
      </div>
    );
  }

  const formatCurrency = (paise: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(paise / 100);
  };

  const statCards = [
    { 
      label: "Total Revenue", 
      value: formatCurrency(stats?.totalRevenue || 0), 
      icon: DollarSign, 
      color: "text-emerald-500", 
      bg: "bg-emerald-500/10",
      trend: "+12.5%",
      isPositive: true
    },
    { 
      label: "Enrollments", 
      value: stats?.totalEnrollments || 0, 
      icon: Users, 
      color: "text-blue-500", 
      bg: "bg-blue-500/10",
      trend: "+8.2%",
      isPositive: true
    },
    { 
      label: "Active Courses", 
      value: stats?.totalCourses || 0, 
      icon: BookOpen, 
      color: "text-primary", 
      bg: "bg-primary/10",
      trend: "0%",
      isPositive: true
    },
    { 
      label: "Watch Hours", 
      value: stats?.watchHours || 0, 
      icon: Clock, 
      color: "text-orange-500", 
      bg: "bg-orange-500/10",
      trend: "-2.4%",
      isPositive: false
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight mb-2">
            Welcome back, <span className="text-primary">{user?.displayName?.split(" ")[0]}</span>.
          </h1>
          <p className="text-zinc-500 font-medium tracking-tight">Here's what's happening with your courses today.</p>
        </div>
        <div className="flex items-center gap-3 text-sm font-black uppercase tracking-widest text-zinc-500 bg-zinc-900/50 border border-zinc-800 px-4 py-2 rounded-xl">
          <Clock className="w-4 h-4" />
          Last Updated: Just Now
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card) => (
          <div key={card.label} className="group p-6 bg-zinc-900/50 border border-zinc-800 rounded-[2rem] hover:border-zinc-700 transition-all hover:scale-[1.02]">
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-2xl ${card.bg} ${card.color}`}>
                <card.icon className="w-6 h-6" />
              </div>
              <div className={`flex items-center gap-1 text-[10px] font-black px-2 py-1 rounded-full ${card.isPositive ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                {card.isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {card.trend}
              </div>
            </div>
            <p className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-1">{card.label}</p>
            <h3 className="text-2xl font-black tracking-tight">{card.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <AnalyticsCharts 
          title="Revenue Growth" 
          type="area" 
          color="#10B981"
          data={[
            { name: "Jan", value: 12000 },
            { name: "Feb", value: 15000 },
            { name: "Mar", value: 28000 },
            { name: "Apr", value: 22000 },
            { name: "May", value: 35000 },
            { name: "Jun", value: 45000 },
          ]}
        />
        <AnalyticsCharts 
          title="New Enrollments" 
          type="bar" 
          color="#7C3AED"
          data={[
            { name: "Mon", value: 12 },
            { name: "Tue", value: 18 },
            { name: "Wed", value: 15 },
            { name: "Thu", value: 25 },
            { name: "Fri", value: 32 },
            { name: "Sat", value: 28 },
            { name: "Sun", value: 20 },
          ]}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black tracking-tight">Recent Enrollments</h2>
            <button className="text-xs font-black uppercase tracking-widest text-primary hover:underline">View All</button>
          </div>
          
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-[2rem] overflow-hidden">
            {recentEnrollments.length === 0 ? (
              <div className="p-12 text-center text-zinc-500 font-medium">
                <Layout className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p>No enrollments yet. Start promoting your courses!</p>
              </div>
            ) : (
              <div className="divide-y divide-zinc-800">
                {recentEnrollments.map((enr) => (
                  <div key={enr.id} className="p-6 flex items-center justify-between hover:bg-zinc-800/30 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-400">
                        <Users className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="font-bold text-zinc-200">{enr.studentName}</p>
                        <p className="text-xs text-zinc-500 font-medium tracking-tight">Enrolled in: <span className="text-zinc-300">{enr.courseTitle}</span></p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-1">
                        {enr.enrolledAt ? new Date(enr.enrolledAt.seconds * 1000).toLocaleDateString() : 'N/A'}
                      </p>
                      <button className="p-1 text-zinc-600 hover:text-white transition-colors">
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          <h2 className="text-2xl font-black tracking-tight">Quick Actions</h2>
          <div className="grid grid-cols-1 gap-4">
            <button 
              className="flex items-center gap-4 p-6 bg-zinc-900/50 border border-zinc-800 rounded-[2rem] hover:bg-zinc-800/50 hover:border-primary/50 transition-all group text-left"
              onClick={() => router.push("/creator/courses/add")}
            >
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                <Plus className="w-6 h-6" />
              </div>
              <div>
                <p className="font-black tracking-tight group-hover:text-primary transition-colors">Create Course</p>
                <p className="text-xs text-zinc-500 font-medium">Build a new learning experience</p>
              </div>
            </button>
            <button className="flex items-center gap-4 p-6 bg-zinc-900/50 border border-zinc-800 rounded-[2rem] hover:bg-zinc-800/50 hover:border-emerald-500/50 transition-all group text-left">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform">
                <DollarSign className="w-6 h-6" />
              </div>
              <div>
                <p className="font-black tracking-tight group-hover:text-emerald-500 transition-colors">Request Payout</p>
                <p className="text-xs text-zinc-500 font-medium">Withdraw your earnings</p>
              </div>
            </button>
            <button className="flex items-center gap-4 p-6 bg-zinc-900/50 border border-zinc-800 rounded-[2rem] hover:bg-zinc-800/50 hover:border-blue-500/50 transition-all group text-left">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <p className="font-black tracking-tight group-hover:text-blue-500 transition-colors">Analytics</p>
                <p className="text-xs text-zinc-500 font-medium">Deep dive into your performance</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

