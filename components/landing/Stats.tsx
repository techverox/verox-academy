"use client";

import { motion } from "framer-motion";

const stats = [
  { label: "Active Students", value: "50,000+", suffix: "" },
  { label: "Premium Courses", value: "1,200+", suffix: "" },
  { label: "Creator Earnings", value: "$5M+", suffix: "" },
  { label: "Average Rating", value: "4.9", suffix: "/5" },
];

export default function Stats() {
  return (
    <section className="py-24 border-y border-border bg-secondary/30 relative overflow-hidden">
      <div className="absolute inset-0 bg-secondary/30 pointer-events-none"></div>
      <div className="container mx-auto px-4 relative z-10 max-w-7xl">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1, ease: "easeOut" }}
              className="flex flex-col items-center justify-center p-8 rounded-3xl glass border border-border shadow-sm hover:shadow-md transition-shadow bg-card/50"
            >
              <h3 className="text-4xl md:text-5xl lg:text-6xl font-black text-foreground mb-3 drop-shadow-sm">
                {stat.value}
                <span className="text-2xl text-muted-foreground ml-1 font-bold">{stat.suffix}</span>
              </h3>
              <p className="text-muted-foreground font-bold uppercase tracking-widest text-xs md:text-sm">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
