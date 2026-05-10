/**
 * Admin Layout — Custom Claims-Based Access Control
 * ===================================================
 * Uses Firebase Custom Claims for admin verification.
 * Falls back to Firestore profile role for backward compatibility.
 *
 * UPGRADE:
 * - Previously: Read Firestore doc → check role field (slow, extra read)
 * - Now: Read token claims → instant admin verification (zero Firestore reads)
 *
 * SECURITY:
 * - Custom claims are set server-side and cannot be spoofed by the client
 * - Token claims are verified by Firebase infrastructure
 * - Prevents admin page flickering (instant check, no async wait)
 */

"use client";

import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isAdmin, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAdmin) {
      router.push("/dashboard/");
    }
  }, [isAdmin, loading, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white dark:bg-black">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-zinc-200 border-t-zinc-900 dark:border-t-zinc-50" />
      </div>
    );
  }

  if (!isAdmin) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <nav className="border-b border-zinc-200 bg-white px-4 py-4 dark:border-zinc-800 dark:bg-black">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-900 text-zinc-50 dark:bg-white dark:text-zinc-900 font-black">A</div>
              <h1 className="text-xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">Admin Center</h1>
            </div>
            <div className="hidden md:flex items-center gap-6">
              <button onClick={() => router.push("/admin/")} className="text-sm font-black uppercase tracking-widest text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors">Dashboard</button>
              <button onClick={() => router.push("/admin/courses/")} className="text-sm font-black uppercase tracking-widest text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors">Courses</button>
            </div>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={() => router.push("/dashboard/")}
              className="text-sm font-bold text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
            >
              Back to Student View
            </button>
          </div>
        </div>
      </nav>
      <main className="container mx-auto p-4 md:p-8">
        {children}
      </main>
    </div>
  );
}
