"use client";

import { LessonCard } from "./LessonCard";
import { Button } from "@/components/ui/Button";
import { CheckCircle2, ChevronRight } from "lucide-react";
import { Lesson } from "@/types/firestore";

interface LessonPlaylistProps {
  lessons: Lesson[];
  activeLessonId: string;
  completedLessonIds: string[];
  onLessonClick: (lesson: Lesson) => void;
  onMarkComplete: () => void;
  onNextModule: () => void;
  isMarking: boolean;
  isLastLesson: boolean;
}

export function LessonPlaylist({ 
  lessons, 
  activeLessonId, 
  completedLessonIds, 
  onLessonClick, 
  onMarkComplete, 
  onNextModule,
  isMarking,
  isLastLesson
}: LessonPlaylistProps) {
  return (
    <div className="flex flex-col h-full bg-background border-l border-border/40">
      <div className="p-6 border-b border-border/40">
        <h3 className="text-xl font-bold tracking-tight text-foreground">Course Content</h3>
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-1 opacity-60">
          {lessons.length} Modules • {completedLessonIds.length} Mastered
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {lessons.map((lesson) => (
          <LessonCard
            key={lesson.id}
            id={lesson.id}
            title={lesson.title}
            duration={lesson.duration}
            isActive={lesson.id === activeLessonId}
            isCompleted={completedLessonIds.includes(lesson.id)}
            onClick={() => onLessonClick(lesson)}
          />
        ))}
      </div>

      <div className="p-6 border-t border-border/40 space-y-3 bg-muted/5">
        {!completedLessonIds.includes(activeLessonId) ? (
          <Button 
            onClick={onMarkComplete} 
            disabled={isMarking}
            className="w-full h-14 rounded-2xl font-bold uppercase tracking-[0.2em] text-[10px] shadow-2xl shadow-accent/40 group px-6 bg-linear-to-r from-blue-600 to-cyan-500 border-none text-white hover:scale-[1.02] transition-all"
          >
            {isMarking ? "Syncing..." : "Mark Mastery Complete"}
            <CheckCircle2 className="ml-3 w-4 h-4 group-hover:rotate-12 transition-transform" />
          </Button>
        ) : (
          <div className="w-full flex items-center justify-center gap-3 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 font-bold text-[10px] uppercase tracking-widest">
            <CheckCircle2 className="w-5 h-5 shadow-emerald-500/20" /> Mastery Confirmed
          </div>
        )}
        
        <Button 
          variant="outline" 
          onClick={onNextModule}
          disabled={isLastLesson}
          className="w-full h-14 rounded-2xl font-bold uppercase tracking-[0.2em] text-[10px] bg-muted/40 border-border/40 text-foreground hover:bg-muted group px-6 hover:scale-[1.02] transition-all"
        >
          Next Module <ChevronRight className="ml-3 w-4 h-4 transition-transform group-hover:translate-x-1" />
        </Button>
      </div>
    </div>
  );
}
