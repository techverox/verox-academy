"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { collection, query, orderBy, limit, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { CreatorStats, User } from "@/types/firestore";
import Image from "next/image";
import Link from "next/link";
import { Trophy, Users, Star, ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { SectionWrapper } from "@/components/layout/SectionWrapper";
import { ContentContainer } from "@/components/layout/ContentContainer";

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
    <div className="min-h-screen bg-background pb-32">
      <SectionWrapper className="relative pt-24 pb-12 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(37,99,235,0.04),transparent_60%)] pointer-events-none" />
        <ContentContainer>
          <div className="max-w-4xl mx-auto text-center mb-16">
            <Badge variant="outline" className="h-8 px-5 rounded-full border-blue-200 bg-blue-50 text-blue-600 text-[10px] font-bold uppercase tracking-[0.2em] mb-8">
              <Trophy className="w-3.5 h-3.5 mr-2" />
              Leaderboard
            </Badge>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-8">
              The <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-cyan-500">Global Elite.</span>
            </h1>
            <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
              Recognizing the educators who are transforming the future of learning on Verox Academy.
            </p>
          </div>

          <div className="max-w-5xl mx-auto space-y-6">
            {loading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-28 bg-white dark:bg-zinc-900/50 border border-border/40 rounded-4xl animate-pulse" />
                ))}
              </div>
            ) : (
              creators.map((creator, index) => (
                <motion.div
                  key={creator.creatorId}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  className="group relative bg-white dark:bg-zinc-900/50 p-6 md:p-8 rounded-4xl border border-border/40 hover:border-blue-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-black/2 dark:shadow-none"
                >
                  <div className="flex flex-col md:flex-row md:items-center gap-8">
                    {/* Rank */}
                    <div className="flex items-center gap-4 md:w-16">
                      <span className={`text-3xl font-bold italic ${
                        index === 0 ? "text-blue-600" : 
                        index === 1 ? "text-zinc-400" : 
                        index === 2 ? "text-orange-500" : "text-zinc-300"
                      }`}>
                        #{index + 1}
                      </span>
                    </div>

                    {/* Profile */}
                    <div className="flex items-center gap-6 flex-1">
                      <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-3xl overflow-hidden border border-border/40 shadow-sm group-hover:scale-105 transition-transform duration-500 bg-muted">
                        <Image
                          src={creator.photoURL || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop"}
                          alt={creator.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-xl font-bold text-foreground">{creator.name}</h3>
                          <ShieldCheck className="w-4 h-4 text-blue-500" />
                        </div>
                        <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest">@{creator.username}</p>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex flex-wrap items-center gap-8 md:gap-12 text-center md:text-left">
                      <div>
                        <div className="flex items-center gap-2 text-muted-foreground mb-1">
                          <Users className="w-4 h-4" />
                          <span className="text-xl font-bold text-foreground">{creator.totalStudents.toLocaleString()}</span>
                        </div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">Students</p>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 text-muted-foreground mb-1">
                          <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                          <span className="text-xl font-bold text-foreground">4.9</span>
                        </div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">Rating</p>
                      </div>
                    </div>

                    <div className="md:ml-auto">
                      <Link href={`/creator/${creator.username}`}>
                        <Button className="h-12 px-8 rounded-full bg-linear-to-r from-blue-600 to-cyan-500 text-white font-semibold border-none shadow-lg shadow-blue-500/20 hover:scale-[1.02] transition-all">
                          View Studio
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </Link>
                    </div>
                  </div>

                  {index === 0 && (
                    <div className="absolute top-0 right-0 p-4 opacity-[0.03]">
                       <Trophy className="w-24 h-24 text-blue-600" />
                    </div>
                  )}
                </motion.div>
              ))
            )}
          </div>
        </ContentContainer>
      </SectionWrapper>

      {/* CTA */}
      <ContentContainer className="mt-20">
        <div className="relative rounded-5xl bg-linear-to-br from-blue-600 via-blue-600 to-cyan-500 overflow-hidden p-12 md:p-20 text-center">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-size-[40px_40px]" />
          <div className="relative z-10 space-y-8">
            <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tighter">Ready to join the elite?</h2>
            <p className="text-white/70 text-lg max-w-2xl mx-auto font-medium">
              Start your creator journey today. Verox Academy provides the tools, audience, and support to help you become a top global educator.
            </p>
            <div className="flex justify-center">
              <Link href="/become-creator">
                <Button className="h-16 px-12 rounded-full bg-white text-blue-600 font-bold text-lg shadow-2xl shadow-blue-900/30 hover:scale-[1.02] transition-all border-none">
                  Apply as Creator
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </ContentContainer>
    </div>
  );
}
