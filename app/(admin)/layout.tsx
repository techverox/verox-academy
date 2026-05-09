"use client";

import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!profile || profile.role !== "admin") {
        router.push("/dashboard");
      }
    }
  }, [profile, loading, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white dark:bg-black">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-zinc-200 border-t-zinc-900 dark:border-t-zinc-50" />
      </div>
    );
  }

  if (!profile || profile.role !== "admin") {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <nav className="border-b border-zinc-200 bg-white px-4 py-4 dark:border-zinc-800 dark:bg-black">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-900 text-zinc-50 dark:bg-white dark:text-zinc-900 font-black">A</div>
            <h1 className="text-xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">Admin Center</h1>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={() => router.push("/dashboard")}
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
