/**
 * Auth Context — Client-Side Authentication Provider
 * ====================================================
 * Manages Firebase Auth state and user profile data.
 *
 * UPGRADE: Now reads custom claims from the ID token for admin status.
 * This eliminates the need for Firestore reads to check admin role,
 * reducing latency and costs.
 *
 * The `isAdmin` flag comes from:
 * 1. Firebase Custom Claims (token.admin === true) — PRIMARY
 * 2. Firestore profile role — FALLBACK (backward compatibility)
 */

"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { getUserProfile, createUserIfNotExists } from "@/lib/firestore";
import { User as FirestoreUser } from "@/types/firestore";

interface AuthContextType {
  user: FirebaseUser | null;
  profile: FirestoreUser | null;
  loading: boolean;
  /** Whether the current user has admin privileges (from custom claims or Firestore role) */
  isAdmin: boolean;
  /** Force refresh the ID token to pick up new custom claims */
  refreshClaims: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  isAdmin: false,
  refreshClaims: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<FirestoreUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  /**
   * Read admin status from the Firebase ID token's custom claims.
   * Falls back to Firestore profile role for backward compatibility.
   */
  const checkAdminStatus = async (
    firebaseUser: FirebaseUser,
    firestoreProfile: FirestoreUser | null
  ): Promise<boolean> => {
    try {
      // PRIMARY: Check custom claims from ID token
      const tokenResult = await firebaseUser.getIdTokenResult();
      if (tokenResult.claims.admin === true) {
        return true;
      }
    } catch (error) {
      console.error("[AUTH] Failed to read token claims:", error);
    }

    // FALLBACK: Check Firestore profile role (backward compatibility)
    // This ensures existing admins still work before custom claims are set
    return firestoreProfile?.role === "admin";
  };

  /**
   * Force refresh the ID token to pick up newly set custom claims.
   * Call this after admin claims are modified via the API.
   */
  const refreshClaims = async (): Promise<void> => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    // Force refresh the token (true = force)
    await currentUser.getIdToken(true);
    const tokenResult = await currentUser.getIdTokenResult();
    setIsAdmin(tokenResult.claims.admin === true || profile?.role === "admin");
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      if (firebaseUser) {
        setUser(firebaseUser);
        // Ensure user exists in Firestore and fetch profile
        await createUserIfNotExists({
          uid: firebaseUser.uid,
          email: firebaseUser.email || "",
          name: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
        });
        const userProfile = await getUserProfile(firebaseUser.uid);
        setProfile(userProfile);

        // Check admin status from custom claims + Firestore fallback
        const adminStatus = await checkAdminStatus(firebaseUser, userProfile);
        setIsAdmin(adminStatus);
      } else {
        setUser(null);
        setProfile(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, profile, loading, isAdmin, refreshClaims }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
