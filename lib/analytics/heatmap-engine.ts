/**
 * VEROX ACADEMY - HEATMAP ENGINE
 * ------------------------------
 * Compact storage for video engagement heatmaps.
 * Uses bucketed segments to track replay peaks and skips.
 */

import { doc, updateDoc, increment } from "firebase/firestore";
import { db } from "@/lib/firebase";

export class HeatmapEngine {
  private static BUCKET_SIZE = 5; // 5-second buckets

  /**
   * Records watch activity for a specific timestamp.
   * Increments the corresponding bucket in Firestore.
   */
  static async recordWatch(lessonId: string, timestamp: number) {
    const bucketIndex = Math.floor(timestamp / this.BUCKET_SIZE);
    const heatmapRef = doc(db, "analytics_heatmaps", lessonId);

    try {
      // Use dynamic field keys to increment specific buckets
      // Format: b_0, b_1, b_2...
      await updateDoc(heatmapRef, {
        [`buckets.b_${bucketIndex}`]: increment(1),
        totalPings: increment(1)
      });
    } catch (error: any) {
      // Heatmap docs should be initialized by a creator-side trigger 
      // or here if we want absolute resilience.
    }
  }

  /**
   * Compiles heatmap data for visualization.
   */
  static processHeatmapData(rawBuckets: Record<string, number>, duration: number) {
    const totalBuckets = Math.ceil(duration / this.BUCKET_SIZE);
    const data = [];

    for (let i = 0; i < totalBuckets; i++) {
      data.push({
        time: i * this.BUCKET_SIZE,
        value: rawBuckets[`b_${i}`] || 0
      });
    }

    return data;
  }
}
