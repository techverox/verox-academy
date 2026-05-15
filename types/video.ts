export type VideoProvider = 'youtube' | 'wistia';

export interface VideoSource {
  provider: VideoProvider;
  videoId: string;
  duration?: number; // in seconds
  thumbnail?: string;
}
