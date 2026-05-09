import { User, Course, Lesson, Enrollment, LessonProgress } from "@/types/firestore";
import { 
  doc, 
  getDoc, 
  setDoc, 
  collection, 
  getDocs, 
  query, 
  where, 
  orderBy,
  serverTimestamp 
} from "firebase/firestore";
import { db } from "./firebase";

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

/**
 * Enrolls a user in a course by creating an enrollment document.
 * In the future, this is where payment verification would happen.
 */
export const enrollUserInCourse = async (userId: string, courseId: string): Promise<void> => {
  const enrollmentId = `${userId}_${courseId}`;
  const enrollmentRef = doc(db, "enrollments", enrollmentId);
  
  const enrollmentSnap = await getDoc(enrollmentRef);
  
  // If already enrolled, just return
  if (enrollmentSnap.exists()) return;

  const newEnrollment: Enrollment = {
    id: enrollmentId,
    userId,
    courseId,
    status: "active",
    progress: 0,
    enrolledAt: serverTimestamp(),
  };

  await setDoc(enrollmentRef, newEnrollment);
};

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

/**
 * Checks if a user is enrolled in a specific course.
 */
export const isUserEnrolled = async (userId: string, courseId: string): Promise<boolean> => {
  const enrollmentId = `${userId}_${courseId}`;
  const enrollmentRef = doc(db, "enrollments", enrollmentId);
  const enrollmentSnap = await getDoc(enrollmentRef);
  return enrollmentSnap.exists();
};
