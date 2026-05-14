"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/Skeleton";
import { Suspense } from "react";

// Dynamic import for the player to improve performance
const WistiaPlayer = dynamic(() => import("@/components/WistiaPlayer"), {
  ssr: false,
  loading: () => <Skeleton className="w-full aspect-video rounded-3xl" />,
});

interface VideoPlayerProps {
  mediaId: string;
  title: string;
  startAt?: number;
  onComplete?: () => void;
  onTimeUpdate?: (seconds: number, duration: number) => void;
}

export function VideoPlayer({ mediaId, title, startAt, onComplete, onTimeUpdate }: VideoPlayerProps) {
  return (
    <div className="w-full aspect-video rounded-3xl overflow-hidden bg-black shadow-2xl ring-1 ring-white/5">
      <Suspense fallback={<Skeleton className="w-full h-full rounded-3xl" />}>
        <WistiaPlayer 
          mediaId={mediaId} 
          title={title} 
          startAt={startAt}
          onComplete={onComplete} 
          onTimeUpdate={onTimeUpdate}
        />
      </Suspense>
    </div>
  );
}
