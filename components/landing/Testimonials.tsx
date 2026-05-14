"use client";

import { motion } from "framer-motion";
import { Quote, Star, ShieldCheck } from "lucide-react";

const testimonials = [
  {
    name: "Rohan Gupta",
    role: "Fullstack Developer @ Techverox",
    content:
      "The quality of the modules combined with the technical depth of the creators is unmatched. It's not just a course; it's a career catalyst.",
    rating: 5,
    avatar:
      "https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=100&h=100&auto=format&fit=crop",
  },
  {
    name: "Isha Sharma",
    role: "UX Architect @ DesignHub",
    content:
      "Finally, a platform that understands the nuance of modern engineering. The learning viewer is flawlessly executed for maximum focus.",
    rating: 5,
    avatar:
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=100&h=100&auto=format&fit=crop",
  },
  {
    name: "Kabir Das",
    role: "SaaS Founder",
    content:
      "We trained our entire product team through Verox Academy. The certification standard is the highest we've seen in India.",
    rating: 5,
    avatar:
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100&h=100&auto=format&fit=crop",
  },
];

export default function Testimonials() {
  return (
    <div className="space-y-14">
      {/* Section Header */}
      <div className="text-center max-w-2xl mx-auto">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-blue-500 mb-4">
          Student Reviews
        </p>
        <h2 className="text-4xl md:text-5xl font-bold tracking-[-0.03em] text-foreground leading-tight mb-5">
          What our students say.
        </h2>
        <p className="text-lg text-muted-foreground font-normal leading-relaxed">
          Hear from the ambitious learners and founders who have accelerated
          their careers with Verox Academy.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {testimonials.map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="relative p-8 rounded-2xl bg-background border border-border hover:border-blue-200 dark:hover:border-blue-500/20 hover:shadow-lg hover:shadow-black/5 transition-all duration-300 flex flex-col"
          >
            <Quote className="absolute top-7 right-7 w-8 h-8 text-muted-foreground/10" />

            {/* Stars */}
            <div className="flex items-center gap-1 mb-5">
              {[...Array(item.rating)].map((_, j) => (
                <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />
              ))}
            </div>

            {/* Content */}
            <p className="text-base text-foreground/80 font-normal leading-relaxed flex-1 mb-8">
              "{item.content}"
            </p>

            {/* Author */}
            <div className="flex items-center gap-3 pt-6 border-t border-border/50">
              <div className="h-10 w-10 rounded-full overflow-hidden border border-border">
                <img
                  src={item.avatar}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground leading-none mb-1">
                  {item.name}
                </p>
                <p className="text-xs text-muted-foreground">{item.role}</p>
              </div>
              <ShieldCheck className="w-4 h-4 text-blue-500/50 ml-auto" />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
