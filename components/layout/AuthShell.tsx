"use client";

import { ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ShieldCheck, Star, Zap, Command, Globe, Sparkles, CheckCircle2, Award, Users, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface AuthShellProps {
  children: ReactNode;
  title: string;
  subtitle: string;
}

export function AuthShell({ children, title, subtitle }: AuthShellProps) {
  return (
    <div className="flex min-h-screen flex-col bg-background selection:bg-accent selection:text-white">
      <Navbar />
      
      <main className="flex-1 flex items-center justify-center py-20 px-6">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(37,99,235,0.04),transparent_60%)] pointer-events-none" />
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
          className="w-full max-w-[480px] bg-surface border border-border/60 rounded-5xl p-8 md:p-12 shadow-2xl shadow-black/3 relative z-10"
        >
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tighter">
              <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-cyan-500">{title}</span>
            </h2>
            <p className="text-muted-foreground font-medium text-sm md:text-base leading-relaxed max-w-[320px] mx-auto">{subtitle}</p>
          </div>

          <div className="space-y-10">
            {children}
          </div>

          <div className="pt-12 mt-12 border-t border-border/40 text-center">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground/30">
              Secured by Verox Protocols
            </p>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}

