import { 
  collection, 
  getDocs, 
  getDoc, 
  doc, 
  setDoc, 
  serverTimestamp,
  query,
  where,
  orderBy
} from "firebase/firestore";
import { db } from "./firebase";
import { Course, User } from "@/types/database";

// --- COURSE HELPERS ---

export const getCourses = async (onlyPublished = true): Promise<Course[]> => {
  try {
    const coursesCol = collection(db, "courses");
    let q = query(coursesCol, orderBy("createdAt", "desc"));
    
    if (onlyPublished) {
      q = query(coursesCol, where("published", "==", true), orderBy("createdAt", "desc"));
    }
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Course));
  } catch (error) {
    console.error("Error fetching courses:", error);
    return [];
  }
};

export const getCourseById = async (id: string): Promise<Course | null> => {
  try {
    const courseRef = doc(db, "courses", id);
    const snapshot = await getDoc(courseRef);
    if (snapshot.exists()) {
      return { id: snapshot.id, ...snapshot.data() } as Course;
    }
    return null;
  } catch (error) {
    console.error("Error fetching course:", error);
    return null;
  }
};

// --- USER HELPERS ---

export const createUserIfNotExists = async (userData: {
  id: string;
  name: string;
  email: string;
  photoURL?: string;
}) => {
  try {
    const userRef = doc(db, "users", userData.id);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      const newUser: User = {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        photoURL: userData.photoURL || "",
        role: "student",
        verified: true, // Auto-verify Google users
        createdAt: serverTimestamp(),
      };
      await setDoc(userRef, newUser);
      return newUser;
    }
    return userSnap.data() as User;
  } catch (error) {
    console.error("Error managing user profile:", error);
    throw error;
  }
};
