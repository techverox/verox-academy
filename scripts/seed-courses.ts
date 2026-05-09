import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";
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

const courses = [
  {
    title: "Mastering React 19: The Zero to Hero Guide",
    description: "Learn React 19 from scratch. We cover Hooks, Server Components, and real-world projects like an E-commerce store.",
    thumbnail: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=800",
    price: 499,
    creator_id: "admin_system",
    category: "Coding",
    published: true,
  },
  {
    title: "UI/UX Design Masterclass for Indian Startups",
    description: "Design premium apps that users love. Learn Figma, Typography, and Indian market design trends.",
    thumbnail: "https://images.unsplash.com/photo-1561070791-26c11d204a3d?q=80&w=800",
    price: 999,
    creator_id: "admin_system",
    category: "Design",
    published: true,
  },
  {
    title: "The AI Revolution: Prompt Engineering with GPT-4",
    description: "Future-proof your career. Master AI tools, automation, and prompt engineering for maximum productivity.",
    thumbnail: "https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=800",
    price: 1299,
    creator_id: "admin_system",
    category: "AI",
    published: true,
  },
  {
    title: "Business Communication & Freelancing Success",
    description: "How to land high-paying international clients as an Indian freelancer. Communication and negotiation skills.",
    thumbnail: "https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=800",
    price: 799,
    creator_id: "admin_system",
    category: "Business",
    published: true,
  },
  {
    title: "Full Stack Next.js & Firebase: Build a SaaS",
    description: "Deep dive into Next.js App Router, Firebase Auth, and Firestore. Build a production-ready application.",
    thumbnail: "https://images.unsplash.com/photo-1618477247222-acbdb0e159b3?q=80&w=800",
    price: 1499,
    creator_id: "admin_system",
    category: "Coding",
    published: true,
  },
  {
    title: "Graphic Design for Social Media Marketing",
    description: "Learn to create viral social media posts, thumbnails, and carousels using Photoshop and Canva.",
    thumbnail: "https://images.unsplash.com/photo-1626785774573-4b799315345d?q=80&w=800",
    price: 399,
    creator_id: "admin_system",
    category: "Design",
    published: true,
  }
];

const seedCourses = async () => {
  console.log("🚀 Starting seeding process...");
  
  try {
    const coursesRef = collection(db, "courses");
    
    for (const course of courses) {
      const newCourse = {
        ...course,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      
      const docRef = await addDoc(coursesRef, newCourse);
      console.log(`✅ Added course: ${course.title} (ID: ${docRef.id})`);
    }
    
    console.log("\n✨ Seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding courses:", error);
    process.exit(1);
  }
};

seedCourses();
