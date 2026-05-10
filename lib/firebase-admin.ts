/**
 * Firebase Admin SDK — Server-Side Singleton
 * ============================================
 * This module initializes the Firebase Admin SDK for use in:
 * - API routes (payment webhooks, order creation)
 * - Server Components (data fetching)
 * - Admin operations (custom claims)
 *
 * SECURITY: This file must NEVER be imported from client components.
 * It uses server-only credentials and has full database access.
 *
 * Initialization Strategy:
 * - Uses Application Default Credentials when running on GCP/Firebase
 * - Falls back to env vars for local development
 * - Singleton pattern prevents multiple initializations in HMR
 */

import { initializeApp, getApps, cert, App } from "firebase-admin/app";
import { getFirestore, Firestore } from "firebase-admin/firestore";
import { getAuth, Auth } from "firebase-admin/auth";

let adminApp: App;
let adminDb: Firestore;
let adminAuth: Auth;

function initializeAdminApp(): App {
  const existingApps = getApps();
  if (existingApps.length > 0) {
    return existingApps[0];
  }

  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;

  // If service account credentials are available, use them
  if (clientEmail && privateKey) {
    return initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        // Private key comes with escaped newlines from env vars
        privateKey: privateKey.replace(/\\n/g, "\n"),
      }),
    });
  }

  // Fallback: use project ID only (works with Application Default Credentials
  // or when running on GCP infrastructure)
  return initializeApp({
    projectId,
  });
}

/**
 * Get the Firebase Admin Firestore instance.
 * Thread-safe singleton — safe to call from any server context.
 */
export function getAdminDb(): Firestore {
  if (!adminApp) {
    adminApp = initializeAdminApp();
  }
  if (!adminDb) {
    adminDb = getFirestore(adminApp);
  }
  return adminDb;
}

/**
 * Get the Firebase Admin Auth instance.
 * Used for custom claims, token verification, and user management.
 */
export function getAdminAuth(): Auth {
  if (!adminApp) {
    adminApp = initializeAdminApp();
  }
  if (!adminAuth) {
    adminAuth = getAuth(adminApp);
  }
  return adminAuth;
}
