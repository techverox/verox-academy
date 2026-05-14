"use client";

import { useState } from "react";
import { Plus, Minus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const faqs = [
  {
    q: "Who is Verox Academy for?",
    a: "Our platform is designed for ambitious learners at all levels—from beginners starting their journey to professionals looking to master advanced skills from industry experts.",
  },
  {
    q: "How do I get my certificate?",
    a: "Upon successful completion of a course and its final assessment, a digital certificate will be automatically generated and added to your profile for easy sharing.",
  },
  {
    q: "Can I become a creator on Verox?",
    a: "Yes! We are always looking for industry experts who want to share their knowledge. You can apply through our 'Become a Creator' program to start building your own masterclasses.",
  },
  {
    q: "What makes Verox courses different?",
    a: "Every course on Verox is built by a successful real-world creator, ensuring that the content is practical, relevant, and focused on current industry standards.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="space-y-14">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="max-w-2xl">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-blue-500 mb-4">
            Help Center
          </p>
          <h2 className="text-4xl md:text-5xl font-bold tracking-[-0.03em] text-foreground leading-tight mb-5">
            Common Questions.
          </h2>
          <p className="text-lg text-muted-foreground font-normal leading-relaxed">
            Everything you need to know about starting your learning journey
            on Verox Academy.
          </p>
        </div>
        <p className="text-xs font-medium text-muted-foreground/50 uppercase tracking-widest shrink-0 hidden md:block">
          Updated 2024
        </p>
      </div>

      <div className="max-w-4xl space-y-3">
        {faqs.map((faq, i) => (
          <div
            key={i}
            className={cn(
              "rounded-2xl border transition-all duration-300 overflow-hidden",
              openIndex === i
                ? "border-blue-200 dark:border-blue-500/30 bg-background shadow-sm"
                : "border-border bg-background hover:border-border/80"
            )}
          >
            <button
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              className="w-full flex items-center justify-between px-7 py-6 text-left"
            >
              <h4
                className={cn(
                  "text-base font-semibold tracking-tight transition-colors",
                  openIndex === i ? "text-blue-600 dark:text-blue-400" : "text-foreground"
                )}
              >
                {faq.q}
              </h4>
              <div
                className={cn(
                  "h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ml-4 transition-all duration-300",
                  openIndex === i
                    ? "bg-blue-500 text-white"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {openIndex === i ? (
                  <Minus className="w-4 h-4" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
              </div>
            </button>
            <AnimatePresence>
              {openIndex === i && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                >
                  <div className="px-7 pb-7">
                    <p className="text-sm text-muted-foreground font-normal leading-relaxed border-t border-border/40 pt-5">
                      {faq.a}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
}
