/**
 * Aggregation Helpers — Server-Side Stats Management
 * ====================================================
 * Pre-computed statistics to eliminate N+1 query problems.
 *
 * STRATEGY:
 * Instead of scanning entire collections on every dashboard load,
 * we maintain denormalized counters that are updated atomically
 * when events occur (enrollment, payment, lesson completion).
 *
 * Collections:
 * - platformStats/global → Global metrics (single document)
 * - courseStats/{courseId} → Per-course metrics
 *
 * These are updated by:
 * - Payment webhook (on successful payment → enrollment)
 * - Lesson completion handler
 * - Admin operations
 *
 * SECURITY: Only server-side code should write to these collections.
 */

import { getAdminDb } from "./firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

// ─── Platform Stats ─────────────────────────────────────────────────────────

const PLATFORM_STATS_DOC = "platformStats/global";

/**
 * Increment platform-level counters atomically.
 * Called after successful enrollment/payment.
 *
 * @param increments - Fields to increment (e.g., { totalEnrollments: 1, totalRevenue: 49900 })
 */
export async function incrementPlatformStats(
  increments: Partial<Record<"totalUsers" | "totalCourses" | "totalEnrollments" | "totalLessons" | "totalRevenue" | "totalPayments", number>>
): Promise<void> {
  const db = getAdminDb();
  const statsRef = db.doc(PLATFORM_STATS_DOC);

  const updateData: Record<string, FieldValue | Date> = {
    lastUpdated: FieldValue.serverTimestamp(),
  };

  for (const [key, value] of Object.entries(increments)) {
    if (value && value !== 0) {
      updateData[key] = FieldValue.increment(value);
    }
  }

  // merge: true creates the document if it doesn't exist
  await statsRef.set(updateData, { merge: true });
}

/**
 * Read platform stats. Returns null if not yet initialized.
 * This is a single-document read — O(1) instead of O(N) collection scans.
 */
export async function getPlatformStats(): Promise<{
  totalUsers: number;
  totalCourses: number;
  totalEnrollments: number;
  totalLessons: number;
  totalRevenue: number;
  totalPayments: number;
} | null> {
  const db = getAdminDb();
  const statsRef = db.doc(PLATFORM_STATS_DOC);
  const snap = await statsRef.get();

  if (!snap.exists) {
    return null;
  }

  const data = snap.data()!;
  return {
    totalUsers: data.totalUsers || 0,
    totalCourses: data.totalCourses || 0,
    totalEnrollments: data.totalEnrollments || 0,
    totalLessons: data.totalLessons || 0,
    totalRevenue: data.totalRevenue || 0,
    totalPayments: data.totalPayments || 0,
  };
}

// ─── Course Stats ───────────────────────────────────────────────────────────

/**
 * Increment per-course counters atomically.
 * Called after successful enrollment or lesson completion.
 *
 * @param courseId - The course to update
 * @param increments - Fields to increment
 */
export async function incrementCourseStats(
  courseId: string,
  increments: Partial<Record<"totalEnrollments" | "totalRevenue" | "totalLessons" | "avgProgress", number>>
): Promise<void> {
  const db = getAdminDb();
  const statsRef = db.doc(`courseStats/${courseId}`);

  const updateData: Record<string, FieldValue | Date | string> = {
    courseId,
    lastUpdated: FieldValue.serverTimestamp(),
  };

  for (const [key, value] of Object.entries(increments)) {
    if (value && value !== 0) {
      updateData[key] = FieldValue.increment(value);
    }
  }

  await statsRef.set(updateData, { merge: true });
}

/**
 * Read stats for a specific course.
 */
export async function getCourseStatsById(courseId: string): Promise<{
  totalEnrollments: number;
  totalRevenue: number;
  totalLessons: number;
  avgProgress: number;
} | null> {
  const db = getAdminDb();
  const statsRef = db.doc(`courseStats/${courseId}`);
  const snap = await statsRef.get();

  if (!snap.exists) {
    return null;
  }

  const data = snap.data()!;
  return {
    totalEnrollments: data.totalEnrollments || 0,
    totalRevenue: data.totalRevenue || 0,
    totalLessons: data.totalLessons || 0,
    avgProgress: data.avgProgress || 0,
  };
}

// ─── Creator Stats ──────────────────────────────────────────────────────────
/**
 * Increment per-creator counters atomically.
 * Called after successful enrollment/payment.
 */
export async function incrementCreatorStats(
  creatorId: string,
  increments: Partial<Record<"totalCourses" | "totalStudents" | "totalEnrollments" | "totalRevenue" | "pendingRevenue" | "paidRevenue" | "watchHours", number>>
): Promise<void> {
  const db = getAdminDb();
  const statsRef = db.doc(`creatorStats/${creatorId}`);

  const updateData: Record<string, FieldValue | Date | string> = {
    creatorId,
    lastUpdated: FieldValue.serverTimestamp(),
  };

  for (const [key, value] of Object.entries(increments)) {
    if (value && value !== 0) {
      updateData[key] = FieldValue.increment(value);
    }
  }

  await statsRef.set(updateData, { merge: true });
}

// ─── Initialization Helper ─────────────────────────────────────────────────

/**
 * Rebuild platform stats from scratch by scanning all collections.
 * This is an expensive operation and should only be run once during migration
 * or as a maintenance task.
 */
export async function rebuildPlatformStats(): Promise<void> {
  const db = getAdminDb();

  try {
    const [usersSnap, coursesSnap, enrollmentsSnap, lessonsSnap, paymentsSnap] =
      await Promise.all([
        db.collection("users").count().get(),
        db.collection("courses").count().get(),
        db.collection("enrollments").count().get(),
        db.collection("lessons").count().get(),
        db.collection("payments").count().get(),
      ]);

    // Calculate total revenue from captured payments
    const paymentDocs = await db
      .collection("payments")
      .where("status", "==", "captured")
      .get();

    let totalRevenue = 0;
    paymentDocs.forEach((doc) => {
      totalRevenue += doc.data().amount || 0;
    });

    await db.doc(PLATFORM_STATS_DOC).set({
      totalUsers: usersSnap.data().count || 0,
      totalCourses: coursesSnap.data().count || 0,
      totalEnrollments: enrollmentsSnap.data().count || 0,
      totalLessons: lessonsSnap.data().count || 0,
      totalRevenue: totalRevenue || 0,
      totalPayments: paymentsSnap.data().count || 0,
      lastUpdated: FieldValue.serverTimestamp(),
    }, { merge: true });

    console.log("[AGGREGATION] Platform stats rebuilt successfully.");
  } catch (error) {
    console.error("[AGGREGATION] Failed to rebuild platform stats:", error);
    throw error;
  }
}
