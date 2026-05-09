export default function Home() {
  return (
    <main className="flex min-h-[calc(100vh-64px)] flex-col items-center justify-center p-8 md:p-24 bg-white dark:bg-black">
      <div className="z-10 max-w-5xl w-full items-center justify-center font-sans text-sm flex flex-col gap-12">
        <div className="space-y-6 text-center">
          <h1 className="text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-7xl">
            Empower Your <span className="text-zinc-500">Learning</span>
          </h1>
          <p className="mx-auto max-w-2xl text-xl text-zinc-600 dark:text-zinc-400">
            Verox Academy is the next-generation LMS platform designed for scalability, speed, and premium user experience.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-4">
          <div className="px-6 py-3 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 font-medium shadow-sm">
            Next.js 15
          </div>
          <div className="px-6 py-3 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 font-medium shadow-sm">
            Tailwind CSS 4
          </div>
          <div className="px-6 py-3 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 font-medium shadow-sm">
            Firebase SDK v9
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mt-8">
          <button className="rounded-full bg-zinc-900 px-8 py-4 text-lg font-semibold text-zinc-50 shadow-lg transition-all hover:scale-105 active:scale-95 dark:bg-zinc-50 dark:text-zinc-900">
            Get Started
          </button>
          <button className="rounded-full border border-zinc-200 bg-white px-8 py-4 text-lg font-semibold text-zinc-900 shadow-sm transition-all hover:bg-zinc-50 dark:border-zinc-800 dark:bg-black dark:text-zinc-50 dark:hover:bg-zinc-900">
            View Demo
          </button>
        </div>
      </div>
    </main>
  );
}
