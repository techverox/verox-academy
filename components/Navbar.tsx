"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function Navbar() {
  const { user, profile } = useAuth();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Hide global navbar on dashboard, learn, and admin routes
  const isDashboard = pathname?.startsWith("/dashboard") || 
                      pathname?.startsWith("/admin") || 
                      pathname?.startsWith("/learn") || 
                      pathname?.startsWith("/settings") || 
                      pathname?.startsWith("/certificates") || 
                      pathname?.startsWith("/wishlist");

  if (isDashboard) {
    return null;
  }

  const navLinks = [
    { name: "Courses", href: "/courses/" },
    { name: "Pricing", href: "/#pricing" },
    ...(profile?.role === "admin" ? [{ name: "Admin Dashboard", href: "/admin/" }] : []),
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-zinc-200 bg-white/80 backdrop-blur-md dark:border-zinc-800 dark:bg-black/80">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-8">
            <Link href="/" className="group flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-zinc-900 flex items-center justify-center dark:bg-white">
                <span className="text-zinc-50 dark:text-zinc-900 font-black text-xl">V</span>
              </div>
              <span className="text-xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">
                Verox Academy
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex md:items-center md:gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-full px-4 py-2 text-sm font-bold transition-all ${
                    isActive(link.href)
                      ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-900 dark:text-zinc-50"
                      : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900/50 dark:hover:text-zinc-50"
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:block">
              {user ? (
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => signOut(auth)}
                    className="text-sm font-bold text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
                  >
                    Logout
                  </button>
                  {profile?.role === "admin" ? (
                    <Link
                      href="/admin/"
                      className="rounded-full bg-red-600 px-6 py-2.5 text-sm font-black uppercase tracking-widest text-white transition-all hover:scale-105 active:scale-95 shadow-lg shadow-red-500/20"
                    >
                      Go to Admin
                    </Link>
                  ) : (
                    <Link
                      href="/dashboard/"
                      className="rounded-full bg-zinc-900 px-6 py-2.5 text-sm font-bold text-zinc-50 transition-all hover:scale-105 active:scale-95 dark:bg-zinc-50 dark:text-zinc-900"
                    >
                      Dashboard
                    </Link>
                  )}
                </div>
              ) : (
                <Link
                  href="/login/"
                  className="rounded-full bg-zinc-900 px-8 py-2.5 text-sm font-bold text-zinc-50 transition-all hover:scale-105 active:scale-95 dark:bg-zinc-50 dark:text-zinc-900"
                >
                  Login
                </Link>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200 bg-white transition-all active:scale-95 md:hidden dark:border-zinc-800 dark:bg-zinc-950"
            >
              <svg
                className={`h-6 w-6 text-zinc-900 transition-transform dark:text-zinc-50 ${
                  isMenuOpen ? "rotate-90" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="border-t border-zinc-200 bg-white p-4 md:hidden dark:border-zinc-800 dark:bg-black">
          <div className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMenuOpen(false)}
                className={`rounded-2xl px-4 py-4 text-lg font-bold ${
                  isActive(link.href)
                    ? "bg-zinc-900 text-zinc-50 dark:bg-zinc-50 dark:text-zinc-900"
                    : "text-zinc-600 dark:text-zinc-400"
                }`}
              >
                {link.name}
              </Link>
            ))}
            {!user ? (
              <Link
                href="/login/"
                onClick={() => setIsMenuOpen(false)}
                className="mt-4 rounded-2xl bg-zinc-900 py-4 text-center text-lg font-black text-zinc-50 dark:bg-zinc-50 dark:text-zinc-900"
              >
                Get Started
              </Link>
            ) : (
              <button
                onClick={() => {
                  signOut(auth);
                  setIsMenuOpen(false);
                }}
                className="mt-4 rounded-2xl border border-zinc-200 py-4 text-center text-lg font-bold text-red-500 dark:border-zinc-800"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
