"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4 text-center dark:bg-black">
      <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-red-50 text-red-600 dark:bg-red-950/20 dark:text-red-500">
        <svg className="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <h1 className="mt-8 text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">
        Something went wrong
      </h1>
      <p className="mt-4 max-w-md text-lg font-medium text-zinc-500 dark:text-zinc-400">
        An unexpected error occurred. Our team has been notified. Please try again or return home.
      </p>
      <div className="mt-10 flex items-center gap-4">
        <button
          onClick={() => reset()}
          className="rounded-full bg-zinc-900 px-8 py-3 text-sm font-bold text-zinc-50 transition-all hover:scale-105 active:scale-95 dark:bg-zinc-50 dark:text-zinc-900"
        >
          Try Again
        </button>
        <a
          href="/"
          className="rounded-full border border-zinc-200 bg-white px-8 py-3 text-sm font-bold text-zinc-900 transition-all hover:bg-zinc-50 dark:border-zinc-800 dark:bg-black dark:text-zinc-50"
        >
          Go Home
        </a>
      </div>
    </div>
  );
}
