import { CinemaPlayer } from "./player/CinemaPlayer";
import { VideoSource } from "@/types/video";

interface VideoPlayerProps {
  mediaId?: string; // Legacy support
  video?: VideoSource; // New system
  title: string;
  courseId: string;
  lessonId: string;
  startAt?: number;
  onComplete?: () => void;
  onTimeUpdate?: (seconds: number, duration: number) => void;
  onNextLesson?: () => void;
}

export function VideoPlayer({ 
  mediaId, 
  video, 
  title, 
  courseId,
  lessonId,
  startAt, 
  onComplete, 
  onTimeUpdate,
  onNextLesson
}: VideoPlayerProps) {
  // 1. Resolve the source: Prefer the new 'video' object, fallback to legacy 'mediaId'
  const resolvedSource: VideoSource | null = video || (mediaId ? {
    provider: 'wistia',
    videoId: mediaId
  } : null);

  if (!resolvedSource) {
    return (
      <div className="w-full aspect-video rounded-3xl bg-zinc-900 flex items-center justify-center">
        <p className="text-muted-foreground text-sm font-bold uppercase tracking-widest">No video source provided</p>
      </div>
    );
  }

  return (
    <CinemaPlayer 
      source={resolvedSource}
      title={title}
      courseId={courseId}
      lessonId={lessonId}
      initialTime={startAt}
      onComplete={onComplete}
      onNextLesson={onNextLesson}
    />
  );
}
