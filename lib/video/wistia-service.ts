import { VideoSource } from "@/types/video";

/**
 * Wistia Service Layer
 */
export const wistiaService = {
  async getVideoMetadata(videoId: string): Promise<Partial<VideoSource>> {
    try {
      const response = await fetch(`https://fast.wistia.com/embed/medias/${videoId}.json`);
      if (!response.ok) throw new Error("Wistia fetch failed");
      const data = await response.json();
      
      return {
        provider: 'wistia',
        videoId,
        duration: data?.media?.duration ? Math.round(data.media.duration) : undefined,
        thumbnail: data?.media?.thumbnail?.url || undefined,
      };
    } catch (error) {
      console.warn("[WISTIA] Metadata fetch failed:", error);
      return {
        provider: 'wistia',
        videoId,
      };
    }
  }
};
