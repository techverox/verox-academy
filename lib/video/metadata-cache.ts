/**
 * VEROX ACADEMY - METADATA CACHE
 * ------------------------------
 * Performance and quota optimization layer.
 * Caches external video metadata to reduce API overhead.
 */

import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export class MetadataCache {
  private static TTL = 24 * 60 * 60 * 1000; // 24 hours

  /**
   * Retrieves metadata from cache or returns null if stale/missing.
   */
  static async get(videoId: string): Promise<any | null> {
    const cacheRef = doc(db, "video_metadata_cache", videoId);
    const snap = await getDoc(cacheRef);
    
    if (snap.exists()) {
      const data = snap.data();
      const isExpired = Date.now() - data.cachedAt.toMillis() > this.TTL;
      if (!isExpired) return data.metadata;
    }
    
    return null;
  }

  /**
   * Stores metadata in the cache.
   */
  static async set(videoId: string, metadata: any) {
    const cacheRef = doc(db, "video_metadata_cache", videoId);
    await setDoc(cacheRef, {
      metadata,
      cachedAt: new Date(),
    });
  }
}
