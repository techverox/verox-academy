"use client";

import { useEffect, useState } from "react";
import { subscribeToAdminStats, subscribeToRecentEnrollments } from "@/lib/admin";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import {
  Users,
  BookOpen,
  DollarSign,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Filter,
  ShieldCheck,
  ChevronRight,
  TrendingUp,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface AdminStatsData {
  totalCourses: number;
  totalEnrollments: number;
  totalLessons: number;
  totalUsers: number;
  totalRevenue?: number;
}

interface RecentActivity {
  id: string;
  userName: string;
  courseTitle: string;
  enrolledAt: { seconds: number } | null;
}

const mockChartData = [
  { name: "Mon", revenue: 45000, enrollments: 12 },
  { name: "Tue", revenue: 52000, enrollments: 15 },
  { name: "Wed", revenue: 48000, enrollments: 10 },
  { name: "Thu", revenue: 61000, enrollments: 22 },
  { name: "Fri", revenue: 55000, enrollments: 18 },
  { name: "Sat", revenue: 67000, enrollments: 25 },
  { name: "Sun", revenue: 72000, enrollments: 30 },
];

export default function AdminDashboard() {
  const { isAdmin, loading: authLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<AdminStatsData | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      router.replace("/dashboard/");
    }
  }, [isAdmin, authLoading, router]);

  useEffect(() => {
    if (!isAdmin || authLoading) return;

    setLoading(true);

    const unsubStats = subscribeToAdminStats((data) => {
      if (data) {
        setStats({
          totalCourses: data.totalCourses || 0,
          totalEnrollments: data.totalEnrollments || 0,
          totalLessons: data.totalLessons || 0,
          totalUsers: data.totalUsers || 0,
          totalRevenue: data.totalRevenue || 0,
        });
      }
      setLoading(false);
    });

    const unsubActivity = subscribeToRecentEnrollments((data) => {
      setRecentActivity(data as RecentActivity[]);
    });

    return () => {
      unsubStats();
      unsubActivity();
    };
  }, [isAdmin, authLoading]);

  const handleSyncData = async () => {
    setSyncing(true);
    try {
      const res = await fetch("/api/admin/stats/sync", { method: "POST" });
      if (res.ok) console.log("Stats synced successfully");
    } catch (err) {
      console.error("Sync error:", err);
    } finally {
      setSyncing(false);
    }
  };

  if (authLoading || (loading && !stats)) {
    return (
      <div className="max-w-7xl mx-auto space-y-8 animate-pulse">
        <div className="h-10 w-56 bg-secondary/50 rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-secondary/30 border border-border rounded-xl" />
          ))}
        </div>
        <div className="h-80 bg-secondary/20 border border-border rounded-xl" />
      </div>
    );
  }

  const formatCurrency = (paise: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(paise / 100);
  };

  const statCards = [
    {
      label: "Total Revenue",
      value: formatCurrency(stats?.totalRevenue || 0),
      icon: DollarSign,
      trend: "+12.5%",
      isPositive: true,
      sub: "All-time platform earnings",
    },
    {
      label: "Total Users",
      value: stats?.totalUsers || 0,
      icon: Users,
      trend: "+8.2%",
      isPositive: true,
      sub: "Registered accounts",
    },
    {
      label: "Published Courses",
      value: stats?.totalCourses || 0,
      icon: BookOpen,
      trend: "+2.4%",
      isPositive: true,
      sub: "Live on the platform",
    },
    {
      label: "Total Enrollments",
      value: stats?.totalEnrollments || 0,
      icon: TrendingUp,
      trend: "+14.1%",
      isPositive: true,
      sub: "Successful course purchases",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="px-2.5 py-1 rounded-md bg-primary/5 border border-primary/10 text-[10px] font-semibold uppercase tracking-wider text-primary flex items-center gap-1.5">
              <ShieldCheck className="w-3 h-3" />
              Admin Panel
            </div>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Platform Overview
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Monitor your platform's performance and recent activity.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSyncData}
            disabled={syncing}
            className="btn-secondary-premium h-10 px-4 text-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncing ? "animate-spin" : ""}`} />
            {syncing ? "Syncing..." : "Sync Data"}
          </button>
          <button
            onClick={() => router.push("/admin/courses/")}
            className="btn-primary-premium h-10 px-5 text-xs"
          >
            Manage Courses
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Metric Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <div key={i} className="surface-elevated p-5 rounded-xl">
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground">
                <card.icon className="w-4.5 h-4.5" />
              </div>
              <div
                className={`flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-md ${
                  card.isPositive
                    ? "bg-success/10 text-success border border-success/15"
                    : "bg-destructive/10 text-destructive border border-destructive/15"
                }`}
              >
                {card.isPositive ? (
                  <ArrowUpRight className="w-3 h-3" />
                ) : (
                  <ArrowDownRight className="w-3 h-3" />
                )}
                {card.trend}
              </div>
            </div>
            <p className="text-xs font-medium text-muted-foreground mb-1">{card.label}</p>
            <h3 className="text-2xl font-bold text-foreground tracking-tight">{card.value}</h3>
            <p className="mt-1.5 text-[10px] text-muted-foreground/80">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Charts & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue chart */}
        <div className="lg:col-span-2 surface-elevated rounded-xl p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold tracking-tight text-foreground">
                Revenue Overview
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Daily revenue for the past 7 days.
              </p>
            </div>
            <div className="flex items-center gap-1 bg-secondary/50 p-1 rounded-lg border border-border">
              <button className="px-3 py-1.5 rounded-md text-[10px] font-semibold uppercase tracking-wider bg-primary text-primary-foreground shadow-sm">
                7D
              </button>
              <button className="px-3 py-1.5 rounded-md text-[10px] font-medium uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors">
                30D
              </button>
            </div>
          </div>

          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockChartData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.12} />
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="var(--border)"
                  opacity={0.5}
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "var(--muted-foreground)", fontSize: 11, fontWeight: 500 }}
                  dy={10}
                />
                <YAxis hide />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    borderColor: "var(--border)",
                    borderRadius: "0.5rem",
                    fontSize: "11px",
                    boxShadow: "var(--shadow-md)",
                  }}
                  formatter={(value) =>
                    typeof value === 'number'
                      ? `₹${(value / 100).toLocaleString("en-IN")}`
                      : value
                  }
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="var(--primary)"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-3 gap-5 pt-5 border-t border-border">
            <div>
              <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground mb-1">
                Weekly Revenue
              </p>
              <p className="text-lg font-bold text-foreground">₹4,25,000</p>
            </div>
            <div>
              <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground mb-1">
                Conversion Rate
              </p>
              <p className="text-lg font-bold text-foreground">18.4%</p>
            </div>
            <div>
              <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground mb-1">
                Retention
              </p>
              <p className="text-lg font-bold text-success">High</p>
            </div>
          </div>
        </div>

        {/* Activity feed */}
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold tracking-tight text-foreground">
              Recent Activity
            </h2>
            <button className="p-2 bg-secondary/50 border border-border rounded-lg text-muted-foreground hover:text-primary transition-all">
              <Filter className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="surface-elevated rounded-xl p-3 space-y-1">
            {recentActivity.length === 0 ? (
              <div className="py-14 text-center">
                <Activity className="w-8 h-8 mx-auto mb-3 text-muted-foreground opacity-20" />
                <p className="text-xs font-medium text-muted-foreground">
                  No recent activity.
                </p>
              </div>
            ) : (
              recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary/30 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-secondary border border-border flex items-center justify-center font-semibold text-primary text-xs">
                      {activity.userName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-foreground">
                        {activity.userName}
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-0.5 truncate max-w-[140px]">
                        Enrolled in{" "}
                        <span className="text-foreground/80">{activity.courseTitle}</span>
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                </div>
              ))
            )}
            <button className="w-full py-2.5 border border-border text-[10px] font-semibold uppercase tracking-wider text-muted-foreground hover:bg-secondary transition-all rounded-lg mt-2">
              View All Activity
            </button>
          </div>

          <div className="bg-primary p-5 rounded-xl text-primary-foreground relative overflow-hidden cursor-pointer hover:opacity-95 transition-opacity">
            <p className="text-[10px] font-semibold uppercase tracking-wider opacity-60 mb-2">
              Reports
            </p>
            <h3 className="text-base font-bold tracking-tight mb-4">
              Export Performance
              <br />
              Report
            </h3>
            <button className="h-8 px-4 bg-white text-black text-xs font-semibold rounded-lg hover:bg-white/90 transition-all">
              Download PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
