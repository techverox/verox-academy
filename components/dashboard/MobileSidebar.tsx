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
  X,
  Sparkles
} from "lucide-react";
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

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileSidebar({ isOpen, onClose }: MobileSidebarProps) {
  const pathname = usePathname();
  const { profile } = useAuth();

  const handleLogout = async () => {
    await signOut(auth);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      
      {/* Drawer */}
      <aside className="absolute bottom-0 left-0 top-0 w-80 bg-sidebar border-r border-border flex flex-col animate-in slide-in-from-left duration-300">
        <div className="h-20 flex items-center justify-between px-6 border-b border-border/50">
          <Link href="/" className="flex items-center gap-3" onClick={onClose}>
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-black text-xl shadow-lg shadow-primary/20">
              V
            </div>
            <span className="font-bold text-lg tracking-tight text-white">
              Verox Academy
            </span>
          </Link>
          <button 
            onClick={onClose}
            className="p-2 text-secondary-text hover:text-white"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-8 px-4">
          <div className="space-y-1">
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={onClose}
                  className={`flex items-center gap-3 px-4 py-4 rounded-xl transition-all ${
                    isActive 
                      ? "bg-primary/10 text-primary border border-primary/20" 
                      : "text-secondary-text hover:bg-muted hover:text-white"
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-semibold text-sm">{item.name}</span>
                  {isActive && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
                  )}
                </Link>
              );
            })}

            {/* CREATOR STUDIO BUTTON (Role Based) */}
            {(profile?.role === 'creator' || profile?.role === 'admin') && (
              <Link
                href="/creator"
                onClick={onClose}
                className="mt-6 flex items-center gap-3 px-4 py-4 rounded-xl bg-gradient-to-r from-primary/20 to-primary/5 border border-primary/20 text-primary transition-all group"
              >
                <Sparkles className="w-5 h-5" />
                <span className="font-black text-sm uppercase tracking-tighter italic">CREATOR STUDIO</span>
              </Link>
            )}
          </div>

          <div className="mt-10 p-6 rounded-2xl bg-gradient-to-br from-primary/10 to-transparent border border-primary/5">
            <Sparkles className="w-5 h-5 text-primary mb-3" />
            <h4 className="text-sm font-bold text-white mb-1">Go Premium</h4>
            <p className="text-xs text-secondary-text mb-4">
              Unlock exclusive courses and certificates.
            </p>
            <button className="w-full py-3 bg-primary text-white text-xs font-black uppercase tracking-widest rounded-xl">
              Upgrade Now
            </button>
          </div>
        </div>

        <div className="p-6 border-t border-border/50 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-muted border border-border flex items-center justify-center text-primary font-bold">
              {profile?.name?.charAt(0) || "U"}
            </div>
            <div>
              <p className="text-sm font-bold text-white">{profile?.name || "Student"}</p>
              <p className="text-[10px] text-secondary-text uppercase tracking-widest">{profile?.role || "Basic Plan"}</p>
            </div>
          </div>
          
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 text-secondary-text hover:text-danger w-full px-2"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm font-bold">Log out</span>
          </button>
        </div>
      </aside>
    </div>
  );
}
