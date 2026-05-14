"use client";

import { Bell, Search, Menu, User, Command, ChevronRight } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

interface TopNavbarProps {
  onOpenMobileSidebar: () => void;
}

export default function TopNavbar({ onOpenMobileSidebar }: TopNavbarProps) {
  const { profile, user } = useAuth();
  const pathname = usePathname();
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Generate breadcrumbs from pathname
  const breadcrumbs = pathname.split("/").filter(Boolean);

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-border/50 bg-background/80 px-4 backdrop-blur-xl lg:px-8 transition-all duration-300">
      <div className="flex items-center gap-4">
        {/* Mobile Menu Toggle */}
        <button 
          onClick={onOpenMobileSidebar}
          className="flex items-center justify-center rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground lg:hidden transition-colors"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Breadcrumbs / Page Title */}
        <nav className="hidden md:flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest">
           <span className="hover:text-foreground transition-colors cursor-pointer">Workspace</span>
           {breadcrumbs.map((crumb, i) => (
             <div key={crumb} className="flex items-center gap-2">
               <ChevronRight className="w-3 h-3 text-muted-foreground/40" />
               <span className={cn(
                 "transition-colors",
                 i === breadcrumbs.length - 1 ? "text-foreground" : "hover:text-foreground cursor-pointer"
               )}>
                 {crumb.replace(/-/g, ' ')}
               </span>
             </div>
           ))}
        </nav>
      </div>

      {/* Center: Search Command Bar */}
      <div className={cn(
        "relative hidden max-w-md flex-1 items-center md:flex transition-all duration-300 ease-in-out px-10",
        isSearchFocused ? "max-w-lg" : "max-w-xs"
      )}>
        <div className="relative w-full">
          <Search className={cn(
            "absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 transition-colors",
            isSearchFocused ? "text-accent" : "text-muted-foreground"
          )} />
          <input
            type="text"
            placeholder="Search commands..."
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            className="h-9 w-full rounded-xl border border-border/60 bg-muted/30 pl-10 pr-12 text-[11px] font-bold text-foreground placeholder:text-muted-foreground/60 focus:border-accent/50 focus:bg-background focus:outline-none focus:ring-4 focus:ring-accent/10 transition-all"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-40">
            <Command className="w-2.5 h-2.5" />
            <span className="text-[9px] font-bold">K</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-border/60 bg-muted/30 text-muted-foreground hover:bg-muted hover:text-foreground transition-all group">
          <Bell className="h-4 w-4 group-hover:scale-110 transition-transform" />
          <span className="absolute right-2.5 top-2.5 flex h-1.5 w-1.5 rounded-full bg-accent ring-2 ring-background" />
        </button>

        <div className="h-6 w-[1px] bg-border/50 mx-1 hidden sm:block" />

        <div className="flex items-center gap-3">
          <div className="hidden flex-col items-end sm:flex">
            <p className="text-[10px] font-bold text-foreground tracking-tight leading-none mb-1">{profile?.name || user?.displayName || "User"}</p>
            <Badge variant="accent" className="text-[7px] h-3 px-1 font-bold uppercase tracking-widest leading-none">PRO ACCOUNT</Badge>
          </div>
          <div className="h-8 w-8 overflow-hidden rounded-xl border border-border/60 bg-muted p-0.5 shadow-sm">
             <div className="flex h-full w-full items-center justify-center rounded-lg bg-accent/10 text-accent font-bold text-xs overflow-hidden">
                {profile?.photoURL || user?.photoURL ? (
                  <img src={profile?.photoURL || user?.photoURL || ""} alt="" className="w-full h-full object-cover" />
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
