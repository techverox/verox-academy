"use client";

import { useEffect, useState } from "react";
import { subscribeToAdminStats, subscribeToRecentEnrollments, getAdminRevenueAnalytics } from "@/lib/admin";
import { useAuth } from "@/hooks/use-auth";
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
  Layout,
  Layers,
  Sparkles,
  Search,
  Database,
  BarChart3,
  Globe,
  Terminal,
  ActivitySquare,
  Cpu,
  MoreVertical,
  Zap
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar
} from "recharts";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

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
  { name: "01/05", revenue: 45000, users: 120 },
  { name: "02/05", revenue: 52000, users: 150 },
  { name: "03/05", revenue: 48000, users: 180 },
  { name: "04/05", revenue: 61000, users: 220 },
  { name: "05/05", revenue: 55000, users: 260 },
  { name: "06/05", revenue: 67000, users: 310 },
  { name: "07/05", revenue: 72000, users: 380 },
];

export default function AdminDashboard() {
  const { isAdmin, loading: authLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<AdminStatsData | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [revenueData, setRevenueData] = useState<any[]>([]);

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

    const fetchRevenue = async () => {
      const data = await getAdminRevenueAnalytics();
      if (data.length > 0) setRevenueData(data);
    };
    fetchRevenue();

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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           <div className="lg:col-span-2 h-[350px] md:h-[400px] bg-muted rounded-4xl" />
           <div className="h-[350px] md:h-[400px] bg-muted rounded-4xl" />
        </div>
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
    { label: "Revenue", value: formatCurrency(stats?.totalRevenue || 0), icon: DollarSign, trend: "+12.5%", isPositive: true, color: "text-accent", bg: "bg-accent/10", href: "/admin/payouts", detail: "View Payout Moderation" },
    { label: "Total Users", value: (stats?.totalUsers || 0).toLocaleString(), icon: Users, trend: "+8.2%", isPositive: true, color: "text-blue-500", bg: "bg-blue-500/10", href: "/admin/users", detail: "Manage User Registry" },
    { label: "Active Courses", value: stats?.totalCourses || 0, icon: Layers, trend: "+2.4%", isPositive: true, color: "text-emerald-500", bg: "bg-emerald-500/10", href: "/admin/courses", detail: "Audit Catalog Entries" },
    { label: "Volume", value: (stats?.totalEnrollments || 0).toLocaleString(), icon: Zap, trend: "+14.1%", isPositive: true, color: "text-amber-500", bg: "bg-amber-500/10", href: "/admin/payouts", detail: "Audit Sales Ledger" },
  ];

  return (
    <div className="space-y-12 md:space-y-16 pb-32">
      {/* Platform Control Header - Hardened Adaptive Layout */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 md:gap-8">
        <div className="space-y-2 md:space-y-3">
          <div className="flex items-center gap-2 text-[9px] md:text-[10px] font-bold uppercase tracking-[0.4em] text-blue-600">
            <ShieldCheck className="w-3.5 h-3.5" />
            Platform Control Center
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tighter text-foreground leading-[1.1]">
            Platform <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-cyan-500">Intelligence.</span>
          </h1>
          <p className="text-sm md:text-base text-muted-foreground font-medium max-w-md leading-relaxed">
            Real-time telemetry across the Techverox ecosystem.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <Button variant="secondary" onClick={handleSyncData} disabled={syncing} className="h-14 px-6 md:px-8 rounded-2xl font-bold uppercase tracking-widest text-[10px] md:text-[11px] border-border/40 w-full sm:w-auto shadow-sm">
            <RefreshCw className={cn("mr-2.5 w-4.5 h-4.5", syncing && "animate-spin")} /> {syncing ? "Syncing..." : "Sync Node"}
          </Button>
          <Button className="h-14 px-6 md:px-8 rounded-2xl bg-linear-to-r from-blue-600 to-cyan-500 text-white font-bold uppercase tracking-widest text-[10px] md:text-[11px] shadow-2xl shadow-blue-500/20 w-full sm:w-auto border-none">
            <Layout className="mr-2.5 w-4.5 h-4.5" /> Platform Registry
          </Button>
        </div>
      </div>
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {statCards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ y: -5 }}
            className="cursor-pointer"
            onClick={() => router.push(card.href)}
          >
            <Card className="p-6 md:p-8 rounded-4xl border border-border/40 bg-surface hover:border-blue-500/40 transition-all duration-500 group relative overflow-hidden shadow-sm">
              <div className="absolute inset-0 bg-linear-to-br from-blue-600/0 via-transparent to-blue-600/0 group-hover:from-blue-600/5 transition-all duration-700" />
              
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
                <p className="text-[8px] md:text-[10px] font-bold text-muted-foreground/60 uppercase tracking-[0.3em] leading-none">{card.label}</p>
                <h3 className="text-3xl md:text-4xl font-bold text-foreground tracking-tighter leading-none">{card.value}</h3>
              </div>

              <div className="mt-6 flex items-center gap-2 text-[8px] font-bold uppercase tracking-widest text-blue-600 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0 relative z-10">
                 {card.detail} <ArrowUpRight className="w-3 h-3" />
              </div>
            </Card>
          </motion.div>
        ))}
      </section>

      {/* Platform Analytics Cluster - Responsive Grid */}
      <section className="flex flex-col lg:grid lg:grid-cols-3 gap-8 md:gap-10">
        <Card className="lg:col-span-2 p-6 md:p-10 rounded-5xl border border-border/40 bg-surface space-y-8 md:space-y-10 shadow-sm overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 md:gap-8">
            <div className="space-y-1 min-w-0">
              <h2 className="text-xl md:text-2xl font-bold tracking-tighter text-foreground truncate">Revenue Monitoring</h2>
              <p className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Real-time aggregate platform earnings</p>
            </div>
            <div className="flex items-center gap-1 bg-muted/40 p-1 rounded-2xl border border-border/40 w-full sm:w-auto overflow-x-auto scrollbar-hide">
              {['7D', '30D', '90D', '1Y'].map((range, i) => (
                <button key={range} className={cn(
                  "flex-1 sm:flex-none px-4 md:px-5 py-2 rounded-xl text-[9px] md:text-[10px] font-bold uppercase tracking-widest transition-all shrink-0",
                  range === '30D' ? "bg-blue-600 text-white shadow-xl shadow-blue-600/20" : "text-muted-foreground hover:text-foreground"
                )}>
                  {range}
                </button>
              ))}
            </div>
          </div>

          <div className="h-[280px] md:h-[340px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData.length > 0 ? revenueData : mockChartData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.3} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 10, fontWeight: 700 }} dy={10} />
                <YAxis hide />
                <Tooltip
                  contentStyle={{ backgroundColor: "var(--surface)", borderColor: "var(--border)", borderRadius: "1.5rem", fontSize: "10px", fontWeight: "700", border: "1px solid var(--border)", boxShadow: "0 20px 50px rgba(0,0,0,0.1)" }}
                  formatter={(value) => `₹${(Number(value)).toLocaleString("en-IN")}`}
                />
                <Area type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={4} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Real-time System Stream - Adaptive Height */}
        <div className="space-y-6 md:space-y-8">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-lg md:text-xl font-bold tracking-tighter text-foreground flex items-center gap-3 min-w-0">
               <ActivitySquare className="w-5 h-5 text-blue-600 shrink-0" />
               <span className="truncate">System Stream</span>
            </h2>
            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-2xl hover:bg-muted/40 shrink-0">
               <Filter className="w-4 h-4 text-muted-foreground/60" />
            </Button>
          </div>

          <div className="grid gap-3 md:gap-4">
            {recentActivity.length === 0 ? (
              <div className="py-16 md:py-24 text-center border-2 border-dashed border-border/40 rounded-5xl bg-muted/5">
                <Cpu className="w-10 h-10 md:w-12 md:h-12 mx-auto mb-4 text-muted-foreground/10" />
                <p className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">No Telemetry</p>
              </div>
            ) : (
              recentActivity.map((activity, i) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: 15 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card className="p-4 md:p-5 rounded-2xl border border-border/40 bg-surface flex items-center justify-between hover:border-blue-500/40 transition-all group cursor-pointer shadow-sm">
                    <div className="flex items-center gap-4 md:gap-5 min-w-0">
                      <div className="h-10 w-10 md:h-12 md:w-12 rounded-2xl bg-blue-600/10 border border-blue-600/20 flex items-center justify-center text-blue-600 font-bold text-[10px] md:text-xs shrink-0 shadow-sm">
                        {activity.userName.charAt(0).toUpperCase()}
                      </div>
                      <div className="space-y-0.5 md:space-y-1 min-w-0">
                        <p className="text-sm font-bold text-foreground leading-none truncate">{activity.userName}</p>
                        <p className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 truncate max-w-[140px] md:max-w-[200px]">
                          Enrolled in <span className="text-foreground">{activity.courseTitle}</span>
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground/30 group-hover:text-blue-600 transition-colors shrink-0" />
                  </Card>
                </motion.div>
              ))
            )}
            <Button variant="ghost" className="w-full h-11 md:h-12 rounded-2xl text-[9px] md:text-[10px] font-bold uppercase tracking-widest border border-border/40 hover:bg-muted/30">
               View All Logs
            </Button>
          </div>

          {/* Operational Intelligence Card - Hardened Styling */}
          <Card className="p-8 md:p-10 rounded-5xl bg-zinc-950 text-white border border-white/10 relative overflow-hidden group cursor-pointer shadow-2xl">
             <div className="absolute inset-0 bg-[radial-gradient(circle_at_100%_0%,rgba(37,99,235,0.15),transparent_70%)]" />
             
             <div className="relative z-10 space-y-6 md:space-y-8">
                <div className="space-y-1.5 md:space-y-2">
                   <p className="text-[9px] md:text-[10px] font-bold uppercase tracking-[0.4em] text-blue-600/60">Node Audit</p>
                   <h3 className="text-xl md:text-2xl font-bold tracking-tighter leading-tight">Export Platform Intelligence</h3>
                </div>
                
                <div className="space-y-3 md:space-y-4">
                   <div className="flex items-center justify-between text-[8px] md:text-[9px] font-bold uppercase tracking-widest text-zinc-500">
                     <span>System Stability</span>
                     <span>98.2%</span>
                   </div>
                   <div className="h-1 md:h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: "98.2%" }}
                        transition={{ duration: 2 }}
                        className="h-full bg-blue-600 shadow-[0_0_20px_rgba(37,99,235,0.6)]" 
                      />
                   </div>
                </div>

                <Button className="w-full h-11 md:h-12 text-[9px] md:text-[10px] font-bold uppercase tracking-widest bg-white/5 border border-white/10 text-white hover:bg-white/10 shadow-lg">
                   Full Report Hub
                </Button>
             </div>
             <Globe className="absolute -bottom-8 -right-8 md:-bottom-10 md:-right-10 w-32 h-32 md:w-40 md:h-40 opacity-[0.03] group-hover:scale-110 transition-transform duration-2000" />
          </Card>
        </div>
      </section>
    </div>

  );
}
