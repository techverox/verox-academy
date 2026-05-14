import { getAdminDb, getAdminAuth } from "./firebase-admin";
import { 
  Course, 
  Lesson, 
  User, 
  Enrollment, 
  CreatorApplication, 
  Certificate, 
  Payment 
} from "@/types/firestore";

/**
 * Helper to sanitize Firestore documents for RSC serialization.
 * Converts Timestamp classes to plain objects.
 */
function sanitizeDoc(id: string, data: any) {
  return {
    id,
    ...data,
    createdAt: data.createdAt ? { seconds: data.createdAt._seconds, nanoseconds: data.createdAt._nanoseconds } : null,
    updatedAt: data.updatedAt ? { seconds: data.updatedAt._seconds, nanoseconds: data.updatedAt._nanoseconds } : null,
    // Add other timestamp fields if they exist in specific models
    enrolledAt: data.enrolledAt ? { seconds: data.enrolledAt._seconds, nanoseconds: data.enrolledAt._nanoseconds } : null,
    completedAt: data.completedAt ? { seconds: data.completedAt._seconds, nanoseconds: data.completedAt._nanoseconds } : null,
    issuedAt: data.issuedAt ? { seconds: data.issuedAt._seconds, nanoseconds: data.issuedAt._nanoseconds } : null,
    reviewedAt: data.reviewedAt ? { seconds: data.reviewedAt._seconds, nanoseconds: data.reviewedAt._nanoseconds } : null,
    verifiedAt: data.verifiedAt ? { seconds: data.verifiedAt._seconds, nanoseconds: data.verifiedAt._nanoseconds } : null,
    lastAccessed: data.lastAccessed ? { seconds: data.lastAccessed._seconds, nanoseconds: data.lastAccessed._nanoseconds } : null,
    lastLogin: data.lastLogin ? { seconds: data.lastLogin._seconds, nanoseconds: data.lastLogin._nanoseconds } : null,
    requestedAt: data.requestedAt ? { seconds: data.requestedAt._seconds, nanoseconds: data.requestedAt._nanoseconds } : null,
    processedAt: data.processedAt ? { seconds: data.processedAt._seconds, nanoseconds: data.processedAt._nanoseconds } : null,
  };
}

/**
 * Fetch featured courses using Firebase Admin SDK.
 */
export async function getFeaturedCourses(limitCount: number = 4): Promise<Course[]> {
  try {
    const db = getAdminDb();
    const snapshot = await db.collection("courses")
      .where("published", "==", true)
      .limit(limitCount * 2) 
      .get();

    const courses = snapshot.docs.map(doc => sanitizeDoc(doc.id, doc.data())) as Course[];

    return courses.sort((a, b) => {
      const dateA = (a.createdAt as any)?.seconds || 0;
      const dateB = (b.createdAt as any)?.seconds || 0;
      return dateB - dateA;
    }).slice(0, limitCount);
  } catch (error) {
    console.error("[SERVER] Failed to fetch featured courses:", error);
    return [];
  }
}

/**
 * Fetch a single course by ID using Firebase Admin SDK.
 */
export async function getCourseByIdServer(courseId: string): Promise<Course | null> {
  try {
    const db = getAdminDb();
    const doc = await db.collection("courses").doc(courseId).get();
    
    if (!doc.exists) return null;
    return sanitizeDoc(doc.id, doc.data()) as Course;
  } catch (error) {
    console.error(`[SERVER] Failed to fetch course ${courseId}:`, error);
    return null;
  }
}

/**
 * Fetch lessons for a course using Firebase Admin SDK.
 */
export async function getLessonsByCourseIdServer(courseId: string): Promise<Lesson[]> {
  try {
    const db = getAdminDb();
    const snapshot = await db.collection("lessons")
      .where("courseId", "==", courseId)
      .get();

    const lessons = snapshot.docs.map(doc => sanitizeDoc(doc.id, doc.data())) as Lesson[];
    
    return lessons.sort((a, b) => (a.order || 0) - (b.order || 0));
  } catch (error) {
    console.error(`[SERVER] Failed to fetch lessons for course ${courseId}:`, error);
    return [];
  }
}

/**
 * Check if a user is enrolled in a course using Firebase Admin SDK.
 */
export async function isUserEnrolledServer(userId: string, courseId: string): Promise<boolean> {
  if (!userId || !courseId) return false;
  try {
    const db = getAdminDb();
    const doc = await db.collection("enrollments").doc(`${userId}_${courseId}`).get();
    return doc.exists && doc.data()?.status === "completed";
  } catch (error) {
    console.error(`[SERVER] Enrollment check failed for user ${userId}:`, error);
    return false;
  }
}

/**
 * Create a course enrollment using Firebase Admin SDK.
 */
export async function createEnrollmentServer(userId: string, courseId: string, orderId: string): Promise<boolean> {
  try {
    const db = getAdminDb();
    const admin = require("firebase-admin");
    const FieldValue = admin.firestore.FieldValue;
    
    await db.collection("enrollments").doc(`${userId}_${courseId}`).set({
      userId,
      courseId,
      status: "completed",
      enrolledAt: FieldValue.serverTimestamp(),
      orderId,
      progress: 0,
      completedLessons: [],
      lastAccessed: FieldValue.serverTimestamp(),
    });
    return true;
  } catch (error) {
    console.error("[SERVER] Failed to create enrollment:", error);
    return false;
  }
}

/**
 * Fetch a payment record by Order ID.
 */
export async function getPaymentByOrderId(orderId: string): Promise<Payment | null> {
  try {
    const db = getAdminDb();
    const doc = await db.collection("payments").doc(orderId).get();
    if (!doc.exists) return null;
    return sanitizeDoc(doc.id, doc.data()) as Payment;
  } catch (error) {
    console.error(`[SERVER] Failed to fetch payment ${orderId}:`, error);
    return null;
  }
}

/**
 * Fetch a certificate by ID.
 */
export async function getCertificateByIdServer(certId: string): Promise<Certificate | null> {
  try {
    const db = getAdminDb();
    const doc = await db.collection("certificates").doc(certId).get();
    if (!doc.exists) return null;
    return sanitizeDoc(doc.id, doc.data()) as Certificate;
  } catch (error) {
    console.error(`[SERVER] Failed to fetch certificate ${certId}:`, error);
    return null;
  }
}

/**
 * Delete a course and its related data.
 */
export async function deleteCourseServer(courseId: string, userId: string, isAdmin: boolean) {
  try {
    const db = getAdminDb();
    const courseRef = db.collection("courses").doc(courseId);
    const courseSnap = await courseRef.get();
    
    if (!courseSnap.exists) return { success: false, error: "Course not found" };
    
    const courseData = courseSnap.data();
    if (!isAdmin && courseData?.creatorId !== userId) {
      return { success: false, error: "Unauthorized" };
    }
    
    // Batch delete lessons and course
    const batch = db.batch();
    const lessonsSnap = await db.collection("lessons").where("courseId", "==", courseId).get();
    lessonsSnap.forEach(doc => batch.delete(doc.ref));
    batch.delete(courseRef);
    
    await batch.commit();
    return { success: true };
  } catch (error: any) {
    console.error("[SERVER] Delete course error:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Enroll a student manually.
 */
export async function enrollStudentManuallyServer(studentEmail: string, courseId: string, actorId: string, isAdmin: boolean) {
  try {
    const db = getAdminDb();
    const userSnap = await db.collection("users").where("email", "==", studentEmail).limit(1).get();
    
    if (userSnap.empty) {
      return { success: false, message: "User with this email not found" };
    }
    
    const studentId = userSnap.docs[0].id;
    const enrollmentId = `${studentId}_${courseId}`;
    
    const admin = require("firebase-admin");
    const FieldValue = admin.firestore.FieldValue;
    
    await db.collection("enrollments").doc(enrollmentId).set({
      userId: studentId,
      courseId,
      status: "completed",
      enrolledAt: FieldValue.serverTimestamp(),
      progress: 0,
      completedLessons: [],
      enrolledBy: actorId,
      type: "manual",
      lastAccessed: FieldValue.serverTimestamp(),
    });
    
    return { success: true, message: "Student enrolled successfully" };
  } catch (error: any) {
    console.error("[SERVER] Manual enrollment error:", error);
    return { success: false, message: error.message };
  }
}

/**
 * Update user role and custom claims.
 */
export async function updateUserRoleServer(userId: string, role: string, adminId: string) {
  const db = getAdminDb();
  const auth = getAdminAuth();
    
  const admin = require("firebase-admin");
  const FieldValue = admin.firestore.FieldValue;
  
  await db.collection("users").doc(userId).update({
    role,
    updatedAt: FieldValue.serverTimestamp(),
    updatedBy: adminId
  });
  
  // Update Firebase Auth Custom Claims
  await auth.setCustomUserClaims(userId, {
    admin: role === "admin",
    creator: role === "creator",
    student: role === "student"
  });
}

/**
 * Delete a user and their data.
 */
export async function deleteUserServer(userId: string) {
  const db = getAdminDb();
  const auth = getAdminAuth();
  
  await db.collection("users").doc(userId).delete();
  await auth.deleteUser(userId);
}

/**
 * Fetch all users for admin dashboard.
 */
export async function getAllUsersServer(): Promise<User[]> {
  try {
    const db = getAdminDb();
    const snapshot = await db.collection("users").orderBy("createdAt", "desc").get();
    return snapshot.docs.map(doc => sanitizeDoc(doc.id, doc.data())) as User[];
  } catch (error) {
    console.error("[SERVER] Failed to fetch all users:", error);
    return [];
  }
}

/**
 * Get all creator applications.
 */
export async function getCreatorApplicationsServer(): Promise<CreatorApplication[]> {
  try {
    const db = getAdminDb();
    const snapshot = await db.collection("creatorApplications").orderBy("createdAt", "desc").get();
    return snapshot.docs.map(doc => sanitizeDoc(doc.id, doc.data())) as CreatorApplication[];
  } catch (error) {
    console.error("[SERVER] Failed to fetch creator applications:", error);
    return [];
  }
}

/**
 * Approve a creator application.
 */
export async function approveCreatorServer(applicationId: string, adminId: string) {
  const db = getAdminDb();
  const appRef = db.collection("creatorApplications").doc(applicationId);
  const appSnap = await appRef.get();
  
  if (!appSnap.exists) throw new Error("Application not found");
  
  const appData = appSnap.data()!;
  const userId = appData.userId;
  
  const admin = require("firebase-admin");
  const FieldValue = admin.firestore.FieldValue;
  
  await db.runTransaction(async (transaction) => {
    transaction.update(appRef, {
      status: "approved",
      reviewedAt: FieldValue.serverTimestamp(),
      reviewedBy: adminId
    });
    
    transaction.update(db.collection("users").doc(userId), {
      role: "creator"
    });
  });
  
  const { getAdminAuth } = require("./firebase-admin");
  await getAdminAuth().setCustomUserClaims(userId, { 
    creator: true,
    student: false,
    admin: false 
  });
}

/**
 * Reject a creator application.
 */
export async function rejectCreatorServer(applicationId: string, reason: string, adminId: string) {
  const db = getAdminDb();
  const admin = require("firebase-admin");
  const FieldValue = admin.firestore.FieldValue;
  
  await db.collection("creatorApplications").doc(applicationId).update({
    status: "rejected",
    rejectionReason: reason,
    reviewedAt: FieldValue.serverTimestamp(),
    reviewedBy: adminId
  });
}

/**
 * Delete a creator application.
 */
export async function deleteCreatorApplicationServer(applicationId: string) {
  const db = getAdminDb();
  await db.collection("creatorApplications").doc(applicationId).delete();
}
