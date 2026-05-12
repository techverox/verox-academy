"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Sparkles, ChevronRight, PlayCircle, Zap, ShieldCheck } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 py-32 bg-background transition-colors duration-500">
      {/* Background Intelligence Layer */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] h-[800px] w-[800px] rounded-full bg-primary/20 blur-[160px] animate-pulse opacity-40 dark:opacity-20" />
        <div className="absolute bottom-[-10%] right-[-10%] h-[700px] w-[700px] rounded-full bg-blue-500/10 blur-[140px] animate-pulse delay-1000 opacity-40 dark:opacity-20" />
        
        {/* Synthetic Grid Mesh */}
        <div className="absolute inset-0 bg-primary/5 mask-[radial-gradient(ellipse_at_center,white,transparent)] dark:opacity-20 opacity-5"></div>
        
        {/* Floating Particles Simulation */}
        <div className="absolute inset-0 overflow-hidden opacity-30">
           <div className="absolute h-1 w-1 bg-primary rounded-full top-[20%] left-[30%] animate-ping duration-[3s]" />
           <div className="absolute h-1.5 w-1.5 bg-blue-500 rounded-full top-[60%] left-[80%] animate-ping duration-[4s] delay-700" />
           <div className="absolute h-1 w-1 bg-purple-500 rounded-full top-[40%] left-[10%] animate-ping duration-[5s] delay-1000" />
        </div>
      </div>

      <div className="container mx-auto max-w-7xl text-center z-10 relative">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="inline-flex items-center gap-3 rounded-full border border-primary/20 bg-primary/5 px-6 py-2.5 text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-12 shadow-[0_0_40px_rgba(139,92,246,0.1)] backdrop-blur-xl"
        >
          <div className="h-2 w-2 rounded-full bg-primary animate-pulse shadow-[0_0_10px_rgba(139,92,246,1)]" />
          Neural Synthesis Engine v4.0 Active
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-4 mb-10"
        >
          <h1 className="text-7xl md:text-[9rem] lg:text-[11rem] font-black tracking-tight leading-[0.85] text-foreground">
             ARCHITECT <br />
             <span className="text-primary italic">YOUR</span> LEGACY.
          </h1>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
          className="mx-auto max-w-3xl text-xl md:text-3xl text-muted-foreground mb-16 leading-relaxed font-medium"
        >
          Verox Academy is the elite-tier ecosystem for intellectual transformation. 
          Experience a cinematic education architecture designed for global market dominance.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.6, ease: "easeOut" }}
          className="flex flex-col sm:flex-row items-center justify-center gap-8"
        >
          <Link href="/courses">
            <button className="h-20 px-14 rounded-5xl bg-primary text-primary-foreground text-[12px] font-black uppercase tracking-widest shadow-2xl shadow-primary/30 hover:scale-[1.05] active:scale-95 transition-all flex items-center gap-4">
              Explore The Registry
              <ChevronRight className="w-5 h-5" />
            </button>
          </Link>
          <Link href="/login/">
            <button className="h-20 px-14 rounded-5xl border border-border bg-card text-foreground text-[12px] font-black uppercase tracking-widest hover:bg-secondary transition-all flex items-center gap-4 group">
              <PlayCircle className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
              Initialize Session
            </button>
          </Link>
        </motion.div>

        {/* Global Network Indicators */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2, delay: 1 }}
          className="mt-32 pt-20 border-t border-border/50 max-w-5xl mx-auto"
        >
           <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
              <div className="space-y-2">
                 <div className="flex items-center justify-center gap-2 text-primary">
                    <Zap className="w-4 h-4" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Throughput</span>
                 </div>
                 <p className="text-2xl font-black text-foreground tracking-tight">1.2M+ Pulses</p>
              </div>
              <div className="space-y-2">
                 <div className="flex items-center justify-center gap-2 text-primary">
                    <ShieldCheck className="w-4 h-4" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Verified</span>
                 </div>
                 <p className="text-2xl font-black text-foreground tracking-tight">45k Graduates</p>
              </div>
              <div className="space-y-2">
                 <div className="flex items-center justify-center gap-2 text-primary">
                    <Sparkles className="w-4 h-4" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Growth</span>
                 </div>
                 <p className="text-2xl font-black text-foreground tracking-tight">92% ROI Index</p>
              </div>
              <div className="space-y-2">
                 <div className="flex items-center justify-center gap-2 text-primary">
                    <PlayCircle className="w-4 h-4" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Active</span>
                 </div>
                 <p className="text-2xl font-black text-foreground tracking-tight">850 Masters</p>
              </div>
           </div>
        </motion.div>
      </div>

      {/* Decorative Verox Pulse */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 opacity-20">
         <div className="w-px h-20 bg-linear-to-b from-primary to-transparent" />
         <span className="text-[10px] font-black uppercase tracking-[0.5em] animate-pulse">Synchronize</span>
      </div>
    </section>
  );
}
