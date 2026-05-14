"use client";

import Link from "next/link";
import { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ArrowLeft, Send, Loader2, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);
    try {
      await sendPasswordResetEmail(auth, email);
      setMessage("Recovery instructions have been sent to your email.");
    } catch (err: any) {
      setError("Unable to process recovery. Please verify your email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-10">
      {message ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-8 rounded-4xl bg-blue-500/5 border border-blue-500/20 text-center space-y-6"
        >
          <div className="h-16 w-16 rounded-2xl bg-blue-500/20 flex items-center justify-center mx-auto text-blue-600">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold tracking-tight text-foreground">Recovery Initiated</h3>
            <p className="text-sm text-muted-foreground font-medium leading-relaxed">{message}</p>
          </div>
          <Link href="/login" className="block">
            <Button variant="outline" className="w-full h-12 rounded-xl font-bold uppercase tracking-widest text-[10px]">Back to Login</Button>
          </Link>
        </motion.div>
      ) : (
        <>
          <form onSubmit={handleReset} className="space-y-6">
            <div className="space-y-3">
              <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground/60 ml-1">Account Email</label>
              <Input
                type="email"
                placeholder="name@example.com"
                required
                className="h-14 rounded-2xl bg-muted/20 border-border/40 px-6 focus:ring-blue-500/5 focus:border-blue-500/40 transition-all text-sm font-medium"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {error && (
              <p className="text-[10px] font-bold uppercase tracking-widest text-destructive/80 ml-1 flex items-center gap-3">
                <div className="h-1.5 w-1.5 rounded-full bg-destructive animate-pulse" />
                {error}
              </p>
            )}

            <Button
              type="submit"
              className="w-full h-16 rounded-2xl bg-linear-to-r from-blue-600 to-cyan-500 text-white shadow-xl shadow-blue-500/20 font-bold uppercase tracking-[0.2em] text-[11px] group border-none"
              isLoading={loading}
            >
              Send Instructions
              <Send className="w-4 h-4 ml-3 transition-transform group-hover:translate-x-1" />
            </Button>
          </form>

          <div className="text-center pt-8 border-t border-border/30">
            <Link href="/login" className="inline-flex items-center gap-2 text-[10px] font-bold text-muted-foreground/60 uppercase tracking-[0.2em] hover:text-foreground transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" />
              Return to Authentication
            </Link>
          </div>
        </>
      )}
    </div>

  );
}
