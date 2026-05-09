import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";
import * as dotenv from "dotenv";

// Load environment variables from .env.local
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

const courses = [
  {
    title: "Mastering Next.js 14 (Hindi) - Zero to Professional",
    description: "Learn Next.js 14 App Router, Server Components, and full-stack deployment with real projects. Perfect for Indian developers.",
    thumbnail: "https://images.unsplash.com/photo-1618477388954-7852f32655ec?q=80&w=1000&auto=format&fit=crop",
    price: 499,
    category: "Coding",
    creatorId: "admin_verox",
    published: true,
  },
  {
    title: "AI Automation Blueprint: Build a 6-Figure Agency",
    description: "How to use ChatGPT, Midjourney, and Zapier to automate businesses and sell AI services to clients worldwide.",
    thumbnail: "https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=1000&auto=format&fit=crop",
    price: 999,
    category: "AI",
    creatorId: "admin_verox",
    published: true,
  },
  {
    title: "Freelancing Masterclass: Get Clients from Upwork & LinkedIn",
    description: "Stop bidding and start winning. Practical strategy for Indian freelancers to get high-paying international clients.",
    thumbnail: "https://images.unsplash.com/photo-1515378960530-7c0da6231fb1?q=80&w=1000&auto=format&fit=crop",
    price: 1499,
    category: "Business",
    creatorId: "admin_verox",
    published: true,
  },
  {
    title: "UI/UX Design for Founders: From Figma to Product",
    description: "Create premium designs that convert. Learn Figma, Typography, and Design Systems from scratch.",
    thumbnail: "https://images.unsplash.com/photo-1586717791821-3f44a563eb4c?q=80&w=1000&auto=format&fit=crop",
    price: 799,
    category: "Design",
    creatorId: "admin_verox",
    published: true,
  },
  {
    title: "Full Stack Web Development with MERN Stack",
    description: "Build production-ready apps with MongoDB, Express, React, and Node. Comprehensive guide with job placement tips.",
    thumbnail: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=1000&auto=format&fit=crop",
    price: 1999,
    category: "Coding",
    creatorId: "admin_verox",
    published: true,
  },
  {
    title: "Content Creation Mastery for YouTubers",
    description: "Learn how to script, film, and edit viral videos. How to grow your channel from 0 to 100k subscribers in India.",
    thumbnail: "https://images.unsplash.com/photo-1492724441997-5dc865305da7?q=80&w=1000&auto=format&fit=crop",
    price: 599,
    category: "Business",
    creatorId: "admin_verox",
    published: true,
  }
];

const seed = async () => {
  console.log("🚀 Starting Firestore Seeding...");
  const coursesCol = collection(db, "courses");

  for (const course of courses) {
    try {
      const docRef = await addDoc(coursesCol, {
        ...course,
        createdAt: serverTimestamp(),
      });
      console.log(`✅ Added: ${course.title} (ID: ${docRef.id})`);
    } catch (error) {
      console.error(`❌ Error adding ${course.title}:`, error);
    }
  }

  console.log("\n✨ Seeding Complete!");
  process.exit(0);
};

seed();
