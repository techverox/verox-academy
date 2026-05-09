export default function Loading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white dark:bg-black">
      <div className="relative">
        {/* Outer Ring */}
        <div className="h-16 w-16 rounded-full border-4 border-zinc-100 dark:border-zinc-900" />
        {/* Spinning Indicator */}
        <div className="absolute inset-0 h-16 w-16 animate-spin rounded-full border-4 border-transparent border-t-zinc-900 dark:border-t-zinc-50" />
      </div>
      <p className="mt-6 text-sm font-bold uppercase tracking-[0.2em] text-zinc-500 animate-pulse">
        Verox Academy
      </p>
    </div>
  );
}
