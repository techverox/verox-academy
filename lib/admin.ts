import { 
  collection, 
  getDocs, 
  query, 
  orderBy, 
  limit, 
  doc, 
  getDoc,
  onSnapshot
} from "firebase/firestore";
import { db } from "./firebase";
import { Enrollment, Course, User } from "@/types/firestore";

/**
 * Live subscription for admin platform stats.
 */
export const subscribeToAdminStats = (callback: (stats: any) => void) => {
  const statsRef = doc(db, "platformStats", "global");
  return onSnapshot(statsRef, 
    (snap) => {
      if (snap.exists()) {
        callback(snap.data());
      } else {
        callback(null);
      }
    },
    (error) => {
      console.warn("[FIRESTORE] Admin Stats subscription error:", error);
    }
  );
};

/**
 * Live subscription for recent enrollments.
 */
export const subscribeToRecentEnrollments = (callback: (enrollments: any[]) => void) => {
  const enrollmentsRef = collection(db, "enrollments");
  const q = query(enrollmentsRef, orderBy("enrolledAt", "desc"), limit(5));

  return onSnapshot(q, 
    async (snapshot) => {
      const recentEnrollments = await Promise.all(
        snapshot.docs.map(async (enrDoc) => {
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
      callback(recentEnrollments);
    },
    (error) => {
      console.warn("[FIRESTORE] Admin Enrollments subscription error:", error);
      callback([]);
    }
  );
};
/**
 * Fetches and groups revenue data for the admin chart.
 */
export const getAdminRevenueAnalytics = async () => {
  const paymentsRef = collection(db, "payments");
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const q = query(
    paymentsRef,
    where("status", "==", "captured"),
    where("createdAt", ">=", Timestamp.fromDate(thirtyDaysAgo))
  );
  
  const snapshot = await getDocs(q);
  const dailyRevenue: Record<string, number> = {};
  
  snapshot.docs.forEach(doc => {
    const data = doc.data();
    const date = data.createdAt.toDate();
    const day = date.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit' });
    dailyRevenue[day] = (dailyRevenue[day] || 0) + (data.amount || 0) / 100;
  });

  return Object.entries(dailyRevenue)
    .map(([name, revenue]) => ({ name, revenue }))
    .sort((a, b) => a.name.localeCompare(b.name));
};

// Add Timestamp to imports
import { Timestamp, where } from "firebase/firestore";
