"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { VideoProgress } from "@/types/firestore";
import { getVideoProgress, saveVideoProgress } from "@/lib/firestore";
import { useAuth } from "./use-auth";

export function useVideoProgress(courseId: string | null, lessonId: string | undefined) {
  const { user } = useAuth();
  const [lastProgress, setLastProgress] = useState<VideoProgress | null>(null);
  const [loading, setLoading] = useState(true);
  
  const progressRef = useRef<{ watchedSeconds: number; duration: number } | null>(null);
  const saveIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initial fetch
  useEffect(() => {
    if (!user || !lessonId) return;

    setLoading(true);
    getVideoProgress(user.uid, lessonId)
      .then((progress) => {
        setLastProgress(progress);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Failed to fetch video progress:", error);
        setLoading(false);
      });
  }, [user, lessonId]);

  // Save progress logic
  const save = useCallback(async (completedForce = false) => {
    if (!user || !courseId || !lessonId || !progressRef.current) return;

    const { watchedSeconds, duration } = progressRef.current;
    if (watchedSeconds < 1) return; // Don't save 0 seconds

    const isCompleted = completedForce || (watchedSeconds / duration) >= 0.9;

    await saveVideoProgress({
      id: `${user.uid}_${lessonId}`,
      userId: user.uid,
      courseId,
      lessonId,
      watchedSeconds,
      duration,
      completed: isCompleted
    });
  }, [user, courseId, lessonId]);

  // Auto-save interval
  useEffect(() => {
    saveIntervalRef.current = setInterval(() => {
      save();
    }, 10000); // Save every 10 seconds

    return () => {
      if (saveIntervalRef.current) clearInterval(saveIntervalRef.current);
      save(); // Save one last time on cleanup
    };
  }, [save]);

  const updateProgress = useCallback((seconds: number, duration: number) => {
    progressRef.current = { watchedSeconds: seconds, duration };
  }, []);

  return {
    lastProgress,
    loading,
    updateProgress,
    manualSave: save
  };
}
