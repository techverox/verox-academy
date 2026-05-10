"use client";

import { motion } from "framer-motion";

const stats = [
  { label: "Active Students", value: "10,000+", suffix: "" },
  { label: "Courses Published", value: "500+", suffix: "" },
  { label: "Creator Earnings", value: "$2M+", suffix: "" },
  { label: "Average Rating", value: "4.9", suffix: "/5" },
];

export default function Stats() {
  return (
    <section className="py-24 border-y border-zinc-800 bg-zinc-950/50">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="text-center"
            >
              <h3 className="text-4xl md:text-5xl font-black text-white mb-2">
                {stat.value}
                <span className="text-xl text-zinc-500 ml-1">{stat.suffix}</span>
              </h3>
              <p className="text-zinc-500 font-medium uppercase tracking-tighter text-sm">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
