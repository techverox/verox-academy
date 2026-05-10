"use client";

import { motion } from "framer-motion";
import { Zap, Shield, BarChart3, Globe, Users, Rocket } from "lucide-react";

const features = [
  {
    title: "Ultra-Fast Performance",
    description: "Built on Next.js 15 for sub-second page loads and instant interactions.",
    icon: Zap,
    color: "text-yellow-500",
    bg: "bg-yellow-500/10",
  },
  {
    title: "Secure Payments",
    description: "Integrated with Razorpay for secure, multi-currency course transactions.",
    icon: Shield,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  {
    title: "Creator Analytics",
    description: "Deep insights into student engagement, revenue, and course completion rates.",
    icon: BarChart3,
    color: "text-purple-500",
    bg: "bg-purple-500/10",
  },
  {
    title: "Global Distribution",
    description: "Built-in SEO engine and sitemaps to help your courses reach a global audience.",
    icon: Globe,
    color: "text-green-500",
    bg: "bg-green-500/10",
  },
  {
    title: "Multi-Creator SaaS",
    description: "A platform built for many. Every creator gets their own studio and dashboard.",
    icon: Users,
    color: "text-orange-500",
    bg: "bg-orange-500/10",
  },
  {
    title: "Viral Growth Loops",
    description: "Integrated referral systems and coupons to accelerate your growth.",
    icon: Rocket,
    color: "text-red-500",
    bg: "bg-red-500/10",
  },
];

export default function Features() {
  return (
    <section className="py-32 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-20">
          <h2 className="text-3xl md:text-5xl font-black mb-6">
            BUILT FOR <span className="text-primary">DISTRIBUTION</span>
          </h2>
          <p className="text-zinc-400 max-w-2xl mx-auto text-lg">
            Verox Academy isn't just an LMS. It's a growth machine designed to help you scale your education business.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group p-8 rounded-3xl border border-zinc-800 bg-zinc-900/30 hover:bg-zinc-900/50 hover:border-primary/50 transition-all duration-300"
            >
              <div className={`w-14 h-14 rounded-2xl ${feature.bg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                <feature.icon className={`w-7 h-7 ${feature.color}`} />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">{feature.title}</h3>
              <p className="text-zinc-400 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
