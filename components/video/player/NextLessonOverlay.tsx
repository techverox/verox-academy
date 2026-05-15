"use client";

import { useEffect, useState } from "react";
import { FastForward, X } from "lucide-react";

interface NextLessonOverlayProps {
  onNext: () => void;
  onCancel: () => void;
  countdownSeconds?: number;
}

export function NextLessonOverlay({ onNext, onCancel, countdownSeconds = 5 }: NextLessonOverlayProps) {
  const [timeLeft, setTimeLeft] = useState(countdownSeconds);

  useEffect(() => {
    if (timeLeft <= 0) {
      onNext();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, onNext]);

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/80 backdrop-blur-xl animate-verox-fade">
      {/* Progress Circle Animation */}
      <div className="absolute inset-0 flex items-center justify-center opacity-10">
        <div className="w-96 h-96 rounded-full border-4 border-blue-500 animate-ping" />
      </div>

      <div className="relative text-center space-y-8 animate-verox-slide">
        <div className="space-y-4">
          <div className="flex items-center justify-center gap-3 text-blue-500 text-[10px] font-bold uppercase tracking-[0.5em]">
            <FastForward className="w-4 h-4" />
            Up Next
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tighter">Preparing Next Module</h2>
          <div className="flex items-center justify-center gap-4">
            <span className="text-6xl font-black text-white/20 font-mono">{timeLeft}</span>
            <div className="h-2 w-32 bg-zinc-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-600 transition-all duration-1000 linear"
                style={{ width: `${(timeLeft / countdownSeconds) * 100}%` }}
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center gap-6">
          <button 
            onClick={onCancel}
            className="flex items-center gap-2 px-8 h-14 rounded-2xl border border-white/10 text-white/60 hover:text-white hover:bg-white/5 font-bold transition-all text-[11px] uppercase tracking-widest"
          >
            <X className="w-4 h-4" />
            Cancel
          </button>
          <button 
            onClick={onNext}
            className="px-10 h-14 rounded-2xl bg-white text-black font-bold hover:scale-105 transition-all text-[11px] uppercase tracking-widest shadow-2xl shadow-white/10"
          >
            Play Now
          </button>
        </div>
      </div>
    </div>
  );
}
