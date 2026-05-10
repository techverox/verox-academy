"use client";

import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function CreatorProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isCreator, isAdmin, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isCreator && !isAdmin) {
      router.push("/dashboard");
    }
  }, [isCreator, isAdmin, loading, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-zinc-800 border-t-primary" />
      </div>
    );
  }

  return (isCreator || isAdmin) ? <>{children}</> : null;
}
