"use client";

import { Loader2 } from "lucide-react";

/**
 * Premium Video Loading Skeleton
 * Features: Cinematic shimmer, blurred backdrop, and high-quality typography.
 */
export function VideoLoading() {
  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-zinc-950 animate-verox-fade">
      {/* Background Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(37,99,235,0.1),transparent_70%)]" />
      
      {/* Shimmer Overlay */}
      <div className="absolute inset-0 verox-shimmer opacity-20" />

      <div className="relative flex flex-col items-center gap-8">
        <div className="relative h-20 w-20">
          <div className="absolute inset-0 animate-ping rounded-full bg-blue-500/10" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
          </div>
        </div>

        <div className="flex flex-col items-center gap-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.5em] text-blue-500/80">Verox Cinema Engine</p>
          <div className="h-[2px] w-48 overflow-hidden rounded-full bg-zinc-900">
            <div className="h-full w-1/3 animate-[loading_2s_infinite] bg-linear-to-r from-blue-600 to-cyan-500 shadow-[0_0_15px_rgba(37,99,235,0.5)]" />
          </div>
          <p className="text-[9px] font-medium text-zinc-600 uppercase tracking-widest">Initializing Secure Stream...</p>
        </div>
      </div>

      <style jsx>{`
        @keyframes loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(300%); }
        }
      `}</style>
    </div>
  );
}
