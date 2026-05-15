/**
 * VEROX ACADEMY - PLAYER CONFIGURATION
 * ------------------------------------
 * Enterprise-grade configuration for the cinematic video engine.
 */

export const PLAYER_CONFIG = {
  // YouTube specific suppression parameters
  youtube: {
    params: {
      modestbranding: 1,
      rel: 0,
      controls: 0, // We use custom controls
      disablekb: 1, // We use custom keyboard shortcuts
      fs: 0, // We handle fullscreen via browser API for custom UI
      playsinline: 1,
      iv_load_policy: 3,
      autohide: 1,
      showinfo: 0,
    }
  },
  
  // Progress tracking thresholds
  progress: {
    saveIntervalSeconds: 10, // Persist to Firestore every 10s
    completionThreshold: 0.85, // 85% watched = completed
    resumeThreshold: 30, // Show resume prompt if > 30s watched
  },

  // UI constants
  ui: {
    hideControlsDelay: 3000, // Hide controls after 3s of inactivity
    autoAdvanceCountdown: 5, // 5 seconds before next lesson
  }
};
