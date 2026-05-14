"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { AlertCircle, ArrowLeft, RefreshCw, ShieldAlert } from "lucide-react";
import { motion } from "framer-motion";

/**
 * Premium Global Error Boundary
 * =============================
 * Gracefully handles runtime exceptions with a brand-consistent UI.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error for infrastructure monitoring
    console.error("Critical System Fault Captured:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(37,99,235,0.02),transparent)] pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 space-y-12 max-w-xl"
      >
        <div className="flex flex-col items-center gap-6">
          <div className="h-20 w-20 rounded-4xl bg-destructive/10 border border-destructive/20 flex items-center justify-center text-destructive shadow-2xl shadow-destructive/5 relative group">
             <ShieldAlert className="w-10 h-10 group-hover:scale-110 transition-transform duration-700" />
             <div className="absolute -inset-4 bg-destructive/5 blur-2xl rounded-full opacity-50" />
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-[0.4em] text-destructive/60">
              <AlertCircle className="w-3.5 h-3.5" />
              Runtime Exception Captured
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tighter text-foreground leading-none">
              System <span className="text-transparent bg-clip-text bg-linear-to-r from-foreground to-foreground/50">Disruption.</span>
            </h1>
            <p className="text-muted-foreground font-medium text-base md:text-lg leading-relaxed">
              Verox core services encountered an unexpected protocol error. Our engineers have been notified of this disruption.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:flex items-center justify-center gap-4">
          <Button
            onClick={() => reset()}
            className="h-14 px-10 rounded-2xl font-bold uppercase tracking-widest text-[10px] md:text-[11px] w-full sm:w-auto shadow-2xl shadow-primary/20"
          >
            <RefreshCw className="mr-3 w-4 h-4" />
            Resume Protocol
          </Button>
          <Link href="/" className="w-full sm:w-auto">
            <Button
              variant="outline"
              className="h-14 px-10 rounded-2xl font-bold uppercase tracking-widest text-[10px] md:text-[11px] border-border/60 hover:bg-muted w-full sm:w-auto"
            >
              <ArrowLeft className="mr-3 w-4 h-4" />
              Platform Origin
            </Button>
          </Link>
        </div>

        <div className="pt-12 border-t border-border/40">
           <div className="flex flex-col items-center gap-3">
              <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-muted-foreground/30">Trace Identifier</p>
              <code className="px-4 py-2 bg-muted/40 rounded-xl text-[10px] font-bold text-muted-foreground/60 border border-border/40">
                {error.digest || "VX-" + Math.random().toString(36).substring(7).toUpperCase()}
              </code>
           </div>
        </div>
      </motion.div>
    </div>
  );
}
