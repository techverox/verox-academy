import { 
  collection, 
  getDocs, 
  query, 
  orderBy, 
  limit, 
  doc, 
  getDoc 
} from "firebase/firestore";
import { db } from "./firebase";
import { Enrollment, Course, User } from "@/types/firestore";

/**
 * Fetches global metrics for the admin dashboard.
 */
export const getAdminStats = async () => {
  try {
    const [coursesSnap, enrollmentsSnap, lessonsSnap, usersSnap] = await Promise.all([
      getDocs(collection(db, "courses")),
      getDocs(collection(db, "enrollments")),
      getDocs(collection(db, "lessons")),
      getDocs(collection(db, "users")),
    ]);

    const stats = {
      totalCourses: coursesSnap.size,
      totalEnrollments: enrollmentsSnap.size,
      totalLessons: lessonsSnap.size,
      totalUsers: usersSnap.size,
    };

    console.log("Admin stats loaded:", stats);
    return stats;
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    throw error;
  }
};

/**
 * Fetches the latest 5 enrollments with user and course details.
 */
export const getRecentEnrollments = async () => {
  try {
    const enrollmentsRef = collection(db, "enrollments");
    const q = query(enrollmentsRef, orderBy("enrolledAt", "desc"), limit(5));
    const querySnapshot = await getDocs(q);

    const recentEnrollments = await Promise.all(
      querySnapshot.docs.map(async (enrDoc) => {
        const data = enrDoc.data() as Enrollment;
        
        // Fetch User Name
        const userRef = doc(db, "users", data.userId);
        const userSnap = await getDoc(userRef);
        const userData = userSnap.exists() ? (userSnap.data() as User) : null;

        // Fetch Course Title
        const courseRef = doc(db, "courses", data.courseId);
        const courseSnap = await getDoc(courseRef);
        const courseData = courseSnap.exists() ? (courseSnap.data() as Course) : null;

        return {
          id: enrDoc.id,
          userName: userData?.name || "Anonymous Student",
          courseTitle: courseData?.title || "Deleted Course",
          enrolledAt: data.enrolledAt,
        };
      })
    );

    return recentEnrollments;
  } catch (error) {
    console.error("Error fetching recent activity:", error);
    return [];
  }
};
