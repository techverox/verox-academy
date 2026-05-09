"use client";

import { useAuth as useAuthContext } from "@/context/auth-context";

export const useAuth = () => {
  const context = useAuthContext();
  
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  
  return context;
};
