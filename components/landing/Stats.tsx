"use client";

import { motion } from "framer-motion";

const stats = [
  { label: "Active Students", value: "50,000+", suffix: "" },
  { label: "Courses Available", value: "850+", suffix: "" },
  { label: "Creator Earnings", value: "₹5Cr+", suffix: "" },
  { label: "Average Rating", value: "4.8", suffix: "/5" },
];

export default function Stats() {
  return (
    <section className="py-16 border-y border-border bg-secondary/20">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.08, ease: "easeOut" }}
              className="flex flex-col items-center justify-center p-6 rounded-xl bg-card border border-border"
            >
              <p className="text-3xl font-bold text-foreground mb-1">
                {stat.value}
                <span className="text-xl text-muted-foreground ml-0.5">{stat.suffix}</span>
              </p>
              <p className="text-xs font-medium text-muted-foreground">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
