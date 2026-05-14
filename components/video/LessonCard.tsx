"use client";

import { Play, CheckCircle2, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface LessonCardProps {
  id: string;
  title: string;
  duration: string;
  isActive: boolean;
  isCompleted: boolean;
  thumbnail?: string;
  onClick: () => void;
}

export function LessonCard({ title, duration, isActive, isCompleted, thumbnail, onClick }: LessonCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "group flex items-start gap-4 p-3 rounded-2xl transition-all duration-300 w-full text-left",
        isActive ? "bg-accent/5 ring-1 ring-accent/20 shadow-lg shadow-accent/5" : "hover:bg-muted/40"
      )}
    >
      <div className="relative h-20 w-36 shrink-0 rounded-xl overflow-hidden bg-muted group-hover:shadow-md transition-all">
        {thumbnail ? (
          <img src={thumbnail} alt={title} className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full flex items-center justify-center bg-muted/60">
            <Play className={cn("w-6 h-6", isActive ? "text-accent" : "text-muted-foreground/40")} />
          </div>
        )}
        
        {isCompleted && (
          <div className="absolute top-2 right-2 bg-emerald-500 rounded-full p-0.5 shadow-lg">
            <CheckCircle2 className="w-3 h-3 text-white" />
          </div>
        )}

        <div className="absolute bottom-1 right-1 bg-black/80 px-1.5 py-0.5 rounded text-[8px] font-bold text-white uppercase tracking-widest">
          {duration}
        </div>

        {isActive && (
           <div className="absolute inset-0 bg-accent/10 border-2 border-accent/40 rounded-xl pointer-events-none" />
        )}
      </div>

      <div className="flex-1 min-w-0 pt-1 space-y-2">
        <h4 className={cn(
          "text-sm font-bold leading-tight tracking-tight line-clamp-2",
          isActive ? "text-accent" : "text-foreground group-hover:text-accent transition-colors"
        )}>
          {title}
        </h4>
        <div className="flex items-center gap-3 text-[9px] font-bold uppercase tracking-widest text-muted-foreground/60">
           <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {duration}
           </span>
        </div>
      </div>
    </button>
  );
}
