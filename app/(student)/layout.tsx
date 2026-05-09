"use client";

import { useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import AppSidebar from "@/components/dashboard/AppSidebar";
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
      <div className="flex min-h-screen bg-background text-foreground">
        {/* Desktop Sidebar */}
        <AppSidebar />

        {/* Mobile Sidebar */}
        <MobileSidebar 
          isOpen={isMobileSidebarOpen} 
          onClose={() => setIsMobileSidebarOpen(false)} 
        />

        {/* Main Content Area */}
        <div className="flex flex-1 flex-col lg:pl-[var(--sidebar-width,260px)]">
          <TopNavbar onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)} />
          
          <main className="flex-1 p-6 lg:p-10">
            <div className="mx-auto max-w-7xl">
              {children}
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
