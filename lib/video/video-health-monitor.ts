/**
 * VEROX ACADEMY - VIDEO HEALTH MONITOR
 * -------------------------------------
 * Proactive observability for external video providers.
 * Detects deleted, private, or restricted content before students see it.
 */

import { youtubeService } from "./youtube-service";
import { wistiaService } from "./wistia-service";
import { VideoSource } from "@/types/video";

export interface HealthStatus {
  isHealthy: boolean;
  error?: string;
  lastChecked: Date;
}

export class VideoHealthMonitor {
  /**
   * Verifies the status of a video from its provider.
   */
  static async checkStatus(source: VideoSource): Promise<HealthStatus> {
    try {
      let metadata;
      if (source.provider === 'youtube') {
        metadata = await youtubeService.getVideoMetadata(source.videoId);
      } else if (source.provider === 'wistia') {
        metadata = await wistiaService.getVideoMetadata(source.videoId);
      }

      if (!metadata || !metadata.videoId) {
        return {
          isHealthy: false,
          error: "Video not found or unavailable",
          lastChecked: new Date()
        };
      }

      return {
        isHealthy: true,
        lastChecked: new Date()
      };
    } catch (error: any) {
      return {
        isHealthy: false,
        error: error.message || "Provider communication failed",
        lastChecked: new Date()
      };
    }
  }

  /**
   * Resilience helper: Decides if the player should show a fallback UI.
   */
  static shouldShowFallback(health: HealthStatus): boolean {
    return !health.isHealthy;
  }
}
