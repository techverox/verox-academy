"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error for debugging
    console.error("Global Error Boundary caught:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4 text-center dark:bg-black">
      <div className="relative">
        <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
          <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
      </div>

      <h1 className="mt-8 text-2xl font-bold tracking-tight text-foreground">
        Something went wrong
      </h1>
      
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        We encountered an unexpected error. Please try again or return home.
      </p>

      <div className="mt-10 flex flex-col sm:flex-row items-center gap-3">
        <button
          onClick={() => reset()}
          className="w-full sm:w-auto rounded-lg bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground transition-all hover:bg-primary/90 shadow-sm"
        >
          Try Again
        </button>
        <Link
          href="/"
          className="w-full sm:w-auto rounded-lg border border-border bg-background px-6 py-2.5 text-sm font-bold text-foreground transition-all hover:bg-secondary"
        >
          Back to Home
        </Link>
      </div>

      <p className="mt-12 text-xs font-bold uppercase tracking-widest text-zinc-400">
        Error Digest: {error.digest || "N/A"}
      </p>
    </div>
  );
}
