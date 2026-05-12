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
  Shield,
  Zap,
  TrendingUp,
  Award,
  Layers,
  GraduationCap
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { ThemeToggle } from "@/components/ThemeToggle";

interface SidebarProps {
  type: "admin" | "creator" | "student";
}

export function AppSidebar({ type }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, profile } = useAuth();

  const links = {
    admin: [
      { name: "Dashboard", href: "/admin/", icon: LayoutDashboard },
      { name: "Courses", href: "/admin/courses/", icon: BookOpen },
      { name: "Students", href: "/admin/users/", icon: Users },
      { name: "Creators", href: "/admin/creators/", icon: Shield },
      { name: "Payouts", href: "/admin/payouts/", icon: DollarSign },
    ],
    creator: [
      { name: "Dashboard", href: "/creator/", icon: LayoutDashboard },
      { name: "My Courses", href: "/creator/courses/", icon: Layers },
      { name: "Payouts", href: "/creator/payouts/", icon: DollarSign },
      { name: "Analytics", href: "/creator/analytics/", icon: TrendingUp },
    ],
    student: [
      { name: "Dashboard", href: "/dashboard/", icon: LayoutDashboard },
      { name: "Browse", href: "/courses/", icon: BookOpen },
      { name: "Learning", href: "/learn/", icon: Zap },
      { name: "Certificates", href: "/certificates/", icon: Award },
    ]
  };

  const currentLinks = links[type];

  return (
    <aside className="w-72 h-screen sticky top-0 bg-sidebar-bg border-r border-sidebar-border hidden lg:flex flex-col p-6 transition-colors duration-300">
      {/* Brand Identity */}
      <div className="flex items-center gap-3 mb-10 px-2">
         <Link href="/" className="flex items-center gap-3 group">
            <div className="h-10 w-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold text-xl transition-transform group-hover:scale-105">
               V
            </div>
            <div>
               <h2 className="text-lg font-bold tracking-tight text-foreground">Verox</h2>
               <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{type} Academy</p>
            </div>
         </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1">
         {currentLinks.map((link) => {
            const active = pathname === link.href;
            return (
               <Link 
                  key={link.href} 
                  href={link.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all group ${
                     active 
                     ? "bg-primary text-primary-foreground shadow-sm" 
                     : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
               >
                  <link.icon className={`w-4 h-4 ${active ? "text-primary-foreground" : "group-hover:text-primary transition-colors"}`} />
                  <span className="text-sm font-medium">{link.name}</span>
                  {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-foreground" />}
               </Link>
            );
         })}
      </nav>

      {/* User area */}
      <div className="mt-auto space-y-4 pt-6 border-t border-sidebar-border">
         <div className="flex items-center gap-3 px-2">
            <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground overflow-hidden border border-border">
               {user?.photoURL ? (
                  <img src={user.photoURL} alt="" className="w-full h-full object-cover" />
               ) : (
                  <Users className="w-5 h-5" />
               )}
            </div>
            <div className="flex-1 min-w-0">
               <p className="text-sm font-semibold text-foreground truncate">{profile?.name || user?.displayName || "Anonymous"}</p>
               <p className="text-[10px] font-medium text-muted-foreground truncate uppercase tracking-wide">{type}</p>
            </div>
            <ThemeToggle />
         </div>

         <div className="grid grid-cols-2 gap-2">
            <button 
               onClick={() => router.push("/")}
               className="h-10 flex items-center justify-center bg-secondary/50 hover:bg-secondary text-muted-foreground hover:text-foreground rounded-lg transition-all border border-border"
               title="Return to Public View"
            >
               <ChevronLeft className="w-4 h-4" />
            </button>
            <button 
               onClick={() => signOut(auth)}
               className="h-10 flex items-center justify-center bg-destructive/5 hover:bg-destructive text-destructive hover:text-destructive-foreground rounded-lg transition-all border border-destructive/20"
               title="Sign Out"
            >
               <LogOut className="w-4 h-4" />
            </button>
         </div>
      </div>
   </aside>
  );
}
