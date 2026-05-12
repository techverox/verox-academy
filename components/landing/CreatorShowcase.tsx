"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

const creators = [
  {
    name: "Arjun Sharma",
    role: "Full-Stack Developer",
    earnings: "₹3.5L/mo",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop",
    verified: true,
  },
  {
    name: "Priya Nair",
    role: "UX Designer & Educator",
    earnings: "₹2.2L/mo",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop",
    verified: true,
  },
  {
    name: "Rohan Mehta",
    role: "Product Designer",
    earnings: "₹1.8L/mo",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop",
    verified: true,
  },
];

export default function CreatorShowcase() {
  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="text-center mb-12">
          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-2xl md:text-3xl font-bold tracking-tight text-foreground mb-3"
          >
            Creators earning on Verox Academy
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-sm text-muted-foreground max-w-lg mx-auto"
          >
            Thousands of educators and subject-matter experts are building successful teaching businesses on our platform.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
          {creators.map((creator, index) => (
            <motion.div
              key={creator.name}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className="bg-card border border-border p-8 rounded-xl text-center flex flex-col items-center hover:shadow-md hover:border-border/60 transition-all duration-200"
            >
              <div className="relative w-28 h-28 mb-6 group">
                <Image
                  src={creator.image}
                  alt={creator.name}
                  width={112}
                  height={112}
                  className="rounded-full object-cover border-[4px] border-background shadow-xl group-hover:border-primary/50 transition-colors duration-500"
                />
                {creator.verified && (
                  <div className="absolute bottom-1 right-1 bg-primary p-1.5 rounded-full border-2 border-background shadow-sm">
                    <svg className="w-3.5 h-3.5 text-primary-foreground" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                    </svg>
                  </div>
                )}
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-1">{creator.name}</h3>
              <p className="text-muted-foreground text-sm font-medium mb-6">{creator.role}</p>
              <div className="bg-primary/10 px-5 py-1.5 rounded-full text-primary font-black text-sm tracking-wide">
                {creator.earnings}
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="bg-card border border-border rounded-xl p-8 md:p-10 text-left"
        >
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1">
              <h3 className="text-xl font-bold mb-3 text-foreground tracking-tight">Ready to start teaching?</h3>
              <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                Join the Verox Creator Program and keep 80% of your course revenue.
                Get professional tools, support, and access to our growing student base.
              </p>
              <Link href="/become-creator">
                <Button size="sm" className="rounded-lg font-semibold">Start Your Academy</Button>
              </Link>
            </div>
            <div className="flex items-center gap-4 bg-secondary/50 p-5 rounded-xl border border-border">
              <div className="w-16 h-16 rounded-xl bg-card border border-border flex items-center justify-center font-bold text-primary text-2xl">80%</div>
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Creator<br />Revenue Share</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
