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
  role: "student" | "creator" | "admin";
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
  // Creator Info (Denormalized for performance)
  creatorId: string;
  creatorName: string | null;
  creatorPhoto: string | null;
  creatorEmail: string | null;
  lessonCount: number;
  published: boolean;
  averageRating?: number;
  totalReviews?: number;
  createdAt: FirestoreTimestamp;
  updatedAt: FirestoreTimestamp;
}

// ─── Review ────────────────────────────────────────────────────────────────
export interface Review {
  id: string;
  courseId: string;
  userId: string;
  userName: string;
  userPhoto?: string;
  rating: number; // 1-5
  comment: string;
  creatorReply?: {
    text: string;
    repliedAt: FirestoreTimestamp;
  };
  createdAt: FirestoreTimestamp;
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
  notes?: string; // Markdown notes
  createdAt: FirestoreTimestamp;
}

// ─── Resource ───────────────────────────────────────────────────────────────
export interface Resource {
  id: string;
  courseId: string;
  lessonId: string;
  title: string;
  type: "pdf" | "zip" | "image" | "doc" | "link";
  url: string;
  size?: number; // bytes
  createdAt: FirestoreTimestamp;
}

// ─── Quiz ──────────────────────────────────────────────────────────────────
export interface Question {
  id: string;
  text: string;
  options: string[];
  correctOptionIndex: number;
}

export interface Quiz {
  id: string;
  courseId: string;
  lessonId: string;
  title: string;
  questions: Question[];
  passingScore: number; // percentage (0-100)
  createdAt: FirestoreTimestamp;
}

export interface QuizAttempt {
  id: string;
  userId: string;
  quizId: string;
  score: number;
  passed: boolean;
  answers: number[]; // Index of selected options
  attemptedAt: FirestoreTimestamp;
}

// ─── Enrollment ─────────────────────────────────────────────────────────────
export interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  status: "active" | "completed";
  progress: number; // percentage
  completedLessons: number;
  totalLessons: number;
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
  /** Revenue breakdown */
  platformFee: number; // in paise (e.g. 20%)
  creatorRevenue: number; // in paise (e.g. 80%)
  creatorId: string;
  payoutStatus: "pending" | "paid" | "n/a";
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

// ─── Creator Application ────────────────────────────────────────────────────
export interface CreatorApplication {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  bio: string;
  expertise: string;
  category: string;
  socialLinks: {
    twitter?: string;
    linkedin?: string;
    youtube?: string;
    instagram?: string;
  };
  portfolioUrl: string;
  sampleCourseIdea: string;
  whyJoin: string;
  status: "pending" | "approved" | "rejected";
  createdAt: FirestoreTimestamp;
  reviewedAt?: FirestoreTimestamp;
  reviewedBy?: string; // admin userId
  rejectionReason?: string;
}

// ─── Payout Request ─────────────────────────────────────────────────────────
export interface PayoutRequest {
  id: string;
  creatorId: string;
  amount: number; // in paise
  status: "pending" | "approved" | "rejected" | "paid";
  requestedAt: FirestoreTimestamp;
  processedAt?: FirestoreTimestamp;
  processedBy?: string; // admin userId
  notes?: string;
  paymentMethod?: {
    type: "upi" | "bank";
    details: string;
  };
}

// ─── Certificate ───────────────────────────────────────────────────────────
export interface Certificate {
  id: string;
  userId: string;
  courseId: string;
  creatorId: string;
  studentName: string;
  courseTitle: string;
  creatorName: string;
  serialNumber: string;
  issuedAt: FirestoreTimestamp;
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

// ─── Aggregation: Creator Stats ─────────────────────────────────────────────
// Per-creator aggregated metrics. Stored in `creatorStats/{creatorId}`.
export interface CreatorStats {
  creatorId: string;
  totalCourses: number;
  totalStudents: number;
  totalEnrollments: number;
  totalRevenue: number; // in paise
  pendingRevenue: number; // in paise (unpaid earnings)
  paidRevenue: number; // in paise (withdrawn earnings)
  watchHours: number;
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
