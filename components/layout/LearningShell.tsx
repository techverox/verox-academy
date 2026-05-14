"use client";

import { ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface LearningShellProps {
  children: ReactNode;
}

export function LearningShell({ children }: LearningShellProps) {
  return (
    <div className="flex h-screen flex-col bg-background text-foreground overflow-hidden font-sans selection:bg-accent selection:text-white">
      <AnimatePresence mode="wait">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="flex-1 flex flex-col overflow-hidden"
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
