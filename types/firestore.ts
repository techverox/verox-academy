/**
 * Firestore Type Definitions
 * ===========================
 * Strict TypeScript interfaces for all Firestore collections.
 * Using FieldValue for server timestamps to maintain type safety.
 */

import { FieldValue } from "firebase/firestore";

// ─── Timestamp Type ─────────────────────────────────────────────────────────
// Firestore timestamps can be either a FieldValue (when writing)
// or a Firestore Timestamp object (when reading)
export type FirestoreTimestamp = FieldValue | { seconds: number; nanoseconds: number };

// ─── User ───────────────────────────────────────────────────────────────────
export interface User {
  uid: string;
  email: string;
  name: string | null;
  photoURL: string | null;
  role: "student" | "admin";
  verified: boolean;
  createdAt: FirestoreTimestamp;
  lastLogin: FirestoreTimestamp;
}

// ─── Course ─────────────────────────────────────────────────────────────────
export interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  price: number;
  instructorId: string;
  lessonCount: number;
  published: boolean;
  createdAt: FirestoreTimestamp;
  updatedAt: FirestoreTimestamp;
}

// ─── Lesson ─────────────────────────────────────────────────────────────────
export interface Lesson {
  id: string;
  courseId: string;
  title: string;
  description: string;
  videoUrl: string;
  wistiaMediaId?: string;
  duration: string; // e.g., "10:30"
  order: number;
  published: boolean;
  isPreviewFree: boolean;
  createdAt: FirestoreTimestamp;
}

// ─── Enrollment ─────────────────────────────────────────────────────────────
export interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  status: "active" | "completed";
  progress: number; // percentage
  enrolledAt: FirestoreTimestamp;
  completedAt?: FirestoreTimestamp;
  /** Payment ID that created this enrollment (source of truth) */
  paymentId?: string;
}

// ─── Lesson Progress ────────────────────────────────────────────────────────
export interface LessonProgress {
  id: string;
  userId: string;
  courseId: string;
  lessonId: string;
  completed: boolean;
  watchedAt: FirestoreTimestamp;
}

// ─── Payment ────────────────────────────────────────────────────────────────
// SECURITY: Payment records are the source of truth for enrollments.
// Only server-side code (webhooks) should create payment records.
export type PaymentStatus = "created" | "authorized" | "captured" | "failed" | "refunded";

export interface Payment {
  id: string;
  userId: string;
  courseId: string;
  /** Razorpay order ID (order_xxxxx) */
  orderId: string;
  /** Razorpay payment ID (pay_xxxxx) — set after payment capture */
  paymentId: string;
  amount: number; // in paise (smallest currency unit)
  currency: string;
  status: PaymentStatus;
  /** Razorpay signature for verification */
  signature?: string;
  createdAt: FirestoreTimestamp;
  verifiedAt?: FirestoreTimestamp;
  /** Metadata for debugging and audit trail */
  metadata?: {
    courseTitle?: string;
    userEmail?: string;
    webhookEventId?: string;
  };
}

// ─── Aggregation: Platform Stats ────────────────────────────────────────────
// Pre-computed stats to avoid N+1 query problems on admin dashboard.
// Updated by server-side triggers (webhooks, cloud functions).
export interface PlatformStats {
  totalUsers: number;
  totalCourses: number;
  totalEnrollments: number;
  totalLessons: number;
  totalRevenue: number; // in paise
  totalPayments: number;
  lastUpdated: FirestoreTimestamp;
}

// ─── Aggregation: Course Stats ──────────────────────────────────────────────
// Per-course aggregated metrics. Stored in `courseStats/{courseId}`.
export interface CourseStats {
  courseId: string;
  totalEnrollments: number;
  totalRevenue: number; // in paise
  totalLessons: number;
  avgProgress: number; // 0-100
  lastUpdated: FirestoreTimestamp;
}
