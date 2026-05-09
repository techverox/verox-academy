export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-zinc-50 dark:bg-zinc-950">
      <div className="z-10 max-w-5xl w-full items-center justify-center font-mono text-sm flex flex-col gap-8">
        <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-6xl text-center">
          Verox Academy
        </h1>
        <p className="text-xl text-zinc-600 dark:text-zinc-400 text-center max-w-2xl">
          The future of SaaS Learning Management Systems. Project foundation initialized successfully.
        </p>
        <div className="flex gap-4">
          <div className="px-4 py-2 rounded-full border border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400">
            Next.js 15
          </div>
          <div className="px-4 py-2 rounded-full border border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400">
            Tailwind CSS 4
          </div>
          <div className="px-4 py-2 rounded-full border border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400">
            Firebase SDK v9
          </div>
        </div>
      </div>
    </main>
  );
}
