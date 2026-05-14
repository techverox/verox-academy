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

// ─── Live Subscriptions ──────────────────────────────────────────────────────

export const subscribeToCreatorStats = (creatorId: string, callback: (stats: CreatorStats | null) => void) => {
  const statsRef = doc(db, "creatorStats", creatorId);
  return onSnapshot(statsRef, (doc) => callback(doc.exists() ? (doc.data() as CreatorStats) : null));
};

export const subscribeToRecentUsers = (limitCount: number = 20, callback: (users: User[]) => void) => {
  const q = query(collection(db, "users"), orderBy("createdAt", "desc"), limit(limitCount));
  return onSnapshot(q, (snap) => callback(snap.docs.map(doc => ({ uid: doc.id, ...doc.data() } as User))));
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
