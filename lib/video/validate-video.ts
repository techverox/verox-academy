import { VideoProvider, VideoSource } from "@/types/video";

export function validateVideoSource(source: any): source is VideoSource {
  if (!source || typeof source !== 'object') return false;
  
  const providers: VideoProvider[] = ['youtube', 'wistia'];
  if (!providers.includes(source.provider)) return false;
  
  if (!source.videoId || typeof source.videoId !== 'string') return false;
  
  return true;
}

export function sanitizeVideoId(id: string): string {
  return id.replace(/[^a-zA-Z0-9_-]/g, '');
}
