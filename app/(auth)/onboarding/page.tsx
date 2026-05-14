"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { updateUserProfile } from "@/lib/firestore";
import { Button } from "@/components/ui/Button";
import { GraduationCap, Briefcase, Rocket, ArrowRight, Loader2, Sparkles, Zap, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export default function OnboardingPage() {
  const [role, setRole] = useState<"student" | "creator" | null>(null);
  const [loading, setLoading] = useState(false);
  const { user, profile } = useAuth();
  const router = useRouter();

  const handleComplete = async () => {
    if (!user || !role) return;
    setLoading(true);
    try {
      await updateUserProfile(user.uid, { role });
      router.push(role === "student" ? "/dashboard/" : "/creator/onboarding/");
    } catch (err) {
      console.error("Onboarding failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const roles = [
    {
      id: "student",
      title: "Ambitious Student",
      desc: "Access premium masterclasses and learn from the industry's best creators.",
      icon: GraduationCap,
      color: "text-blue-500",
      bg: "bg-blue-500/10"
    },
    {
      id: "creator",
      title: "Professional Creator",
      desc: "Share your expertise, architect courses, and build your digital brand.",
      icon: Briefcase,
      color: "text-accent",
      bg: "bg-accent/10"
    }
  ];

  return (
    <div className="space-y-12">
      <div className="space-y-3 text-center lg:text-left">
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.4em] text-accent mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          Welcome to the Ecosystem
        </div>
        <h3 className="text-4xl font-bold tracking-tighter text-foreground leading-[1.1]">Choose your path.</h3>
        <p className="text-muted-foreground font-medium text-sm leading-relaxed max-w-sm">Select your primary role to customize your experience within Verox Academy.</p>
      </div>

      <div className="grid gap-4">
        {roles.map((item, i) => (
          <motion.button
            key={item.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            onClick={() => setRole(item.id as any)}
            className={cn(
              "p-8 rounded-4xl border transition-all duration-500 text-left relative overflow-hidden group",
              role === item.id 
                ? "bg-surface-elevated border-accent shadow-2xl shadow-accent/10" 
                : "bg-muted/20 border-border/40 hover:bg-muted/30 hover:border-accent/20"
            )}
          >
            <div className="flex items-center gap-6 relative z-10">
              <div className={cn(
                "h-16 w-16 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-lg",
                role === item.id ? "bg-accent text-white" : cn(item.bg, item.color)
              )}>
                <item.icon className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xl font-bold tracking-tight text-foreground">{item.title}</h4>
                <p className="text-sm text-muted-foreground font-medium leading-relaxed">{item.desc}</p>
              </div>
            </div>
            
            {role === item.id && (
              <div className="absolute right-8 top-1/2 -translate-y-1/2">
                <div className="h-8 w-8 rounded-full bg-accent flex items-center justify-center shadow-xl shadow-accent/20">
                   <CheckCircle2 className="w-5 h-5 text-white" />
                </div>
              </div>
            )}
          </motion.button>
        ))}
      </div>

      <div className="pt-8">
        <Button
          variant="gradient"
          className="w-full h-16 rounded-[1.5rem] shadow-2xl shadow-accent/40 font-bold uppercase tracking-[0.3em] text-[11px] group"
          disabled={!role || loading}
          onClick={handleComplete}
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              Confirm & Continue
              <ArrowRight className="w-4 h-4 ml-3 transition-transform group-hover:translate-x-1" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
