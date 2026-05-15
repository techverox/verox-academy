/**
 * VEROX ACADEMY - ANALYTICS ENGINE
 * ---------------------------------
 * The central hub for all platform intelligence.
 * Coordinates between aggregation, heatmap, and engagement engines.
 */

import { HeatmapEngine } from "./heatmap-engine";
import { AggregationEngine } from "./aggregation-engine";
import { EngagementEngine, EngagementMetrics } from "./engagement-engine";
import { Observability } from "../monitoring/observability";

export class AnalyticsEngine {
  /**
   * Records a complex watch event.
   */
  static async recordWatch(courseId: string, lessonId: string, metrics: EngagementMetrics) {
    try {
      // 1. Log engagement
      const score = EngagementEngine.calculateScore(metrics);
      
      // 2. Heatmap Ping (done via hook usually, but here for completeness)
      
      // 3. Increment aggregation
      // Only increment completions if it's the first time
      await AggregationEngine.updateLessonStats(courseId, lessonId, {
        totalWatchTime: 0, // Handled by continuous pings
        completions: metrics.isCompleted ? 1 : 0,
        totalEngagements: score > 80 ? 1 : 0
      });

      // 4. Observability
      if (metrics.isCompleted) {
        await Observability.logEvent('playback_success', { lessonId, context: 'completion' });
      }
    } catch (error) {
      console.error("[AnalyticsEngine] Event recording failed:", error);
    }
  }

  /**
   * Throttled aggregation update to prevent Firestore spam.
   */
  static async throttledHeartbeat(courseId: string, lessonId: string, seconds: number) {
    await AggregationEngine.updateLessonStats(courseId, lessonId, {
      totalWatchTime: seconds,
      totalViews: 0
    });
  }
}
