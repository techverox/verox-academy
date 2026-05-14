export default function CourseSkeleton() {
  return (
    <div className="group flex flex-col overflow-hidden rounded-[2rem] border border-zinc-100 bg-white shadow-sm dark:border-zinc-900 dark:bg-zinc-950/50">
      {/* Thumbnail Skeleton */}
      <div className="relative aspect-video w-full overflow-hidden bg-zinc-50 dark:bg-zinc-900/50 animate-pulse">
        <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/5 to-transparent skew-x-12 animate-[shimmer_2s_infinite]" />
      </div>
      
      {/* Content Skeleton */}
      <div className="flex flex-1 flex-col p-6">
        <div className="space-y-4 flex-1">
          <div className="h-7 w-3/4 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 animate-pulse" />
          <div className="space-y-2">
            <div className="h-4 w-full rounded-lg bg-zinc-50 dark:bg-zinc-900/50 animate-pulse" />
            <div className="h-4 w-2/3 rounded-lg bg-zinc-50 dark:bg-zinc-900/50 animate-pulse" />
          </div>
        </div>
        
        {/* Footer Skeleton */}
        <div className="mt-8 flex items-center justify-between border-t border-zinc-50 pt-6 dark:border-zinc-900/50">
          <div className="space-y-1">
            <div className="h-3 w-10 rounded-full bg-zinc-50 dark:bg-zinc-900/50 animate-pulse" />
            <div className="h-6 w-16 rounded-lg bg-zinc-50 dark:bg-zinc-900/50 animate-pulse" />
          </div>
          <div className="h-11 w-28 rounded-full bg-zinc-50 dark:bg-zinc-900/50 animate-pulse" />
        </div>
      </div>
    </div>
  );
}
