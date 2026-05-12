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
    answer: "Payouts are processed automatically every week via our secure payment partners once you reach the minimum threshold of $50.",
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
    <section className="py-32 bg-secondary/10 relative overflow-hidden">
      {/* Decorative gradient */}
      <div className="absolute left-1/2 top-0 -translate-x-1/2 w-full max-w-3xl h-[400px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="container mx-auto px-4 max-w-4xl relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl md:text-6xl font-black mb-6 tracking-tight text-foreground">
            FREQUENTLY ASKED <span className="text-primary">QUESTIONS</span>
          </h2>
          <p className="text-muted-foreground text-lg md:text-xl font-medium">Everything you need to know about the platform.</p>
        </motion.div>

        <div className="space-y-6">
          {faqs.map((faq, index) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              key={index}
              className={`border rounded-3xl overflow-hidden transition-all duration-300 ${openIndex === index ? 'border-primary/30 bg-card/60 shadow-lg shadow-primary/5' : 'border-border/50 bg-card/30 hover:border-primary/20 hover:bg-card/50'} backdrop-blur-md`}
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full flex items-center justify-between p-8 text-left transition-colors"
              >
                <span className={`font-bold text-xl md:text-2xl transition-colors ${openIndex === index ? 'text-primary' : 'text-foreground'}`}>
                  {faq.question}
                </span>
                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-colors ${openIndex === index ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'}`}>
                  {openIndex === index ? (
                    <Minus className="w-5 h-5" />
                  ) : (
                    <Plus className="w-5 h-5" />
                  )}
                </div>
              </button>
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <div className="px-8 pb-8 text-muted-foreground text-lg leading-relaxed font-medium">
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
