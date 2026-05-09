"use client";

import { useEffect, useState } from "react";

interface WistiaPlayerProps {
  mediaId: string;
  title?: string;
  onComplete?: () => void;
}

export default function WistiaPlayer({ mediaId, title, onComplete }: WistiaPlayerProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Zero-Script Tracking: We use PostMessage to listen for events from the Wistia Iframe.
    // This avoids loading Wistia's JS in the main window, preventing "Failed to fetch" errors.
    const handleMessage = (event: MessageEvent) => {
      // Wistia sends messages from fast.wistia.net or fast.wistia.com
      if (!event.origin.includes("wistia")) return;

      try {
        const data = typeof event.data === "string" ? JSON.parse(event.data) : event.data;
        
        // Wistia event for video ending
        if (data?.method === "onStateChange" && data?.args?.includes("ended")) {
          if (onComplete) onComplete();
        }
        
        // Also handle the simple 'ended' event if sent
        if (data?.event === "ended" || (data?.method === "fireEvent" && data?.args?.[0] === "end")) {
          if (onComplete) onComplete();
        }
      } catch (e) {
        // Ignore non-JSON messages
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [onComplete]);

  return (
    <div className="group relative w-full overflow-hidden bg-black shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] transition-all duration-700 md:rounded-3xl border border-white/5">
      {/* Cinematic Glow Effect */}
      <div className="absolute -inset-1 bg-gradient-to-r from-zinc-800 via-zinc-400 to-zinc-800 opacity-0 blur-2xl transition-opacity duration-1000 group-hover:opacity-10" />
      
      {/* Premium Loading Skeleton */}
      {!isLoaded && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-zinc-950">
          <div className="relative h-20 w-20">
            <div className="absolute inset-0 animate-ping rounded-full bg-white/5" />
            <div className="absolute inset-4 animate-spin rounded-full border-2 border-zinc-800 border-t-white" />
          </div>
          <div className="mt-8 flex flex-col items-center gap-2">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500">Verox Cinema Engine</p>
            <div className="h-1 w-32 overflow-hidden rounded-full bg-zinc-900">
              <div className="h-full w-1/3 animate-[loading_2s_infinite] bg-white shadow-[0_0_10px_white]" />
            </div>
          </div>
        </div>
      )}

      {/* Wistia Standard Iframe Embed (Isolated & Reliable) */}
      <div className="wistia_responsive_padding" style={{ padding: "56.25% 0 0 0", position: "relative" }}>
        <div className="wistia_responsive_wrapper" style={{ height: "100%", left: 0, position: "absolute", top: 0, width: "100%" }}>
          <iframe 
            src={`https://fast.wistia.com/embed/iframe/${mediaId}?videoFoam=true&version=v1&videoHeight=720&videoWidth=1280`} 
            title={title} 
            allow="autoplay; fullscreen" 
            allowFullScreen
            onLoad={() => setIsLoaded(true)}
            className="wistia_embed border-0" 
            name="wistia_embed" 
            width="100%" 
            height="100%"
          />
        </div>
      </div>

      <style jsx global>{`
        @keyframes loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(300%); }
        }
        .wistia_embed {
          border-radius: 0px !important;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}
