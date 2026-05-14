"use client";

import { motion } from "framer-motion";
import { ArrowRight, DollarSign, Star, Award } from "lucide-react";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

const creators = [
  {
    name: "Arjun Mehta",
    role: "Senior Product Architect",
    specialty: "Software Engineering",
    earnings: "₹12.4L+",
    rating: "4.9",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&h=200&auto=format&fit=crop",
  },
  {
    name: "Sara Khan",
    role: "Lead Brand Designer",
    specialty: "Digital Marketing",
    earnings: "₹8.2L+",
    rating: "5.0",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&h=200&auto=format&fit=crop",
  },
  {
    name: "Vikram Singh",
    role: "Fullstack Developer",
    specialty: "App Development",
    earnings: "₹15.1L+",
    rating: "4.8",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200&h=200&auto=format&fit=crop",
  },
];

export default function CreatorShowcase() {
  return (
    <div className="space-y-14">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="max-w-2xl">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-blue-500 mb-4">
            Expert Mentorship
          </p>
          <h2 className="text-4xl md:text-5xl font-bold tracking-[-0.03em] text-foreground leading-tight mb-5">
            Learn from industry leaders.
          </h2>
          <p className="text-lg text-muted-foreground font-normal leading-relaxed">
            Our creators are successful professionals who bring real-world
            experience and proven strategies to every masterclass.
          </p>
        </div>
        <Link href="/become-creator" className="shrink-0">
          <Button className="h-12 px-7 rounded-full bg-linear-to-r from-blue-600 to-blue-500 text-white font-semibold text-sm shadow-lg shadow-blue-500/20 hover:scale-[1.02] hover:shadow-blue-500/30 transition-all duration-200 gap-2">
            Join as a Creator
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {creators.map((creator, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="group p-8 rounded-2xl bg-background border border-border hover:border-blue-200 dark:hover:border-blue-500/30 hover:shadow-lg hover:shadow-black/5 transition-all duration-300"
          >
            {/* Creator Avatar & Name */}
            <div className="flex items-center gap-4 mb-8">
              <div className="h-14 w-14 rounded-xl overflow-hidden border border-border">
                <img
                  src={creator.image}
                  alt={creator.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div>
                <h4 className="text-lg font-semibold tracking-tight text-foreground leading-tight">
                  {creator.name}
                </h4>
                <p className="text-xs font-medium text-muted-foreground mt-0.5">
                  {creator.role}
                </p>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="p-4 rounded-xl bg-muted/40 border border-border/50">
                <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground mb-1.5">
                  Earnings
                </p>
                <div className="flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-blue-500" />
                  <span className="text-base font-bold text-foreground">
                    {creator.earnings}
                  </span>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-muted/40 border border-border/50">
                <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground mb-1.5">
                  Rating
                </p>
                <div className="flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5 text-amber-400 fill-current" />
                  <span className="text-base font-bold text-foreground">
                    {creator.rating}
                  </span>
                </div>
              </div>
            </div>

            {/* Specialty */}
            <div className="flex items-center gap-2 text-xs font-medium text-blue-500">
              <Award className="w-3.5 h-3.5" />
              Specializing in {creator.specialty}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
