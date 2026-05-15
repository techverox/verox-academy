import { VideoProvider } from "@/types/video";

export interface ExtractedVideo {
  provider: VideoProvider;
  videoId: string;
}

/**
 * Extracts video ID and provider from a URL or raw ID.
 * Supports YouTube and Wistia.
 */
export function extractVideoId(input: string): ExtractedVideo | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  // 1. YouTube Regex Patterns
  // Matches: 
  // youtube.com/watch?v=ID
  // youtu.be/ID
  // youtube.com/embed/ID
  // youtube.com/shorts/ID
  const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const ytMatch = trimmed.match(youtubeRegex);
  if (ytMatch && ytMatch[1]) {
    return { provider: 'youtube', videoId: ytMatch[1] };
  }

  // 2. Wistia Regex Patterns
  // Matches:
  // wistia.com/medias/ID
  // fast.wistia.com/embed/iframe/ID
  // raw ID (usually 10 alphanumeric chars)
  const wistiaRegex = /(?:wistia\.com\/(?:medias|projects)\/|fast\.wistia\.com\/embed\/iframe\/)([a-zA-Z0-9]+)/;
  const wistiaMatch = trimmed.match(wistiaRegex);
  if (wistiaMatch && wistiaMatch[1]) {
    return { provider: 'wistia', videoId: wistiaMatch[1] };
  }

  // 3. Fallback for raw IDs
  // YouTube IDs are always 11 chars
  if (trimmed.length === 11 && /^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return { provider: 'youtube', videoId: trimmed };
  }
  
  // Wistia IDs are typically 10 chars
  if (trimmed.length === 10 && /^[a-zA-Z0-9]+$/.test(trimmed)) {
    return { provider: 'wistia', videoId: trimmed };
  }

  return null;
}
