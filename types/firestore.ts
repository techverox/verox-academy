/* eslint-disable @typescript-eslint/no-explicit-any */
export interface User {
  uid: string;
  email: string;
  name: string | null;
  photoURL: string | null;
  role: "student" | "admin";
  verified: boolean;
  createdAt: any; // ServerTimestamp
  lastLogin: any; // ServerTimestamp
}

export interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  price: number;
  instructorId: string;
  lessonCount: number;
  published: boolean;
  createdAt: any;
  updatedAt: any;
}

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
  createdAt: any;
}

export interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  status: "active" | "completed";
  progress: number; // percentage
  enrolledAt: any;
  completedAt?: any;
}

export interface LessonProgress {
  id: string;
  userId: string;
  courseId: string;
  lessonId: string;
  completed: boolean;
  watchedAt: any;
}
