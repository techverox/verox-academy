"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { VideoSource } from "@/types/video";
import { VideoEngine } from "../VideoEngine";
import { PlayerControls } from "./PlayerControls";
import { VideoLoading } from "./VideoLoading";
import { WatermarkOverlay } from "./WatermarkOverlay";
import { ResumePrompt } from "./ResumePrompt";
import { NextLessonOverlay } from "./NextLessonOverlay";
import { usePlayerProgress } from "@/hooks/video/usePlayerProgress";
import { usePlayerVisibility } from "@/hooks/video/usePlayerVisibility";
import { useResumePlayback } from "@/hooks/video/useResumePlayback";
import { useAutoAdvance } from "@/hooks/video/useAutoAdvance";
import { useWatchSession } from "@/hooks/analytics/useWatchSession";
import { cn } from "@/lib/utils";
import "@/styles/player.css";

interface CinemaPlayerProps {
  source: VideoSource;
  title: string;
  courseId: string;
  lessonId: string;
  initialTime?: number;
  onNextLesson?: () => void;
  onComplete?: () => void;
}

/**
 * VEROX CINEMA PLAYER
 * -------------------
 * The premium, OTT-style immersive learning experience.
 * Orchestrates loading, controls, security, and progress tracking.
 */
export function CinemaPlayer({
  source,
  title,
  courseId,
  lessonId,
  initialTime = 0,
  onNextLesson,
  onComplete
}: CinemaPlayerProps) {
  // 1. State Management
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [controlsVisible, setControlsVisible] = useState(true);
  
  const [seekTo, setSeekTo] = useState<number | undefined>(undefined);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 2. Specialized Hooks
  const { progress, updateProgress, forceSync } = usePlayerProgress(courseId, lessonId);
  const { shouldShowPrompt, clearPrompt } = useResumePlayback(initialTime);
  const { isCountingDown, startAutoAdvance, cancelAutoAdvance } = useAutoAdvance(onNextLesson || (() => {}));

  // 3. Analytics & Watch Session
  useWatchSession(courseId, lessonId, isPlaying, progress.currentTime);

  // 4. Visibility Hook
  usePlayerVisibility((isVisible) => {
    if (!isVisible && isPlaying) {
      setIsPlaying(false);
      forceSync(progress.currentTime, progress.duration);
    }
  });

  // 4. Lifecycle & Events
  const handleTogglePlay = useCallback(() => {
    setIsPlaying(prev => !prev);
    if (isPlaying) {
      forceSync(progress.currentTime, progress.duration);
    }
  }, [isPlaying, progress, forceSync]);

  const handleSeek = useCallback((time: number) => {
    setSeekTo(time);
    updateProgress(time, progress.duration);
    // Reset seekTo after a short delay to allow re-seeking to same spot
    setTimeout(() => setSeekTo(undefined), 100);
  }, [progress.duration, updateProgress]);

  const handleFullscreen = useCallback(() => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  const showControls = useCallback(() => {
    setControlsVisible(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) setControlsVisible(false);
    }, 3000);
  }, [isPlaying]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        handleTogglePlay();
      }
      if (e.code === "KeyF") handleFullscreen();
      if (e.code === "ArrowLeft") handleSeek(Math.max(0, progress.currentTime - 10));
      if (e.code === "ArrowRight") handleSeek(Math.min(progress.duration, progress.currentTime + 10));
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleTogglePlay, handleFullscreen, handleSeek, progress]);

  // 5. Rendering
  return (
    <div 
      ref={containerRef}
      className={cn(
        "verox-player-container group rounded-3xl overflow-hidden shadow-2xl ring-1 ring-white/5",
        isFullscreen && "rounded-none"
      )}
      onMouseMove={showControls}
      onClick={showControls}
      onMouseLeave={() => isPlaying && setControlsVisible(false)}
    >
      {/* Background suppression layer for YouTube */}
      <div className="absolute inset-0 z-0 bg-black" />

      {/* The Core Engine */}
      <VideoEngine 
        source={source}
        title={title}
        playing={isPlaying}
        seekTo={seekTo}
        playbackSpeed={playbackSpeed}
        startAt={initialTime}
        volume={volume}
        isMuted={isMuted}
        onProgress={(seconds, duration) => {
          updateProgress(seconds, duration);
          if (isLoading) setIsLoading(false);
        }}
        onReady={() => setIsLoading(false)}
        onComplete={() => {
          if (onComplete) onComplete();
          startAutoAdvance();
        }}
      />

      {/* UI Overlays */}
      {isLoading && <VideoLoading />}
      
      <WatermarkOverlay />

      {shouldShowPrompt && (
        <ResumePrompt 
          lastTime={initialTime}
          onResume={() => {
            clearPrompt();
            setIsPlaying(true);
          }}
          onRestart={() => {
            clearPrompt();
            handleSeek(0);
            setIsPlaying(true);
          }}
        />
      )}

      {isCountingDown && onNextLesson && (
        <NextLessonOverlay 
          onNext={() => {
            cancelAutoAdvance();
            onNextLesson();
          }}
          onCancel={cancelAutoAdvance}
        />
      )}

      {/* Custom Controls (Only show for non-YouTube providers, as YouTube uses Plyr UI) */}
      {!shouldShowPrompt && !isCountingDown && source.provider !== 'youtube' && (
        <PlayerControls 
          isPlaying={isPlaying}
          currentTime={progress.currentTime}
          duration={progress.duration}
          volume={volume}
          isMuted={isMuted}
          isFullscreen={isFullscreen}
          playbackSpeed={playbackSpeed}
          isVisible={controlsVisible}
          onTogglePlay={handleTogglePlay}
          onSeek={handleSeek}
          onToggleMute={() => setIsMuted(prev => !prev)}
          onVolumeChange={setVolume}
          onToggleFullscreen={handleFullscreen}
          onPlaybackSpeedChange={setPlaybackSpeed}
        />
      )}

      {/* Corner Branding (Verox Logo Placeholder) */}
      <div className="absolute top-6 left-8 z-30 opacity-40 hover:opacity-100 transition-opacity pointer-events-none">
        <div className="flex items-center gap-2">
           <div className="h-6 w-6 rounded bg-blue-600 flex items-center justify-center font-black text-[10px] text-white">V</div>
           <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-white">Cinema</span>
        </div>
      </div>
    </div>
  );
}
