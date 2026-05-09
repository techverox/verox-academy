import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { AuthProvider } from "@/context/auth-context";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://verox-academy.vercel.app"),
  title: {
    default: "Verox Academy | Premium SaaS LMS Platform",
    template: "%s | Verox Academy",
  },
  description: "Master new skills with Verox Academy. A cinematic, high-performance learning experience designed for modern students.",
  keywords: ["LMS", "Online Courses", "SaaS", "Next.js LMS", "Skill Development", "Verox Academy"],
  authors: [{ name: "Verox Team" }],
  creator: "Verox Academy",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://verox-academy.vercel.app",
    siteName: "Verox Academy",
    title: "Verox Academy | Premium SaaS LMS Platform",
    description: "Master new skills with Verox Academy. A cinematic, high-performance learning experience designed for modern students.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Verox Academy - Premium Learning Experience",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Verox Academy | Premium SaaS LMS Platform",
    description: "Master new skills with Verox Academy. A cinematic, high-performance learning experience designed for modern students.",
    images: ["/og-image.jpg"],
    creator: "@veroxacademy",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-white text-zinc-950 dark:bg-black dark:text-zinc-50">
        <AuthProvider>
          <Navbar />
          <div className="flex-1">
            {children}
          </div>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
