"use client";

import dynamic from "next/dynamic";
import { VideoSource } from "@/types/video";
import { Skeleton } from "@/components/ui/Skeleton";
import { Suspense, useMemo } from "react";

// Dynamic imports for providers to minimize bundle size
const YouTubeProvider = dynamic(() => import("./providers/YouTubeProvider"), {
  ssr: false,
  loading: () => <Skeleton className="w-full aspect-video rounded-3xl" />,
});

const WistiaProvider = dynamic(() => import("./providers/WistiaProvider"), {
  ssr: false,
  loading: () => <Skeleton className="w-full aspect-video rounded-3xl" />,
});

interface VideoEngineProps {
  source: VideoSource;
  title?: string;
  startAt?: number;
  autoplay?: boolean;
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
 * VideoEngine Component
 * A high-level abstraction that renders the appropriate video player based on the provider.
 * Supports YouTube, Wistia (Legacy), and future providers.
 */
export function VideoEngine({
  source,
  title,
  startAt,
  autoplay = false,
  playing = false,
  seekTo,
  playbackSpeed = 1,
  onComplete,
  onProgress,
  onReady,
  volume,
  isMuted,
}: VideoEngineProps) {
  
  const Player = useMemo(() => {
    switch (source.provider) {
      case 'youtube':
        return YouTubeProvider;
      case 'wistia':
        return WistiaProvider;
      default:
        console.error(`[VideoEngine] Unsupported provider: ${source.provider}`);
        return null;
    }
  }, [source.provider]);

  if (!Player) {
    return (
      <div className="w-full aspect-video rounded-3xl bg-zinc-900 flex items-center justify-center border border-white/5">
        <p className="text-muted-foreground text-sm font-bold uppercase tracking-widest">Unsupported Video Provider</p>
      </div>
    );
  }

  return (
    <div className="w-full aspect-video rounded-3xl overflow-hidden bg-black shadow-2xl ring-1 ring-white/5 transition-all duration-700">
      <Suspense fallback={<Skeleton className="w-full h-full rounded-3xl" />}>
        <Player 
          videoId={source.videoId}
          title={title}
          startAt={startAt}
          playing={playing || autoplay}
          seekTo={seekTo}
          playbackSpeed={playbackSpeed}
          onComplete={onComplete}
          onProgress={onProgress}
          onReady={onReady}
          volume={volume}
          isMuted={isMuted}
        />
      </Suspense>
    </div>
  );
}
