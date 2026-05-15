import { VideoSource } from "@/types/video";

/**
 * YouTube Service Layer
 * Responsibilities: Fetching metadata, thumbnails, and validating videos.
 */
export const youtubeService = {
  /**
   * Fetches basic metadata for a YouTube video.
   * Note: Duration requires YouTube Data API v3. 
   * For Phase 1, we provide the structure.
   */
  async getVideoMetadata(videoId: string): Promise<Partial<VideoSource>> {
    try {
      // YouTube oEmbed can give us the title and thumbnail
      const response = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`);
      if (!response.ok) throw new Error("YouTube metadata fetch failed");
      
      const data = await response.json();
      
      return {
        provider: 'youtube',
        videoId,
        thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
        duration: undefined, // oEmbed doesn't provide duration
      };
    } catch (error) {
      console.warn("[YOUTUBE] Metadata fetch failed:", error);
      return {
        provider: 'youtube',
        videoId,
        thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
      };
    }
  },

  getThumbnailUrl(videoId: string): string {
    return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
  }
};
