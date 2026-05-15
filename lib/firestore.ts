/**
 * Client-Side Firestore Helpers
 * ==============================
 * These functions run in the browser using the Firebase Client SDK.
 * They are subject to Firestore Security Rules.
 */

import { 
  User, 
  Course, 
  Lesson, 
  Enrollment, 
  LessonProgress, 
  CreatorApplication, 
  Certificate, 
  Resource, 
  Quiz, 
  Question, 
  QuizAttempt, 
  Review, 
  CreatorStats, 
  PayoutRequest, 
  VideoProgress, 
  VideoReaction, 
  Teacher,
  Comment,
  CommentReply,
  CommentLike,
  LessonAnalytics
} from "@/types/firestore";
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
  increment,
  Timestamp,
  onSnapshot,
  startAfter,
  deleteDoc,
  writeBatch
} from "firebase/firestore";
import { db } from "./firebase";
import { FieldValue } from "firebase/firestore";

/**
 * Safely removes undefined values from an object before sending to Firestore.
 * Preserves Firestore FieldValue and other complex objects.
 */
export const sanitizeData = (data: any): any => {
  if (data === null || typeof data !== 'object') return data;
  
  // If it's a Firestore-specific object, return as-is
  // We check for the presence of common Firestore object methods/properties
  if (data instanceof FieldValue || (data.seconds !== undefined && data.nanoseconds !== undefined)) {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map(item => sanitizeData(item));
  }

  const sanitized: any = {};
  for (const key in data) {
    if (data[key] !== undefined) {
      sanitized[key] = sanitizeData(data[key]);
    }
  }
  return sanitized;
};

// ─── Live Subscriptions ──────────────────────────────────────────────────────

export const subscribeToCreatorStats = (creatorId: string, callback: (stats: CreatorStats | null) => void) => {
  const statsRef = doc(db, "creatorStats", creatorId);
  return onSnapshot(statsRef, (doc) => callback(doc.exists() ? (doc.data() as CreatorStats) : null));
};

export const subscribeToRecentUsers = (limitCount: number = 20, callback: (users: User[]) => void) => {
  const q = query(collection(db, "users"), orderBy("createdAt", "desc"), limit(limitCount));
  return onSnapshot(q, (snap) => callback(snap.docs.map(doc => ({ uid: doc.id, ...doc.data() } as User))));
};

/**
 * Real-time subscription for creator's recent activity (enrollments/payments).
 * Simplified query to avoid composite index requirements.
 */
export const subscribeToCreatorRecentEnrollments = (creatorId: string, callback: (data: any[]) => void) => {
  // Use only creatorId filter to avoid index issues
  const q = query(
    collection(db, "payments"), 
    where("creatorId", "==", creatorId), 
    limit(50) 
  );

  return onSnapshot(q, (snap) => {
    const data = snap.docs
      .map(docSnap => ({ id: docSnap.id, ...docSnap.data() } as any))
      .filter(p => p.status === "captured") // Filter in memory
      .sort((a, b) => { // Sort in memory
        const dateA = a.createdAt?.seconds || 0;
        const dateB = b.createdAt?.seconds || 0;
        return dateB - dateA;
      })
      .slice(0, 10) // Limit in memory
      .map(payment => ({
        id: payment.id,
        studentName: payment.metadata?.userEmail?.split("@")[0] || "Student",
        courseTitle: payment.metadata?.courseTitle || "Course",
        price: payment.amount,
        createdAt: payment.createdAt
      }));
    callback(data);
  });
};

/**
 * Fetches aggregated analytics for the creator dashboard.
 * Simplified query to avoid composite index requirements.
 */
export const getCreatorAnalytics = async (creatorId: string) => {
  try {
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
    const fourteenDaysAgoSeconds = Math.floor(fourteenDaysAgo.getTime() / 1000);
    
    // Only filter by creatorId
    const q = query(
      collection(db, "payments"),
      where("creatorId", "==", creatorId),
      limit(500)
    );

    const snap = await getDocs(q);
    const revenueMap: Record<string, number> = {};
    const enrollmentMap: Record<string, number> = {};

    // Initialize map with last 14 days
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      revenueMap[label] = 0;
      enrollmentMap[label] = 0;
    }

    snap.docs.forEach(docSnap => {
      const data = docSnap.data();
      if (data.status !== "captured") return;
      
      const createdAt = data.createdAt as Timestamp;
      if (createdAt.seconds < fourteenDaysAgoSeconds) return;

      const date = createdAt.toDate();
      const label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      
      if (revenueMap[label] !== undefined) {
        revenueMap[label] += (data.creatorRevenue || 0) / 100;
        enrollmentMap[label] += 1;
      }
    });

    return {
      revenueData: Object.entries(revenueMap).map(([label, value]) => ({ label, value })),
      enrollmentData: Object.entries(enrollmentMap).map(([label, value]) => ({ label, value })),
    };
  } catch (error) {
    console.error("[FIRESTORE] Failed to fetch creator analytics:", error);
    return { revenueData: [], enrollmentData: [] };
  }
};

// ─── User Operations ────────────────────────────────────────────────────────

export const createUserIfNotExists = async (userData: Partial<User>) => {
  if (!userData.uid) return;
  const userRef = doc(db, "users", userData.uid);
  const userSnap = await getDoc(userRef);
  if (!userSnap.exists()) {
    await setDoc(userRef, {
      uid: userData.uid,
      email: userData.email || "",
      name: userData.name || null,
      photoURL: userData.photoURL || null,
      role: "student",
      verified: true,
      createdAt: serverTimestamp(),
      lastLogin: serverTimestamp(),
    });
  } else {
    await updateDoc(userRef, { lastLogin: serverTimestamp() });
  }
};

export const getUserProfile = async (uid: string): Promise<User | null> => {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? (snap.data() as User) : null;
};

/**
 * Updates a user's profile data.
 */
export const updateUserProfile = async (uid: string, data: Partial<User>) => {
  const userRef = doc(db, "users", uid);
  await updateDoc(userRef, data);
};

// ─── Course & Lesson Queries ────────────────────────────────────────────────

export const getCourseById = async (courseId: string): Promise<Course | null> => {
  const snap = await getDoc(doc(db, "courses", courseId));
  return snap.exists() ? { id: snap.id, ...snap.data() } as Course : null;
};

export const getCourses = async (): Promise<Course[]> => {
  const q = query(collection(db, "courses"), where("published", "==", true));
  const snap = await getDocs(q);
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Course));
};

export const getAllCoursesAdmin = async (): Promise<Course[]> => {
  const q = query(collection(db, "courses"), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Course));
};

export const getCoursesByCreator = async (creatorId: string): Promise<Course[]> => {
  const q = query(collection(db, "courses"), where("creatorId", "==", creatorId), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Course));
};

export const toggleCoursePublish = async (courseId: string, currentStatus: boolean) => {
  const courseRef = doc(db, "courses", courseId);
  await updateDoc(courseRef, { 
    published: !currentStatus,
    updatedAt: serverTimestamp()
  });
};

export const getLessonsByCourseId = async (courseId: string): Promise<Lesson[]> => {
  const q = query(collection(db, "lessons"), where("courseId", "==", courseId), orderBy("order", "asc"));
  const snap = await getDocs(q);
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Lesson));
};

export const subscribeToLessons = (courseId: string, callback: (lessons: Lesson[]) => void, onError?: (error: any) => void) => {
  const q = query(collection(db, "lessons"), where("courseId", "==", courseId), orderBy("order", "asc"));
  return onSnapshot(q, 
    (snap) => {
      const fetchedLessons = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Lesson));
      console.log(`[FIRESTORE] Subscribed to lessons for ${courseId}. Found: ${fetchedLessons.length}`);
      callback(fetchedLessons);
    },
    (error) => {
      console.error(`[FIRESTORE] Subscription error for lessons (${courseId}):`, error);
      if (onError) onError(error);
    }
  );
};

// ─── Progress Tracking ──────────────────────────────────────────────────────

export const markLessonComplete = async (userId: string, courseId: string, lessonId: string) => {
  const progressId = `${userId}_${lessonId}`;
  const enrollmentId = `${userId}_${courseId}`;
  
  await runTransaction(db, async (transaction) => {
    const progressRef = doc(db, "lessonProgress", progressId);
    const enrollmentRef = doc(db, "enrollments", enrollmentId);
    
    const progressSnap = await transaction.get(progressRef);
    if (progressSnap.exists()) return;

    const enrollmentSnap = await transaction.get(enrollmentRef);
    if (!enrollmentSnap.exists()) return;

    const enrollmentData = enrollmentSnap.data() as Enrollment;
    const newCompleted = (enrollmentData.completedLessons || 0) + 1;
    const total = enrollmentData.totalLessons || 1;
    const progress = Math.min(Math.round((newCompleted / total) * 100), 100);

    transaction.set(progressRef, {
      id: progressId, userId, courseId, lessonId,
      completed: true, watchedAt: serverTimestamp()
    });

    transaction.update(enrollmentRef, {
      completedLessons: newCompleted,
      progress,
      status: progress === 100 ? "completed" : "active",
      lastActivityAt: serverTimestamp()
    });
  });
};

export const getUserProgress = async (userId: string, courseId: string): Promise<string[]> => {
  const q = query(collection(db, "lessonProgress"), where("userId", "==", userId), where("courseId", "==", courseId), where("completed", "==", true));
  const snap = await getDocs(q);
  return snap.docs.map(doc => doc.data().lessonId);
};

export const saveVideoProgress = async (progress: Omit<VideoProgress, "updatedAt">) => {
  await setDoc(doc(db, "video_progress", progress.id), {
    ...progress,
    updatedAt: serverTimestamp()
  }, { merge: true });
  if (progress.completed) {
    await markLessonComplete(progress.userId, progress.courseId, progress.lessonId);
  }
};

export const getVideoProgress = async (userId: string, lessonId: string): Promise<VideoProgress | null> => {
  const snap = await getDoc(doc(db, "video_progress", `${userId}_${lessonId}`));
  return snap.exists() ? (snap.data() as VideoProgress) : null;
};

// ─── Enrollment Verification ──────────────────────────────────────────────

export const isUserEnrolled = async (userId: string, courseId: string): Promise<boolean> => {
  const enrollmentRef = doc(db, "enrollments", `${userId}_${courseId}`);
  const snap = await getDoc(enrollmentRef);
  return snap.exists();
};

// ─── Reviews System ─────────────────────────────────────────────────────────

export const getReviewsByCourseId = async (courseId: string): Promise<Review[]> => {
  const q = query(collection(db, "reviews"), where("courseId", "==", courseId));
  const snap = await getDocs(q);
  const reviews = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Review));
  
  // Sort in memory to avoid index requirements
  return reviews.sort((a, b) => {
    const dateA = (a.createdAt as any)?.seconds || 0;
    const dateB = (b.createdAt as any)?.seconds || 0;
    return dateB - dateA;
  });
};

export const addReview = async (review: Omit<Review, "id" | "createdAt">) => {
  const reviewRef = doc(collection(db, "reviews"));
  const courseRef = doc(db, "courses", review.courseId);

  await runTransaction(db, async (transaction) => {
    transaction.set(reviewRef, {
      ...review,
      id: reviewRef.id,
      createdAt: serverTimestamp(),
    });

    // Update course stats
    const courseSnap = await transaction.get(courseRef);
    if (courseSnap.exists()) {
      const data = courseSnap.data() as Course;
      const oldTotal = data.totalReviews || 0;
      const oldAvg = data.averageRating || 0;
      const newTotal = oldTotal + 1;
      const newAvg = ((oldAvg * oldTotal) + review.rating) / newTotal;
      
      transaction.update(courseRef, {
        totalReviews: newTotal,
        averageRating: Number(newAvg.toFixed(1))
      });
    }
  });
};

// ─── Reactions ──────────────────────────────────────────────────────────────

export const toggleVideoReaction = async (userId: string, lessonId: string, type: "like" | "dislike" | null) => {
  const ref = doc(db, "video_reactions", `${userId}_${lessonId}`);
  if (type === null) await deleteDoc(ref);
  else await setDoc(ref, { id: ref.id, userId, lessonId, type, createdAt: serverTimestamp() });
};

export const subscribeToVideoReactions = (lessonId: string, userId: string | undefined, callback: (data: any) => void) => {
  const q = query(collection(db, "video_reactions"), where("lessonId", "==", lessonId));
  return onSnapshot(q, (snap) => {
    let likes = 0, dislikes = 0, userReaction = null;
    snap.docs.forEach(doc => {
      const data = doc.data() as VideoReaction;
      if (data.type === "like") likes++;
      if (data.type === "dislike") dislikes++;
      if (userId && data.userId === userId) userReaction = data.type;
    });
    callback({ likes, dislikes, userReaction });
  });
};

// ─── Comments System ────────────────────────────────────────────────────────

export const addComment = async (comment: Omit<Comment, "id" | "likes" | "replyCount" | "isEdited" | "createdAt" | "updatedAt">) => {
  const ref = doc(collection(db, "comments"));
  await setDoc(ref, {
    ...comment,
    id: ref.id,
    likes: 0,
    replyCount: 0,
    isEdited: false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
  return ref.id;
};

export const updateComment = async (commentId: string, content: string) => {
  await updateDoc(doc(db, "comments", commentId), {
    content,
    isEdited: true,
    updatedAt: serverTimestamp()
  });
};

export const deleteComment = async (commentId: string) => {
  // In a real app, you might want to delete replies too or mark as [deleted]
  await deleteDoc(doc(db, "comments", commentId));
};

export const subscribeToComments = (lessonId: string, pageSize: number, lastDoc: any, callback: (comments: Comment[], lastVisible: any) => void) => {
  let q = query(
    collection(db, "comments"),
    where("lessonId", "==", lessonId),
    orderBy("createdAt", "desc"),
    limit(pageSize)
  );

  if (lastDoc) q = query(q, startAfter(lastDoc));

  return onSnapshot(q, (snap) => {
    const comments = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Comment));
    callback(comments, snap.docs[snap.docs.length - 1]);
  });
};

export const addReply = async (reply: Omit<CommentReply, "id" | "likes" | "isEdited" | "createdAt" | "updatedAt">) => {
  const replyRef = doc(collection(db, "comment_replies"));
  const commentRef = doc(db, "comments", reply.commentId);

  await runTransaction(db, async (transaction) => {
    transaction.set(replyRef, {
      ...reply,
      id: replyRef.id,
      likes: 0,
      isEdited: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    transaction.update(commentRef, { replyCount: increment(1) });
  });
  return replyRef.id;
};

export const subscribeToReplies = (commentId: string, callback: (replies: CommentReply[]) => void) => {
  const q = query(collection(db, "comment_replies"), where("commentId", "==", commentId), orderBy("createdAt", "asc"));
  return onSnapshot(q, (snap) => callback(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as CommentReply))));
};

export const toggleCommentLike = async (userId: string, commentId: string, type: "comment" | "reply") => {
  const likeId = `${userId}_${commentId}`;
  const likeRef = doc(db, "comment_likes", likeId);
  const targetRef = doc(db, type === "comment" ? "comments" : "comment_replies", commentId);

  await runTransaction(db, async (transaction) => {
    const likeSnap = await transaction.get(likeRef);
    if (likeSnap.exists()) {
      transaction.delete(likeRef);
      transaction.update(targetRef, { likes: increment(-1) });
    } else {
      transaction.set(likeRef, { id: likeId, userId, commentId, type, createdAt: serverTimestamp() });
      transaction.update(targetRef, { likes: increment(1) });
    }
  });
};

export const subscribeToCommentLikes = (userId: string | undefined, callback: (likedIds: string[]) => void) => {
  if (!userId) { callback([]); return () => {}; }
  const q = query(collection(db, "comment_likes"), where("userId", "==", userId));
  return onSnapshot(q, (snap) => callback(snap.docs.map(doc => (doc.data() as CommentLike).commentId)));
};

// ─── Analytics & Teacher ────────────────────────────────────────────────────

export const trackLessonAnalytics = async (analytics: Omit<LessonAnalytics, "lastTracked">) => {
  const ref = doc(db, "lesson_analytics", analytics.id);
  await setDoc(ref, {
    ...analytics,
    lastTracked: serverTimestamp()
  }, { merge: true });
};

/**
 * Aggregates statistics for the student dashboard.
 * Fetches all enrollments and calculates progress across courses.
 */
export const getUserDashboardStats = async (userId: string) => {
  try {
    const enrollmentsQuery = query(collection(db, "enrollments"), where("userId", "==", userId));
    const enrollmentsSnap = await getDocs(enrollmentsQuery);
    
    const enrolledCourses = await Promise.all(enrollmentsSnap.docs.map(async (docSnap) => {
      const enrollment = docSnap.data() as Enrollment;
      const courseSnap = await getDoc(doc(db, "courses", enrollment.courseId));
      const course = courseSnap.data() as Course;
      
      return {
        courseId: enrollment.courseId,
        courseTitle: course?.title || "Untitled Course",
        thumbnail: course?.thumbnail || "",
        status: enrollment.status,
        progress: enrollment.progress || 0,
        percentage: enrollment.progress || 0,
        completedCount: enrollment.completedLessons || 0,
        totalLessons: enrollment.totalLessons || course?.lessonCount || 1,
      };
    }));

    const totalCompletedLessonsQuery = query(
      collection(db, "lessonProgress"), 
      where("userId", "==", userId), 
      where("completed", "==", true)
    );
    const totalCompletedLessonsSnap = await getDocs(totalCompletedLessonsQuery);

    return {
      enrolledCourses,
      totalCompletedLessons: totalCompletedLessonsSnap.size,
    };
  } catch (error) {
    console.error("[FIRESTORE] Failed to fetch dashboard stats:", error);
    throw error;
  }
};

export const getTeacherById = async (id: string): Promise<Teacher | null> => {
  const snap = await getDoc(doc(db, "teachers", id));
  return snap.exists() ? (snap.data() as Teacher) : null;
};

export const getResourcesByLessonId = async (lessonId: string, courseId?: string): Promise<Resource[]> => {
  const q = courseId 
    ? query(collection(db, "resources"), where("courseId", "==", courseId), where("lessonId", "==", lessonId))
    : query(collection(db, "resources"), where("lessonId", "==", lessonId));
  const snap = await getDocs(q);
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Resource))
    .sort((a, b) => ((b.createdAt as any)?.seconds || 0) - ((a.createdAt as any)?.seconds || 0));
};

// ─── Lesson Management (CMS) ────────────────────────────────────────────────

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
    video: lessonData.video || undefined,
    duration: lessonData.duration || "0:00",
    order: Number(lessonData.order) || 0,
    published: lessonData.published || false,
    isPreviewFree: lessonData.isPreviewFree || false,
    createdAt: serverTimestamp(),
  };

  await setDoc(newLessonRef, sanitizeData(newLesson));
  return newLessonRef.id;
};

export const adminUpdateLesson = async (lessonId: string, lessonData: Partial<Lesson>) => {
  const lessonRef = doc(db, "lessons", lessonId);
  
  await updateDoc(lessonRef, sanitizeData({
    ...lessonData,
    updatedAt: serverTimestamp(),
  }));
};

/**
 * CMS: Deletes a lesson.
 */
export const adminDeleteLesson = async (lessonId: string) => {
  const lessonRef = doc(db, "lessons", lessonId);
  await deleteDoc(lessonRef);
};

/**
 * CMS: Updates the order of multiple lessons.
 */
export const adminUpdateLessonOrder = async (lessons: { id: string; order: number }[]) => {
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
    order: lesson.order + 0.1, 
  };
  
  await setDoc(newLessonRef, newLesson);
  return newLessonRef.id;
};

// ─── Lesson Resources (CMS) ─────────────────────────────────────────────────

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
  await deleteDoc(resourceRef);
};

/**
 * Updates lesson notes.
 */
export const adminUpdateLessonNotes = async (lessonId: string, notes: string): Promise<void> => {
  const lessonRef = doc(db, "lessons", lessonId);
  await updateDoc(lessonRef, { notes });
};

// ─── Quiz & Assessment (CMS) ────────────────────────────────────────────────

/**
 * Fetches the quiz for a specific lesson.
 */
export const getQuizByLessonId = async (lessonId: string, courseId?: string): Promise<Quiz | null> => {
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
  const quizRef = doc(db, "quizzes", quizData.lessonId); 
  await setDoc(quizRef, sanitizeData({
    ...quizData,
    createdAt: serverTimestamp(),
  }), { merge: true });
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

// ─── Payouts & Admin Stats ──────────────────────────────────────────────────

/**
 * CMS: Fetches global stats for the admin dashboard.
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

/**
 * CMS: Creates a new course.
 */
export const adminCreateCourse = async (courseData: Partial<Course>, creator?: any): Promise<string> => {
  console.log("[FIRESTORE] Creating course with data:", courseData, "Creator profile:", creator);
  const coursesRef = collection(db, "courses");
  const newCourseRef = doc(coursesRef);
  
  const newCourse: Omit<Course, "id"> = {
    title: courseData.title || "Untitled Course",
    description: courseData.description || "",
    thumbnail: courseData.thumbnail || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3",
    price: Number(courseData.price) || 0,
    instructorId: creator?.uid || creator?.id || courseData.instructorId || courseData.creatorId || "admin",
    creatorId: creator?.uid || creator?.id || courseData.creatorId || "admin",
    creatorName: creator?.name || courseData.creatorName || "Elite Instructor",
    creatorPhoto: creator?.photoURL || creator?.photoUrl || courseData.creatorPhoto || null,
    creatorEmail: creator?.email || courseData.creatorEmail || null,
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
  await updateDoc(courseRef, {
    ...courseData,
    price: Number(courseData.price) || 0,
    updatedAt: serverTimestamp(),
  });
};

/**
 * CMS: Reassigns a course to a different creator.
 * Useful for fixing "orphaned" courses or transferring ownership.
 */
export const adminAssignCourseToCreator = async (courseId: string, creator: User) => {
  const courseRef = doc(db, "courses", courseId);
  await updateDoc(courseRef, {
    creatorId: creator.uid,
    creatorName: creator.name || "Elite Instructor",
    creatorPhoto: creator.photoURL || null,
    creatorEmail: creator.email || null,
    instructorId: creator.uid,
    updatedAt: serverTimestamp(),
  });
};

/**
 * Fetches payout history for a creator.
 */
export const getPayoutHistory = async (creatorId: string): Promise<PayoutRequest[]> => {
  const q = query(
    collection(db, "payoutRequests"), 
    where("creatorId", "==", creatorId), 
    orderBy("requestedAt", "desc")
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PayoutRequest));
};

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

/**
 * Fetches aggregated stats for a creator.
 */
export const getCreatorStats = async (creatorId: string): Promise<CreatorStats | null> => {
  const statsRef = doc(db, "creatorStats", creatorId);
  const statsSnap = await getDoc(statsRef);
  
  if (statsSnap.exists()) {
    return statsSnap.data() as CreatorStats;
  }
  
  return null;
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
