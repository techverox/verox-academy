"use client";

import { 
  Play, 
  Pause, 
  RotateCcw, 
  RotateCw, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Minimize, 
  Settings,
  FastForward
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDuration } from "@/lib/utils";

interface PlayerControlsProps {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isFullscreen: boolean;
  playbackSpeed: number;
  onTogglePlay: () => void;
  onSeek: (time: number) => void;
  onToggleMute: () => void;
  onVolumeChange: (volume: number) => void;
  onToggleFullscreen: () => void;
  onPlaybackSpeedChange: (speed: number) => void;
  isVisible: boolean;
}

export function PlayerControls({
  isPlaying,
  currentTime,
  duration,
  volume,
  isMuted,
  isFullscreen,
  playbackSpeed,
  onTogglePlay,
  onSeek,
  onToggleMute,
  onVolumeChange,
  onToggleFullscreen,
  onPlaybackSpeedChange,
  isVisible
}: PlayerControlsProps) {
  
  const progress = (currentTime / (duration || 1)) * 100;

  return (
    <div className={cn(
      "absolute inset-0 flex flex-col justify-end verox-controls-gradient transition-opacity duration-500 z-30",
      isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
    )}>
      {/* Bottom Control Bar */}
      <div className="px-4 md:px-8 pb-4 md:pb-8 space-y-4 md:space-y-6">
        
        {/* Timeline Scrubber */}
        <div 
          className="verox-scrubber-container w-full"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const pos = (e.clientX - rect.left) / rect.width;
            onSeek(pos * duration);
          }}
        >
          <div 
            className="verox-scrubber-progress"
            style={{ width: `${progress}%` }}
          >
            <div className="verox-scrubber-handle" />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 md:gap-8">
            {/* Play/Pause */}
            <button 
              onClick={onTogglePlay}
              className="text-white hover:text-blue-500 transition-colors"
            >
              {isPlaying ? <Pause className="w-6 h-6 md:w-8 md:h-8 fill-current" /> : <Play className="w-6 h-6 md:w-8 md:h-8 fill-current" />}
            </button>

            {/* Seek Backward */}
            <button 
              onClick={() => onSeek(Math.max(0, currentTime - 10))}
              className="text-white/80 hover:text-white transition-colors hidden sm:block"
            >
              <RotateCcw className="w-5 h-5 md:w-6 md:h-6" />
            </button>

            {/* Seek Forward */}
            <button 
              onClick={() => onSeek(Math.min(duration, currentTime + 10))}
              className="text-white/80 hover:text-white transition-colors hidden sm:block"
            >
              <RotateCw className="w-5 h-5 md:w-6 md:h-6" />
            </button>

            {/* Volume */}
            <div className="flex items-center gap-3 group/vol">
              <button onClick={onToggleMute} className="text-white/80 hover:text-white transition-colors">
                {isMuted || volume === 0 ? <VolumeX className="w-5 h-5 md:w-6 md:h-6" /> : <Volume2 className="w-5 h-5 md:w-6 md:h-6" />}
              </button>
              <input 
                type="range"
                min="0"
                max="100"
                value={isMuted ? 0 : volume}
                onChange={(e) => onVolumeChange(Number(e.target.value))}
                className="w-0 group-hover/vol:w-20 transition-all duration-300 accent-blue-500 h-1 hidden md:block"
              />
            </div>

            {/* Time */}
            <div className="text-[10px] md:text-xs font-bold text-white/80 font-mono tracking-tighter">
              <span>{formatDuration(currentTime)}</span>
              <span className="mx-2 opacity-30">/</span>
              <span>{formatDuration(duration)}</span>
            </div>
          </div>

          <div className="flex items-center gap-4 md:gap-8">
            {/* Speed Selector */}
            <div className="relative group/speed">
              <button className="text-[10px] md:text-xs font-bold text-white/80 hover:text-white uppercase tracking-widest px-3 py-1 rounded-lg border border-white/10 bg-white/5">
                {playbackSpeed}x
              </button>
              <div className="absolute bottom-full right-0 mb-4 bg-zinc-900 border border-white/10 rounded-xl overflow-hidden opacity-0 group-hover/speed:opacity-100 transition-opacity pointer-events-none group-hover/speed:pointer-events-auto shadow-2xl">
                {[0.5, 0.75, 1, 1.25, 1.5, 2].map(speed => (
                  <button
                    key={speed}
                    onClick={() => onPlaybackSpeedChange(speed)}
                    className={cn(
                      "block w-full px-6 py-3 text-xs font-bold text-left hover:bg-white/5 transition-colors",
                      playbackSpeed === speed ? "text-blue-500" : "text-white/60"
                    )}
                  >
                    {speed}x
                  </button>
                ))}
              </div>
            </div>

            {/* Fullscreen */}
            <button 
              onClick={onToggleFullscreen}
              className="text-white/80 hover:text-white transition-colors"
            >
              {isFullscreen ? <Minimize className="w-5 h-5 md:w-6 md:h-6" /> : <Maximize className="w-5 h-5 md:w-6 md:h-6" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
