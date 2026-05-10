"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { collection, query, orderBy, limit, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { CreatorStats, User } from "@/types/firestore";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Image from "next/image";
import Link from "next/link";
import { Trophy, Users, Star, ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface LeaderboardCreator extends CreatorStats {
  name: string;
  photoURL: string | null;
  username: string;
}

export default function TopCreatorsPage() {
  const [creators, setCreators] = useState<LeaderboardCreator[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLeaderboard() {
      try {
        const statsRef = collection(db, "creatorStats");
        const q = query(statsRef, orderBy("totalStudents", "desc"), limit(10));
        const statsSnap = await getDocs(q);

        const leaderboardData = await Promise.all(
          statsSnap.docs.map(async (statsDoc) => {
            const stats = statsDoc.data() as CreatorStats;
            const userRef = doc(db, "users", stats.creatorId);
            const userSnap = await getDoc(userRef);
            const userData = userSnap.data() as User;

            return {
              ...stats,
              name: userData?.name || "Verox Creator",
              photoURL: userData?.photoURL || null,
              username: userData?.username || stats.creatorId
            };
          })
        );

        setCreators(leaderboardData);
      } catch (error) {
        console.error("Failed to load leaderboard:", error);
      } finally {
        setLoading(false);
      }
    }
    loadLeaderboard();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center mb-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 rounded-full border border-yellow-500/20 bg-yellow-500/5 px-4 py-1.5 text-sm font-medium text-yellow-500 mb-6"
          >
            <Trophy className="w-4 h-4" />
            Top 10 Creators
          </motion.div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-8 uppercase">
            THE HALL OF <span className="text-primary italic">FAME</span>
          </h1>
          <p className="text-zinc-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            Recognizing the educators who are transforming the future of learning on Verox Academy.
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="h-24 bg-zinc-900/50 border border-zinc-800 rounded-3xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {creators.map((creator, index) => (
                <motion.div
                  key={creator.creatorId}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  className="group relative glass p-6 md:p-8 rounded-[2.5rem] border-zinc-800/50 hover:border-primary/30 transition-all duration-300"
                >
                  <div className="flex flex-col md:flex-row md:items-center gap-8">
                    {/* Rank */}
                    <div className="flex items-center gap-4 md:w-16">
                      <span className={`text-4xl font-black italic ${
                        index === 0 ? "text-yellow-500" : 
                        index === 1 ? "text-zinc-400" : 
                        index === 2 ? "text-orange-500" : "text-zinc-700"
                      }`}>
                        #{index + 1}
                      </span>
                    </div>

                    {/* Profile */}
                    <div className="flex items-center gap-6 flex-1">
                      <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden border-4 border-zinc-900 shadow-xl group-hover:scale-105 transition-transform duration-500">
                        <Image
                          src={creator.photoURL || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop"}
                          alt={creator.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-xl font-black text-white">{creator.name}</h3>
                          <ShieldCheck className="w-4 h-4 text-primary" />
                        </div>
                        <p className="text-zinc-500 text-sm font-bold uppercase tracking-widest">@{creator.username}</p>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex flex-wrap items-center gap-8 md:gap-12 text-center md:text-left">
                      <div>
                        <div className="flex items-center gap-2 text-zinc-400 mb-1">
                          <Users className="w-4 h-4" />
                          <span className="text-xl font-black text-white">{creator.totalStudents.toLocaleString()}</span>
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Students</p>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 text-zinc-400 mb-1">
                          <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                          <span className="text-xl font-black text-white">4.9</span>
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Avg Rating</p>
                      </div>
                    </div>

                    <div className="md:ml-auto">
                      <Link href={`/creator/${creator.username}`}>
                        <Button variant="outline" className="rounded-full px-8 group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all">
                          View Studio
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </Link>
                    </div>
                  </div>

                  {/* Aesthetic Background Sparkle for Top 1 */}
                  {index === 0 && (
                    <div className="absolute top-0 right-0 p-4">
                       <Trophy className="w-12 h-12 text-yellow-500/10" />
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-32 text-center"
        >
          <div className="glass max-w-4xl mx-auto p-12 rounded-[3rem] border-primary/20">
            <h2 className="text-3xl font-black mb-6">WANT TO BE ON THIS LIST?</h2>
            <p className="text-zinc-400 mb-10 max-w-2xl mx-auto text-lg">
              Start your creator journey today. Verox Academy provides the tools, traffic, and support to help you become a top educator.
            </p>
            <Link href="/become-creator">
              <Button size="lg" className="rounded-full px-12 h-14 text-lg">Apply as Creator</Button>
            </Link>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
