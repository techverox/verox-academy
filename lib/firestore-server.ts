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
 * - Removes custom claim 'creator' (sets to false)
 * - Updates user role to 'student' in Firestore
 * - Updates application status to 'rejected'
 * - Logs action in adminAuditLog
 */
export async function rejectCreatorServer(applicationId: string, reason: string, adminId: string): Promise<void> {
  const db = getAdminDb();
  const auth = getAdminAuth();

  const appRef = db.collection("creatorApplications").doc(applicationId);
  const appSnap = await appRef.get();
  
  if (!appSnap.exists) throw new Error("Application not found");
  const appData = appSnap.data() as CreatorApplication;

  // 1. Remove Custom Claims (set creator to false)
  const userRef = db.collection("users").doc(appData.userId);
  const existingClaims = (await auth.getUser(appData.userId)).customClaims || {};
  
  await auth.setCustomUserClaims(appData.userId, {
    ...existingClaims,
    creator: false
  });

  // 2. Update Firestore Role back to student
  await userRef.update({
    role: "student"
  });

  // 3. Update Application Status
  await appRef.update({
    status: "rejected",
    rejectionReason: reason,
    reviewedAt: FieldValue.serverTimestamp(),
    reviewedBy: adminId
  });

  // 4. Log Audit
  await db.collection("adminAuditLog").add({
    action: "REJECT_CREATOR",
    targetUserId: appData.userId,
    applicationId: applicationId,
    performedBy: adminId,
    timestamp: FieldValue.serverTimestamp(),
    reason
  });
}

/**
 * Delete a creator application.
 */
export async function deleteCreatorApplicationServer(applicationId: string, adminId: string): Promise<void> {
  const db = getAdminDb();
  const appRef = db.collection("creatorApplications").doc(applicationId);
  const appSnap = await appRef.get();

  if (!appSnap.exists) throw new Error("Application not found");
  const appData = appSnap.data() as CreatorApplication;

  // Log Audit before deletion
  await db.collection("adminAuditLog").add({
    action: "DELETE_CREATOR_APPLICATION",
    targetUserId: appData.userId,
    applicationId: applicationId,
    performedBy: adminId,
    timestamp: FieldValue.serverTimestamp()
  });

  await appRef.delete();
}

// ─── User Management ────────────────────────────────────────────────────────

/**
 * Find a user by their email address.
 */
export async function getUserByEmailServer(email: string): Promise<User | null> {
  const db = getAdminDb();
  const snapshot = await db.collection("users").where("email", "==", email.toLowerCase()).limit(1).get();
  
  if (snapshot.empty) return null;
  const doc = snapshot.docs[0];
  return { uid: doc.id, ...doc.data() } as User;
}

/**
 * Manually enroll a student into a course (Free Access).
 */
export async function enrollStudentManuallyServer(
  studentEmail: string,
  courseId: string,
  creatorId: string,
  isAdmin: boolean
): Promise<{ success: boolean; message: string }> {
  const db = getAdminDb();
  
  // 1. Verify Course Ownership
  const courseRef = db.collection("courses").doc(courseId);
  const courseSnap = await courseRef.get();
  if (!courseSnap.exists) return { success: false, message: "Course not found" };
  
  const courseData = courseSnap.data();
  if (!isAdmin && courseData?.creatorId !== creatorId) {
    return { success: false, message: "Unauthorized: You don't own this course" };
  }

  // 2. Find Student
  const student = await getUserByEmailServer(studentEmail);
  if (!student) return { success: false, message: "Student not found with this email" };

  const enrollmentId = `${student.uid}_${courseId}`;
  const enrollmentRef = db.collection("enrollments").doc(enrollmentId);

  // 3. Check existing enrollment
  const existing = await enrollmentRef.get();
  if (existing.exists) return { success: false, message: "Student is already enrolled" };

  // 4. Atomic Transaction for Enrollment
  await db.runTransaction(async (transaction) => {
    // A. Create Enrollment
    transaction.set(enrollmentRef, {
      id: enrollmentId,
      userId: student.uid,
      courseId,
      status: "active",
      progress: 0,
      completedLessons: 0,
      totalLessons: courseData?.lessonCount || 0,
      enrolledAt: FieldValue.serverTimestamp(),
      paymentId: `manual_${Date.now()}`,
      isManual: true,
      grantedBy: creatorId
    });

    // B. Create 'Free' Payment Record for tracking
    const paymentId = `pay_manual_${Date.now()}`;
    transaction.set(db.collection("payments").doc(paymentId), {
      id: paymentId,
      userId: student.uid,
      courseId,
      creatorId: courseData?.creatorId,
      amount: 0,
      currency: "INR",
      status: "manual_free",
      createdAt: FieldValue.serverTimestamp(),
      method: "manual_grant"
    });

    // C. Update Aggregates
    const platformStatsRef = db.collection("platformStats").doc("global");
    const creatorStatsRef = db.collection("creatorStats").doc(courseData?.creatorId);
    const courseStatsRef = db.collection("courseStats").doc(courseId);

    transaction.update(platformStatsRef, { totalEnrollments: FieldValue.increment(1) });
    transaction.update(creatorStatsRef, { totalEnrollments: FieldValue.increment(1) });
    transaction.update(courseStatsRef, { totalEnrollments: FieldValue.increment(1) });
  });

  return { success: true, message: "Student enrolled successfully!" };
}

/**
 * Fetch all users from the database.
 */
export async function getAllUsersServer(): Promise<User[]> {
  const db = getAdminDb();
  const snapshot = await db.collection("users").orderBy("createdAt", "desc").get();
  return snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() })) as User[];
}

/**
 * Update a user's role and sync their custom claims.
 */
export async function updateUserRoleServer(userId: string, role: "admin" | "creator" | "student", adminId: string): Promise<void> {
  const db = getAdminDb();
  const auth = getAdminAuth();

  // 1. Update Firestore Profile
  await db.collection("users").doc(userId).update({
    role,
    updatedAt: FieldValue.serverTimestamp()
  });

  // 2. Sync Custom Claims
  const existingClaims = (await auth.getUser(userId)).customClaims || {};
  
  // Reset roles first
  const newClaims = { ...existingClaims };
  delete newClaims.admin;
  delete newClaims.creator;

  if (role === "admin") {
    newClaims.admin = true;
    newClaims.creator = true; // Admins are implicitly creators
  } else if (role === "creator") {
    newClaims.creator = true;
  }

  await auth.setCustomUserClaims(userId, newClaims);

  // 3. Log Audit
  await db.collection("adminAuditLog").add({
    action: "UPDATE_USER_ROLE",
    targetUserId: userId,
    performedBy: adminId,
    newRole: role,
    timestamp: FieldValue.serverTimestamp()
  });
}

/**
 * Delete a user from Auth and Firestore.
 */
export async function deleteUserServer(userId: string, adminId: string): Promise<void> {
  const db = getAdminDb();
  const auth = getAdminAuth();

  // 1. Log Audit first (while data still exists)
  await db.collection("adminAuditLog").add({
    action: "DELETE_USER",
    targetUserId: userId,
    performedBy: adminId,
    timestamp: FieldValue.serverTimestamp()
  });

  // 2. Delete from Auth
  try {
    await auth.deleteUser(userId);
  } catch (err) {
    console.error(`[ADMIN] Failed to delete user ${userId} from Auth:`, err);
    // Continue anyway if user doesn't exist in Auth
  }

  // 3. Delete from Firestore
  await db.collection("users").doc(userId).delete();

  // Note: In a production app, we should also clean up their courses, enrollments, etc.
  // but for now we focus on the user profile as requested.
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

/**
 * Permanently delete a course and all its associated data (lessons, resources, stats).
 * SECURITY: Only for Admins or the Course Creator.
 */
export async function deleteCourseServer(courseId: string, actorId: string, isAdmin: boolean): Promise<{ success: boolean; error?: string }> {
  const db = getAdminDb();
  
  try {
    const courseRef = db.collection("courses").doc(courseId);
    const courseDoc = await courseRef.get();
    
    if (!courseDoc.exists) {
      return { success: false, error: "Course not found" };
    }
    
    const courseData = courseDoc.data();
    
    // Check Ownership
    if (!isAdmin && courseData?.creatorId !== actorId) {
      return { success: false, error: "Unauthorized to delete this course" };
    }
    
    // Use a transaction for atomic deletion
    await db.runTransaction(async (transaction) => {
      // 1. Delete Lessons
      const lessonsSnap = await db.collection("lessons").where("courseId", "==", courseId).get();
      lessonsSnap.forEach(doc => transaction.delete(doc.ref));
      
      // 2. Delete Resources
      const resourcesSnap = await db.collection("resources").where("courseId", "==", courseId).get();
      resourcesSnap.forEach(doc => transaction.delete(doc.ref));
      
      // 3. Delete Stats
      transaction.delete(db.collection("courseStats").doc(courseId));
      
      // 4. Delete Course
      transaction.delete(courseRef);
    });
    
    // Audit Log
    await db.collection("adminAuditLog").add({
      action: "DELETE_COURSE",
      targetId: courseId,
      actorId,
      timestamp: FieldValue.serverTimestamp(),
      details: { title: courseData?.title }
    });
    
    return { success: true };
  } catch (error) {
    console.error("[SERVER] Delete course failed:", error);
    return { success: false, error: "Internal Server Error" };
  }
}
