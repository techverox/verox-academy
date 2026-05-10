"use client";

import { motion } from "framer-motion";
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
    answer: "Payouts are processed automatically every week via Razorpay/Stripe once you reach the minimum threshold of $50.",
  },
  {
    question: "Can I host my videos on Verox?",
    answer: "Yes! We use Wistia for premium, ad-free video hosting. Your content is protected and optimized for all devices.",
  },
  {
    question: "Is there a monthly fee?",
    answer: "No. Verox Academy is free for creators. We only make money when you make money.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="py-32 bg-background">
      <div className="container mx-auto px-4 max-w-3xl">
        <h2 className="text-3xl md:text-5xl font-black text-center mb-16">
          FREQUENTLY ASKED <span className="text-primary">QUESTIONS</span>
        </h2>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="border border-zinc-800 rounded-2xl overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full flex items-center justify-between p-6 text-left hover:bg-zinc-900/50 transition-colors"
              >
                <span className="font-bold text-lg">{faq.question}</span>
                {openIndex === index ? (
                  <Minus className="w-5 h-5 text-primary" />
                ) : (
                  <Plus className="w-5 h-5 text-zinc-500" />
                )}
              </button>
              {openIndex === index && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  className="px-6 pb-6 text-zinc-400 leading-relaxed"
                >
                  {faq.answer}
                </motion.div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
