"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import {
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { createUserIfNotExists } from "@/lib/firestore";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Eye, EyeOff, ArrowRight, Loader2, Command, Zap } from "lucide-react";
import { motion } from "framer-motion";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { user, profile, loading: authLoading } = useAuth();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect");

  useEffect(() => {
    if (user && profile && !authLoading) {
      if (redirectPath) {
        router.push(redirectPath);
      } else {
        router.push(profile.role === "admin" ? "/admin/" : profile.role === "creator" ? "/creator/" : "/dashboard/");
      }
    }
  }, [user, profile, authLoading, router, redirectPath]);

  if (authLoading || user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-accent" />
      </div>
    );
  }

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      await createUserIfNotExists({
        uid: result.user.uid,
        email: result.user.email || "",
        name: result.user.displayName,
        photoURL: result.user.photoURL,
      });
    } catch (err: any) {
      if (err?.code !== "auth/popup-closed-by-user") {
        setError("Authentication failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      setError("Invalid email or password combination.");
    } finally {
      setLoading(false);
    }
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-10">
      <motion.div variants={item} className="space-y-6">
        <Button
          variant="secondary"
          className="w-full h-14 rounded-2xl shadow-sm border-border/40 font-bold uppercase tracking-widest text-[10px] group transition-all hover:bg-muted/60"
          onClick={handleGoogleLogin}
          disabled={loading}
        >
          <svg className="h-5 w-5 mr-3 transition-transform group-hover:scale-110" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          Continue with Google
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border/40" /></div>
          <div className="relative flex justify-center text-[9px] uppercase tracking-[0.4em] font-bold">
            <span className="bg-surface px-6 text-muted-foreground/40">Secure Access Hub</span>
          </div>
        </div>

        <form onSubmit={handleEmailAuth} className="space-y-6">
          <motion.div variants={item} className="space-y-3">
            <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground/60 ml-1">Email</label>
            <Input
              type="email"
              placeholder="name@example.com"
              required
              className="h-14 rounded-2xl bg-muted/20 border-border/40 px-6 focus:ring-blue-500/5 focus:border-blue-500/40 transition-all text-sm font-medium"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </motion.div>

          <motion.div variants={item} className="space-y-3">
            <div className="flex justify-between items-center px-1">
              <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground/60">Password</label>
              <Link href="/forgot-password" core-recover-access="true" className="text-[10px] font-bold text-blue-600 uppercase tracking-widest hover:underline decoration-2 underline-offset-4">Forgot Password?</Link>
            </div>
            <div className="relative group">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                required
                className="h-14 rounded-2xl bg-muted/20 border-border/40 px-6 pr-14 focus:ring-blue-500/5 focus:border-blue-500/40 transition-all text-sm font-medium"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-6 top-1/2 -translate-y-1/2 text-muted-foreground/40 hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
              </button>
            </div>
          </motion.div>

          {error && (
            <motion.p 
              initial={{ opacity: 0, x: -10 }} 
              animate={{ opacity: 1, x: 0 }}
              className="text-[10px] font-bold uppercase tracking-widest text-destructive/80 ml-1 flex items-center gap-3"
            >
              <div className="h-1.5 w-1.5 rounded-full bg-destructive animate-pulse" />
              {error}
            </motion.p>
          )}

          <motion.div variants={item} className="pt-4">
            <Button
              type="submit"
              className="w-full h-16 rounded-2xl bg-linear-to-r from-blue-600 to-cyan-500 text-white shadow-xl shadow-blue-500/20 font-bold uppercase tracking-[0.2em] text-[11px] group border-none"
              isLoading={loading}
            >
              Sign In
              <ArrowRight className="w-4 h-4 ml-3 transition-transform group-hover:translate-x-1" />
            </Button>
          </motion.div>
        </form>
      </motion.div>

      <motion.div variants={item} className="text-center pt-8 border-t border-border/30">
        <p className="text-sm text-muted-foreground/60 font-medium">
          New to Verox?{" "}
          <Link href="/register" className="text-blue-600 font-bold uppercase tracking-widest hover:underline decoration-2 underline-offset-4 ml-2">
            Create Account
          </Link>
        </p>
      </motion.div>
    </motion.div>

  );
}
