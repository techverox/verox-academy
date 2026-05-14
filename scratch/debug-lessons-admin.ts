
import * as admin from "firebase-admin";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: ".env.local" });

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  });
}

const db = admin.firestore();

async function checkLessons() {
  const courseId = "UduUjoTzH5aD6qX3eEtn";
  console.log(`Checking lessons for course: ${courseId}`);
  
  try {
    const lessonsSnap = await db.collection("lessons").where("courseId", "==", courseId).get();
    console.log(`Found ${lessonsSnap.size} lessons`);
    lessonsSnap.docs.forEach(doc => {
      console.log(`Lesson ID: ${doc.id}, Title: ${doc.data().title}, Order: ${doc.data().order}`);
    });
    
    if (lessonsSnap.empty) {
      console.log("No lessons found for this course. Checking all lessons...");
      const allSnap = await db.collection("lessons").limit(10).get();
      console.log(`Total lessons in DB (limited to 10): ${allSnap.size}`);
      allSnap.docs.forEach(doc => {
        console.log(`Lesson ID: ${doc.id}, CourseID: ${doc.data().courseId}, Title: ${doc.data().title}`);
      });
    }

    // Check enrollment for a user if provided
    const userId = "some_user_id"; // I'll check a few common paths
    const enrollmentId = `some_user_id_${courseId}`;
    const enrollmentSnap = await db.collection("enrollments").doc(enrollmentId).get();
    console.log(`Enrollment ${enrollmentId} exists: ${enrollmentSnap.exists}`);

  } catch (err) {
    console.error("Error checking lessons:", err);
  }
}

checkLessons();
