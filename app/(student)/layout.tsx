"use client";

import { useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { AppSidebar } from "@/components/AppSidebar";
import TopNavbar from "@/components/dashboard/TopNavbar";
import MobileSidebar from "@/components/dashboard/MobileSidebar";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-background text-foreground transition-colors duration-300">
        <AppSidebar type="student" />

        <div className="flex-1 flex flex-col min-w-0">
          <TopNavbar onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)} />
          
          <main className="flex-1 overflow-y-auto p-6 md:p-12 lg:p-20">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>

        <MobileSidebar 
          isOpen={isMobileSidebarOpen} 
          onClose={() => setIsMobileSidebarOpen(false)} 
        />
      </div>
    </ProtectedRoute>
  );
}
