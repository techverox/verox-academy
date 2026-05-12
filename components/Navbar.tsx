"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Menu, X, ChevronRight, Zap } from "lucide-react";

export default function Navbar() {
  const { user, isAdmin, isCreator } = useAuth();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isDashboard = pathname?.startsWith("/dashboard") || 
                      pathname?.startsWith("/admin") || 
                      pathname?.startsWith("/creator") ||
                      pathname?.startsWith("/learn") || 
                      pathname?.startsWith("/settings") || 
                      pathname?.startsWith("/certificates") || 
                      pathname?.startsWith("/wishlist") ||
                      pathname?.startsWith("/login") ||
                      pathname?.startsWith("/register") ||
                      pathname?.startsWith("/forgot-password");

  if (isDashboard) return null;

  const navLinks = [
    { name: "Courses", href: "/courses" },
    { name: "Blog", href: "/blog" },
    { name: "Creators", href: "/top-creators" },
    { name: "Pricing", href: "/enterprise" },
  ];

  return (
    <nav className={`fixed top-0 z-50 w-full transition-all duration-300 ${scrolled ? 'py-2' : 'py-6'}`}>
      <div className="container mx-auto px-6 max-w-7xl">
        <div className={`relative flex items-center justify-between px-6 h-16 rounded-2xl border transition-all duration-300 ${scrolled ? 'bg-background/80 backdrop-blur-md border-border shadow-sm' : 'bg-transparent border-transparent'}`}>
          
          {/* Brand Identity */}
          <Link href="/" className="group flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-foreground text-background flex items-center justify-center font-bold text-lg transition-transform group-hover:scale-105">
              V
            </div>
            <span className="text-xl font-bold tracking-tight text-foreground">
              Verox<span className="text-primary">.</span>
            </span>
          </Link>

          {/* Core Navigation */}
          <div className="hidden md:flex items-center gap-1 bg-secondary/30 p-1 rounded-xl border border-border/40">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${
                  pathname === link.href
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Action Hub */}
          <div className="hidden md:flex items-center gap-4">
            <ThemeToggle />
            <div className="h-4 w-px bg-border/60" />
            
            {user ? (
               <Link href={isAdmin ? "/admin/" : isCreator ? "/creator/" : "/dashboard/"}>
                  <button className="h-10 px-6 bg-foreground text-background text-xs font-semibold rounded-lg hover:bg-foreground/90 transition-all shadow-sm">
                    Dashboard
                  </button>
               </Link>
            ) : (
              <div className="flex items-center gap-4">
                 <Link href="/login/" className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">
                    Login
                 </Link>
                 <Link href="/login/">
                    <button className="h-10 px-6 bg-primary text-primary-foreground text-xs font-semibold rounded-lg shadow-sm hover:bg-primary/90 transition-all flex items-center gap-2">
                       Join Free
                       <ChevronRight className="w-4 h-4" />
                    </button>
                 </Link>
              </div>
            )}
          </div>

          {/* Mobile Toggle */}
          <button 
            className="md:hidden p-2 bg-secondary rounded-lg text-foreground"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Experience */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-[-1] bg-background/95 backdrop-blur-xl md:hidden pt-24 p-6 animate-in fade-in duration-200">
           <div className="space-y-2">
              {navLinks.map((link) => (
                 <Link 
                   key={link.href} 
                   href={link.href}
                   onClick={() => setIsMenuOpen(false)}
                   className="block p-4 rounded-xl bg-secondary/50 border border-border/50 text-xl font-bold text-foreground"
                 >
                   {link.name}
                 </Link>
              ))}
              <div className="pt-4 space-y-3">
                 <Link href="/login/" className="block w-full">
                    <button className="w-full h-14 bg-primary text-primary-foreground text-base font-bold rounded-xl">
                       Get Started
                    </button>
                 </Link>
              </div>
           </div>
        </div>
      )}
    </nav>
  );
}
