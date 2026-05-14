"use client";

import { ReactNode, useState, useEffect } from "react";
import { AppSidebar } from "@/components/AppSidebar";
import TopNavbar from "@/components/dashboard/TopNavbar";
import MobileSidebar from "@/components/dashboard/MobileSidebar";
import ProtectedRoute from "@/components/ProtectedRoute";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface DashboardShellProps {
  children: ReactNode;
  type: "admin" | "creator" | "student";
}

export function DashboardShell({ children, type }: DashboardShellProps) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-background text-foreground transition-colors duration-300 overflow-hidden relative">
        {/* Sidebar System - Optimized for Tablet/Desktop */}
        <AppSidebar 
          type={type} 
          isCollapsed={isSidebarCollapsed} 
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
        />

        <div className="flex-1 flex flex-col min-w-0 h-screen relative">
          {/* Topbar System - Touch Optimized */}
          <TopNavbar onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)} />
          
          {/* Main Content with Adaptive Spacing */}
          <main className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide focus-visible:outline-none">
            <AnimatePresence mode="wait">
              <motion.div
                key={type} // Force re-animation on shell type change
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                className="p-4 sm:p-6 md:p-10 lg:p-12 xl:p-16 max-w-[2000px] mx-auto w-full"
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </main>

          {/* Safe Area Inset for Mobile (iOS PWA Support) */}
          <div className="h-[env(safe-area-inset-bottom)] bg-background lg:hidden shrink-0" />
        </div>

        {/* Mobile Sidebar System - Native Feel */}
        <AnimatePresence>
          {isMobileSidebarOpen && (
            <MobileSidebar 
              isOpen={isMobileSidebarOpen} 
              onClose={() => setIsMobileSidebarOpen(false)} 
            />
          )}
        </AnimatePresence>
      </div>
    </ProtectedRoute>
  );
}
