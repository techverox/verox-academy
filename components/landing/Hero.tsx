"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, BookOpen, Star, Users } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative flex flex-col items-center justify-center overflow-hidden px-4 pt-28 pb-20 bg-background transition-colors duration-300 min-h-[calc(100vh-64px)]">
      {/* Subtle background gradient */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-primary/4 rounded-full blur-[120px] opacity-60 dark:opacity-20" />
      </div>

      <div className="container mx-auto max-w-5xl text-center z-10 relative">
        {/* Trust badge */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-xs font-medium text-muted-foreground mb-8 shadow-sm"
        >
          <div className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
          Trusted by 45,000+ learners across India
        </motion.div>

        {/* Hero Headline */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-4 mb-6"
        >
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground leading-tight">
            Learn from India's{" "}
            <span className="text-primary">best creators.</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed font-normal">
            Verox Academy is a premium learning platform where top creators share
            their expertise through structured, practical courses.
          </p>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25, ease: "easeOut" }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8"
        >
          <Link href="/courses">
            <button className="h-11 px-7 rounded-lg bg-primary text-primary-foreground text-sm font-semibold shadow-sm hover:bg-primary-hover active:scale-[0.98] transition-all flex items-center gap-2">
              Browse Courses
              <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
          <Link href="/login/">
            <button className="h-11 px-7 rounded-lg border border-border bg-card text-foreground text-sm font-medium hover:bg-secondary active:scale-[0.98] transition-all">
              Sign In
            </button>
          </Link>
        </motion.div>

        {/* Social proof stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-16 pt-12 border-t border-border max-w-3xl mx-auto"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="space-y-1 text-center">
              <div className="flex items-center justify-center gap-1.5 text-muted-foreground mb-1.5">
                <Users className="w-3.5 h-3.5" />
                <span className="text-xs font-medium">Students</span>
              </div>
              <p className="text-2xl font-bold text-foreground tracking-tight">45,000+</p>
            </div>
            <div className="space-y-1 text-center">
              <div className="flex items-center justify-center gap-1.5 text-muted-foreground mb-1.5">
                <BookOpen className="w-3.5 h-3.5" />
                <span className="text-xs font-medium">Courses</span>
              </div>
              <p className="text-2xl font-bold text-foreground tracking-tight">850+</p>
            </div>
            <div className="space-y-1 text-center">
              <div className="flex items-center justify-center gap-1.5 text-muted-foreground mb-1.5">
                <Star className="w-3.5 h-3.5" />
                <span className="text-xs font-medium">Avg. Rating</span>
              </div>
              <p className="text-2xl font-bold text-foreground tracking-tight">4.8 / 5</p>
            </div>
            <div className="space-y-1 text-center">
              <div className="flex items-center justify-center gap-1.5 text-muted-foreground mb-1.5">
                <Users className="w-3.5 h-3.5" />
                <span className="text-xs font-medium">Creators</span>
              </div>
              <p className="text-2xl font-bold text-foreground tracking-tight">120+</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
