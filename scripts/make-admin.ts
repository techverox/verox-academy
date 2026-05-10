import { initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";

// Load environment variables from .env.local
dotenv.config({ path: ".env.local" });

async function makeAdmin() {
  const uid = "Zo3IxDlk0LWTLhZN0KuhuXSD4B33"; // The user ID from the logs

  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

  if (!clientEmail || !privateKey || !projectId) {
    console.error("Missing Firebase Admin credentials in .env.local");
    return;
  }

  // Ensure the private key is properly formatted with newlines
  const formattedKey = privateKey.replace(/\\n/g, "\n");

  const app = initializeApp({
    credential: cert({
      projectId,
      clientEmail,
      privateKey: formattedKey,
    }),
  });

  const auth = getAuth(app);

  try {
    const user = await auth.getUser(uid);
    const currentClaims = user.customClaims || {};
    
    await auth.setCustomUserClaims(uid, {
      ...currentClaims,
      admin: true,
      creator: true
    });
    
    console.log(`✅ Successfully granted ADMIN and CREATOR claims to user ${uid}`);
    console.log("You may need to log out and log back in, or click 'Refresh Permissions' in the UI.");
  } catch (error) {
    console.error("Error setting custom claims:", error);
  }
}

makeAdmin();
