"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { PublicShell } from "./PublicShell";
import { DashboardShell } from "./DashboardShell";
import { AuthShell } from "./AuthShell";
import { LearningShell } from "./LearningShell";

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();

  // Route Classification
  const isAdmin = pathname?.startsWith("/admin");
  const isCreator = pathname?.startsWith("/creator");
  const isStudent = pathname?.startsWith("/dashboard") || 
                    pathname?.startsWith("/settings") || 
                    pathname?.startsWith("/certificates") || 
                    pathname?.startsWith("/wishlist");
  
  const isAuth = pathname?.startsWith("/login") || 
                 pathname?.startsWith("/register") || 
                 pathname?.startsWith("/forgot-password");
  
  const isLearnViewer = pathname?.startsWith("/learn/viewer");

  // Selection Logic
  if (isLearnViewer) return <LearningShell>{children}</LearningShell>;
  
  if (isAdmin) return <DashboardShell type="admin">{children}</DashboardShell>;
  if (isCreator) return <DashboardShell type="creator">{children}</DashboardShell>;
  if (isStudent) return <DashboardShell type="student">{children}</DashboardShell>;
  
  if (isAuth) {
    const isLogin = pathname?.startsWith("/login");
    return (
      <AuthShell 
        title={isLogin ? "Welcome back" : "Initialize Account"} 
        subtitle={isLogin ? "Enter your credentials to access your workspace." : "Join the next generation of digital creators."}
      >
        {children}
      </AuthShell>
    );
  }

  // Public pages (Home, Courses, Blog, etc.)
  return <PublicShell>{children}</PublicShell>;
}
