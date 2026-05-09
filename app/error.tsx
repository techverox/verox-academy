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
        <div className="flex h-24 w-24 items-center justify-center rounded-[2rem] bg-red-50 text-red-600 dark:bg-red-950/20 dark:text-red-500">
          <svg className="h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <div className="absolute -right-2 -top-2 h-8 w-8 animate-ping rounded-full bg-red-500/20" />
      </div>

      <h1 className="mt-10 text-4xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">
        Something went wrong
      </h1>
      
      <p className="mt-4 max-w-md text-lg font-medium text-zinc-500 dark:text-zinc-400">
        We encountered an unexpected error. This might be due to a temporary connection issue or a broken link.
      </p>

      <div className="mt-12 flex flex-col sm:flex-row items-center gap-4">
        <button
          onClick={() => reset()}
          className="w-full sm:w-auto rounded-full bg-zinc-900 px-10 py-4 text-sm font-black text-zinc-50 transition-all hover:scale-105 active:scale-95 dark:bg-zinc-50 dark:text-zinc-900 shadow-xl"
        >
          Try Again
        </button>
        <Link
          href="/"
          className="w-full sm:w-auto rounded-full border border-zinc-200 bg-white px-10 py-4 text-sm font-black text-zinc-900 transition-all hover:bg-zinc-50 dark:border-zinc-800 dark:bg-black dark:text-zinc-50"
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
