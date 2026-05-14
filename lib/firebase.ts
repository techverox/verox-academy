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
const app: FirebaseApp = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Singleton pattern for Auth
const auth: Auth = getAuth(app);

// Singleton pattern for Firestore with SSR and HMR safety
let db: Firestore;

const firestoreSettings = {
  experimentalForceLongPolling: true,
  cacheSizeBytes: CACHE_SIZE_UNLIMITED,
};

try {
  db = initializeFirestore(app, firestoreSettings);
} catch (e) {
  db = getFirestore(app);
}

if (typeof window !== "undefined") {
  console.log("✅ Firestore initialized with Long Polling");
}

export { app, auth, db };
