"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import {
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { createUserIfNotExists } from "@/lib/firestore";
import { Button } from "@/components/ui/Button";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { Eye, EyeOff, BookOpen, ShieldCheck, ArrowRight, Loader2, Command } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showErrorModal, setShowErrorModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: "error" | "signup-prompt";
  }>({ isOpen: false, title: "", message: "", type: "error" });
  const router = useRouter();
  const { user, profile, loading: authLoading } = useAuth();

  useEffect(() => {
    if (user && profile && !authLoading) {
      if (profile.role === "admin") {
        router.push("/admin/");
      } else {
        router.push("/dashboard/");
      }
    }
  }, [user, profile, authLoading, router]);

  if (authLoading || user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const firebaseUser = result.user;
      await createUserIfNotExists({
        uid: firebaseUser.uid,
        email: firebaseUser.email || "",
        name: firebaseUser.displayName,
        photoURL: firebaseUser.photoURL,
      });
    } catch (err: unknown) {
      const code = (err as any)?.code;
      if (code === "auth/popup-closed-by-user") return;
      console.error(err);
      setError("Google sign-in failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        await createUserIfNotExists({
          uid: result.user.uid,
          email: result.user.email || "",
          name: email.split("@")[0],
          role: "student",
        });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err: unknown) {
      console.error(err);
      const errorCode = (err as any).code;

      if (errorCode === "auth/invalid-credential" || errorCode === "auth/user-not-found") {
        setShowErrorModal({
          isOpen: true,
          title: "Account Not Found",
          message:
            "We couldn't find an account with this email. Would you like to create a new account?",
          type: "signup-prompt",
        });
      } else if (errorCode === "auth/wrong-password") {
        setShowErrorModal({
          isOpen: true,
          title: "Incorrect Password",
          message: "The password you entered is incorrect. Please try again.",
          type: "error",
        });
      } else if (errorCode === "auth/weak-password") {
        setError("Password must be at least 6 characters.");
      } else if (errorCode === "auth/email-already-in-use") {
        setError("An account with this email already exists. Please sign in instead.");
      } else {
        setError((err as any).message || "Authentication failed. Please check your credentials.");
      }
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-6 sm:p-12 overflow-hidden">
      {/* Background with Image + Overlay */}
      <div className="absolute inset-0 z-0">
        <div 
          className="absolute inset-0 bg-cover bg-center grayscale-[20%] dark:grayscale-0 transition-all duration-700" 
          style={{ backgroundImage: "url('/login_background_premium_1778608004555.png')" }} 
        />
        <div className="absolute inset-0 bg-background/60 dark:bg-black/40 backdrop-blur-[2px]" />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 w-full max-w-[1100px] grid lg:grid-cols-2 gap-0 overflow-hidden rounded-[2.5rem] bg-background shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] border border-border"
      >
        {/* Left Section: Branding & Social Proof */}
        <div className="hidden lg:flex flex-col justify-between p-12 bg-secondary/30 dark:bg-card/30 border-r border-border backdrop-blur-md">
          <motion.div variants={itemVariants}>
            <Link href="/" className="flex items-center gap-3 group">
              <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center font-bold text-primary-foreground shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform">
                V
              </div>
              <span className="text-2xl font-bold tracking-tight text-foreground">
                Verox<span className="text-primary">.</span>
              </span>
            </Link>
          </motion.div>

          <div className="space-y-8">
            <motion.div variants={itemVariants} className="space-y-4">
              <h1 className="text-5xl font-extrabold text-foreground leading-[1.1] tracking-tight">
                Unlock Your <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-500">
                  Full Potential
                </span>
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed max-w-sm">
                Join India's most advanced learning matrix. Practical courses for the modern era.
              </p>
            </motion.div>

            <motion.div variants={itemVariants} className="grid gap-4">
               {[
                 { icon: BookOpen, text: "850+ Premium Courses" },
                 { icon: ShieldCheck, text: "Verified Certification" },
               ].map((feature, i) => (
                 <div key={i} className="flex items-center gap-3 p-4 rounded-2xl bg-background/50 border border-border hover:border-primary/30 transition-colors">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                       <feature.icon className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-sm font-semibold text-foreground">{feature.text}</span>
                 </div>
               ))}
            </motion.div>
          </div>

          <motion.div variants={itemVariants} className="flex items-center gap-4 p-4 rounded-2xl bg-primary/5 border border-primary/10">
             <div className="flex -space-x-3">
                {[1,2,3,4].map(i => (
                  <div key={i} className="h-8 w-8 rounded-full border-2 border-background bg-muted overflow-hidden">
                     <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="avatar" />
                  </div>
                ))}
             </div>
             <p className="text-xs font-bold text-foreground">
                Joined by <span className="text-primary">45,000+</span> professionals
             </p>
          </motion.div>
        </div>

        {/* Right Section: Auth Form */}
        <div className="flex flex-col justify-center p-8 sm:p-16 bg-background dark:bg-card">
          <motion.div variants={itemVariants} className="mb-10 text-center lg:text-left">
            <h2 className="text-3xl font-bold text-foreground tracking-tight mb-2">
              {isSignUp ? "Create account" : "Welcome back"}
            </h2>
            <p className="text-muted-foreground">
              {isSignUp ? "Start your journey today" : "Glad to see you again"}
            </p>
          </motion.div>

          <motion.div variants={itemVariants} className="space-y-6">
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full h-12 flex items-center justify-center gap-3 rounded-xl bg-background border border-border text-foreground font-semibold hover:bg-secondary hover:border-primary/30 transition-all active:scale-[0.98] shadow-sm"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Continue with Google
            </button>

            <div className="relative flex items-center">
              <div className="flex-1 border-t border-border" />
              <span className="mx-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">OR EMAIL</span>
              <div className="flex-1 border-t border-border" />
            </div>

            <form onSubmit={handleEmailAuth} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full h-12 px-4 rounded-xl bg-secondary/30 dark:bg-background/30 border border-border focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none text-foreground font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1">
                    Password
                  </label>
                  {!isSignUp && (
                    <button type="button" className="text-xs font-bold text-primary hover:underline">
                      Forgot?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full h-12 px-4 pr-12 rounded-xl bg-secondary/30 dark:bg-background/30 border border-border focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none text-foreground font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-14 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl shadow-xl shadow-primary/20 hover:scale-[1.01] active:scale-[0.99] transition-all"
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <span className="flex items-center gap-2">
                    {isSignUp ? "Get Started" : "Sign In"}
                    <ArrowRight className="w-5 h-5" />
                  </span>
                )}
              </Button>
            </form>
          </motion.div>

          <motion.div variants={itemVariants} className="mt-10 text-center">
            <p className="text-sm text-muted-foreground font-medium">
              {isSignUp ? "Already have an account?" : "New to Verox Academy?"}{" "}
              <button
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError(null);
                }}
                className="text-primary font-bold hover:underline"
              >
                {isSignUp ? "Sign In" : "Create Account"}
              </button>
            </p>
          </motion.div>

          <motion.p variants={itemVariants} className="mt-auto pt-10 text-[10px] text-center text-muted-foreground uppercase tracking-widest font-bold">
            © 2026 Verox Systems • Privacy • Terms
          </motion.p>
        </div>
      </motion.div>

      {/* Error/Signup Modal */}
      <ConfirmModal
        isOpen={showErrorModal.isOpen}
        onClose={() => setShowErrorModal((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={() => {
          if (showErrorModal.type === "signup-prompt") {
            setIsSignUp(true);
          }
          setShowErrorModal((prev) => ({ ...prev, isOpen: false }));
        }}
        title={showErrorModal.title}
        message={showErrorModal.message}
        confirmText={showErrorModal.type === "signup-prompt" ? "Sign Up Now" : "Try Again"}
        cancelText="Close"
        variant={showErrorModal.type === "signup-prompt" ? "info" : "danger"}
      />
    </div>
  );
}
