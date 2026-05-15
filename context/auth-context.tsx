/**
 * Auth Context — Client-Side Authentication Provider
 * ====================================================
 * Manages Firebase Auth state and user profile data.
 *
 * UPGRADE: Now uses unified AppUser type to solve TypeScript property access issues.
 * Combines Firebase Auth and Firestore profile data safely.
 */

"use client";

import React, { createContext, useContext, useEffect, useState, useMemo } from "react";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { getUserProfile, createUserIfNotExists } from "@/lib/firestore";
import { User as FirestoreUser, AppUser } from "@/types/firestore";

interface AuthContextType {
  user: AppUser | null;
  profile: FirestoreUser | null;
  /** Raw Firebase User for internal use if needed */
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  isAdmin: boolean;
  isCreator: boolean;
  refreshClaims: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  firebaseUser: null,
  loading: true,
  isAdmin: false,
  isCreator: false,
  refreshClaims: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<FirestoreUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isCreator, setIsCreator] = useState(false);

  // Compute the unified AppUser
  const user = useMemo<AppUser | null>(() => {
    if (!firebaseUser || !profile) return null;

    return {
      uid: firebaseUser.uid,
      email: firebaseUser.email || profile.email,
      name: profile.name || firebaseUser.displayName || "Student",
      photoURL: profile.photoURL || firebaseUser.photoURL || "",
      role: profile.role,
      username: profile.username,
      bio: profile.bio,
      verified: profile.verified,
      onboardingCompleted: profile.onboardingCompleted,
      createdAt: profile.createdAt,
      lastLogin: profile.lastLogin,
    };
  }, [firebaseUser, profile]);

  const checkRoles = async (
    fbUser: FirebaseUser,
    fsProfile: FirestoreUser | null
  ): Promise<{ isAdmin: boolean; isCreator: boolean }> => {
    let admin = false;
    let creator = false;

    try {
      const tokenResult = await fbUser.getIdTokenResult();
      admin = tokenResult.claims.admin === true;
      creator = tokenResult.claims.creator === true;
    } catch (error) {
      console.error("[AUTH] Failed to read token claims:", error);
    }

    if (!admin) admin = fsProfile?.role === "admin";
    if (!creator) creator = fsProfile?.role === "creator";

    return { isAdmin: admin, isCreator: creator };
  };

  const refreshClaims = async (): Promise<void> => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    await currentUser.getIdToken(true);
    const tokenResult = await currentUser.getIdTokenResult();
    
    setIsAdmin(tokenResult.claims.admin === true || profile?.role === "admin");
    setIsCreator(tokenResult.claims.creator === true || profile?.role === "creator");
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setLoading(true);
      if (fbUser) {
        setFirebaseUser(fbUser);
        
        // Ensure user exists in Firestore
        await createUserIfNotExists({
          uid: fbUser.uid,
          email: fbUser.email || "",
          name: fbUser.displayName,
          photoURL: fbUser.photoURL,
        });

        const userProfile = await getUserProfile(fbUser.uid);
        setProfile(userProfile);

        const { isAdmin: admin, isCreator: creator } = await checkRoles(fbUser, userProfile);
        let finalAdmin = admin;
        let finalCreator = creator;

        // Auto-sync custom claims if they diverge from Firestore
        try {
          const tokenResult = await fbUser.getIdTokenResult();
          const claimAdmin = tokenResult.claims.admin === true;
          const claimCreator = tokenResult.claims.creator === true;
          const fsAdmin = userProfile?.role === "admin";
          const fsCreator = userProfile?.role === "creator" || fsAdmin;

          if ((fsAdmin && !claimAdmin) || (fsCreator && !claimCreator)) {
            const token = await fbUser.getIdToken();
            const res = await fetch("/api/auth/sync-claims", {
              method: "POST",
              headers: { Authorization: `Bearer ${token}` }
            });
            
            if (res.ok) {
              await fbUser.getIdToken(true);
              const newTokenResult = await fbUser.getIdTokenResult();
              finalAdmin = newTokenResult.claims.admin === true || fsAdmin;
              finalCreator = newTokenResult.claims.creator === true || fsCreator;
            }
          }
        } catch (error) {
          console.error("[AUTH] Failed to sync claims:", error);
        }

        setIsAdmin(finalAdmin);
        setIsCreator(finalCreator);
      } else {
        setFirebaseUser(null);
        setProfile(null);
        setIsAdmin(false);
        setIsCreator(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, profile, firebaseUser, loading, isAdmin, isCreator, refreshClaims }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
