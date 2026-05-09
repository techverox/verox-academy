export type UserRole = "student" | "creator" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  photoURL?: string;
  role: UserRole;
  verified: boolean;
  createdAt: any; // eslint-disable-line @typescript-eslint/no-explicit-any
}

export interface Course {
  id: string;
  title: string;
  description: string;
  price: number;
  thumbnail: string;
  category: string;
  creatorId: string;
  published: boolean;
  createdAt: any; // eslint-disable-line @typescript-eslint/no-explicit-any
}

export interface Lesson {
  id: string;
  courseId: string;
  title: string;
  videoUrl: string; // Wistia or YouTube
  pdfUrl?: string;
  order: number;
}

export interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  progress: number; // 0 to 100
  completed: boolean;
  enrolledAt: any; // eslint-disable-line @typescript-eslint/no-explicit-any
}
