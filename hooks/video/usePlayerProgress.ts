"use client";

import { useCallback, useRef, useState } from "react";
import { ProgressEngine, ProgressState } from "@/lib/video/progress-engine";
import { saveVideoProgress } from "@/lib/firestore";
import { useAuth } from "@/hooks/use-auth";

/**
 * Orchestrates video progress tracking and Firestore persistence.
 */
export function usePlayerProgress(courseId: string, lessonId: string) {
  const { user } = useAuth();
  const [progress, setProgress] = useState<ProgressState>({
    currentTime: 0,
    duration: 0,
    watchedPercentage: 0,
    isCompleted: false
  });

  const engineRef = useRef<ProgressEngine | null>(null);

  // Initialize engine with persistence logic
  if (!engineRef.current && user && courseId && lessonId) {
    engineRef.current = new ProgressEngine(async (state) => {
      await saveVideoProgress({
        id: `${user.uid}_${lessonId}`,
        userId: user.uid,
        courseId,
        lessonId,
        watchedSeconds: state.currentTime,
        duration: state.duration,
        completed: state.isCompleted
      });
    });
  }

  const updateProgress = useCallback((currentTime: number, duration: number) => {
    setProgress({
      currentTime,
      duration,
      watchedPercentage: duration > 0 ? currentTime / duration : 0,
      isCompleted: (duration > 0 && currentTime / duration >= 0.85)
    });

    if (engineRef.current) {
      engineRef.current.track(currentTime, duration);
    }
  }, []);

  const forceSync = useCallback(async (currentTime: number, duration: number) => {
    if (engineRef.current) {
      await engineRef.current.forceSave(currentTime, duration);
    }
  }, []);

  return {
    progress,
    updateProgress,
    forceSync
  };
}
