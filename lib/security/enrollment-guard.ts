/**
 * VEROX ACADEMY - ENROLLMENT GUARD
 * ---------------------------------
 * Hardened server-side security layer.
 * Ensures students can only access content they are authorized for.
 */

import { getDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export class EnrollmentGuard {
  /**
   * Validates if a user is currently enrolled in a course.
   * This is a server-side check intended for use in Middleware or Server Actions.
   */
  static async validateAccess(userId: string, courseId: string): Promise<boolean> {
    if (!userId || !courseId) return false;

    try {
      const enrollmentRef = doc(db, "enrollments", `${userId}_${courseId}`);
      const snap = await getDoc(enrollmentRef);
      
      if (!snap.exists()) {
        console.warn(`[SECURITY] Unauthorized access attempt: User ${userId} -> Course ${courseId}`);
        return false;
      }

      const data = snap.data();
      return data.status === "active" || data.status === "completed";
    } catch (error) {
      console.error("[SECURITY] Access validation failed:", error);
      return false;
    }
  }

  /**
   * Generates a secure session token (simplified for this context).
   */
  static async generateSessionToken(userId: string, lessonId: string) {
    // In a production environment, this would involve a signed JWT 
    // or a temporary Firestore session document.
    return Buffer.from(`${userId}:${lessonId}:${Date.now()}`).toString('base64');
  }
}
