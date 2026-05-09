import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { 
  initializeFirestore, 
  getFirestore, 
  Firestore, 
  CACHE_SIZE_UNLIMITED
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Singleton pattern for Firebase App
let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

// Singleton pattern for Auth
const auth: Auth = getAuth(app);

// Singleton pattern for Firestore with SSR and HMR safety
let db: Firestore;

// Shared settings for stability across environments
const firestoreSettings = {
  experimentalForceLongPolling: true, // Bypass gRPC issues in both browser and build environments
  cacheSizeBytes: CACHE_SIZE_UNLIMITED,
};

try {
  db = initializeFirestore(app, firestoreSettings);
  if (typeof window !== "undefined") {
    console.log("✅ Firestore initialized with Long Polling");
  }
} catch (e) {
  // If already initialized (common in Next.js dev), get the existing instance
  db = getFirestore(app);
}

export { app, auth, db };
