import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="border-b border-zinc-100 bg-white/80 backdrop-blur-md sticky top-0 z-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold tracking-tight">
              Verox<span className="text-zinc-500">Academy</span>
            </Link>
          </div>
          <div className="hidden sm:ml-6 sm:block">
            <div className="flex space-x-8">
              <Link
                href="/courses"
                className="text-sm font-medium text-zinc-600 hover:text-black transition-colors"
              >
                Browse Courses
              </Link>
              <Link
                href="/login"
                className="text-sm font-medium text-zinc-600 hover:text-black transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="rounded-full bg-black px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 transition-colors"
              >
                Get Started
              </Link>
            </div>
          </div>
          <div className="sm:hidden">
            {/* Mobile menu button placeholder */}
            <button className="text-zinc-600">
              <span className="sr-only">Open main menu</span>
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
