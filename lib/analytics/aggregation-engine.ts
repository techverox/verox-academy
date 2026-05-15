/**
 * VEROX ACADEMY - AGGREGATION ENGINE
 * -----------------------------------
 * Scalable architecture for incremental metric aggregation.
 * Ensures O(1) reads for creator dashboards by pre-computing values.
 */

import { doc, updateDoc, increment, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface AggregationMetrics {
  totalWatchTime: number;
  totalViews: number;
  completions: number;
  totalEngagements: number;
}

export class AggregationEngine {
  /**
   * Updates lesson-level aggregations incrementally.
   */
  static async updateLessonStats(courseId: string, lessonId: string, delta: Partial<AggregationMetrics>) {
    const statsRef = doc(db, "analytics_lessons", lessonId);
    
    try {
      await updateDoc(statsRef, {
        totalWatchTime: increment(delta.totalWatchTime || 0),
        totalViews: increment(delta.totalViews || 0),
        completions: increment(delta.completions || 0),
        totalEngagements: increment(delta.totalEngagements || 0),
        lastUpdated: new Date()
      });
    } catch (error: any) {
      // If doc doesn't exist, initialize it
      if (error.code === 'not-found') {
        await setDoc(statsRef, {
          courseId,
          lessonId,
          totalWatchTime: delta.totalWatchTime || 0,
          totalViews: delta.totalViews || 0,
          completions: delta.completions || 0,
          totalEngagements: delta.totalEngagements || 0,
          lastUpdated: new Date()
        });
      }
    }
  }

  /**
   * Updates course-level aggregations.
   */
  static async updateCourseStats(courseId: string, delta: Partial<AggregationMetrics>) {
    const statsRef = doc(db, "analytics_courses", courseId);
    
    try {
      await updateDoc(statsRef, {
        totalWatchTime: increment(delta.totalWatchTime || 0),
        totalEnrollments: increment(delta.totalViews || 0), // Use totalViews as proxy for entry
        totalCompletions: increment(delta.completions || 0),
        updatedAt: new Date()
      });
    } catch (error: any) {
      if (error.code === 'not-found') {
        await setDoc(statsRef, {
          courseId,
          totalWatchTime: delta.totalWatchTime || 0,
          totalEnrollments: delta.totalViews || 0,
          totalCompletions: delta.completions || 0,
          updatedAt: new Date()
        });
      }
    }
  }
}
