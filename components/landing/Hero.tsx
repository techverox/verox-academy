"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Play, Sparkles, BarChart2 } from "lucide-react";
import { motion } from "framer-motion";
import { ContentContainer } from "@/components/layout/ContentContainer";
import { cn } from "@/lib/utils";

export default function Hero() {
  return (
    <section className="relative flex flex-col justify-center pt-20 pb-6 md:pt-24 md:pb-8 overflow-hidden bg-background">
      {/* Very subtle background - light blue tint like reference */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(37,99,235,0.06),transparent)]" />
      
      <ContentContainer className="relative z-10">
        <div className="flex flex-col items-center text-center max-w-5xl mx-auto">

          {/* Trust Badge */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full border border-border/60 bg-background/80 backdrop-blur-sm shadow-sm mb-4 text-[13px] font-medium text-foreground/70"
          >
            <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
            Trusted by startups and growing businesses
          </motion.div>

          {/* MAIN HEADING — ultra bold, matching reference exactly */}
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.7, ease: [0.23, 1, 0.32, 1] }}
            className="text-[2.6rem] sm:text-[3.4rem] md:text-[4.4rem] lg:text-[5.5rem] font-bold tracking-[-0.03em] text-foreground leading-[1.02] mb-4"
          >
            Learn from the best{" "}
            <br className="hidden sm:block" />
            <span className="bg-clip-text text-transparent bg-linear-to-r from-blue-600 via-blue-500 to-cyan-400">
              Digital Creators.
            </span>
          </motion.h1>

          {/* Subheading */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.7 }}
            className="text-base md:text-lg text-muted-foreground font-normal max-w-xl mx-auto leading-relaxed mb-6"
          >
            We design and develop high-performance apps, websites and SaaS
            systems for startups and businesses in India.
          </motion.p>

          {/* CTA Buttons — matching reference style */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.7 }}
            className="flex flex-col sm:flex-row items-center gap-4 mb-6"
          >
            <Link href="/register">
              <Button className="h-12 px-7 rounded-2xl bg-linear-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-semibold text-sm shadow-xl shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-[1.02] transition-all duration-200 gap-2">
                <span>🚀</span>
                Start Project
              </Button>
            </Link>
            <Link href="/courses">
              <Button
                variant="outline"
                className="h-12 px-7 rounded-2xl bg-background border-border font-semibold text-sm hover:bg-muted/40 transition-all duration-200 shadow-sm gap-2"
              >
                <BarChart2 className="w-4 h-4 text-blue-500" />
                View Courses
              </Button>
            </Link>
          </motion.div>

          {/* Trust Pills */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="flex flex-wrap items-center justify-center gap-6"
          >
            {[
              { label: "No upfront costs", dot: "bg-emerald-500" },
              { label: "30-day delivery", dot: "bg-blue-500" },
              { label: "Dedicated team", dot: "bg-cyan-500" },
            ].map((pill, i) => (
              <div key={i} className="flex items-center gap-2 text-[13px] font-normal text-muted-foreground">
                <div className={cn("h-2 w-2 rounded-full", pill.dot)} />
                {pill.label}
              </div>
            ))}
          </motion.div>
        </div>
      </ContentContainer>
    </section>
  );
}
