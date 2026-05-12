"use client";

import { motion } from "framer-motion";
import { Zap, Shield, BarChart3, Globe, Users, Rocket } from "lucide-react";

const features = [
  {
    title: "Fast & Reliable",
    description: "Built on Next.js 15 for instant page loads and a smooth learning experience on any device.",
    icon: Zap,
    color: "text-amber-500",
    bg: "bg-amber-500/10",
  },
  {
    title: "Secure Payments",
    description: "Pay safely with Razorpay. All transactions are encrypted and verified before enrollment.",
    icon: Shield,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  {
    title: "Creator Analytics",
    description: "Track student progress, course revenue, and completion rates from your creator dashboard.",
    icon: BarChart3,
    color: "text-violet-500",
    bg: "bg-violet-500/10",
  },
  {
    title: "Global Access",
    description: "Built-in SEO and structured sitemaps help your courses reach students around the world.",
    icon: Globe,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
  },
  {
    title: "Multi-Creator Platform",
    description: "Every creator gets their own studio, dashboard, and analytics — all in one place.",
    icon: Users,
    color: "text-orange-500",
    bg: "bg-orange-500/10",
  },
  {
    title: "Growth Tools",
    description: "Coupon codes, referral incentives, and marketing tools to help you grow your audience.",
    icon: Rocket,
    color: "text-rose-500",
    bg: "bg-rose-500/10",
  },
];

export default function Features() {
  return (
    <section className="py-20 bg-secondary/30 relative">
      <div className="container mx-auto px-6 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-14">
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-2xl md:text-3xl font-bold tracking-tight text-foreground mb-3"
          >
            Everything you need to learn and teach
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-muted-foreground max-w-xl mx-auto text-base leading-relaxed"
          >
            Verox Academy gives students and creators all the tools they need — from secure payments to deep analytics.
          </motion.p>
        </div>

        {/* Feature grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.06 }}
              className="group p-6 rounded-xl border border-border bg-card hover:shadow-md hover:border-border/60 transition-all duration-200"
            >
              <div className={`w-11 h-11 rounded-lg ${feature.bg} flex items-center justify-center mb-4 group-hover:scale-105 transition-transform duration-200`}>
                <feature.icon className={`w-5 h-5 ${feature.color}`} />
              </div>
              <h3 className="text-base font-semibold text-foreground mb-2 tracking-tight">
                {feature.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
