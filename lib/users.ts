import { 
  collection, 
  query, 
  where, 
  limit, 
  getDocs,
  doc,
  getDoc
} from "firebase/firestore";
import { db } from "./firebase";
import { User, Course, CreatorStats, Article } from "@/types/firestore";

/**
 * Fetches a user by their username handle.
 */
export const getUserByUsername = async (username: string): Promise<User | null> => {
  const usersRef = collection(db, "users");
  const q = query(usersRef, where("username", "==", username), limit(1));
  const querySnapshot = await getDocs(q);
  
  if (querySnapshot.empty) return null;
  return querySnapshot.docs[0].data() as User;
};

/**
 * Fetches a user by their UID.
 */
export const getUserById = async (uid: string): Promise<User | null> => {
  const userRef = doc(db, "users", uid);
  const userSnap = await getDoc(userRef);
  
  if (userSnap.exists()) {
    return userSnap.data() as User;
  }
  return null;
};
