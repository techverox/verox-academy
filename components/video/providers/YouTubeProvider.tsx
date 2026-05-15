"use client";

import { useEffect, useRef, useState } from "react";
// @ts-ignore
import Plyr from "plyr";
import "plyr/dist/plyr.css";
import { Skeleton } from "@/components/ui/Skeleton";

interface YouTubeProviderProps {
  videoId: string;
  title?: string;
  startAt?: number;
  playing?: boolean;
  seekTo?: number;
  playbackSpeed?: number;
  onComplete?: () => void;
  onProgress?: (seconds: number, duration: number) => void;
  onReady?: () => void;
  volume?: number;
  isMuted?: boolean;
}

/**
 * VEROX CINEMA - ENHANCED YOUTUBE PROVIDER
 * ---------------------------------------
 * Features:
 * - Plyr.js Custom UI
 * - Right-click disabled for security
 * - Robust resume/seek synchronization
 * - Branding ghosting (YT Title/Logo suppression)
 */
export default function YouTubeProvider({
  videoId,
  title,
  startAt = 0,
  playing = false,
  seekTo,
  playbackSpeed = 1,
  onComplete,
  onProgress,
  onReady,
  volume = 100,
  isMuted = false,
}: YouTubeProviderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<Plyr | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    // 1. Create the inner element that Plyr will use
    const innerDiv = document.createElement("div");
    innerDiv.dataset.plyrProvider = "youtube";
    innerDiv.dataset.plyrEmbedId = videoId;
    containerRef.current.appendChild(innerDiv);

    // 2. Initialize Plyr
    const player = new Plyr(innerDiv, {
      controls: [
        "play-large",
        "play",
        "progress",
        "current-time",
        "mute",
        "volume",
        "captions",
        "settings",
        "pip",
        "airplay",
        "fullscreen",
      ],
      settings: ["quality", "speed", "loop"],
      youtube: {
        noCookie: true,
        rel: 0,
        showinfo: 0,
        iv_load_policy: 3,
        modestbranding: 1,
        origin: window.location.origin,
        start: Math.floor(startAt),
      },
      speed: { selected: playbackSpeed, options: [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2] },
      keyboard: { focused: true, global: true },
      tooltips: { controls: true, seek: true },
      displayDuration: true,
      clickToPlay: true,
    });

    playerRef.current = player;

    player.on("ready", () => {
      console.log("[CINEMA] Player Syncing...");
      setIsReady(true);
      
      // Explicitly sync current time for resume accuracy
      if (startAt > 0) {
        player.currentTime = startAt;
      }

      if (onReady) onReady();
      
      // Initial state sync
      player.volume = volume / 100;
      player.muted = isMuted;
      player.speed = playbackSpeed;
      
      if (playing) {
        const p = player.play();
        if (p && typeof p.catch === 'function') p.catch(() => {});
      }
    });

    player.on("timeupdate", () => {
      if (onProgress) {
        onProgress(player.currentTime, player.duration);
      }
    });

    player.on("ended", () => {
      if (onComplete) onComplete();
    });

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
      }
      if (containerRef.current) {
        containerRef.current.innerHTML = "";
      }
    };
  }, [videoId]);

  // Sync state changes after initialization
  useEffect(() => {
    if (!playerRef.current || !isReady) return;

    try {
      if (playing) {
        const p = playerRef.current.play();
        if (p && typeof p.catch === 'function') p.catch(() => {});
      } else {
        playerRef.current.pause();
      }
    } catch (err) {
      console.warn("[CINEMA] Play/Pause sync failed:", err);
    }
  }, [playing, isReady]);

  useEffect(() => {
    if (!playerRef.current || !isReady || seekTo === undefined) return;
    playerRef.current.currentTime = seekTo;
  }, [seekTo, isReady]);

  useEffect(() => {
    if (!playerRef.current || !isReady) return;
    playerRef.current.volume = volume / 100;
  }, [volume, isReady]);

  useEffect(() => {
    if (!playerRef.current || !isReady) return;
    playerRef.current.muted = isMuted;
  }, [isMuted, isReady]);

  useEffect(() => {
    if (!playerRef.current || !isReady) return;
    playerRef.current.speed = playbackSpeed;
  }, [playbackSpeed, isReady]);

  // Disable right-click for security
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
  };

  return (
    <div 
      className="relative w-full aspect-video bg-zinc-950 rounded-3xl overflow-hidden shadow-2xl group verox-plyr-theme"
      onContextMenu={handleContextMenu}
    >
      {/* 1. The Core Engine Container */}
      <div ref={containerRef} className="w-full h-full" />

      {/* 2. Branding Ghosting Layer (Covering YT Title) */}
      <div className="absolute top-0 left-0 w-full h-24 bg-linear-to-b from-black/95 via-black/40 to-transparent z-40 pointer-events-none" />
      
      {/* 3. Corner Branding Overlay */}
      <div className="absolute top-6 left-8 z-50 opacity-60 hover:opacity-100 transition-opacity pointer-events-none">
        <div className="flex items-center gap-2">
           <div className="h-6 w-6 rounded bg-blue-600 flex items-center justify-center font-black text-[10px] text-white shadow-lg">V</div>
           <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-white drop-shadow-md">Cinema</span>
        </div>
      </div>

      {!isReady && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-zinc-950">
           <div className="flex flex-col items-center gap-4">
              <div className="h-10 w-10 animate-spin rounded-full border-2 border-zinc-800 border-t-white" />
              <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-zinc-500">Synchronizing Cinema Engine</p>
           </div>
        </div>
      )}

      <style jsx global>{`
        .verox-plyr-theme {
          --plyr-color-main: #3b82f6;
          --plyr-video-background: #000000;
        }
        .plyr__video-embed iframe {
          top: -50% !important;
          height: 200% !important;
          pointer-events: none !important;
        }
        .ytp-ce-element, .ytp-pause-overlay, .ytp-show-cards-title, .ytp-upnext {
          display: none !important;
        }
        .ytp-watermark, .ytp-youtube-button, .ytp-share-button, .ytp-chrome-top {
          display: none !important;
        }
        .plyr--full-ui.plyr--video .plyr__controls {
          z-index: 45 !important;
        }
        .plyr--video .plyr__video-wrapper {
          z-index: 10;
        }
      `}</style>
    </div>
  );
}
