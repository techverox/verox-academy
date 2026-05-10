/**
 * Server-Side Firestore Helpers
 * ==============================
 * Data fetching functions that use Firebase Admin SDK.
 * These run on the server (API routes, Server Components)
 * and bypass Firestore security rules (admin access).
 *
 * IMPORTANT: Never import this file from client components.
 * Use `lib/firestore.ts` for client-side reads instead.
 *
 * PERFORMANCE: These helpers are designed for Server Components
 * to enable SSR data fetching, better SEO, and smaller JS bundles.
 */

import { Course, Lesson, Payment, Enrollment, CreatorApplication, User, Certificate } from "@/types/firestore";
import { getAdminDb, getAdminAuth } from "./firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

/**
 * Fetch all creator applications.
 */
export async function getCreatorApplicationsServer(): Promise<CreatorApplication[]> {
  const db = getAdminDb();
  const snapshot = await db.collection("creatorApplications").orderBy("createdAt", "desc").get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as CreatorApplication[];
}

/**
 * Approve a creator application.
 * - Sets custom claim 'creator: true'
 * - Updates user role to 'creator' in Firestore
 * - Updates application status to 'approved'
 * - Logs action in adminAuditLog
 */
export async function approveCreatorServer(applicationId: string, adminId: string): Promise<void> {
  const db = getAdminDb();
  const auth = getAdminAuth();

  const appRef = db.collection("creatorApplications").doc(applicationId);
  const appSnap = await appRef.get();
  
  if (!appSnap.exists) throw new Error("Application not found");
  const appData = appSnap.data() as CreatorApplication;

  // 1. Set Custom Claims
  const userRef = db.collection("users").doc(appData.userId);
  const userSnap = await userRef.get();
  const existingClaims = (await auth.getUser(appData.userId)).customClaims || {};
  
  await auth.setCustomUserClaims(appData.userId, {
    ...existingClaims,
    creator: true
  });

  // 2. Update Firestore Role
  await userRef.update({
    role: "creator"
  });

  // 3. Update Application Status
  await appRef.update({
    status: "approved",
    reviewedAt: FieldValue.serverTimestamp(),
    reviewedBy: adminId
  });

  // 4. Log Audit
  await db.collection("adminAuditLog").add({
    action: "APPROVE_CREATOR",
    targetUserId: appData.userId,
    applicationId: applicationId,
    performedBy: adminId,
    timestamp: FieldValue.serverTimestamp()
  });
}

/**
 * Reject a creator application.
 */
export async function rejectCreatorServer(applicationId: string, reason: string, adminId: string): Promise<void> {
  const db = getAdminDb();
  const appRef = db.collection("creatorApplications").doc(applicationId);
  
  await appRef.update({
    status: "rejected",
    rejectionReason: reason,
    reviewedAt: FieldValue.serverTimestamp(),
    reviewedBy: adminId
  });

  // Log Audit
  const appSnap = await appRef.get();
  const appData = appSnap.data() as CreatorApplication;

  await db.collection("adminAuditLog").add({
    action: "REJECT_CREATOR",
    targetUserId: appData?.userId,
    applicationId: applicationId,
    performedBy: adminId,
    timestamp: FieldValue.serverTimestamp(),
    reason
  });
}

// ─── Course Queries ─────────────────────────────────────────────────────────

/**
 * Fetch all published courses (server-side).
 * Used by the public /courses page as a Server Component.
 */
export async function getPublishedCoursesServer(): Promise<Course[]> {
  const db = getAdminDb();
  const snapshot = await db
    .collection("courses")
    .where("published", "==", true)
    .get();

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Course[];
}

/**
 * Fetch a single course by ID (server-side).
 * Returns null if not found or not published (unless includeUnpublished is true).
 */
export async function getCourseByIdServer(
  courseId: string,
  includeUnpublished = false
): Promise<Course | null> {
  const db = getAdminDb();
  const doc = await db.collection("courses").doc(courseId).get();

  if (!doc.exists) return null;

  const data = doc.data()!;
  if (!includeUnpublished && !data.published) return null;

  return { id: doc.id, ...data } as Course;
}

/**
 * Fetch all lessons for a course (server-side), ordered by 'order'.
 */
export async function getLessonsByCourseIdServer(
  courseId: string
): Promise<Lesson[]> {
  const db = getAdminDb();
  const snapshot = await db
    .collection("lessons")
    .where("courseId", "==", courseId)
    .orderBy("order", "asc")
    .get();

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Lesson[];
}

// ─── Payment Queries ────────────────────────────────────────────────────────

/**
 * Check if a payment already exists for this order (idempotency check).
 * Prevents duplicate enrollments from webhook retries.
 */
export async function getPaymentByOrderId(
  orderId: string
): Promise<Payment | null> {
  const db = getAdminDb();
  const snapshot = await db
    .collection("payments")
    .where("orderId", "==", orderId)
    .limit(1)
    .get();

  if (snapshot.empty) return null;

  const doc = snapshot.docs[0];
  return { id: doc.id, ...doc.data() } as Payment;
}

/**
 * Create a payment record in Firestore.
 * Called by the webhook handler after payment verification.
 */
export async function createPaymentRecord(
  payment: Omit<Payment, "id">
): Promise<string> {
  const db = getAdminDb();
  const ref = db.collection("payments").doc();
  await ref.set(payment);
  return ref.id;
}

/**
 * Update a payment record's status.
 */
export async function updatePaymentStatus(
  paymentDocId: string,
  status: Payment["status"],
  additionalData?: Partial<Payment>
): Promise<void> {
  const db = getAdminDb();
  await db
    .collection("payments")
    .doc(paymentDocId)
    .update({
      status,
      ...additionalData,
    });
}

// ─── Enrollment Queries ─────────────────────────────────────────────────────

/**
 * Check if a user is enrolled in a course (server-side).
 * Uses deterministic enrollment ID format: `{userId}_{courseId}`.
 */
export async function isUserEnrolledServer(
  userId: string,
  courseId: string
): Promise<boolean> {
  const db = getAdminDb();
  const enrollmentId = `${userId}_${courseId}`;
  const doc = await db.collection("enrollments").doc(enrollmentId).get();
  return doc.exists;
}

/**
 * Create an enrollment record (server-side only).
 * SECURITY: This should only be called after payment verification.
 * Returns false if the enrollment already exists (idempotent).
 */
export async function createEnrollmentServer(
  userId: string,
  courseId: string,
  paymentId: string
): Promise<boolean> {
  const db = getAdminDb();
  const enrollmentId = `${userId}_${courseId}`;
  const enrollmentRef = db.collection("enrollments").doc(enrollmentId);

  // Idempotency check: don't create duplicate enrollments
  const existing = await enrollmentRef.get();
  if (existing.exists) {
    console.log(
      `[ENROLLMENT] Enrollment ${enrollmentId} already exists, skipping`
    );
    return false;
  }

  // Fetch course to get lesson count for aggregation
  const courseDoc = await db.collection("courses").doc(courseId).get();
  const lessonCount = courseDoc.exists ? (courseDoc.data()?.lessonCount || 0) : 0;

  const enrollment = {
    id: enrollmentId,
    userId,
    courseId,
    status: "active" as const,
    progress: 0,
    completedLessons: 0,
    totalLessons: lessonCount,
    enrolledAt: FieldValue.serverTimestamp(),
    paymentId,
  };

  await enrollmentRef.set(enrollment);
  console.log(`[ENROLLMENT] Created enrollment ${enrollmentId} with ${lessonCount} lessons`);
  return true;
}

// ─── Recent Activity (Admin) ────────────────────────────────────────────────

/**
 * Fetch recent enrollments with user and course details (server-side).
 * Optimized: Uses batched reads instead of N+1 individual fetches.
 */
export async function getRecentEnrollmentsServer(limit = 5): Promise<
  Array<{
    id: string;
    userName: string;
    courseTitle: string;
    enrolledAt: FirebaseFirestore.Timestamp | null;
  }>
> {
  const db = getAdminDb();

  // 1. Fetch recent enrollments
  const enrollmentsSnap = await db
    .collection("enrollments")
    .orderBy("enrolledAt", "desc")
    .limit(limit)
    .get();

  if (enrollmentsSnap.empty) return [];

  // 2. Collect unique user IDs and course IDs
  const userIds = new Set<string>();
  const courseIds = new Set<string>();
  const enrollments = enrollmentsSnap.docs.map((doc) => {
    const data = doc.data();
    userIds.add(data.userId);
    courseIds.add(data.courseId);
    return { id: doc.id, ...data };
  });

  // 3. Batch fetch users and courses (2 queries instead of N+1)
  const [usersMap, coursesMap] = await Promise.all([
    batchGetDocuments(db, "users", Array.from(userIds)),
    batchGetDocuments(db, "courses", Array.from(courseIds)),
  ]);

  // 4. Join data
  return enrollments.map((enr: Record<string, unknown>) => ({
    id: enr.id as string,
    userName: (usersMap.get(enr.userId as string)?.name as string) || "Anonymous Student",
    courseTitle: (coursesMap.get(enr.courseId as string)?.title as string) || "Deleted Course",
    enrolledAt: (enr.enrolledAt as FirebaseFirestore.Timestamp) || null,
  }));
}

/**
 * Batch-read documents by their IDs from a collection.
 * Firestore Admin SDK's getAll() supports up to 100 documents per call.
 */
async function batchGetDocuments(
  db: FirebaseFirestore.Firestore,
  collectionName: string,
  ids: string[]
): Promise<Map<string, Record<string, string>>> {
  if (ids.length === 0) return new Map();

  const refs = ids.map((id) => db.collection(collectionName).doc(id));
  const docs = await db.getAll(...refs);

  const result = new Map<string, Record<string, string>>();
  docs.forEach((doc) => {
    if (doc.exists) {
      result.set(doc.id, doc.data() as Record<string, string>);
    }
  });

  return result;
}

/**
 * Fetch a certificate by ID (server-side).
 */
export async function getCertificateByIdServer(
  certId: string
): Promise<Certificate | null> {
  const db = getAdminDb();
  const doc = await db.collection("certificates").doc(certId).get();

  if (!doc.exists) return null;

  return { id: doc.id, ...doc.data() } as Certificate;
}
