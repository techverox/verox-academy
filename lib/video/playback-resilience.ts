/**
 * VEROX ACADEMY - PLAYBACK RESILIENCE
 * ------------------------------------
 * High-availability logic for video playback.
 * Manages retries and fallback states during network or provider issues.
 */

import { Observability } from "../monitoring/observability";

export class PlaybackResilience {
  private static MAX_RETRIES = 3;

  /**
   * Evaluates if a playback error should trigger a retry or a fallback UI.
   */
  static async handleError(error: any, retryCount: number): Promise<'retry' | 'fallback'> {
    console.error("[RESILIENCE] Playback error detected:", error);
    
    // Log for observability
    await Observability.logEvent('playback_failure', { 
      error: error.message, 
      retryCount 
    });

    // Strategy: Retry for network errors, fallback for provider restrictions
    if (this.isNetworkError(error) && retryCount < this.MAX_RETRIES) {
      return 'retry';
    }

    return 'fallback';
  }

  private static isNetworkError(error: any): boolean {
    const msg = error.message?.toLowerCase() || "";
    return msg.includes("network") || msg.includes("timeout") || msg.includes("failed to fetch");
  }
}
