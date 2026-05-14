"use client";

import { useState } from "react";
import { auth } from "@/lib/firebase";
import { sendEmailVerification } from "firebase/auth";
import { Button } from "@/components/ui/Button";
import { Mail, CheckCircle2, RefreshCw, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function VerifyEmailPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleResend = async () => {
    if (!auth.currentUser) return;
    setLoading(true);
    try {
      await sendEmailVerification(auth.currentUser);
      setMessage("A fresh verification link has been dispatched.");
    } catch (err) {
      setMessage("Unable to send verification. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-12">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-8"
      >
        <div className="relative mx-auto w-24 h-24">
           <div className="absolute inset-0 bg-accent/20 rounded-4xl animate-pulse" />
           <div className="relative h-full w-full rounded-4xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
              <Mail className="w-10 h-10" />
           </div>
        </div>

        <div className="space-y-4">
           <h3 className="text-2xl font-bold tracking-tight text-foreground">Verify your email</h3>
           <p className="text-sm text-muted-foreground font-medium leading-relaxed max-w-xs mx-auto">
             We've sent a secure verification link to your inbox. Please click the link to finalize your account setup.
           </p>
        </div>

        <div className="space-y-4 pt-4">
           <Button
             onClick={handleResend}
             variant="primary"
             className="w-full h-16 rounded-[1.5rem] shadow-2xl shadow-accent/20 font-bold uppercase tracking-[0.2em] text-[11px]"
             isLoading={loading}
           >
             Resend Verification
           </Button>
           
           {message && (
             <motion.p 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               className="text-[10px] font-bold uppercase tracking-widest text-accent text-center"
             >
               {message}
             </motion.p>
           )}
        </div>
      </motion.div>

      <div className="text-center pt-8 border-t border-border/30">
        <Link href="/login" className="inline-flex items-center gap-2 text-[10px] font-bold text-muted-foreground/60 uppercase tracking-[0.2em] hover:text-foreground transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Authentication
        </Link>
      </div>
    </div>
  );
}
