"use client";

import { useState, useEffect } from "react";
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword 
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { createUserIfNotExists } from "@/lib/firestore";
import { Button } from "@/components/ui/Button";
import { ConfirmModal } from "@/components/ui/confirm-modal";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
    // If user and profile are loaded, redirect based on role
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
      <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-200 border-t-zinc-900" />
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

      // Automatically create user document in Firestore
      await createUserIfNotExists({
        uid: firebaseUser.uid,
        email: firebaseUser.email || "",
        name: firebaseUser.displayName,
        photoURL: firebaseUser.photoURL,
      });
    } catch (err: unknown) {
      console.error(err);
      setError((err as any).message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let result;
      if (isSignUp) {
        result = await createUserWithEmailAndPassword(auth, email, password);
        // Create user document in Firestore for new signups
        await createUserIfNotExists({
          uid: result.user.uid,
          email: result.user.email || "",
          name: email.split("@")[0], // Default name from email
          role: "student",
        });
      } else {
        result = await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err: unknown) {
      console.error(err);
      const errorCode = (err as any).code;
      
      if (errorCode === "auth/invalid-credential" || errorCode === "auth/user-not-found") {
        setShowErrorModal({
          isOpen: true,
          title: "Account Not Found",
          message: "We couldn't find an account with this email. Would you like to create a new account and start your learning journey?",
          type: "signup-prompt"
        });
      } else if (errorCode === "auth/wrong-password") {
        setShowErrorModal({
          isOpen: true,
          title: "Incorrect Password",
          message: "The password you entered is incorrect. Please try again or reset your password.",
          type: "error"
        });
      } else {
        setError((err as any).message || "Authentication failed. Please check your credentials.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-zinc-50 px-4 dark:bg-zinc-950">
      <div className="w-full max-w-md space-y-8 rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-black">
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Verox Academy
          </h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            {isSignUp ? "Create an account to start learning" : "Sign in to access your courses and dashboard"}
          </p>
        </div>

        <div className="mt-8 space-y-6">
          {error && (
            <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600 dark:bg-red-950/30 dark:text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleEmailAuth} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="mt-1 block w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:border-zinc-50 dark:focus:ring-zinc-50"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="mt-1 block w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:border-zinc-50 dark:focus:ring-zinc-50"
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full py-6 text-base font-bold shadow-lg shadow-purple-500/20"
            >
              {loading ? "Please wait..." : isSignUp ? "Create Account" : "Sign In"}
            </Button>
          </form>

          <div className="relative flex items-center py-4">
            <div className="flex-grow border-t border-zinc-200 dark:border-zinc-800"></div>
            <span className="mx-4 flex-shrink text-xs font-medium uppercase text-zinc-400 dark:text-zinc-600">Or continue with</span>
            <div className="flex-grow border-t border-zinc-200 dark:border-zinc-800"></div>
          </div>

          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="flex w-full items-center justify-center gap-3 rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-semibold text-zinc-700 transition-all hover:bg-zinc-50 hover:shadow-sm disabled:opacity-50 dark:border-zinc-800 dark:bg-black dark:text-zinc-300 dark:hover:bg-zinc-900"
          >
            {loading ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-600 dark:border-zinc-700 dark:border-t-zinc-400" />
            ) : (
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
            )}
            Google
          </button>
          
          <div className="text-center text-sm">
            <button 
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
            >
              {isSignUp ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
            </button>
          </div>
        </div>

        <p className="mt-8 text-center text-xs text-zinc-500 dark:text-zinc-600">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
      {/* Professional Error/Signup Modal */}
      <ConfirmModal 
        isOpen={showErrorModal.isOpen}
        onClose={() => setShowErrorModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={() => {
          if (showErrorModal.type === "signup-prompt") {
            setIsSignUp(true);
          }
          setShowErrorModal(prev => ({ ...prev, isOpen: false }));
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
