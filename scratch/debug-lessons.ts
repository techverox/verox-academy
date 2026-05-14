
import { initializeApp } from "firebase/app";
import { getFirestore, collection, query, where, getDocs } from "firebase/firestore";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkLessons() {
  const courseId = "UduUjoTzH5aD6qX3eEtn";
  console.log(`Checking lessons for course: ${courseId}`);
  
  try {
    const q = query(collection(db, "lessons"), where("courseId", "==", courseId));
    const snap = await getDocs(q);
    console.log(`Found ${snap.size} lessons`);
    snap.docs.forEach(doc => {
      console.log(`Lesson ID: ${doc.id}, Title: ${doc.data().title}, Order: ${doc.data().order}`);
    });
    
    if (snap.empty) {
      console.log("No lessons found. Checking all lessons...");
      const allSnap = await getDocs(collection(db, "lessons"));
      console.log(`Total lessons in DB: ${allSnap.size}`);
      allSnap.docs.forEach(doc => {
        console.log(`Lesson ID: ${doc.id}, CourseID: ${doc.data().courseId}`);
      });
    }
  } catch (err) {
    console.error("Error checking lessons:", err);
  }
}

checkLessons();
