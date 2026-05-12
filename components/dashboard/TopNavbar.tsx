"use client";

import { Bell, Search, Menu, User } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/context/auth-context";
import { ThemeToggle } from "@/components/ThemeToggle";

interface TopNavbarProps {
  onOpenMobileSidebar: () => void;
}

export default function TopNavbar({ onOpenMobileSidebar }: TopNavbarProps) {
  const { profile } = useAuth();
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  return (
    <header className="sticky top-0 z-30 flex h-20 w-full items-center justify-between border-b border-border/50 bg-background/80 px-6 backdrop-blur-xl lg:px-10 transition-colors duration-300">
      {/* Mobile Menu Toggle */}
      <button 
        onClick={onOpenMobileSidebar}
        className="flex items-center justify-center rounded-lg p-2 text-muted-foreground hover:bg-secondary hover:text-foreground lg:hidden transition-colors"
      >
        <Menu className="h-6 w-6" />
      </button>

      {/* Search Bar */}
      <div className={`relative hidden max-w-md flex-1 items-center md:flex transition-all duration-500 ease-out ${isSearchFocused ? "max-w-lg" : "max-w-xs"}`}>
        <Search className={`absolute left-4 h-4 w-4 transition-colors ${isSearchFocused ? "text-primary" : "text-muted-foreground"}`} />
        <input
          type="text"
          placeholder="Search courses, lessons..."
          onFocus={() => setIsSearchFocused(true)}
          onBlur={() => setIsSearchFocused(false)}
          className="h-11 w-full rounded-2xl border border-border bg-secondary/30 pl-11 pr-4 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary/50 focus:bg-background focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all shadow-sm"
        />
        <div className="absolute right-4 hidden items-center gap-1 md:flex">
          <kbd className="rounded border border-border bg-card px-1.5 py-0.5 text-[10px] font-bold text-muted-foreground shadow-sm">⌘</kbd>
          <kbd className="rounded border border-border bg-card px-1.5 py-0.5 text-[10px] font-bold text-muted-foreground shadow-sm">K</kbd>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4 lg:gap-6 ml-auto md:ml-0">
        <ThemeToggle />
        
        <button className="relative flex h-10 w-10 items-center justify-center rounded-full border border-border bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground transition-all group shadow-sm">
          <Bell className="h-5 w-5 group-hover:scale-110 transition-transform" />
          <span className="absolute right-2.5 top-2.5 flex h-2.5 w-2.5 rounded-full bg-primary ring-4 ring-background" />
        </button>

        <div className="flex items-center gap-3 pl-4 border-l border-border/50">
          <div className="hidden flex-col items-end lg:flex">
            <p className="text-sm font-bold text-foreground tracking-tight">{profile?.name || "Student"}</p>
            <p className="text-[10px] text-primary uppercase font-black tracking-widest bg-primary/10 px-2 py-0.5 rounded-sm mt-0.5">Premium</p>
          </div>
          <div className="h-10 w-10 overflow-hidden rounded-full border-2 border-border bg-secondary p-0.5 shadow-sm">
            <div className="flex h-full w-full items-center justify-center rounded-full bg-primary/10 text-primary font-black text-xs overflow-hidden">
              {profile?.photoURL ? (
                <img src={profile.photoURL} alt={profile.name || ""} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
              ) : (
                profile?.name?.charAt(0) || <User className="h-4 w-4" />
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
