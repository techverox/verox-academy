"use client";

import { Play, RotateCcw } from "lucide-react";
import { formatDuration } from "@/lib/utils";

interface ResumePromptProps {
  lastTime: number;
  onResume: () => void;
  onRestart: () => void;
}

export function ResumePrompt({ lastTime, onResume, onRestart }: ResumePromptProps) {
  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-verox-fade">
      <div className="max-w-md w-full p-8 md:p-12 rounded-4xl bg-zinc-900 border border-white/10 shadow-2xl animate-verox-slide text-center space-y-8">
        <div className="space-y-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-blue-500">Welcome Back</p>
          <h3 className="text-2xl font-bold text-white tracking-tight">Pick up where you left off?</h3>
          <p className="text-zinc-500 text-sm font-medium">You were at <span className="text-white font-mono">{formatDuration(lastTime)}</span> in this lesson.</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button 
            onClick={onRestart}
            className="flex items-center justify-center gap-2 h-14 rounded-2xl border border-white/5 bg-white/5 hover:bg-white/10 text-white font-bold transition-all text-[11px] uppercase tracking-widest"
          >
            <RotateCcw className="w-4 h-4" />
            Restart
          </button>
          <button 
            onClick={onResume}
            className="flex items-center justify-center gap-2 h-14 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all text-[11px] uppercase tracking-widest shadow-xl shadow-blue-600/20"
          >
            <Play className="w-4 h-4 fill-current" />
            Resume
          </button>
        </div>
      </div>
    </div>
  );
}
