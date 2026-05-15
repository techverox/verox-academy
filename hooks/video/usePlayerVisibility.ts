"use client";

import { useEffect, useRef } from "react";

/**
 * Hook to handle player behavior when tab visibility changes.
 * Automatically pauses or saves progress when the user leaves.
 */
export function usePlayerVisibility(onVisibilityChange: (isVisible: boolean) => void) {
  const isVisibleRef = useRef(true);

  useEffect(() => {
    const handleVisibilityChange = () => {
      const isVisible = document.visibilityState === "visible";
      isVisibleRef.current = isVisible;
      onVisibilityChange(isVisible);
    };

    const handleBlur = () => {
      onVisibilityChange(false);
    };

    const handleFocus = () => {
      onVisibilityChange(true);
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleBlur);
    window.addEventListener("focus", handleFocus);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("focus", handleFocus);
    };
  }, [onVisibilityChange]);

  return isVisibleRef;
}
