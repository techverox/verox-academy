import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { AuthProvider } from "@/context/AuthContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Verox Academy",
    template: "%s | Verox Academy",
  },
  description: "The premier LMS platform for modern creators and students.",
  keywords: ["LMS", "Course", "Education", "Creator Economy", "Learning"],
  authors: [{ name: "Verox Academy Team" }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full scroll-smooth">
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans flex min-h-screen flex-col bg-white antialiased`}>
        <AuthProvider>
          <Navbar />
          <main className="flex-grow">
            {children}
          </main>
          <footer className="border-t border-zinc-100 py-8 text-center text-sm text-zinc-500">
            © {new Date().getFullYear()} Verox Academy. All rights reserved.
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
