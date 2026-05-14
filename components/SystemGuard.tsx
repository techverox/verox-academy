"use client";

import React, { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import { AlertCircle, X, Sparkles, ShieldAlert } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";

export function SystemGuard({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<any>(null);
  const [showAnnouncement, setShowAnnouncement] = useState(true);

  useEffect(() => {
    // We use onSnapshot for real-time reactivity to admin changes
    const unsub = onSnapshot(doc(db, "systemConfig", "global"), 
      (snap) => {
        if (snap.exists()) {
          setConfig(snap.data());
        }
      },
      (error) => {
        // Handle gracefully to prevent console spam for unauthorized listeners
        if (error.code !== "permission-denied") {
          console.error("[SYSTEM] Config sync error:", error);
        }
      }
    );
    return () => unsub();
  }, []);

  // Maintenance Mode View
  if (config?.maintenanceMode) {
    return (
      <div className="fixed inset-0 z-9999 bg-zinc-950 flex items-center justify-center p-6 text-center">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(37,99,235,0.1),transparent_50%)]" />
        <div className="max-w-md space-y-8 relative z-10">
          <div className="w-24 h-24 rounded-4xl bg-blue-600/10 border border-blue-600/20 flex items-center justify-center mx-auto animate-pulse">
            <ShieldAlert className="w-12 h-12 text-blue-600" />
          </div>
          <div className="space-y-4">
            <h1 className="text-4xl font-bold tracking-tighter text-white">System Optimization.</h1>
            <p className="text-zinc-500 text-sm leading-relaxed">
              We are currently performing critical infrastructure maintenance to improve your experience. Verox Academy will be back online shortly.
            </p>
          </div>
          <div className="pt-4">
            <div className="h-1 w-full bg-zinc-900 rounded-full overflow-hidden">
               <motion.div 
                initial={{ width: 0 }}
                animate={{ width: "60%" }}
                transition={{ duration: 10, repeat: Infinity, repeatType: "reverse" }}
                className="h-full bg-blue-600 shadow-[0_0_20px_rgba(37,99,235,0.6)]" 
               />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Global Announcement Bar */}
      <AnimatePresence>
        {config?.announcement && showAnnouncement && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-linear-to-r from-blue-600 to-cyan-500 text-white relative z-50 overflow-hidden"
          >
            <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-center gap-4">
              <Sparkles className="w-4 h-4 shrink-0 animate-pulse" />
              <p className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-center">
                {config.announcement}
              </p>
              <button 
                onClick={() => setShowAnnouncement(false)}
                className="absolute right-4 p-1 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {children}
    </>
  );
}
