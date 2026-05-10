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
  /** Whether the current user has admin privileges */
  isAdmin: boolean;
  /** Whether the current user has creator privileges */
  isCreator: boolean;
  /** Force refresh the ID token to pick up new custom claims */
  refreshClaims: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  isAdmin: false,
  isCreator: false,
  refreshClaims: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<FirestoreUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isCreator, setIsCreator] = useState(false);

  /**
   * Read admin and creator status from the Firebase ID token's custom claims.
   * Falls back to Firestore profile role for backward compatibility.
   */
  const checkRoles = async (
    firebaseUser: FirebaseUser,
    firestoreProfile: FirestoreUser | null
  ): Promise<{ isAdmin: boolean; isCreator: boolean }> => {
    let admin = false;
    let creator = false;

    try {
      // PRIMARY: Check custom claims from ID token
      const tokenResult = await firebaseUser.getIdTokenResult();
      admin = tokenResult.claims.admin === true;
      creator = tokenResult.claims.creator === true;
    } catch (error) {
      console.error("[AUTH] Failed to read token claims:", error);
    }

    // FALLBACK: Check Firestore profile role
    if (!admin) admin = firestoreProfile?.role === "admin";
    if (!creator) creator = firestoreProfile?.role === "creator";

    return { isAdmin: admin, isCreator: creator };
  };

  /**
   * Force refresh the ID token to pick up newly set custom claims.
   */
  const refreshClaims = async (): Promise<void> => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    await currentUser.getIdToken(true);
    const tokenResult = await currentUser.getIdTokenResult();
    
    setIsAdmin(tokenResult.claims.admin === true || profile?.role === "admin");
    setIsCreator(tokenResult.claims.creator === true || profile?.role === "creator");
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      if (firebaseUser) {
        setUser(firebaseUser);
        await createUserIfNotExists({
          uid: firebaseUser.uid,
          email: firebaseUser.email || "",
          name: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
        });
        const userProfile = await getUserProfile(firebaseUser.uid);
        setProfile(userProfile);

        const { isAdmin: admin, isCreator: creator } = await checkRoles(firebaseUser, userProfile);
        setIsAdmin(admin);
        setIsCreator(creator);
      } else {
        setUser(null);
        setProfile(null);
        setIsAdmin(false);
        setIsCreator(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, profile, loading, isAdmin, isCreator, refreshClaims }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
