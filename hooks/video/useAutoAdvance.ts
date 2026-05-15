"use client";

import { useState, useCallback } from "react";

/**
 * Hook to manage automatic lesson transitions.
 */
export function useAutoAdvance(onNext: () => void) {
  const [isCountingDown, setIsCountingDown] = useState(false);

  const startAutoAdvance = useCallback(() => {
    setIsCountingDown(true);
  }, []);

  const cancelAutoAdvance = useCallback(() => {
    setIsCountingDown(false);
  }, []);

  return {
    isCountingDown,
    startAutoAdvance,
    cancelAutoAdvance
  };
}
