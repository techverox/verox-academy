"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, 
  BookOpen, 
  Settings, 
  LogOut,
  X,
  Sparkles,
  Command,
  Shield,
  Zap,
  Award,
  Users,
  Layers,
  DollarSign,
  TrendingUp
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { ThemeToggle } from "@/components/ThemeToggle";

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileSidebar({ isOpen, onClose }: MobileSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, profile } = useAuth();

  // Unified link logic (mirrored from AppSidebar)
  const role = profile?.role || "student";
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
      { name: "Masterclasses", href: "/learn/", icon: Zap },
      { name: "Certificates", href: "/certificates/", icon: Award },
      { name: "Profile", href: "/profile/", icon: Users },
    ]
  };

  const currentLinks = links[role as keyof typeof links] || links.student;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 lg:hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-zinc-950/80 backdrop-blur-md transition-opacity" 
        onClick={onClose}
      />
      
      {/* Drawer */}
      <aside className="absolute bottom-0 left-0 top-0 w-80 bg-surface border-r border-border/50 flex flex-col animate-in slide-in-from-left duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]">
        {/* Header */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-border/40">
          <Link href="/" className="flex items-center gap-3" onClick={onClose}>
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-primary/20">
              V
            </div>
            <div className="flex flex-col">
               <span className="text-sm font-bold tracking-tight text-foreground leading-none">Verox Academy</span>
               <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-accent mt-1">{role} Workspace</span>
            </div>
          </Link>
          <button 
            onClick={onClose}
            className="p-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-8 px-4 scrollbar-hide">
          <div className="space-y-6">
            <div>
              <p className="px-4 mb-3 text-[9px] font-bold uppercase tracking-[0.3em] text-muted-foreground/50">Main Menu</p>
              <nav className="space-y-1">
                {currentLinks.map((link) => {
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.name}
                      href={link.href}
                      onClick={onClose}
                      className={cn(
                        "flex items-center gap-4 px-4 py-3 rounded-xl transition-all border",
                        isActive 
                          ? "bg-accent/10 text-accent border-accent/20" 
                          : "text-muted-foreground border-transparent hover:bg-muted hover:text-foreground"
                      )}
                    >
                      <link.icon className="w-5 h-5 shrink-0" />
                      <span className="font-bold text-sm tracking-tight">{link.name}</span>
                      {isActive && (
                        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-accent shadow-[0_0_8px_rgba(37,99,235,0.8)]" />
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div>
              <p className="px-4 mb-3 text-[9px] font-bold uppercase tracking-[0.3em] text-muted-foreground/50">Ecosystem</p>
              <nav className="space-y-1">
                <Link href="/" onClick={onClose} className="flex items-center gap-4 px-4 py-3 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-all">
                   <Command className="w-5 h-5 shrink-0" />
                   <span className="text-sm font-bold tracking-tight">Public Home</span>
                </Link>
                <Link href="/help" onClick={onClose} className="flex items-center gap-4 px-4 py-3 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-all">
                   <Sparkles className="w-5 h-5 shrink-0" />
                   <span className="text-sm font-bold tracking-tight">Help Center</span>
                </Link>
              </nav>
            </div>
          </div>

          {/* Premium CTA */}
          {role === 'student' && (
            <div className="mt-10 p-6 rounded-4xl bg-accent/5 border border-accent/20 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-accent/20 transition-colors" />
              <Zap className="w-5 h-5 text-accent mb-4 relative z-10" />
              <h4 className="text-sm font-bold text-foreground mb-1 relative z-10 uppercase tracking-tight">Elevate Potential</h4>
              <p className="text-[11px] text-muted-foreground mb-5 relative z-10 font-medium leading-relaxed">
                Unlock industrial-grade certifications and cinematic learning modules.
              </p>
              <button className="w-full py-3 bg-accent text-white text-[10px] font-bold uppercase tracking-[0.2em] rounded-xl shadow-lg shadow-accent/20 relative z-10">
                Upgrade Workspace
              </button>
            </div>
          )}
        </div>

        {/* Footer Area */}
        <div className="p-6 border-t border-border/40 space-y-6 bg-surface-elevated/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-muted border border-border/50 flex items-center justify-center text-accent font-bold overflow-hidden">
                {user?.photoURL ? (
                   <img src={user.photoURL} alt="" className="w-full h-full object-cover" />
                ) : (
                   <div className="text-lg">{profile?.name?.charAt(0) || "U"}</div>
                )}
              </div>
              <div className="flex flex-col">
                <p className="text-sm font-bold text-foreground leading-tight">{profile?.name || user?.displayName || "Student"}</p>
                <Badge variant="accent" className="text-[7px] h-3.5 px-1.5 font-bold uppercase tracking-widest mt-1 w-fit">{role === "student" ? "Premium" : role}</Badge>
              </div>
            </div>
            <ThemeToggle />
          </div>
          
          <button 
            onClick={() => {
              signOut(auth);
              onClose();
            }}
            className="flex items-center justify-center gap-3 w-full h-12 bg-destructive/5 hover:bg-destructive text-destructive hover:text-white rounded-xl transition-all border border-destructive/20 font-bold text-[10px] uppercase tracking-widest"
          >
            <LogOut className="w-4 h-4" />
            Terminate Session
          </button>
        </div>
      </aside>
    </div>
  );
}
