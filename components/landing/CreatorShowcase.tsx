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
    <section className="py-32 bg-zinc-950">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-5xl font-black mb-16">
          THE <span className="text-primary">CREATOR</span> ECONOMY ENGINE
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-20">
          {creators.map((creator, index) => (
            <motion.div
              key={creator.name}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="glass p-8 rounded-3xl text-center flex flex-col items-center border-zinc-800/50"
            >
              <div className="relative w-24 h-24 mb-6">
                <Image
                  src={creator.image}
                  alt={creator.name}
                  width={96}
                  height={96}
                  className="rounded-full object-cover border-4 border-primary/20"
                />
                {creator.verified && (
                  <div className="absolute bottom-0 right-0 bg-primary p-1.5 rounded-full border-2 border-zinc-950">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                    </svg>
                  </div>
                )}
              </div>
              <h3 className="text-xl font-bold text-white">{creator.name}</h3>
              <p className="text-zinc-500 text-sm mb-4">{creator.role}</p>
              <div className="bg-primary/10 px-4 py-1 rounded-full text-primary font-black text-sm">
                {creator.earnings}
              </div>
            </motion.div>
          ))}
        </div>

        <div className="max-w-3xl mx-auto glass p-10 rounded-3xl border-primary/20 text-left">
          <div className="flex flex-col md:flex-row items-center gap-10">
            <div className="flex-1">
              <h3 className="text-2xl font-black mb-4">READY TO SCALE?</h3>
              <p className="text-zinc-400 mb-6">
                Join the Verox Creator Program and keep 80% of your course revenue. 
                Get professional tools, dedicated support, and access to a global student base.
              </p>
              <Link href="/become-creator">
                <Button className="rounded-full px-8">Start Your Academy</Button>
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center font-black text-primary italic text-xl">80%</div>
              <div className="text-sm font-bold text-zinc-500 uppercase">Creator<br />Share</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
