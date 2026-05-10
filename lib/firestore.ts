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

import { User, Course, Lesson, Enrollment, LessonProgress, CreatorApplication, Certificate, Resource, Quiz, Question, QuizAttempt, Review, CreatorStats, PayoutRequest } from "@/types/firestore";
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc,
  collection, 
  getDocs, 
  query, 
  where, 
  orderBy,
  limit,
  serverTimestamp,
  runTransaction,
  increment 
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
  
  // Trigger email via API (Admin Alert)
  try {
    const { auth } = await import("./firebase");
    const token = await auth.currentUser?.getIdToken();
    if (token) {
      await fetch("/api/creators/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(application),
      });
    }
  } catch (err) {
    console.error("[EMAIL] Failed to trigger creator application email:", err);
  }

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
    
    // Trigger Welcome Email via API
    try {
      const { auth } = await import("./firebase");
      const token = await auth.currentUser?.getIdToken();
      if (token) {
        await fetch("/api/auth/onboard", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` }
        });
      }
    } catch (err) {
      console.warn("[EMAIL] Failed to trigger welcome email:", err);
    }
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
  const enrollmentId = `${userId}_${courseId}`;
  const enrollmentRef = doc(db, "enrollments", enrollmentId);

  await runTransaction(db, async (transaction) => {
    const progressSnap = await transaction.get(progressRef);
    // If already completed, do nothing to avoid over-incrementing
    if (progressSnap.exists()) return;

    const enrollmentSnap = await transaction.get(enrollmentRef);
    if (!enrollmentSnap.exists()) return;

    const enrollmentData = enrollmentSnap.data() as Enrollment;
    const currentCompleted = enrollmentData.completedLessons || 0;
    const totalLessons = enrollmentData.totalLessons || 0;
    
    const newCompletedCount = currentCompleted + 1;
    const newProgress = totalLessons > 0 ? Math.min(Math.round((newCompletedCount / totalLessons) * 100), 100) : 0;
    const isFinished = newProgress === 100;

    // 1. Mark lesson as complete
    transaction.set(progressRef, {
      id: progressId,
      userId,
      courseId,
      lessonId,
      completed: true,
      watchedAt: serverTimestamp(),
    });

    // 2. Update enrollment progress (Aggregated read optimization)
    transaction.update(enrollmentRef, {
      completedLessons: newCompletedCount,
      progress: newProgress,
      status: isFinished ? "completed" : "active",
      completedAt: isFinished ? serverTimestamp() : (enrollmentData.completedAt || null),
      lastActivityAt: serverTimestamp()
    });

    // ─── Trigger Review Reminder at 50% ──────────────────────────
    if (newProgress >= 50 && (enrollmentData.progress || 0) < 50) {
      // Trigger Review Reminder via API
      try {
        const { auth } = await import("./firebase");
        const token = await auth.currentUser?.getIdToken();
        if (token) {
          fetch("/api/reviews/reminder", {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({ courseId }),
          });
        }
      } catch (err) {
        console.warn("[EMAIL] Failed to trigger review reminder email:", err);
      }
    }
  });

  // 3. Auto-issue certificate if finished (outside transaction for simplicity)
  const finalEnrollmentSnap = await getDoc(enrollmentRef);
  if (finalEnrollmentSnap.exists() && finalEnrollmentSnap.data().status === "completed") {
    // Trigger Certificate Issuance and Email via API
    try {
      const { auth } = await import("./firebase");
      const token = await auth.currentUser?.getIdToken();
      if (token) {
        await fetch("/api/certificates/issue", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ courseId }),
        });
      }
    } catch (err) {
      console.error("[EMAIL] Failed to trigger certificate email:", err);
      // Fallback to client-side issuance if API fails (but email won't be sent)
      await autoIssueCertificate(userId, courseId);
    }
  }
};

/**
 * Automatically issues a certificate for a user-course combination if one doesn't exist.
 */
export const autoIssueCertificate = async (userId: string, courseId: string) => {
  const certId = `${userId}_${courseId}`;
  const certRef = doc(db, "certificates", certId);
  
  const certSnap = await getDoc(certRef);
  if (certSnap.exists()) return;

  const [userProfile, course] = await Promise.all([
    getUserProfile(userId),
    getCourseById(courseId)
  ]);

  if (!userProfile || !course) return;

  const certificate: Certificate = {
    id: certId,
    userId,
    courseId,
    creatorId: course.creatorId,
    studentName: userProfile.name || "Verox Student",
    courseTitle: course.title,
    creatorName: course.creatorName || "Verox Academy",
    serialNumber: `VX-${courseId.slice(0, 4)}-${userId.slice(0, 4)}-${Math.floor(Date.now() / 100000)}`.toUpperCase(),
    issuedAt: serverTimestamp(),
  };

  await setDoc(certRef, certificate);
};

/**
 * Fetches a certificate by its ID.
 */
export const getCertificateById = async (certId: string): Promise<Certificate | null> => {
  const certRef = doc(db, "certificates", certId);
  const certSnap = await getDoc(certRef);
  
  if (certSnap.exists()) {
    return { id: certSnap.id, ...certSnap.data() } as Certificate;
  }
  return null;
};

/**
 * Fetches certificates for a specific user.
 */
export const getUserCertificates = async (userId: string): Promise<Certificate[]> => {
  const certsRef = collection(db, "certificates");
  const q = query(certsRef, where("userId", "==", userId));
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Certificate));
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
  // Enrollment now contains aggregated progress data
  const enrollments = await getUserEnrollments(userId);
  
  if (enrollments.length === 0) {
    return {
      enrolledCourses: [],
      totalEnrolled: 0,
      totalCompletedLessons: 0,
      totalHours: 0,
    };
  }

  // 2. Map enrollments directly to stats (No more N+1 fetches for lessons/progress!)
  const stats = enrollments.map((enr) => {
    return {
      courseId: enr.courseId,
      courseTitle: enr.course.title,
      thumbnail: enr.course.thumbnail,
      totalLessons: enr.totalLessons || 0,
      completedCount: enr.completedLessons || 0,
      percentage: enr.progress || 0,
      status: enr.status,
      completedAt: enr.completedAt
    };
  });

  const totalEnrolled = enrollments.length;
  const totalCompletedLessons = stats.reduce((acc, s) => acc + s.completedCount, 0);
  
  // NOTE: totalHours calculation still requires lesson durations if we want to be exact,
  // but for the dashboard summary, we can approximate or skip if not critical.
  // To keep it "premium", let's assume average 10 mins per lesson for the summary 
  // if we don't want to fetch all lessons.
  // Actually, the user might prefer accuracy. Let's keep it 0 for now as we optimized reads.
  const totalHours = 0; 

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
  
  // Trigger Admin Alert via API
  try {
    const { auth } = await import("./firebase");
    const token = await auth.currentUser?.getIdToken();
    if (token) {
      await fetch("/api/payouts/request", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ amount, paymentMethod }),
      });
    }
  } catch (err) {
    console.error("[EMAIL] Failed to trigger payout alert email:", err);
  }

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
// ─── Lesson Resources ───────────────────────────────────────────────────────

/**
 * Fetches all resources for a specific lesson.
 */
export const getResourcesByLessonId = async (lessonId: string): Promise<Resource[]> => {
  const resourcesRef = collection(db, "resources");
  const q = query(resourcesRef, where("lessonId", "==", lessonId), orderBy("createdAt", "desc"));
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as Resource));
};

/**
 * Adds a new resource to a lesson.
 */
export const adminAddResource = async (resourceData: Omit<Resource, "id" | "createdAt">): Promise<string> => {
  const resourcesRef = collection(db, "resources");
  const newResourceRef = doc(resourcesRef);
  
  const newResource: Omit<Resource, "id"> = {
    ...resourceData,
    createdAt: serverTimestamp(),
  };

  await setDoc(newResourceRef, newResource);
  return newResourceRef.id;
};

/**
 * Deletes a resource.
 */
export const adminDeleteResource = async (resourceId: string): Promise<void> => {
  const resourceRef = doc(db, "resources", resourceId);
  const { deleteDoc } = await import("firebase/firestore");
  await deleteDoc(resourceRef);
};

/**
 * Updates lesson notes.
 */
export const adminUpdateLessonNotes = async (lessonId: string, notes: string): Promise<void> => {
  const lessonRef = doc(db, "lessons", lessonId);
  await setDoc(lessonRef, { notes }, { merge: true });
};

// ─── Quiz & Assessment ──────────────────────────────────────────────────────

/**
 * Fetches the quiz for a specific lesson.
 */
export const getQuizByLessonId = async (lessonId: string): Promise<Quiz | null> => {
  const quizzesRef = collection(db, "quizzes");
  const q = query(quizzesRef, where("lessonId", "==", lessonId));
  const querySnapshot = await getDocs(q);
  
  if (!querySnapshot.empty) {
    return { id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() } as Quiz;
  }
  return null;
};

/**
 * Records a quiz attempt.
 */
export const saveQuizAttempt = async (attempt: Omit<QuizAttempt, "id" | "attemptedAt">): Promise<string> => {
  const attemptsRef = collection(db, "quizAttempts");
  const newAttemptRef = doc(attemptsRef);
  
  const newAttempt: Omit<QuizAttempt, "id"> = {
    ...attempt,
    attemptedAt: serverTimestamp(),
  };

  await setDoc(newAttemptRef, newAttempt);
  return newAttemptRef.id;
};

/**
 * Fetches the latest attempt for a quiz by a user.
 */
export const getLatestQuizAttempt = async (userId: string, quizId: string): Promise<QuizAttempt | null> => {
  const attemptsRef = collection(db, "quizAttempts");
  const q = query(
    attemptsRef, 
    where("userId", "==", userId), 
    where("quizId", "==", quizId), 
    orderBy("attemptedAt", "desc"), 
    limit(1)
  );
  const querySnapshot = await getDocs(q);
  
  if (!querySnapshot.empty) {
    return { id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() } as QuizAttempt;
  }
  return null;
};

/**
 * CMS: Creates or updates a quiz for a lesson.
 */
export const adminSaveQuiz = async (quizData: Omit<Quiz, "id" | "createdAt">): Promise<void> => {
  const quizRef = doc(db, "quizzes", quizData.lessonId); // Using lessonId as ID for 1:1 mapping
  await setDoc(quizRef, {
    ...quizData,
    createdAt: serverTimestamp(),
  }, { merge: true });
};

// ─── Reviews & Ratings ──────────────────────────────────────────────────────

/**
 * Fetches all reviews for a specific course.
 */
export const getReviewsByCourseId = async (courseId: string): Promise<Review[]> => {
  const reviewsRef = collection(db, "reviews");
  const q = query(reviewsRef, where("courseId", "==", courseId), orderBy("createdAt", "desc"));
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as Review));
};

/**
 * Adds a new review and updates the course's average rating.
 * Only one review per user per course.
 */
export const addReview = async (reviewData: Omit<Review, "id" | "createdAt">) => {
  const reviewId = `${reviewData.userId}_${reviewData.courseId}`;
  const reviewRef = doc(db, "reviews", reviewId);
  const courseRef = doc(db, "courses", reviewData.courseId);

  await runTransaction(db, async (transaction) => {
    const reviewSnap = await transaction.get(reviewRef);
    const courseSnap = await transaction.get(courseRef);

    if (!courseSnap.exists()) throw new Error("Course not found");

    const courseData = courseSnap.data() as Course;
    const oldRating = reviewSnap.exists() ? (reviewSnap.data() as Review).rating : 0;
    const isNewReview = !reviewSnap.exists();

    // Calculate new aggregation
    let totalReviews = courseData.totalReviews || 0;
    let totalRatingSum = (courseData.averageRating || 0) * totalReviews;

    if (isNewReview) {
      totalReviews += 1;
      totalRatingSum += reviewData.rating;
    } else {
      totalRatingSum = totalRatingSum - oldRating + reviewData.rating;
    }

    const averageRating = Number((totalRatingSum / totalReviews).toFixed(1));

    // Update Course aggregation
    transaction.update(courseRef, {
      averageRating,
      totalReviews,
      updatedAt: serverTimestamp()
    });

    // Save Review
    transaction.set(reviewRef, {
      ...reviewData,
      createdAt: serverTimestamp()
    }, { merge: true });
  });
};

/**
 * Adds a creator reply to a review.
 */
export const addReviewReply = async (reviewId: string, replyText: string) => {
  const reviewRef = doc(db, "reviews", reviewId);
  await updateDoc(reviewRef, {
    creatorReply: {
      text: replyText,
      repliedAt: serverTimestamp()
    }
  });
};
