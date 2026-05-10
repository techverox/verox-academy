"use client";

import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { 
  LayoutDashboard, 
  BookOpen, 
  Users, 
  DollarSign, 
  TrendingUp, 
  Settings, 
  LogOut,
  ChevronRight,
  Plus
} from "lucide-react";

export default function CreatorLayout({ children }: { children: React.ReactNode }) {
  const { isCreator, isAdmin, loading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isCreator && !isAdmin) {
      router.push("/dashboard");
    }
  }, [isCreator, isAdmin, loading, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-zinc-800 border-t-primary" />
      </div>
    );
  }

  if (!isCreator && !isAdmin) {
    return null;
  }

  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/creator" },
    { icon: BookOpen, label: "My Courses", href: "/creator/courses" },
    { icon: Users, label: "My Articles", href: "/creator/articles" },
    { icon: DollarSign, label: "Earnings", href: "/creator/payouts" },
    { icon: TrendingUp, label: "Analytics", href: "/creator/analytics" },
  ];

  return (
    <div className="min-h-screen bg-black text-white flex">
      {/* Sidebar */}
      <aside className="w-72 border-r border-zinc-800 flex flex-col hidden lg:flex">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-black font-black text-xl">C</div>
            <div className="flex flex-col">
              <span className="font-black tracking-tight text-lg leading-none">Creator Studio</span>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mt-1">Verox Engine</span>
            </div>
          </div>

          <nav className="space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.label}
                onClick={() => router.push(item.href)}
                className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-zinc-400 hover:text-white hover:bg-zinc-900 transition-all group"
              >
                <item.icon className="w-5 h-5 group-hover:text-primary transition-colors" />
                <span className="font-bold">{item.label}</span>
                <ChevronRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-8 space-y-4">
          <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-2xl">
            <p className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-2">Need Help?</p>
            <p className="text-[10px] text-zinc-400 leading-relaxed mb-4">Contact our support team for any issues with your courses.</p>
            <button className="w-full py-2 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-xs font-bold transition-colors">
              Support Center
            </button>
          </div>
          
          <button 
            onClick={() => router.push("/dashboard")}
            className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-zinc-500 hover:text-white transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-bold">Student View</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-20 border-b border-zinc-800 flex items-center justify-between px-8 bg-black/50 backdrop-blur-xl sticky top-0 z-40">
          <div className="flex items-center gap-4 lg:hidden">
             <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-black font-black">C</div>
          </div>
          
          <div className="flex-1" />
          
          <div className="flex items-center gap-6">
            <button 
              onClick={() => router.push("/creator/courses/add")}
              className="flex items-center gap-2 px-6 py-2 bg-primary text-black font-black rounded-xl hover:scale-105 transition-transform active:scale-95"
            >
              <Plus className="w-4 h-4" />
              NEW COURSE
            </button>
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-black tracking-tight">{user?.displayName}</p>
                <p className="text-[10px] font-black uppercase tracking-widest text-primary">Certified Creator</p>
              </div>
              <img 
                src={user?.photoURL || "https://ui-avatars.com/api/?name=Creator"} 
                className="w-10 h-10 rounded-xl border border-zinc-800"
                alt="Profile"
              />
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
