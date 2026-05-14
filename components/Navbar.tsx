"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/Button";
import { Menu, X, ChevronRight, Sparkles, Globe, Command, Search, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { ContentContainer } from "@/components/layout/ContentContainer";

export default function Navbar() {
  const { user, isAdmin, isCreator } = useAuth();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close menu on navigation
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  const navLinks = [
    { name: "Courses", href: "/courses" },
    { name: "Apply as Creator", href: "/become-creator" },
  ];

  return (
    <nav 
      className={cn(
        "fixed top-0 left-0 right-0 z-100 transition-all duration-300",
        scrolled 
          ? "bg-background/80 backdrop-blur-xl border-b border-border/50 py-2 shadow-sm" 
          : "bg-transparent border-b border-transparent py-4"
      )}
    >
      <ContentContainer className="flex items-center justify-between">
        <div className="flex items-center gap-12">
          {/* Branding - Techverox Style */}
          <Link href="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="relative h-10 w-10 flex items-center justify-center transition-all duration-500 group-hover:scale-105">
              <svg viewBox="0 0 40 40" className="w-full h-full text-primary fill-current">
                <path d="M20 0L40 10V30L20 40L0 30V10L20 0Z" className="opacity-10" />
                <path d="M10 15L20 10L30 15L20 20L10 15Z" />
                <path d="M10 25L20 20L30 25L20 30L10 25Z" />
                <path d="M20 10V30" className="stroke-primary stroke-2" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight text-foreground leading-none">
                Techverox
              </span>
              <span className="text-[7px] uppercase tracking-[0.3em] font-bold text-muted-foreground mt-1">
                Architecting the Digital Future
              </span>
            </div>
          </Link>

          {/* Left-aligned Navigation Links */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={cn(
                  "text-[13px] font-semibold uppercase tracking-widest transition-colors hover:text-primary",
                  pathname === link.href ? "text-primary" : "text-muted-foreground/80"
                )}
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>

        {/* Right Actions - Techverox Style */}
        <div className="hidden md:flex items-center gap-6">
          <ThemeToggle />
          {!user ? (
            <Link href="/login">
              <Button className="h-10 px-7 rounded-full bg-linear-to-r from-blue-600 to-cyan-500 text-white font-semibold uppercase tracking-widest text-[10px] shadow-md shadow-blue-500/20 hover:scale-[1.02] transition-all active:scale-95 border-none">
                Login
              </Button>
            </Link>
          ) : (
            <Link href="/dashboard">
              <Button className="h-11 px-8 rounded-full bg-linear-to-r from-blue-500 to-cyan-400 text-white font-bold text-[11px] shadow-lg shadow-blue-500/20">
                Workspace
              </Button>
            </Link>
          )}
        </div>


        {/* Mobile Interaction Toggle - Hardened Touch Targets */}
        <div className="flex items-center gap-3 lg:hidden">
          <ThemeToggle />
          <button 
            className="h-10 w-10 flex items-center justify-center bg-muted/40 border border-border/40 rounded-xl text-foreground active:scale-95 transition-all outline-none"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle Menu"
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </ContentContainer>

      {/* Mobile Sidebar - Enhanced Responsive Logic */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-zinc-950/80 backdrop-blur-md z-150 lg:hidden"
              onClick={() => setIsMenuOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-[80%] max-w-[360px] bg-background border-l border-border/40 z-200 lg:hidden p-6 md:p-8 flex flex-col"
            >
              <div className="flex items-center justify-between mb-12">
                <div className="flex items-center gap-3">
                   <div className="h-9 w-9 flex items-center justify-center bg-primary rounded-xl text-white font-bold text-xl">V</div>
                   <span className="text-base font-bold uppercase tracking-widest text-muted-foreground/40">Navigation</span>
                </div>
                <button 
                  onClick={() => setIsMenuOpen(false)} 
                  className="h-10 w-10 flex items-center justify-center bg-muted/40 rounded-xl active:scale-90 transition-transform"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="space-y-2 flex-1 overflow-y-auto scrollbar-hide py-4">
                {navLinks.map((link, i) => (
                  <motion.div
                    key={link.name}
                    initial={{ opacity: 0, x: 15 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                  >
                    <Link 
                      href={link.href}
                      className={cn(
                        "flex items-center justify-between p-4 rounded-xl border border-transparent transition-all",
                        pathname === link.href 
                          ? "bg-accent/10 border-accent/20 text-accent" 
                          : "text-foreground hover:bg-muted/40"
                      )}
                    >
                      <span className="text-xl font-bold tracking-tighter">{link.name}</span>
                      <ChevronRight className={cn("w-5 h-5 opacity-20", pathname === link.href && "opacity-100")} />
                    </Link>
                  </motion.div>
                ))}
              </nav>

              <div className="space-y-3 pt-8 border-t border-border/40 mt-auto">
                {!user ? (
                  <div className="grid grid-cols-2 gap-3">
                    <Link href="/login">
                      <Button variant="outline" className="w-full h-12 rounded-xl font-bold uppercase tracking-widest text-[9px] border-border/40">
                        Login
                      </Button>
                    </Link>
                    <Link href="/register">
                      <Button variant="gradient" className="w-full h-12 rounded-xl font-bold uppercase tracking-widest text-[9px] shadow-lg shadow-accent/10">
                        Register
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <Link href="/dashboard" className="block">
                    <Button variant="primary" className="w-full h-12 rounded-xl font-bold uppercase tracking-widest text-[9px] shadow-xl shadow-primary/20">
                      Workspace Hub
                    </Button>
                  </Link>
                )}
                
                <div className="flex items-center justify-center gap-4 mt-8 opacity-20">
                   <div className="flex items-center gap-2 text-[8px] font-bold uppercase tracking-[0.4em] leading-none">
                      <Zap className="w-3 h-3" />
                      v1.02
                   </div>
                   <div className="h-3 w-px bg-foreground" />
                   <div className="flex items-center gap-2 text-[8px] font-bold uppercase tracking-[0.4em] leading-none">
                      <Globe className="w-3 h-3" />
                      GLOBAL
                   </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
}
