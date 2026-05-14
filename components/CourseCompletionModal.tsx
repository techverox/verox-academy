"use client";

import { useEffect, useState } from "react";
import { Trophy, Award, ArrowRight, Home, Sparkles, Share2, Download, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

interface CourseCompletionModalProps {
  courseTitle: string;
  courseId: string;
  userId: string;
  onClose: () => void;
}

export function CourseCompletionModal({ courseTitle, courseId, userId, onClose }: CourseCompletionModalProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={cn(
      "fixed inset-0 z-[100] flex items-center justify-center p-6 transition-all duration-1000",
      isVisible ? "bg-black/90 backdrop-blur-xl" : "bg-transparent opacity-0"
    )}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
        className="relative w-full max-w-3xl overflow-hidden rounded-[4rem] border border-white/10 bg-zinc-950 p-12 text-center shadow-2xl md:p-20"
      >
        {/* Cinematic Background */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(37,99,235,0.15),transparent_70%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:40px_40px] opacity-20" />
        
        <div className="relative z-10 space-y-12">
          {/* Achievement Badge */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-accent/20 rounded-[3rem] blur-2xl animate-pulse" />
              <div className="relative h-32 w-32 rounded-[3rem] bg-accent/10 border border-accent/20 flex items-center justify-center text-accent shadow-2xl">
                <Trophy className="h-16 w-16 drop-shadow-[0_0_20px_rgba(37,99,235,0.5)]" />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-center gap-3 text-accent font-bold text-[10px] uppercase tracking-[0.5em]">
               <Sparkles className="w-5 h-5" />
               Mastery Achieved
            </div>
            
            <h2 className="text-5xl font-bold tracking-tighter text-white md:text-6xl lg:text-7xl leading-none text-balance">
              Course Completed.
            </h2>
            
            <p className="mx-auto max-w-lg text-xl font-medium text-zinc-400 leading-relaxed">
              Congratulations. You have successfully mastered <span className="text-white font-bold underline decoration-accent decoration-4 underline-offset-8">{courseTitle}</span>. Your verified credentials are now active.
            </p>
          </div>

          <div className="pt-12 flex flex-col sm:flex-row items-center justify-center gap-6">
             <Link href="/dashboard/" className="w-full sm:w-auto">
               <Button variant="outline" className="w-full h-16 px-10 rounded-2xl font-bold uppercase tracking-widest text-[11px] border-white/10 hover:bg-white/5 group">
                 <Home className="w-4 h-4 mr-3" />
                 Return to Workspace
               </Button>
             </Link>
             
             <Link href={`/verify-certificate/${userId}_${courseId}`} className="w-full sm:w-auto">
               <Button variant="primary" className="w-full h-16 px-12 rounded-2xl font-bold uppercase tracking-[0.2em] text-[11px] shadow-2xl shadow-accent/40 group">
                 View Certificate
                 <Award className="w-4 h-4 ml-3 group-hover:rotate-12 transition-transform" />
               </Button>
             </Link>
          </div>

          <div className="pt-16 border-t border-white/5 flex flex-wrap items-center justify-center gap-10">
             <button className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:text-white transition-colors">
                <Share2 className="w-4 h-4" /> Share Achievement
             </button>
             <button className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:text-white transition-colors">
                <Download className="w-4 h-4" /> Download Assets
             </button>
             <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-emerald-500/60">
                <CheckCircle2 className="w-4 h-4" /> Verified Credentials
             </div>
          </div>
        </div>

        <button 
          onClick={onClose}
          className="absolute top-10 right-10 text-zinc-600 hover:text-white transition-colors"
        >
          <ArrowRight className="w-8 h-8 rotate-45" />
        </button>
      </motion.div>
    </div>
  );
}

import { cn } from "@/lib/utils";
