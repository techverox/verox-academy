"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, 
  BookOpen, 
  Users, 
  DollarSign, 
  Settings, 
  LogOut, 
  ChevronLeft,
  ChevronRight,
  Shield,
  Zap,
  TrendingUp,
  Award,
  Layers,
  Sparkles,
  Command,
  Bell,
  PanelLeftClose,
  PanelLeftOpen
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { ThemeToggle } from "@/components/ThemeToggle";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { motion } from "framer-motion";

interface SidebarProps {
  type: "admin" | "creator" | "student";
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function AppSidebar({ type, isCollapsed, onToggleCollapse }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, profile } = useAuth();

  const links = {
    admin: [
      { name: "Dashboard", href: "/admin/", icon: LayoutDashboard },
      { name: "Courses", href: "/admin/courses/", icon: Layers },
      { name: "Students", href: "/admin/users/", icon: Users },
      { name: "Creators", href: "/admin/creators/", icon: Shield },
      { name: "Payouts", href: "/admin/payouts/", icon: DollarSign },
      { name: "System", href: "/admin/settings/", icon: Settings },
    ],
    creator: [
      { name: "Studio", href: "/creator/", icon: LayoutDashboard },
      { name: "My Courses", href: "/creator/courses/", icon: Layers },
      { name: "Earnings", href: "/creator/payouts/", icon: DollarSign },
      { name: "Insights", href: "/creator/analytics", icon: TrendingUp },
      { name: "Settings", href: "/creator/settings/", icon: Settings },
    ],
    student: [
      { name: "Command Hub", href: "/dashboard/", icon: LayoutDashboard },
      { name: "Marketplace", href: "/courses/", icon: BookOpen },
      { name: "Learning Lab", href: "/dashboard/", icon: Zap }, // Placeholder for /learn/
      { name: "Certificates", href: "/dashboard/", icon: Award }, // Placeholder for /certificates/
      { name: "My Account", href: "/dashboard/", icon: Users }, // Placeholder for /profile/
    ]
  };

  const currentLinks = links[type];

  return (
    <aside 
      className={cn(
        "h-screen sticky top-0 bg-surface/80 backdrop-blur-3xl border-r border-border/40 hidden lg:flex flex-col transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] z-50",
        isCollapsed ? "w-20" : "w-72"
      )}
    >
      {/* Brand Identity & Toggle */}
      <div className={cn(
        "flex items-center justify-between h-20 px-6 border-b border-border/40 mb-8",
        isCollapsed && "justify-center px-0"
      )}>
         {!isCollapsed && (
           <Link href="/" className="flex items-center gap-3.5 group">
              <div className="h-10 w-10 rounded-2xl bg-linear-to-br from-blue-600 to-cyan-500 text-white flex items-center justify-center font-bold text-xl shadow-2xl shadow-blue-500/30 group-hover:scale-110 group-hover:rotate-3 transition-all shrink-0">
                 V
              </div>
              <div className="flex flex-col overflow-hidden">
                 <span className="text-[13px] font-bold tracking-tight text-foreground leading-none">Verox Academy</span>
                 <span className="text-[8px] font-bold uppercase tracking-[0.4em] text-blue-600 mt-1.5">{type} Central</span>
              </div>
           </Link>
         )}
         {isCollapsed && (
           <div className="h-10 w-10 rounded-2xl bg-linear-to-br from-blue-600 to-cyan-500 text-white flex items-center justify-center font-bold text-xl shadow-2xl shadow-blue-500/30 shrink-0">
             V
           </div>
         )}
         
         {!isCollapsed && (
           <button 
             onClick={onToggleCollapse}
             className="h-9 w-9 flex items-center justify-center rounded-xl bg-muted/40 text-muted-foreground hover:text-foreground border border-border/40 hover:bg-muted transition-all"
           >
             <PanelLeftClose className="w-4 h-4" />
           </button>
         )}
         
         {isCollapsed && (
           <button 
             onClick={onToggleCollapse}
             className="absolute -right-4 top-20 h-8 w-8 flex items-center justify-center rounded-full bg-surface border border-border shadow-2xl text-muted-foreground hover:text-foreground transition-all"
           >
             <PanelLeftOpen className="w-3.5 h-3.5" />
           </button>
         )}
      </div>

      {/* Navigation Groups */}
      <div className="space-y-6 flex-1 overflow-y-auto scrollbar-hide px-3">
        <div>
          {!isCollapsed && <p className="px-3 mb-3 text-[9px] font-bold uppercase tracking-[0.3em] text-muted-foreground/50">Main Menu</p>}
          <nav className="space-y-1.5">
            {currentLinks.map((link) => {
              const active = pathname === link.href;
              return (
                <Link 
                  key={link.name} 
                  href={link.href}
                  className={cn(
                    "flex items-center gap-3.5 px-4 py-3 rounded-2xl transition-all group relative overflow-hidden",
                    active 
                    ? "bg-linear-to-r from-blue-600/15 to-cyan-500/5 text-blue-600 border border-blue-600/10 shadow-sm" 
                    : "text-muted-foreground/70 hover:bg-muted/40 hover:text-foreground",
                    isCollapsed && "justify-center px-0"
                  )}
                  title={isCollapsed ? link.name : ""}
                >
                  {active && (
                    <motion.div 
                      layoutId="sidebar-active"
                      className="absolute inset-0 bg-linear-to-r from-blue-600/10 to-transparent pointer-events-none"
                    />
                  )}
                  <link.icon className={cn("w-5 h-5 shrink-0 transition-all duration-500 relative z-10", active ? "text-blue-600 scale-110" : "group-hover:text-foreground group-hover:scale-110")} />
                  {!isCollapsed && <span className="text-xs font-bold tracking-tight relative z-10">{link.name}</span>}
                  {active && !isCollapsed && (
                    <div className="absolute right-4 w-1.5 h-1.5 rounded-full bg-blue-600 shadow-[0_0_12px_rgba(37,99,235,0.8)] z-10" />
                  )}
                  {active && isCollapsed && (
                    <div className="absolute left-0 w-1 h-8 bg-blue-600 rounded-r-full" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Support Section */}
        <div>
          {!isCollapsed && <p className="px-3 mb-3 text-[9px] font-bold uppercase tracking-[0.3em] text-muted-foreground/50">Ecosystem</p>}
          <nav className="space-y-1">
             <Link href="/" className={cn("flex items-center gap-3 px-3 py-2.5 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-all group", isCollapsed && "justify-center")} title={isCollapsed ? "Public Home" : ""}>
                <Command className="w-4 h-4 shrink-0 group-hover:text-foreground" />
                {!isCollapsed && <span className="text-xs font-bold tracking-tight">Public Home</span>}
             </Link>
             <Link href="/help" className={cn("flex items-center gap-3 px-3 py-2.5 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-all group", isCollapsed && "justify-center")} title={isCollapsed ? "Help Center" : ""}>
                <Sparkles className="w-4 h-4 shrink-0 group-hover:text-foreground" />
                {!isCollapsed && <span className="text-xs font-bold tracking-tight">Help Center</span>}
             </Link>
          </nav>
        </div>
      </div>

      {/* User area */}
      <div className={cn(
        "mt-auto space-y-4 p-4 border-t border-border/50",
        isCollapsed && "px-0 py-4 items-center flex flex-col"
      )}>
         {!isCollapsed ? (
           <>
            <div className="flex items-center gap-3 px-1">
              <div className="relative w-9 h-9 rounded-xl bg-muted border border-border/50 overflow-hidden shrink-0">
                {user?.photoURL ? (
                    <img src={user.photoURL} alt="" className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs font-bold text-blue-600 bg-blue-600/10">
                      {profile?.name?.charAt(0) || "U"}
                    </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-bold text-foreground truncate leading-none mb-1">{profile?.name || user?.displayName || "Anonymous"}</p>
                <Badge variant="accent" className="text-[7px] h-3.5 px-1.5 font-bold uppercase tracking-widest bg-blue-600 text-white">{type === "student" ? "Premium" : type}</Badge>
              </div>
              <ThemeToggle />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button 
                  onClick={() => router.push("/")}
                  className="h-9 flex items-center justify-center bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground rounded-lg transition-all border border-border/50"
                  title="Return to Public View"
              >
                  <ChevronLeft className="w-4 h-4" />
              </button>
              <button 
                  onClick={() => signOut(auth)}
                  className="h-9 flex items-center justify-center bg-destructive/5 hover:bg-destructive text-destructive hover:text-destructive-foreground rounded-lg transition-all border border-destructive/20"
                  title="Sign Out"
              >
                  <LogOut className="w-4 h-4" />
              </button>
            </div>
           </>
         ) : (
           <div className="flex flex-col items-center gap-4">
              <div className="relative w-10 h-10 rounded-xl bg-muted border border-border/50 overflow-hidden shrink-0">
                {user?.photoURL ? (
                    <img src={user.photoURL} alt="" className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs font-bold text-accent bg-accent/10">
                      {profile?.name?.charAt(0) || "U"}
                    </div>
                )}
              </div>
              <ThemeToggle />
              <button 
                  onClick={() => signOut(auth)}
                  className="h-10 w-10 flex items-center justify-center bg-destructive/5 hover:bg-destructive text-destructive hover:text-destructive-foreground rounded-xl transition-all border border-destructive/20"
                  title="Sign Out"
              >
                  <LogOut className="w-4 h-4" />
              </button>
           </div>
         )}
      </div>
   </aside>
  );
}
