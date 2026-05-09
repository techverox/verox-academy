"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const pathname = usePathname();

  // Hide global footer on dashboard routes
  const isDashboard = pathname?.startsWith("/dashboard") || 
                      pathname?.startsWith("/admin") || 
                      pathname?.startsWith("/learn") || 
                      pathname?.startsWith("/settings") || 
                      pathname?.startsWith("/certificates") || 
                      pathname?.startsWith("/wishlist");

  if (isDashboard) {
    return null;
  }

  return (
    <footer className="border-t border-zinc-100 bg-white dark:border-zinc-900 dark:bg-black">
      <div className="container mx-auto px-4 py-12 md:px-8">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2">
              <div className="h-6 w-6 rounded bg-zinc-900 flex items-center justify-center dark:bg-white text-xs font-black text-white dark:text-zinc-900">V</div>
              <span className="text-lg font-black tracking-tight text-zinc-900 dark:text-zinc-50">Verox Academy</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm font-medium text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Empowering the next generation of creators with professional Indian-style education.
            </p>
          </div>

          {/* Platform */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-900 dark:text-zinc-50">Platform</h4>
            <ul className="mt-6 space-y-4 text-sm font-bold text-zinc-500 dark:text-zinc-400">
              <li><Link href="/courses" className="hover:text-zinc-900 dark:hover:text-zinc-50">All Courses</Link></li>
              <li><Link href="/dashboard" className="hover:text-zinc-900 dark:hover:text-zinc-50">Student Dashboard</Link></li>
              <li><Link href="/#pricing" className="hover:text-zinc-900 dark:hover:text-zinc-50">Pricing Plans</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-900 dark:text-zinc-50">Company</h4>
            <ul className="mt-6 space-y-4 text-sm font-bold text-zinc-500 dark:text-zinc-400">
              <li><Link href="/contact" className="hover:text-zinc-900 dark:hover:text-zinc-50">Contact Us</Link></li>
              <li><Link href="/privacy" className="hover:text-zinc-900 dark:hover:text-zinc-50">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-zinc-900 dark:hover:text-zinc-50">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-16 border-t border-zinc-100 pt-8 dark:border-zinc-900 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs font-bold text-zinc-400">
            © {currentYear} Verox Academy. All rights reserved.
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50">
              <span className="sr-only">Twitter</span>
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.84 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
            </a>
            {/* Add more icons as needed */}
          </div>
        </div>
      </div>
    </footer>
  );
}
