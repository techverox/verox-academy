"use client";

import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function CreatorLayout({ children }: { children: React.ReactNode }) {
  const { isCreator, isAdmin, loading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login");
        return;
      }
      
      if (!isCreator && !isAdmin) {
        router.push("/dashboard");
      }
    }
  }, [isCreator, isAdmin, loading, router, user]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-border border-t-accent" />
      </div>
    );
  }

  if (!isCreator && !isAdmin) return null;

  return <>{children}</>;
}
