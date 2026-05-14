"use client";

import { Users, BookOpen, Globe, Trophy } from "lucide-react";
import { motion } from "framer-motion";

const stats = [
  { label: "Active Learners", value: "45K+", sub: "Growing community", icon: Users },
  { label: "Creator Courses", value: "120+", sub: "Expert-led content", icon: BookOpen },
  { label: "Student Success", value: "98%", sub: "Satisfaction rate", icon: Trophy },
  { label: "Global Reach", value: "12+", sub: "International access", icon: Globe },
];

export default function Stats() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-4">
      {stats.map((stat, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.08 }}
          className="relative flex flex-col items-start gap-2 pl-0 lg:pl-6 first:pl-0"
        >
          {/* Divider for desktop */}
          {i > 0 && (
            <div className="hidden lg:block absolute left-0 top-1/2 -translate-y-1/2 h-12 w-px bg-border/50" />
          )}

          <div className="flex items-center gap-2 mb-1">
            <stat.icon className="w-4 h-4 text-blue-500" />
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
              {stat.label}
            </p>
          </div>

          <h3 className="text-4xl md:text-5xl font-bold tracking-tighter text-foreground leading-none">
            {stat.value}
          </h3>
          <p className="text-sm text-muted-foreground font-normal">{stat.sub}</p>
        </motion.div>
      ))}
    </div>
  );
}
