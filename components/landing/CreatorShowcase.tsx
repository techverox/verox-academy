"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

const creators = [
  {
    name: "Alex River",
    role: "Fullstack Architect",
    earnings: "$45k/mo",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop",
    verified: true,
  },
  {
    name: "Sarah Chen",
    role: "UX Strategy Lead",
    earnings: "$32k/mo",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop",
    verified: true,
  },
  {
    name: "Marcus Thorne",
    role: "Product Designer",
    earnings: "$28k/mo",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop",
    verified: true,
  },
];

export default function CreatorShowcase() {
  return (
    <section className="py-32 bg-background relative overflow-hidden">
      <div className="absolute left-0 bottom-0 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="container mx-auto px-4 text-center relative z-10">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-4xl md:text-6xl font-black mb-20 tracking-tighter text-foreground"
        >
          THE <span className="bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">CREATOR</span> ECONOMY ENGINE
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-24">
          {creators.map((creator, index) => (
            <motion.div
              key={creator.name}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className="glass p-10 rounded-[2rem] text-center flex flex-col items-center border-border/50 bg-card/60 backdrop-blur-md shadow-lg hover:shadow-2xl hover:border-primary/40 transition-all duration-500 hover:-translate-y-2 relative"
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
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="max-w-4xl mx-auto glass p-10 md:p-12 rounded-[2.5rem] border border-primary/20 text-left bg-card/40 backdrop-blur-xl shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] pointer-events-none" />
          <div className="flex flex-col md:flex-row items-center gap-12 relative z-10">
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-3xl font-black mb-4 text-foreground tracking-tight">READY TO SCALE?</h3>
              <p className="text-muted-foreground mb-8 text-lg leading-relaxed">
                Join the Verox Creator Program and keep 80% of your course revenue. 
                Get professional tools, dedicated support, and access to a global student base.
              </p>
              <Link href="/become-creator">
                <Button size="lg" className="rounded-full px-10 h-14 text-lg font-bold shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-1 transition-all">Start Your Academy</Button>
              </Link>
            </div>
            <div className="flex items-center gap-6 bg-background/50 p-6 rounded-3xl border border-border/50">
              <div className="w-20 h-20 rounded-2xl bg-card border border-border flex items-center justify-center font-black text-primary italic text-3xl shadow-inner">80%</div>
              <div className="text-sm font-black text-muted-foreground uppercase tracking-widest">Creator<br />Share</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
