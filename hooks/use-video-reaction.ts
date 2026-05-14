"use client";

import { useState, useEffect, useCallback } from "react";
import { subscribeToVideoReactions, toggleVideoReaction } from "@/lib/firestore";
import { useAuth } from "./use-auth";

export function useVideoReaction(lessonId: string | undefined) {
  const { user } = useAuth();
  const [stats, setStats] = useState({ likes: 0, dislikes: 0, userReaction: null as "like" | "dislike" | null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!lessonId) return;

    setLoading(true);
    const unsubscribe = subscribeToVideoReactions(lessonId, user?.uid, (data) => {
      setStats(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [lessonId, user?.uid]);

  const toggle = useCallback(async (type: "like" | "dislike") => {
    if (!user || !lessonId) return;

    // Optimistic UI
    const newType = stats.userReaction === type ? null : type;
    setStats(prev => {
      const isRemoving = prev.userReaction === type;
      const isSwitching = prev.userReaction !== null && prev.userReaction !== type;
      
      return {
        ...prev,
        likes: type === "like" ? (isRemoving ? prev.likes - 1 : prev.likes + 1) : (isSwitching ? prev.likes - 1 : prev.likes),
        dislikes: type === "dislike" ? (isRemoving ? prev.dislikes - 1 : prev.dislikes + 1) : (isSwitching ? prev.dislikes - 1 : prev.dislikes),
        userReaction: newType
      };
    });

    try {
      await toggleVideoReaction(user.uid, lessonId, newType);
    } catch (error) {
      console.error("Failed to toggle reaction:", error);
      // Revert optimistic UI on error (in a real app, you'd fetch latest stats here)
    }
  }, [user, lessonId, stats.userReaction]);

  return {
    ...stats,
    loading,
    toggleLike: () => toggle("like"),
    toggleDislike: () => toggle("dislike")
  };
}
