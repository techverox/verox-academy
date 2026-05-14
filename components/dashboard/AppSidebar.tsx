"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  BookOpen, 
  Trophy, 
  Heart, 
  Settings, 
  LogOut,
  ChevronLeft,
  ChevronRight,
  Sparkles
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/context/auth-context";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

const menuItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "My Courses", href: "/courses", icon: BookOpen },
  { name: "Certificates", href: "/dashboard", icon: Trophy },
  { name: "Wishlist", href: "/dashboard", icon: Heart },
  { name: "Settings", href: "/settings", icon: Settings },
];

export default function AppSidebar() {
  const pathname = usePathname();
  const { profile } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleLogout = async () => {
    await signOut(auth);
  };

  return (
    <aside 
      className={`fixed left-0 top-0 z-40 h-screen bg-sidebar-bg border-r border-border transition-all duration-300 ease-in-out hidden lg:flex flex-col shadow-sm ${
        isCollapsed ? "w-20" : "w-[260px]"
      }`}
    >
      {/* Logo Section */}
      <div className="h-20 flex items-center px-6 border-b border-border/50">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-foreground flex items-center justify-center text-background font-bold text-xl shadow-lg transition-transform group-hover:scale-105">
            V
          </div>
          {!isCollapsed && (
            <span className="font-bold text-lg tracking-tight text-foreground transition-opacity duration-300">
              Verox Academy
            </span>
          )}
        </Link>
      </div>

      {/* Navigation Section */}
      <div className="flex-1 overflow-y-auto py-8 px-4 scrollbar-hide">
        <div className="space-y-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 group font-medium ${
                  isActive 
                    ? "bg-primary/10 text-primary border border-primary/10 shadow-sm" 
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground border border-transparent"
                }`}
              >
                <item.icon className={`w-5 h-5 ${isActive ? "text-primary" : "group-hover:scale-110 transition-transform"}`} />
                {!isCollapsed && (
                  <span className="text-sm">{item.name}</span>
                )}
                {isActive && !isCollapsed && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_var(--primary)]" />
                )}
              </Link>
            );
          })}

          {/* CREATOR STUDIO BUTTON (Role Based) */}
          {(profile?.role === 'creator' || profile?.role === 'admin') && (
            <Link
              href="/creator"
              className="mt-8 flex items-center gap-3 px-4 py-3.5 rounded-xl bg-linear-to-r from-primary/20 to-primary/5 border border-primary/20 text-primary hover:from-primary/30 hover:to-primary/10 transition-all group shadow-sm hover:shadow-md"
            >
              <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              {!isCollapsed && (
                <span className="font-bold text-sm uppercase tracking-wider">CREATOR STUDIO</span>
              )}
            </Link>
          )}
        </div>

        {/* Upgrade Card (Only if not collapsed) */}
        {!isCollapsed && (
          <div className="mt-12 p-6 rounded-3xl bg-linear-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 relative overflow-hidden group shadow-sm">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
            <Sparkles className="w-6 h-6 text-primary mb-4" />
            <h4 className="text-base font-bold text-foreground mb-2">Go Premium</h4>
            <p className="text-xs text-muted-foreground leading-relaxed mb-6 font-medium">
              Unlock exclusive courses, certificates, and premium mentoring today.
            </p>
            <button className="w-full py-3 bg-primary text-primary-foreground text-xs font-bold uppercase tracking-widest rounded-xl shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all">
              Upgrade Now
            </button>
          </div>
        )}
      </div>

      {/* User & Toggle Section */}
      <div className="p-4 border-t border-border/50 space-y-4 bg-sidebar-bg/50 backdrop-blur-md">
        {!isCollapsed && (
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="w-10 h-10 rounded-full bg-secondary border border-border flex items-center justify-center text-primary font-bold text-sm overflow-hidden shadow-sm">
              {profile?.photoURL ? (
                <img src={profile.photoURL} alt={profile.name || ""} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
              ) : (
                profile?.name?.charAt(0) || "U"
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-foreground truncate">{profile?.name || "Student"}</p>
              <p className="text-[10px] text-muted-foreground truncate uppercase tracking-widest font-bold">{profile?.role || "Basic Plan"}</p>
            </div>
          </div>
        )}
        
        <div className="flex items-center gap-2">
          <button 
            onClick={handleLogout}
            className={`flex items-center gap-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10 p-3 rounded-xl transition-all w-full font-medium ${
              isCollapsed ? "justify-center" : ""
            }`}
          >
            <LogOut className="w-5 h-5" />
            {!isCollapsed && <span className="text-sm">Log out</span>}
          </button>
          
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-3 hover:bg-secondary rounded-xl text-muted-foreground transition-colors ml-auto hidden lg:block"
          >
            {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </aside>
  );
}
