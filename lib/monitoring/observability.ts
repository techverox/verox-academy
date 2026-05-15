/**
 * VEROX ACADEMY - OBSERVABILITY LAYER
 * ------------------------------------
 * High-level health metrics for platform administrators.
 * Tracks operational success rates and failure patterns.
 */

import { doc, setDoc, increment } from "firebase/firestore";
import { db } from "@/lib/firebase";

export class Observability {
  /**
   * Records a platform-level event for observability.
   */
  static async logEvent(type: 'playback_success' | 'playback_failure' | 'api_error', metadata?: any) {
    const today = new Date().toISOString().split('T')[0];
    const metricsRef = doc(db, "system_observability", today);

    try {
      await setDoc(metricsRef, {
        [`counts.${type}`]: increment(1),
        lastEvent: new Date(),
        // We could store samples of errors if metadata is provided
      }, { merge: true });
    } catch (error) {
      // Fail silently for observability logs to prevent disruption
    }
  }

  /**
   * Tracks playback latency.
   */
  static async trackLatency(ms: number) {
    if (ms > 5000) {
      await this.logEvent('api_error', { context: 'high_latency', value: ms });
    }
  }
}
