"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";

/**
 * Dynamic Watermark Overlay
 * Displays user identifiers with randomized positioning to deter piracy.
 */
export function WatermarkOverlay() {
  const { user } = useAuth();
  const [position, setPosition] = useState({ top: "10%", left: "10%" });

  useEffect(() => {
    // Randomize position every 3 minutes
    const interval = setInterval(() => {
      const top = Math.floor(Math.random() * 80 + 5) + "%";
      const left = Math.floor(Math.random() * 80 + 5) + "%";
      setPosition({ top, left });
    }, 180000);

    return () => clearInterval(interval);
  }, []);

  if (!user) return null;

  const displayId = `${user.email?.split("@")[0]}_${user.uid.slice(-6)}`;

  return (
    <div 
      className="yt-suppression-layer pointer-events-none select-none transition-all duration-1000 ease-in-out"
      style={{
        position: "absolute",
        top: position.top,
        left: position.left,
        opacity: 0.15,
        zIndex: 40
      }}
    >
      <div className="flex flex-col items-start font-mono text-[8px] md:text-[10px] font-bold text-white uppercase tracking-widest drop-shadow-lg">
        <span>{displayId}</span>
        <span className="text-[6px] opacity-50">{new Date().toLocaleDateString()}</span>
      </div>
    </div>
  );
}
