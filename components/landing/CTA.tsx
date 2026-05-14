"use client";

import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { ArrowRight, ShieldCheck, Star, Users } from "lucide-react";
import { motion } from "framer-motion";

export default function CTA() {
  return (
    <div className="relative rounded-3xl bg-linear-to-br from-blue-600 via-blue-600 to-cyan-500 overflow-hidden p-12 lg:p-20">
      {/* Subtle grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-size-[40px_40px]" />
      {/* Glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-cyan-400/20 rounded-full blur-3xl -ml-24 -mb-24" />

      <div className="relative z-10 flex flex-col items-center text-center space-y-8 max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="space-y-4"
        >
          <p className="text-sm font-medium uppercase tracking-[0.25em] text-white/70">
            Get Started Today
          </p>
          <h2 className="text-4xl md:text-6xl font-bold tracking-[-0.03em] text-white leading-[1.05]">
            Start your journey to{" "}
            <br className="hidden sm:block" />
            Professional Mastery.
          </h2>
          <p className="text-lg text-white/70 font-normal max-w-xl mx-auto leading-relaxed">
            Join the community of ambitious learners and creators building the
            future. Access premium courses and verified certifications today.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.15 }}
          className="flex flex-col sm:flex-row items-center gap-4"
        >
          <Link href="/register">
            <Button
              size="lg"
              className="h-14 px-10 rounded-full bg-white text-blue-600 font-semibold text-base shadow-2xl shadow-blue-900/30 hover:bg-white/95 hover:scale-[1.02] transition-all duration-200 gap-2"
            >
              Get Started for Free
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <Link href="/courses">
            <Button
              variant="outline"
              size="lg"
              className="h-14 px-10 rounded-full border-white/30 text-white font-semibold text-base bg-white/10 hover:bg-white/20 transition-all duration-200"
            >
              Explore All Courses
            </Button>
          </Link>
        </motion.div>

        {/* Trust indicators */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="flex flex-wrap items-center justify-center gap-8 pt-4"
        >
          {[
            { icon: ShieldCheck, label: "Secure Payments" },
            { icon: Star, label: "Top Rated Courses" },
            { icon: Users, label: "Active Community" },
          ].map((item, i) => (
            <div
              key={i}
              className="flex items-center gap-2 text-xs font-medium text-white/60 uppercase tracking-widest"
            >
              <item.icon className="w-3.5 h-3.5" />
              {item.label}
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
