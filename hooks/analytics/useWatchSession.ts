"use client";

import { useEffect, useRef, useState } from "react";
import { HeatmapEngine } from "@/lib/analytics/heatmap-engine";
import { AggregationEngine } from "@/lib/analytics/aggregation-engine";

/**
 * VEROX ACADEMY - WATCH SESSION HOOK
 * ----------------------------------
 * Manages the lifecycle of a single viewing session.
 * Features: Idle detection, heatmap pings, and aggregation sync.
 */
export function useWatchSession(courseId: string, lessonId: string, isPlaying: boolean, currentTime: number) {
  const sessionStartTime = useRef(Date.now());
  const lastPingTime = useRef(0);
  const [sessionDuration, setSessionDuration] = useState(0);

  useEffect(() => {
    if (!isPlaying) return;

    // Heatmap Tracking: Ping every 5 seconds
    const interval = setInterval(() => {
      const now = Date.now();
      const diff = (now - sessionStartTime.current) / 1000;
      setSessionDuration(diff);

      // Record heatmap bucket
      HeatmapEngine.recordWatch(lessonId, currentTime);
      
      // Update local aggregation (batched)
      if (diff - lastPingTime.current >= 30) {
         AggregationEngine.updateLessonStats(courseId, lessonId, {
            totalWatchTime: 30,
            totalViews: lastPingTime.current === 0 ? 1 : 0
         });
         lastPingTime.current = diff;
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [isPlaying, courseId, lessonId, currentTime]);

  return {
    sessionDuration
  };
}
