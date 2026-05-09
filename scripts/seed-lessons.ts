import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs, serverTimestamp } from "firebase/firestore";
import * as dotenv from "dotenv";

// Load environment variables from .env.local
dotenv.config({ path: ".env.local" });

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const lessonTemplates = [
  {
    title: "Introduction",
    duration: "08:30",
    wistiaMediaId: "26ye7e5z83", // Demo Wistia ID
  },
  {
    title: "Basics & Fundamentals",
    duration: "15:45",
    wistiaMediaId: "26ye7e5z83",
  },
  {
    title: "Intermediate Concepts",
    duration: "25:10",
    wistiaMediaId: "26ye7e5z83",
  },
  {
    title: "Advanced Implementation",
    duration: "35:00",
    wistiaMediaId: "26ye7e5z83",
  },
  {
    title: "Final Capstone Project",
    duration: "45:30",
    wistiaMediaId: "26ye7e5z83",
  },
];

const seedLessons = async () => {
  console.log("🚀 Starting lessons seeding process...");
  
  try {
    const coursesRef = collection(db, "courses");
    const coursesSnap = await getDocs(coursesRef);
    
    if (coursesSnap.empty) {
      console.log("❌ No courses found. Please run course seed script first.");
      process.exit(1);
    }

    const lessonsRef = collection(db, "lessons");
    
    for (const courseDoc of coursesSnap.docs) {
      const courseId = courseDoc.id;
      const courseTitle = courseDoc.data().title;
      
      console.log(`\n📚 Seeding lessons for: ${courseTitle}`);
      
      for (let i = 0; i < lessonTemplates.length; i++) {
        const template = lessonTemplates[i];
        const newLesson = {
          courseId: courseId,
          title: `${template.title} - ${courseTitle}`,
          description: `This lesson covers the ${template.title.toLowerCase()} of ${courseTitle}. Master the concepts through hands-on practice.`,
          videoUrl: "", // Keep empty for backward compatibility if needed, but primary is wistia
          wistiaMediaId: template.wistiaMediaId,
          duration: template.duration,
          order: i + 1,
          createdAt: serverTimestamp(),
        };
        
        const docRef = await addDoc(lessonsRef, newLesson);
        console.log(`  ✅ Added lesson: ${newLesson.title} (ID: ${docRef.id})`);
      }
    }
    
    console.log("\n✨ Lessons seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding lessons:", error);
    process.exit(1);
  }
};

seedLessons();
