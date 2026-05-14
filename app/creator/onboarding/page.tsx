"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { updateUserProfile } from "@/lib/firestore";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { AuthShell } from "@/components/layout/AuthShell";
import { 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  Sparkles, 
  ShieldCheck, 
  Award, 
  Globe,
  Upload,
  User,
  Briefcase,
  Star,
  Zap,
  Target
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const STEPS = [
  { id: "expertise", title: "Expertise", icon: Briefcase },
  { id: "socials", title: "Presence", icon: Globe },
  { id: "finish", title: "Complete", icon: CheckCircle2 },
];

export default function CreatorOnboardingPage() {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    expertise: "",
    bio: "",
    socialLink: "",
    portfolio: ""
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { user } = useAuth();

  const handleNext = () => setStep(prev => Math.min(prev + 1, STEPS.length - 1));
  const handlePrev = () => setStep(prev => Math.max(prev - 1, 0));

  const handleFinish = async () => {
    if (!user) return;
    setLoading(true);
    try {
      await updateUserProfile(user.uid, { 
        ...formData, 
        role: "creator",
        onboardingCompleted: true 
      });
      router.push("/creator/");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell 
      title="Apply as a Creator" 
      subtitle="Complete your professional profile to start architecting masterclasses on Verox."
    >
      <div className="space-y-12">
        {/* Progress Tracker */}
        <div className="flex items-center justify-between px-2">
           {STEPS.map((s, i) => (
             <div key={s.id} className="flex items-center gap-3">
                <div className={cn(
                  "h-8 w-8 rounded-xl flex items-center justify-center text-xs font-bold transition-all",
                  step === i ? "bg-accent text-white" : step > i ? "bg-emerald-500/20 text-emerald-500" : "bg-muted/40 text-muted-foreground/40"
                )}>
                   {step > i ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                </div>
                <span className={cn(
                  "text-[10px] font-bold uppercase tracking-widest hidden sm:block",
                  step === i ? "text-foreground" : "text-muted-foreground/30"
                )}>
                  {s.title}
                </span>
                {i < STEPS.length - 1 && <div className="h-px w-8 bg-border/40 mx-2 hidden sm:block" />}
             </div>
           ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div
              key="step0"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="space-y-4">
                <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground/60 ml-1">Core Expertise</label>
                <Input
                  placeholder="e.g. Fullstack Engineering, Brand Design"
                  className="h-14 rounded-2xl bg-muted/20 border-border/40 px-6"
                  value={formData.expertise}
                  onChange={e => setFormData({...formData, expertise: e.target.value})}
                />
              </div>
              <div className="space-y-4">
                <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground/60 ml-1">Professional Bio</label>
                <textarea
                  placeholder="Tell us about your industry journey..."
                  className="w-full h-32 rounded-2xl bg-muted/20 border-border/40 p-6 text-sm font-medium resize-none focus:ring-accent/10 focus:border-accent/40 outline-none transition-all"
                  value={formData.bio}
                  onChange={e => setFormData({...formData, bio: e.target.value})}
                />
              </div>
              <Button 
                onClick={handleNext} 
                disabled={!formData.expertise || !formData.bio}
                className="w-full h-16 rounded-[1.5rem] font-bold uppercase tracking-[0.2em] text-[11px]"
              >
                Next Protocol <ArrowRight className="ml-3 w-4 h-4" />
              </Button>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="space-y-4">
                <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground/60 ml-1">Primary Social Link</label>
                <Input
                  placeholder="https://linkedin.com/in/username"
                  className="h-14 rounded-2xl bg-muted/20 border-border/40 px-6"
                  value={formData.socialLink}
                  onChange={e => setFormData({...formData, socialLink: e.target.value})}
                />
              </div>
              <div className="space-y-4">
                <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground/60 ml-1">Portfolio or Website</label>
                <Input
                  placeholder="https://yourportfolio.com"
                  className="h-14 rounded-2xl bg-muted/20 border-border/40 px-6"
                  value={formData.portfolio}
                  onChange={e => setFormData({...formData, portfolio: e.target.value})}
                />
              </div>
              <div className="flex gap-4">
                <Button variant="ghost" onClick={handlePrev} className="h-16 px-8 rounded-2xl font-bold uppercase tracking-widest text-[10px]">Back</Button>
                <Button 
                  onClick={handleNext} 
                  disabled={!formData.socialLink}
                  className="flex-1 h-16 rounded-[1.5rem] font-bold uppercase tracking-[0.2em] text-[11px]"
                >
                  Continue <ArrowRight className="ml-3 w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-10 py-4"
            >
              <div className="h-24 w-24 rounded-4xl bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto text-accent">
                 <Zap className="w-10 h-10 fill-current" />
              </div>
              <div className="space-y-3">
                 <h4 className="text-2xl font-bold tracking-tighter">Ready to architect.</h4>
                 <p className="text-sm text-muted-foreground font-medium leading-relaxed">Your professional application is complete. Click below to initialize your creator studio.</p>
              </div>
              <Button 
                onClick={handleFinish} 
                isLoading={loading}
                className="w-full h-16 rounded-[1.5rem] shadow-2xl shadow-accent/20 font-bold uppercase tracking-[0.2em] text-[11px]"
              >
                Launch Studio
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AuthShell>
  );
}
