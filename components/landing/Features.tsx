"use client";

import { motion } from "framer-motion";
import { Play, Sparkles, Award, Heart } from "lucide-react";
import { cn } from "@/lib/utils";

const features = [
  {
    title: "Premium Learning Experience",
    desc: "A distraction-free, professional video engine designed for maximum focus and knowledge retention.",
    icon: Play,
    color: "text-blue-500",
    bg: "bg-blue-50 dark:bg-blue-500/10",
    border: "border-blue-100 dark:border-blue-500/20",
  },
  {
    title: "Industry Leading Mentors",
    desc: "Direct access to masterclasses built by the most successful creators in the digital economy.",
    icon: Sparkles,
    color: "text-violet-500",
    bg: "bg-violet-50 dark:bg-violet-500/10",
    border: "border-violet-100 dark:border-violet-500/20",
  },
  {
    title: "Verified Certifications",
    desc: "Receive professional credentials that are recognized across the digital industry.",
    icon: Award,
    color: "text-emerald-500",
    bg: "bg-emerald-50 dark:bg-emerald-500/10",
    border: "border-emerald-100 dark:border-emerald-500/20",
  },
  {
    title: "Dynamic Student Hub",
    desc: "Connect with thousands of ambitious learners and mentors in our vibrant community.",
    icon: Heart,
    color: "text-rose-500",
    bg: "bg-rose-50 dark:bg-rose-500/10",
    border: "border-rose-100 dark:border-rose-500/20",
  },
];

export default function Features() {
  return (
    <div className="space-y-16">
      {/* Section Header */}
      <div className="max-w-2xl">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-blue-500 mb-4">
          Core Benefits
        </p>
        <h2 className="text-4xl md:text-5xl font-bold tracking-[-0.03em] text-foreground leading-tight mb-5">
          Designed for Results.
        </h2>
        <p className="text-lg text-muted-foreground font-normal leading-relaxed">
          We've built a learning experience focused on professional growth,
          clarity, and real-world results.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((feature, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
            className={cn(
              "group p-7 rounded-2xl border bg-background transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-black/5",
              feature.border
            )}
          >
            <div
              className={cn(
                "h-12 w-12 rounded-xl flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110",
                feature.bg,
                feature.color
              )}
            >
              <feature.icon className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-semibold tracking-tight text-foreground mb-3 leading-snug">
              {feature.title}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {feature.desc}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
