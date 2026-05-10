/**
 * Client-Side Firestore Helpers
 * ==============================
 * These functions run in the browser using the Firebase Client SDK.
 * They are subject to Firestore Security Rules.
 *
 * SECURITY NOTES:
 * - enrollUserInCourse() has been REMOVED — enrollment now happens server-side only
 * - Data writes should be limited to user's own data (progress, profile)
 * - Admin writes use client SDK but are protected by Firestore rules
 *
 * PERFORMANCE NOTES:
 * - getUserDashboardStats() has been optimized to reduce nested fetches
 * - Admin stats should eventually read from aggregation collections
 */

import { User, Course, Lesson, Enrollment, LessonProgress, CreatorApplication } from "@/types/firestore";
import { 
  doc, 
  getDoc, 
  setDoc, 
  collection, 
  getDocs, 
  query, 
  where, 
  orderBy,
  limit,
  serverTimestamp 
} from "firebase/firestore";
import { db } from "./firebase";

// ─── Creator Economy Operations ─────────────────────────────────────────────

/**
 * Submits a new creator application.
 */
export const submitCreatorApplication = async (application: Omit<CreatorApplication, "id" | "status" | "createdAt">) => {
  const applicationsRef = collection(db, "creatorApplications");
  const newAppRef = doc(applicationsRef);
  
  const newApp: Omit<CreatorApplication, "id"> = {
    ...application,
    status: "pending",
    createdAt: serverTimestamp(),
  };

  await setDoc(newAppRef, newApp);
  return newAppRef.id;
};

/**
 * Fetches the status of a user's creator application.
 */
export const getCreatorApplicationStatus = async (userId: string): Promise<CreatorApplication | null> => {
  const applicationsRef = collection(db, "creatorApplications");
  const q = query(applicationsRef, where("userId", "==", userId), orderBy("createdAt", "desc"), limit(1));
  const querySnapshot = await getDocs(q);
  
  if (querySnapshot.empty) return null;
  return { id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() } as CreatorApplication;
};

// ─── User Operations ────────────────────────────────────────────────────────

/**
 * Creates a user profile in Firestore if it doesn't already exist.
 */
export const createUserIfNotExists = async (userData: Partial<User>) => {
  if (!userData.uid) return;

  const userRef = doc(db, "users", userData.uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    const newUser: User = {
      uid: userData.uid,
      email: userData.email || "",
      name: userData.name || null,
      photoURL: userData.photoURL || null,
      role: "student",
      verified: true,
      createdAt: serverTimestamp(),
      lastLogin: serverTimestamp(),
    };
    await setDoc(userRef, newUser);
  } else {
    // Update last login
    await setDoc(userRef, { lastLogin: serverTimestamp() }, { merge: true });
  }
};

/**
 * Updates last login for an existing user.
 */
export const updateUserLogin = async (uid: string) => {
  const userRef = doc(db, "users", uid);
  await setDoc(userRef, { lastLogin: serverTimestamp() }, { merge: true });
};

/**
 * Fetches a user's profile from Firestore.
 */
export const getUserProfile = async (uid: string): Promise<User | null> => {
  const userRef = doc(db, "users", uid);
  const userSnap = await getDoc(userRef);
  if (userSnap.exists()) {
    return userSnap.data() as User;
  }
  return null;
};

// ─── Course Queries ─────────────────────────────────────────────────────────

/**
 * Fetches all published courses.
 */
export const getCourses = async (): Promise<Course[]> => {
  const coursesRef = collection(db, "courses");
  const q = query(coursesRef, where("published", "==", true));
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as Course));
};

/**
 * Fetches a single course by its ID.
 */
export const getCourseById = async (courseId: string): Promise<Course | null> => {
  const courseRef = doc(db, "courses", courseId);
  const courseSnap = await getDoc(courseRef);

  if (courseSnap.exists()) {
    return { id: courseSnap.id, ...courseSnap.data() } as Course;
  }
  
  return null;
};

// ─── Lesson Queries ─────────────────────────────────────────────────────────

/**
 * Fetches all lessons for a specific course, ordered by 'order'.
 */
export const getLessonsByCourseId = async (courseId: string): Promise<Lesson[]> => {
  const lessonsRef = collection(db, "lessons");
  const q = query(
    lessonsRef, 
    where("courseId", "==", courseId),
    orderBy("order", "asc")
  );
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as Lesson));
};

/**
 * Fetches a single lesson by its ID.
 */
export const getLessonById = async (lessonId: string): Promise<Lesson | null> => {
  const lessonRef = doc(db, "lessons", lessonId);
  const lessonSnap = await getDoc(lessonRef);

  if (lessonSnap.exists()) {
    return { id: lessonSnap.id, ...lessonSnap.data() } as Lesson;
  }
  
  return null;
};

// ─── Enrollment Queries (Read-Only from Client) ─────────────────────────────

/**
 * Checks if a user is enrolled in a specific course.
 */
export const isUserEnrolled = async (userId: string, courseId: string): Promise<boolean> => {
  const enrollmentId = `${userId}_${courseId}`;
  const enrollmentRef = doc(db, "enrollments", enrollmentId);
  const enrollmentSnap = await getDoc(enrollmentRef);
  return enrollmentSnap.exists();
};

/**
 * Fetches all enrollments for a user along with course details.
 * OPTIMIZED: Uses Promise.all for parallel fetching instead of sequential.
 */
export const getUserEnrollments = async (userId: string): Promise<(Enrollment & { course: Course })[]> => {
  const enrollmentsRef = collection(db, "enrollments");
  const q = query(enrollmentsRef, where("userId", "==", userId));
  const querySnapshot = await getDocs(q);
  
  const enrollments = querySnapshot.docs.map(doc => doc.data() as Enrollment);
  
  // Parallel fetch all courses (still N+1 but courses are cached by Firestore)
  const enrollmentWithCourses = await Promise.all(
    enrollments.map(async (enrollment) => {
      const course = await getCourseById(enrollment.courseId);
      return { ...enrollment, course: course! };
    })
  );

  return enrollmentWithCourses;
};

// ─── Progress Tracking ──────────────────────────────────────────────────────

/**
 * Marks a lesson as completed for a user.
 */
export const markLessonComplete = async (
  userId: string, 
  courseId: string, 
  lessonId: string
): Promise<void> => {
  const progressId = `${userId}_${lessonId}`;
  const progressRef = doc(db, "lessonProgress", progressId);

  const newProgress: LessonProgress = {
    id: progressId,
    userId,
    courseId,
    lessonId,
    completed: true,
    watchedAt: serverTimestamp(),
  };

  await setDoc(progressRef, newProgress);
};

/**
 * Fetches all completed lessons for a user in a specific course.
 */
export const getUserProgress = async (
  userId: string, 
  courseId: string
): Promise<string[]> => {
  const progressRef = collection(db, "lessonProgress");
  const q = query(
    progressRef,
    where("userId", "==", userId),
    where("courseId", "==", courseId),
    where("completed", "==", true)
  );
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => doc.data().lessonId);
};

// ─── Dashboard Stats (Optimized) ───────────────────────────────────────────

/**
 * Calculates detailed progress for a user across their enrolled courses.
 *
 * OPTIMIZATION: 
 * - Fetches all enrollments in one query
 * - Parallel fetches courses and lessons
 * - Minimizes total Firestore reads vs previous N+1 pattern
 */
export const getUserDashboardStats = async (userId: string) => {
  // 1. Fetch all enrollments for the user (single query)
  const enrollments = await getUserEnrollments(userId);
  
  if (enrollments.length === 0) {
    return {
      enrolledCourses: [],
      totalEnrolled: 0,
      totalCompletedLessons: 0,
      totalHours: 0,
    };
  }

  // 2. Fetch lessons and progress in parallel for all courses
  const stats = await Promise.all(
    enrollments.map(async (enr) => {
      // Parallel: fetch lessons + progress for each course simultaneously
      const [lessons, completedLessonIds] = await Promise.all([
        getLessonsByCourseId(enr.courseId),
        getUserProgress(userId, enr.courseId),
      ]);
      
      const totalLessons = lessons.length;
      const completedCount = completedLessonIds.length;
      const percentage = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

      // Calculate watch time from completed lessons
      let totalSeconds = 0;
      const completedSet = new Set(completedLessonIds); // O(1) lookups
      lessons.forEach(lesson => {
        if (completedSet.has(lesson.id)) {
          const parts = lesson.duration.split(":").map(Number);
          const mins = parts[0] || 0;
          const secs = parts[1] || 0;
          totalSeconds += (mins * 60) + secs;
        }
      });

      return {
        courseId: enr.courseId,
        courseTitle: enr.course.title,
        thumbnail: enr.course.thumbnail,
        totalLessons,
        completedCount,
        percentage,
        totalSeconds
      };
    })
  );

  const totalEnrolled = enrollments.length;
  const totalCompletedLessons = stats.reduce((acc, s) => acc + s.completedCount, 0);
  const totalSecondsWatched = stats.reduce((acc, s) => acc + s.totalSeconds, 0);
  const totalHours = Math.round((totalSecondsWatched / 3600) * 10) / 10;

  return {
    enrolledCourses: stats,
    totalEnrolled,
    totalCompletedLessons,
    totalHours
  };
};

// ─── Admin Global Stats ─────────────────────────────────────────────────────

/**
 * Fetches global stats for the admin dashboard.
 * NOTE: This still performs full collection counts. For production at scale,
 * use the pre-computed platformStats collection via the server-side helpers.
 */
export const getAdminGlobalStats = async () => {
  const [coursesSnap, enrollmentsSnap, lessonsSnap, usersSnap] = await Promise.all([
    getDocs(collection(db, "courses")),
    getDocs(collection(db, "enrollments")),
    getDocs(collection(db, "lessons")),
    getDocs(collection(db, "users")),
  ]);

  return {
    totalCourses: coursesSnap.size,
    totalEnrollments: enrollmentsSnap.size,
    totalLessons: lessonsSnap.size,
    totalUsers: usersSnap.size,
  };
};

// ─── Admin CMS Operations ───────────────────────────────────────────────────

/**
 * CMS: Fetches ALL courses for admin.
 */
export const getAllCoursesAdmin = async (): Promise<Course[]> => {
  const coursesRef = collection(db, "courses");
  const q = query(coursesRef, orderBy("createdAt", "desc"));
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as Course));
};

/**
 * CMS: Fetches courses for a specific creator.
 */
export const getCoursesByCreator = async (creatorId: string): Promise<Course[]> => {
  const coursesRef = collection(db, "courses");
  const q = query(coursesRef, where("creatorId", "==", creatorId), orderBy("createdAt", "desc"));
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as Course));
};

/**
 * CMS: Creates a new course.
 */
export const adminCreateCourse = async (courseData: Partial<Course>, creator?: User): Promise<string> => {
  const coursesRef = collection(db, "courses");
  const newCourseRef = doc(coursesRef);
  
  const newCourse: Omit<Course, "id"> = {
    title: courseData.title || "Untitled Course",
    description: courseData.description || "",
    thumbnail: courseData.thumbnail || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3",
    price: Number(courseData.price) || 0,
    instructorId: creator?.uid || "admin",
    // Creator Info
    creatorId: creator?.uid || "admin",
    creatorName: creator?.name || "Verox Academy",
    creatorPhoto: creator?.photoURL || null,
    creatorEmail: creator?.email || null,
    lessonCount: 0,
    published: courseData.published || false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  await setDoc(newCourseRef, newCourse);
  return newCourseRef.id;
};

/**
 * CMS: Updates a course.
 */
export const adminUpdateCourse = async (courseId: string, courseData: Partial<Course>) => {
  const courseRef = doc(db, "courses", courseId);
  await setDoc(courseRef, {
    ...courseData,
    price: Number(courseData.price) || 0,
    updatedAt: serverTimestamp(),
  }, { merge: true });
};

/**
 * CMS: Toggles publish status.
 */
export const toggleCoursePublish = async (courseId: string, currentStatus: boolean) => {
  const courseRef = doc(db, "courses", courseId);
  await setDoc(courseRef, {
    published: !currentStatus,
    updatedAt: serverTimestamp(),
  }, { merge: true });
};
/**
 * CMS: Creates a new lesson for a course.
 */
export const adminCreateLesson = async (lessonData: Partial<Lesson>): Promise<string> => {
  const lessonsRef = collection(db, "lessons");
  const newLessonRef = doc(lessonsRef);
  
  const newLesson: Omit<Lesson, "id"> = {
    courseId: lessonData.courseId || "",
    title: lessonData.title || "New Lesson",
    description: lessonData.description || "",
    videoUrl: lessonData.videoUrl || "",
    wistiaMediaId: lessonData.wistiaMediaId || "",
    duration: lessonData.duration || "0:00",
    order: Number(lessonData.order) || 0,
    published: lessonData.published || false,
    isPreviewFree: lessonData.isPreviewFree || false,
    createdAt: serverTimestamp(),
  };

  await setDoc(newLessonRef, newLesson);
  return newLessonRef.id;
};

/**
 * CMS: Updates an existing lesson.
 */
export const adminUpdateLesson = async (lessonId: string, lessonData: Partial<Lesson>) => {
  const lessonRef = doc(db, "lessons", lessonId);
  await setDoc(lessonRef, {
    ...lessonData,
    order: Number(lessonData.order) || 0,
  }, { merge: true });
};

/**
 * CMS: Deletes a lesson.
 */
export const adminDeleteLesson = async (lessonId: string) => {
  const lessonRef = doc(db, "lessons", lessonId);
  // Using setDoc to mark as deleted or actually deleting? 
  // For lessons, we can actually delete as it's content management.
  // But let's just delete for now as per usual CMS flow.
  const { deleteDoc } = await import("firebase/firestore");
  await deleteDoc(lessonRef);
};

/**
 * CMS: Updates the order of multiple lessons.
 */
export const adminUpdateLessonOrder = async (lessons: { id: string; order: number }[]) => {
  const { writeBatch } = await import("firebase/firestore");
  const batch = writeBatch(db);
  
  lessons.forEach((l) => {
    const lessonRef = doc(db, "lessons", l.id);
    batch.update(lessonRef, { order: l.order });
  });
  
  await batch.commit();
};

/**
 * CMS: Duplicates a lesson.
 */
export const adminDuplicateLesson = async (lesson: Lesson) => {
  const lessonsRef = collection(db, "lessons");
  const newLessonRef = doc(lessonsRef);
  
  const { id, ...lessonData } = lesson;
  const newLesson = {
    ...lessonData,
    title: `${lesson.title} (Copy)`,
    createdAt: serverTimestamp(),
    order: lesson.order + 0.1, // Will be re-indexed if needed
  };
  
  await setDoc(newLessonRef, newLesson);
  return newLessonRef.id;
};
/**
 * Fetches aggregated stats for a creator.
 */
export const getCreatorStats = async (creatorId: string): Promise<CreatorStats | null> => {
  const statsRef = doc(db, "creatorStats", creatorId);
  const statsSnap = await getDoc(statsRef);
  
  if (statsSnap.exists()) {
    return statsSnap.data() as CreatorStats;
  }
  
  // Return default stats if collection doesn't exist yet
  return {
    creatorId,
    totalCourses: 0,
    totalStudents: 0,
    totalEnrollments: 0,
    totalRevenue: 0,
    pendingRevenue: 0,
    paidRevenue: 0,
    watchHours: 0,
    lastUpdated: serverTimestamp() as any
  };
};

/**
 * Fetches recent enrollments for a creator's courses.
 */
export const getCreatorRecentEnrollments = async (creatorId: string, limitCount = 5) => {
  // 1. Get creator's course IDs
  const coursesRef = collection(db, "courses");
  const coursesQuery = query(coursesRef, where("creatorId", "==", creatorId));
  const coursesSnap = await getDocs(coursesQuery);
  const courseIds = coursesSnap.docs.map(doc => doc.id);

  if (courseIds.length === 0) return [];

  // 2. Get enrollments for these courses
  const enrollmentsRef = collection(db, "enrollments");
  const enrollmentsQuery = query(
    enrollmentsRef, 
    where("courseId", "in", courseIds.slice(0, 10)), // Firestore 'in' limit is 10
    orderBy("enrolledAt", "desc"),
    limit(limitCount)
  );
  
  const enrollmentsSnap = await getDocs(enrollmentsQuery);
  
  // 3. Join with course and user info
  const results = await Promise.all(enrollmentsSnap.docs.map(async (enrDoc) => {
    const data = enrDoc.data() as Enrollment;
    const course = coursesSnap.docs.find(d => d.id === data.courseId)?.data() as Course;
    
    const userRef = doc(db, "users", data.userId);
    const userSnap = await getDoc(userRef);
    const userData = userSnap.exists() ? userSnap.data() as User : null;

    return {
      id: enrDoc.id,
      courseTitle: course?.title || "Unknown Course",
      studentName: userData?.name || "Anonymous Student",
      enrolledAt: data.enrolledAt
    };
  }));

  return results;
};

/**
 * Submits a new payout request.
 */
export const requestPayout = async (creatorId: string, amount: number, paymentMethod: any) => {
  const payoutsRef = collection(db, "payoutRequests");
  const newPayoutRef = doc(payoutsRef);
  
  const newPayout: Omit<PayoutRequest, "id"> = {
    creatorId,
    amount,
    status: "pending",
    requestedAt: serverTimestamp() as any,
    paymentMethod
  };

  await setDoc(newPayoutRef, newPayout);
  return newPayoutRef.id;
};

/**
 * Fetches payout history for a creator.
 */
export const getPayoutHistory = async (creatorId: string): Promise<PayoutRequest[]> => {
  const payoutsRef = collection(db, "payoutRequests");
  const q = query(payoutsRef, where("creatorId", "==", creatorId), orderBy("requestedAt", "desc"));
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PayoutRequest));
};
