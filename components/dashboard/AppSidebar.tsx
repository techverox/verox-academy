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
  { name: "Dashboard", href: "/dashboard/", icon: LayoutDashboard },
  { name: "My Courses", href: "/courses/", icon: BookOpen },
  { name: "Certificates", href: "/certificates/", icon: Trophy },
  { name: "Wishlist", href: "/wishlist/", icon: Heart },
  { name: "Settings", href: "/settings/", icon: Settings },
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
      className={`fixed left-0 top-0 z-40 h-screen bg-sidebar border-r border-border transition-all duration-300 ease-in-out hidden lg:flex flex-col ${
        isCollapsed ? "w-20" : "w-[260px]"
      }`}
    >
      {/* Logo Section */}
      <div className="h-20 flex items-center px-6 border-b border-border/50">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-black text-xl shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
            V
          </div>
          {!isCollapsed && (
            <span className="font-bold text-lg tracking-tight text-white transition-opacity duration-300">
              Verox Academy
            </span>
          )}
        </Link>
      </div>

      {/* Navigation Section */}
      <div className="flex-1 overflow-y-auto py-8 px-4 scrollbar-hide">
        <div className="space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                  isActive 
                    ? "bg-primary/10 text-primary border border-primary/20" 
                    : "text-secondary-text hover:bg-muted hover:text-white"
                }`}
              >
                <item.icon className={`w-5 h-5 ${isActive ? "text-primary" : "group-hover:scale-110 transition-transform"}`} />
                {!isCollapsed && (
                  <span className="font-medium text-sm">{item.name}</span>
                )}
                {isActive && !isCollapsed && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_var(--primary)]" />
                )}
              </Link>
            );
          })}
        </div>

        {/* Upgrade Card (Only if not collapsed) */}
        {!isCollapsed && (
          <div className="mt-10 p-5 rounded-2xl bg-gradient-to-br from-primary/20 via-primary/5 to-transparent border border-primary/10 relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-20 h-20 bg-primary/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
            <Sparkles className="w-5 h-5 text-primary mb-3" />
            <h4 className="text-sm font-bold text-white mb-1">Go Premium</h4>
            <p className="text-[10px] text-secondary-text leading-relaxed mb-4">
              Unlock exclusive courses and certificates today.
            </p>
            <button className="w-full py-2 bg-primary text-white text-[10px] font-black uppercase tracking-wider rounded-lg hover:bg-primary-hover transition-colors">
              Upgrade Now
            </button>
          </div>
        )}
      </div>

      {/* User & Toggle Section */}
      <div className="p-4 border-t border-border/50 space-y-4">
        {!isCollapsed && (
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="w-10 h-10 rounded-full bg-muted border border-border flex items-center justify-center text-primary font-bold text-sm">
              {profile?.name?.charAt(0) || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate">{profile?.name || "Student"}</p>
              <p className="text-[10px] text-secondary-text truncate uppercase tracking-widest">{profile?.role || "Basic Plan"}</p>
            </div>
          </div>
        )}
        
        <div className="flex items-center gap-2">
          <button 
            onClick={handleLogout}
            className={`flex items-center gap-3 text-secondary-text hover:text-danger hover:bg-danger/10 p-3 rounded-xl transition-all w-full ${
              isCollapsed ? "justify-center" : ""
            }`}
          >
            <LogOut className="w-5 h-5" />
            {!isCollapsed && <span className="text-sm font-semibold">Log out</span>}
          </button>
          
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 hover:bg-muted rounded-lg text-secondary-text transition-colors ml-auto hidden lg:block"
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </aside>
  );
}
