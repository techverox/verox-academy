"use client";

import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/Skeleton";

interface WistiaProviderProps {
  videoId: string;
  title?: string;
  startAt?: number;
  autoplay?: boolean;
  playing?: boolean;
  seekTo?: number;
  onComplete?: () => void;
  onProgress?: (seconds: number, duration: number) => void;
  onReady?: () => void;
}

export default function WistiaProvider({
  videoId,
  title,
  startAt = 0,
  autoplay = false,
  playing = false,
  seekTo,
  onComplete,
  onProgress,
  onReady,
}: WistiaProviderProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (!event.origin.includes("wistia")) return;

      try {
        const data = typeof event.data === "string" ? JSON.parse(event.data) : event.data;
        
        // Handle time updates
        if (data?.method === "timechange" || data?.event === "timechange") {
          const seconds = data?.args?.[0] || data?.time;
          const duration = data?.args?.[1] || data?.duration;
          if (onProgress && typeof seconds === "number") {
            onProgress(seconds, duration || 0);
          }
        }

        // Handle completion
        if (data?.method === "onStateChange" && data?.args?.includes("ended")) {
          if (onComplete) onComplete();
        }
        
        if (data?.event === "ended" || (data?.method === "fireEvent" && data?.args?.[0] === "end")) {
          if (onComplete) onComplete();
        }
      } catch (e) {
        // Ignore non-JSON messages
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [onComplete, onProgress]);

  return (
    <div className="relative w-full aspect-video bg-zinc-950 rounded-3xl overflow-hidden shadow-2xl">
      {!isLoaded && (
        <div className="absolute inset-0 z-10">
          <Skeleton className="w-full h-full rounded-3xl" />
          <div className="absolute inset-0 flex items-center justify-center bg-zinc-950">
            <div className="flex flex-col items-center gap-4">
              <div className="h-10 w-10 animate-spin rounded-full border-2 border-zinc-800 border-t-white" />
              <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-zinc-500">Verox Cinema Engine</p>
            </div>
          </div>
        </div>
      )}

      <div className="w-full h-full" style={{ position: "relative" }}>
        <iframe 
          src={`https://fast.wistia.com/embed/iframe/${videoId}?videoFoam=true&version=v1&videoHeight=720&videoWidth=1280&autoplay=${(playing || autoplay) ? "true" : "false"}${startAt ? `&time=${startAt}` : ""}`} 
          title={title} 
          allow="autoplay; fullscreen" 
          allowFullScreen
          onLoad={() => {
            setIsLoaded(true);
            if (onReady) onReady();
          }}
          loading="lazy"
          className="border-0 w-full h-full" 
          name="wistia_embed" 
        />
      </div>
    </div>
  );
}
