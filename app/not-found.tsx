import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4 text-center dark:bg-black">
      <div className="text-8xl font-black text-zinc-100 dark:text-zinc-900">
        404
      </div>
      <h1 className="mt-8 text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">
        Page Not Found
      </h1>
      <p className="mt-4 max-w-md text-lg font-medium text-zinc-500 dark:text-zinc-400">
        Oops! The page you are looking for doesn&apos;t exist or has been moved.
      </p>
      <div className="mt-10">
        <Link
          href="/"
          className="rounded-full bg-zinc-900 px-10 py-4 text-sm font-bold text-zinc-50 shadow-xl transition-all hover:scale-105 active:scale-95 dark:bg-zinc-50 dark:text-zinc-900"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
}
