"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function Hero() {
  return (
    <section className="relative flex min-h-[90vh] flex-col items-center justify-center overflow-hidden px-4 pt-20 pb-32">
      {/* Background Gradients */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 h-[400px] w-[400px] rounded-full bg-primary/20 blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 h-[300px] w-[300px] rounded-full bg-blue-500/10 blur-[100px] animate-pulse delay-700" />
      </div>

      <div className="container mx-auto max-w-6xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary mb-8"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
          </span>
          Phase E: Distribution Engine is Live
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter mb-8 leading-[0.9]"
        >
          THE NEXT <br />
          <span className="bg-gradient-to-r from-primary via-purple-400 to-blue-500 bg-clip-text text-transparent">
            GENERATION
          </span> <br />
          OF LEARNING
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mx-auto max-w-2xl text-lg md:text-xl text-zinc-400 mb-12 leading-relaxed"
        >
          Verox Academy is a premium multi-creator LMS designed for scale. 
          Build, launch, and grow your digital academy with cinematic performance.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link href="/courses">
            <Button size="lg" className="rounded-full px-10 h-14 text-lg font-bold">
              Explore Courses
            </Button>
          </Link>
          <Link href="/become-creator">
            <Button size="lg" variant="outline" className="rounded-full px-10 h-14 text-lg font-bold glass">
              Become a Creator
            </Button>
          </Link>
        </motion.div>

        {/* Social Proof Mini */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="mt-20 flex flex-col items-center gap-4"
        >
          <p className="text-sm font-medium text-zinc-500 uppercase tracking-widest">
            Trusted by world-class creators
          </p>
          <div className="flex flex-wrap justify-center gap-8 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
             {/* Placeholders for partner logos */}
             <div className="text-2xl font-black text-white">GOOGLE</div>
             <div className="text-2xl font-black text-white">STRIPE</div>
             <div className="text-2xl font-black text-white">VERCEL</div>
             <div className="text-2xl font-black text-white">RESEND</div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
