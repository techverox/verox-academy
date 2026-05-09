export default function CourseSkeleton() {
  return (
    <div className="flex animate-pulse flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <div className="aspect-video w-full bg-zinc-100 dark:bg-zinc-900" />
      <div className="flex flex-1 flex-col p-5">
        <div className="h-6 w-3/4 rounded-md bg-zinc-100 dark:bg-zinc-900" />
        <div className="mt-3 h-4 w-full rounded-md bg-zinc-100 dark:bg-zinc-900" />
        <div className="mt-1 h-4 w-5/6 rounded-md bg-zinc-100 dark:bg-zinc-900" />
        <div className="mt-8 flex items-center justify-between border-t border-zinc-100 pt-4 dark:border-zinc-900">
          <div className="h-8 w-16 rounded-md bg-zinc-100 dark:bg-zinc-900" />
          <div className="h-10 w-24 rounded-full bg-zinc-100 dark:bg-zinc-900" />
        </div>
      </div>
    </div>
  );
}
