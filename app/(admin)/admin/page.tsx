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
  Search,
  Filter,
  ShieldCheck,
  Zap,
  Clock,
  ChevronRight,
  TrendingUp,
  CreditCard,
  UserPlus
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

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
  { name: 'Mon', revenue: 45000, enrollments: 12 },
  { name: 'Tue', revenue: 52000, enrollments: 15 },
  { name: 'Wed', revenue: 48000, enrollments: 10 },
  { name: 'Thu', revenue: 61000, enrollments: 22 },
  { name: 'Fri', revenue: 55000, enrollments: 18 },
  { name: 'Sat', revenue: 67000, enrollments: 25 },
  { name: 'Sun', revenue: 72000, enrollments: 30 },
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
      <div className="max-w-7xl mx-auto space-y-12 animate-pulse">
        <div className="h-10 w-64 bg-secondary/50 rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-40 bg-secondary/30 border border-border rounded-xl" />
          ))}
        </div>
        <div className="h-[500px] bg-secondary/20 border border-border rounded-xl" />
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
    { label: "Gross Revenue", value: formatCurrency(stats?.totalRevenue || 0), icon: DollarSign, trend: "+12.5%", isPositive: true, sub: "Total platform earnings" },
    { label: "Active Learners", value: stats?.totalUsers || 0, icon: Users, trend: "+8.2%", isPositive: true, sub: "Verified platform members" },
    { label: "Course Inventory", value: stats?.totalCourses || 0, icon: BookOpen, trend: "+2.4%", isPositive: true, sub: "Published masterclasses" },
    { label: "Market Growth", value: stats?.totalEnrollments || 0, icon: TrendingUp, trend: "+14.1%", isPositive: true, sub: "Total successful conversions" },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="px-2.5 py-1 rounded-md bg-primary/5 border border-primary/10 text-[10px] font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
              <ShieldCheck className="w-3 h-3" />
              Admin Panel
            </div>
            <div className="px-2.5 py-1 rounded-md bg-success/5 border border-success/10 text-[10px] font-bold uppercase tracking-wider text-success flex items-center gap-1.5">
              <Zap className="w-3 h-3" />
              System Live
            </div>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Overview of your platform's performance and recent activities.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={handleSyncData}
            disabled={syncing}
            className="btn-secondary-premium h-10 px-4 text-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? "Syncing..." : "Sync Stats"}
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {statCards.map((card, i) => (
          <div 
            key={i} 
            className="surface-elevated p-6 rounded-xl relative overflow-hidden"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground">
                <card.icon className="w-5 h-5" />
              </div>
              <div className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-md ${card.isPositive ? 'bg-success/10 text-success border border-success/10' : 'bg-destructive/10 text-destructive border border-destructive/10'}`}>
                {card.isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {card.trend}
              </div>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">{card.label}</p>
              <h3 className="text-2xl font-bold text-foreground tracking-tight">
                {card.value}
              </h3>
              <p className="mt-2 text-[10px] text-muted-foreground/80">{card.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Analytics & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 surface-elevated rounded-xl p-6 lg:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-foreground">Revenue Overview</h2>
              <p className="text-xs text-muted-foreground mt-1">Daily revenue and enrollment performance.</p>
            </div>
            <div className="flex items-center gap-1 bg-secondary/50 p-1 rounded-lg border border-border">
              <button className="px-4 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-primary text-primary-foreground shadow-sm">7D</button>
              <button className="px-4 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground">30D</button>
            </div>
          </div>
          
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockChartData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.3} />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: 'var(--muted-foreground)', fontSize: 10, fontWeight: 500}} 
                  dy={10}
                />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'var(--card)',
                    borderColor: 'var(--border)',
                    borderRadius: '0.5rem',
                    fontSize: '11px',
                  }}
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
          
          <div className="grid grid-cols-3 gap-6 pt-6 border-t border-border">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Total Yield</p>
              <p className="text-lg font-bold text-foreground">₹4,25,000</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Conv. Rate</p>
              <p className="text-lg font-bold text-foreground">18.4%</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Churn Risk</p>
              <p className="text-lg font-bold text-success">Low</p>
            </div>
          </div>
        </div>

        {/* Activity Feed */}
        <div className="space-y-6">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xl font-bold tracking-tight text-foreground">Recent Activity</h2>
            <button className="p-2 bg-secondary/50 border border-border rounded-lg text-muted-foreground hover:text-primary transition-all">
              <Filter className="w-3.5 h-3.5" />
            </button>
          </div>
          
          <div className="surface-elevated rounded-xl p-4 space-y-3">
            {recentActivity.length === 0 ? (
              <div className="py-20 text-center">
                <Activity className="w-8 h-8 mx-auto mb-4 text-muted-foreground opacity-20" />
                <p className="text-xs font-medium text-muted-foreground">No recent activity found.</p>
              </div>
            ) : (
              recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/20 border border-transparent hover:border-border/50 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-background border border-border flex items-center justify-center font-bold text-primary text-xs">
                      {activity.userName.charAt(0)}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-foreground">{activity.userName}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5 truncate max-w-[150px]">
                        Joined <span className="text-foreground/80">{activity.courseTitle}</span>
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                </div>
              ))
            )}
            <button className="w-full py-2.5 border border-border text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:bg-secondary transition-all rounded-lg mt-2">
              View All Activity
            </button>
          </div>

          <div className="bg-primary p-6 rounded-xl text-primary-foreground relative overflow-hidden group cursor-pointer shadow-sm">
            <div className="relative z-10">
              <p className="text-[10px] font-bold uppercase tracking-wider opacity-60 mb-2">Advanced Tools</p>
              <h3 className="text-lg font-bold tracking-tight mb-4">Export Performance <br />Report</h3>
              <button className="h-9 px-4 bg-white text-black text-xs font-bold rounded-lg hover:bg-white/90 transition-all">
                Download PDF
              </button>
            </div>
            <div className="absolute inset-0 bg-primary/5 mask-[radial-gradient(ellipse_at_center,white,transparent)] dark:opacity-20 opacity-5"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
