"use client";

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
import { Eye, EyeOff, BookOpen, ShieldCheck, Award } from "lucide-react";

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
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-border border-t-primary" />
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

  return (
    <div className="flex min-h-screen bg-background">
      {/* Left branding panel — desktop only */}
      <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden bg-primary flex-col justify-between p-12">
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-primary-foreground/10 text-primary-foreground flex items-center justify-center font-bold text-lg">
              V
            </div>
            <span className="text-xl font-bold text-primary-foreground tracking-tight">
              Verox Academy
            </span>
          </div>
        </div>

        <div className="relative z-10 space-y-8">
          <div>
            <h2 className="text-3xl font-bold text-primary-foreground leading-tight mb-4">
              Learn from India's best creators
            </h2>
            <p className="text-primary-foreground/70 text-base leading-relaxed">
              Join 45,000+ students building real skills with structured, practical courses.
            </p>
          </div>

          <div className="space-y-4">
            {[
              { icon: BookOpen, text: "850+ courses across topics" },
              { icon: ShieldCheck, text: "Verified certificates on completion" },
              { icon: Award, text: "Expert-led, practical curriculum" },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-primary-foreground/10 flex items-center justify-center">
                  <item.icon className="w-4 h-4 text-primary-foreground" />
                </div>
                <span className="text-sm text-primary-foreground/80 font-medium">{item.text}</span>
              </div>
            ))}
          </div>

          {/* Testimonial */}
          <div className="bg-primary-foreground/10 rounded-xl p-5 border border-primary-foreground/10">
            <p className="text-sm text-primary-foreground/80 leading-relaxed italic mb-3">
              "Verox Academy completely changed how I approach learning. The courses are practical and the creator support is outstanding."
            </p>
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-full bg-primary-foreground/20 flex items-center justify-center text-primary-foreground font-bold text-sm">
                A
              </div>
              <div>
                <p className="text-xs font-semibold text-primary-foreground">Arjun S.</p>
                <p className="text-xs text-primary-foreground/60">Student, Mumbai</p>
              </div>
            </div>
          </div>
        </div>

        {/* Background decoration */}
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-primary-foreground/5 rounded-full translate-x-1/3 translate-y-1/3 pointer-events-none" />
        <div className="absolute top-1/4 -left-8 w-32 h-32 bg-primary-foreground/5 rounded-full pointer-events-none" />
      </div>

      {/* Right auth panel */}
      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="h-9 w-9 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">
              V
            </div>
            <span className="text-xl font-bold text-foreground tracking-tight">
              Verox Academy
            </span>
          </div>

          {/* Form header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-foreground tracking-tight mb-1">
              {isSignUp ? "Create your account" : "Welcome back"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {isSignUp
                ? "Sign up to start learning today."
                : "Sign in to access your courses and dashboard."}
            </p>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-5 rounded-lg bg-destructive/8 border border-destructive/20 p-4">
              <p className="text-sm text-destructive font-medium">{error}</p>
            </div>
          )}

          {/* Google sign-in */}
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            id="google-signin-btn"
            className="flex w-full items-center justify-center gap-3 h-11 rounded-lg border border-border bg-card text-sm font-medium text-foreground transition-all hover:bg-secondary hover:shadow-sm active:scale-[0.98] disabled:opacity-60 mb-5"
          >
            {loading ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-border border-t-primary" />
            ) : (
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
            )}
            Continue with Google
          </button>

          {/* Divider */}
          <div className="relative flex items-center mb-5">
            <div className="flex-1 border-t border-border" />
            <span className="mx-4 text-xs font-medium text-muted-foreground">or continue with email</span>
            <div className="flex-1 border-t border-border" />
          </div>

          {/* Email / password form */}
          <form onSubmit={handleEmailAuth} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Email address
              </label>
              <input
                id="email-input"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full h-11 px-4 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  id="password-input"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-11 px-4 pr-11 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {isSignUp && (
                <p className="text-xs text-muted-foreground mt-1.5">
                  Must be at least 6 characters.
                </p>
              )}
            </div>

            <Button
              id="auth-submit-btn"
              type="submit"
              disabled={loading}
              className="w-full h-11 text-sm font-semibold rounded-lg"
            >
              {loading
                ? "Please wait..."
                : isSignUp
                ? "Create Account"
                : "Sign In"}
            </Button>
          </form>

          {/* Toggle sign-up / sign-in */}
          <p className="mt-5 text-center text-sm text-muted-foreground">
            {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError(null);
              }}
              className="text-primary font-semibold hover:underline transition-colors"
            >
              {isSignUp ? "Sign In" : "Sign Up Free"}
            </button>
          </p>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            By continuing, you agree to our{" "}
            <a href="/terms" className="hover:underline">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="/privacy" className="hover:underline">
              Privacy Policy
            </a>
            .
          </p>
        </div>
      </div>

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
