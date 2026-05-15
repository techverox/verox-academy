"use client";

import { useState, useEffect } from "react";

/**
 * Hook to manage the resume playback flow.
 * Decides whether to show the resume prompt based on the initial time.
 */
export function useResumePlayback(initialTime: number) {
  const [shouldShowPrompt, setShouldShowPrompt] = useState(false);

  useEffect(() => {
    // Show prompt only if there is significant progress (e.g. > 30s)
    if (initialTime > 30) {
      setShouldShowPrompt(true);
    }
  }, [initialTime]);

  const clearPrompt = () => setShouldShowPrompt(false);

  return {
    shouldShowPrompt,
    clearPrompt
  };
}
