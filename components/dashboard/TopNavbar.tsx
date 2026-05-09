"use client";

import { Bell, Search, Menu, User } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/context/auth-context";

interface TopNavbarProps {
  onOpenMobileSidebar: () => void;
}

export default function TopNavbar({ onOpenMobileSidebar }: TopNavbarProps) {
  const { profile } = useAuth();
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  return (
    <header className="sticky top-0 z-30 flex h-20 w-full items-center justify-between border-b border-border/50 bg-background/80 px-6 backdrop-blur-xl lg:px-10">
      {/* Mobile Menu Toggle */}
      <button 
        onClick={onOpenMobileSidebar}
        className="flex items-center justify-center rounded-lg p-2 text-secondary-text hover:bg-muted hover:text-white lg:hidden"
      >
        <Menu className="h-6 w-6" />
      </button>

      {/* Search Bar */}
      <div className={`relative hidden max-w-md flex-1 items-center md:flex transition-all duration-300 ${isSearchFocused ? "max-w-lg" : "max-w-xs"}`}>
        <Search className={`absolute left-4 h-4 w-4 transition-colors ${isSearchFocused ? "text-primary" : "text-secondary-text"}`} />
        <input
          type="text"
          placeholder="Search courses, lessons..."
          onFocus={() => setIsSearchFocused(true)}
          onBlur={() => setIsSearchFocused(false)}
          className="h-11 w-full rounded-2xl border border-border bg-muted/30 pl-11 pr-4 text-sm text-white placeholder:text-secondary-text/60 focus:border-primary/50 focus:bg-muted/50 focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all"
        />
        <div className="absolute right-4 hidden items-center gap-1 md:flex">
          <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-bold text-secondary-text">⌘</kbd>
          <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-bold text-secondary-text">K</kbd>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4 lg:gap-6">
        <button className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-muted/30 text-secondary-text hover:bg-muted hover:text-white transition-all group">
          <Bell className="h-5 w-5 group-hover:scale-110 transition-transform" />
          <span className="absolute right-2.5 top-2.5 flex h-2 w-2 rounded-full bg-primary ring-4 ring-background" />
        </button>

        <div className="flex items-center gap-3 pl-4 border-l border-border/50">
          <div className="hidden flex-col items-end lg:flex">
            <p className="text-sm font-bold text-white">{profile?.name || "Student"}</p>
            <p className="text-[10px] text-primary uppercase font-black tracking-widest">Premium Student</p>
          </div>
          <div className="h-10 w-10 overflow-hidden rounded-xl border border-border bg-muted p-0.5">
            <div className="flex h-full w-full items-center justify-center rounded-[9px] bg-primary/20 text-primary font-black text-xs">
              {profile?.name?.charAt(0) || <User className="h-4 w-4" />}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
