"use client";

import { motion } from "framer-motion";
import { Zap, Shield, BarChart3, Globe, Users, Rocket } from "lucide-react";

const features = [
  {
    title: "Ultra-Fast Performance",
    description: "Built on Next.js 15 for sub-second page loads and instant interactions.",
    icon: Zap,
    color: "text-amber-500",
    bg: "bg-amber-500/10",
  },
  {
    title: "Secure Payments",
    description: "Integrated with robust gateways for secure, multi-currency course transactions.",
    icon: Shield,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  {
    title: "Creator Analytics",
    description: "Deep insights into student engagement, revenue, and course completion rates.",
    icon: BarChart3,
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    title: "Global Distribution",
    description: "Built-in SEO engine and sitemaps to help your courses reach a global audience.",
    icon: Globe,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
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
    color: "text-rose-500",
    bg: "bg-rose-500/10",
  },
];

export default function Features() {
  return (
    <section className="py-32 bg-secondary/20 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background pointer-events-none" />
      
      <div className="container mx-auto px-4 relative z-10 max-w-7xl">
        <div className="text-center mb-24">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-6xl font-black mb-6 tracking-tight text-foreground"
          >
            BUILT FOR <span className="bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">SCALE</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-muted-foreground max-w-2xl mx-auto text-xl font-medium"
          >
            Verox Academy isn't just an LMS. It's a growth machine designed to help you scale your education empire.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group p-10 rounded-3xl border border-border/50 bg-card/40 backdrop-blur-sm hover:bg-card hover:border-primary/30 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-2 relative overflow-hidden"
            >
              {/* Hover gradient effect inside card */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              
              <div className={`w-16 h-16 rounded-2xl ${feature.bg} flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500 shadow-inner`}>
                <feature.icon className={`w-8 h-8 ${feature.color}`} />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-4 tracking-tight">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed text-lg">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
