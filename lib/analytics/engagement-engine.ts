/**
 * VEROX ACADEMY - ENGAGEMENT ENGINE
 * ----------------------------------
 * Intelligence layer to score lesson quality.
 * Analyzes behavior to help creators identify high-performing content.
 */

export interface EngagementMetrics {
  watchDuration: number;
  pauseCount: number;
  seekCount: number;
  totalDuration: number;
  isCompleted: boolean;
}

export class EngagementEngine {
  /**
   * Calculates a weighted engagement score (0-100).
   * High completion + low seek frequency = high score.
   */
  static calculateScore(metrics: EngagementMetrics): number {
    if (!metrics.totalDuration) return 0;

    const completionWeight = 0.6;
    const stabilityWeight = 0.4;

    const completionScore = (metrics.watchDuration / metrics.totalDuration) * 100;
    
    // Stability decreases if user seeks too much or pauses constantly
    const friction = (metrics.seekCount * 5) + (metrics.pauseCount * 2);
    const stabilityScore = Math.max(0, 100 - friction);

    const finalScore = (completionScore * completionWeight) + (stabilityScore * stabilityWeight);
    
    return Math.min(100, Math.round(finalScore));
  }

  /**
   * Identifies "Drop Zones" - where students typically stop watching.
   */
  static identifyDropZone(watchTimeline: number[], totalDuration: number): number | null {
    if (watchTimeline.length < 2) return null;
    
    // Logic to find the last sequential timestamp
    const lastWatched = Math.max(...watchTimeline);
    return lastWatched < totalDuration * 0.9 ? lastWatched : null;
  }
}
