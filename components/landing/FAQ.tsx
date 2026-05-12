"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Plus, Minus } from "lucide-react";

const faqs = [
  {
    question: "How do I become a creator on Verox Academy?",
    answer: "Simply click on the 'Become a Creator' button, fill out your profile, and submit your first course for review. Once approved, you can start selling immediately.",
  },
  {
    question: "What is the revenue split?",
    answer: "Creators keep 80% of every sale. The remaining 20% covers platform maintenance, hosting, and global distribution costs.",
  },
  {
    question: "How do I get paid?",
    answer: "Payouts are processed every week via secure payment partners once you reach the minimum threshold of ₹4,000.",
  },
  {
    question: "Can I host my videos on Verox?",
    answer: "Yes! We use enterprise-grade video hosting for premium, ad-free playback. Your content is protected and optimized for all devices globally.",
  },
  {
    question: "Is there a monthly fee?",
    answer: "No. Verox Academy is completely free for creators to join and build. We only succeed when you succeed.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="py-16 bg-secondary/20">
      <div className="container mx-auto px-6 max-w-3xl">
        <div className="text-center mb-10">
          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-2xl md:text-3xl font-bold tracking-tight text-foreground mb-3"
          >
            Frequently Asked Questions
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-sm text-muted-foreground"
          >
            Everything you need to know about the platform.
          </motion.p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.07 }}
              key={index}
              className={`border rounded-xl overflow-hidden transition-all duration-200 ${
                openIndex === index
                  ? 'border-primary/30 bg-card shadow-sm'
                  : 'border-border bg-card hover:border-border/80'
              }`}
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full flex items-center justify-between p-5 text-left"
              >
                <span className={`font-semibold text-sm transition-colors ${openIndex === index ? 'text-primary' : 'text-foreground'}`}>
                  {faq.question}
                </span>
                <div className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-colors ml-3 ${openIndex === index ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'}`}>
                  {openIndex === index ? (
                    <Minus className="w-3.5 h-3.5" />
                  ) : (
                    <Plus className="w-3.5 h-3.5" />
                  )}
                </div>
              </button>
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                  >
                    <div className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
