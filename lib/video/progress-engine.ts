/**
 * VEROX ACADEMY - PROGRESS ENGINE
 * --------------------------------
 * Intelligent video progress synchronization logic.
 * Features: Throttling, batching, and resiliency.
 */

import { PLAYER_CONFIG } from "./player-config";

export interface ProgressState {
  currentTime: number;
  duration: number;
  watchedPercentage: number;
  isCompleted: boolean;
}

export class ProgressEngine {
  private lastSavedTime: number = 0;
  private onSave: (state: ProgressState) => Promise<void>;

  constructor(onSave: (state: ProgressState) => Promise<void>) {
    this.onSave = onSave;
  }

  /**
   * Evaluates if progress should be persisted to the server.
   */
  public async track(currentTime: number, duration: number) {
    if (!duration || duration === 0) return;

    const watchedPercentage = currentTime / duration;
    const isCompleted = watchedPercentage >= PLAYER_CONFIG.progress.completionThreshold;
    
    const state: ProgressState = {
      currentTime,
      duration,
      watchedPercentage,
      isCompleted
    };

    // Rule 1: Save if interval reached (e.g. every 10s)
    const timeSinceLastSave = Math.abs(currentTime - this.lastSavedTime);
    if (timeSinceLastSave >= PLAYER_CONFIG.progress.saveIntervalSeconds) {
      await this.save(state);
      return;
    }

    // Rule 2: Save if completed
    if (isCompleted && this.lastSavedTime < (duration * PLAYER_CONFIG.progress.completionThreshold)) {
      await this.save(state);
      return;
    }
  }

  /**
   * Force save (e.g. on pause, tab close)
   */
  public async forceSave(currentTime: number, duration: number) {
    const watchedPercentage = currentTime / duration;
    const isCompleted = watchedPercentage >= PLAYER_CONFIG.progress.completionThreshold;
    
    await this.save({
      currentTime,
      duration,
      watchedPercentage,
      isCompleted
    });
  }

  private async save(state: ProgressState) {
    try {
      await this.onSave(state);
      this.lastSavedTime = state.currentTime;
    } catch (error) {
      console.error("[ProgressEngine] Failed to persist progress:", error);
    }
  }
}
