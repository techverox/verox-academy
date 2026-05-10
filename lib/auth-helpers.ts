/**
 * Authentication Helpers — Server-Side Token Verification
 * ========================================================
 * Utility functions for verifying Firebase Auth tokens in API routes
 * and server components. Uses Firebase Admin SDK.
 *
 * SECURITY: These functions run server-side only.
 * They verify the ID token's authenticity and check custom claims.
 */

import { getAdminAuth } from "./firebase-admin";
import { DecodedIdToken } from "firebase-admin/auth";
import { NextRequest } from "next/server";

/**
 * Extract the Bearer token from an Authorization header.
 */
function extractBearerToken(request: NextRequest): string | null {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }
  return authHeader.slice(7); // Remove "Bearer " prefix
}

/**
 * Verify a Firebase ID token and return the decoded claims.
 * Returns null if the token is invalid or expired.
 *
 * @param request - The incoming NextRequest
 * @returns DecodedIdToken or null
 */
export async function verifyAuthToken(
  request: NextRequest
): Promise<DecodedIdToken | null> {
  const token = extractBearerToken(request);
  if (!token) {
    return null;
  }

  try {
    const auth = getAdminAuth();
    const decodedToken = await auth.verifyIdToken(token);
    return decodedToken;
  } catch (error) {
    console.error("[AUTH] Token verification failed:", error);
    return null;
  }
}

/**
 * Verify a Firebase ID token AND check for admin custom claim.
 * Returns the decoded token only if `token.admin === true`.
 *
 * @param request - The incoming NextRequest
 * @returns DecodedIdToken or null
 */
export async function verifyAdminToken(
  request: NextRequest
): Promise<DecodedIdToken | null> {
  const decodedToken = await verifyAuthToken(request);

  if (!decodedToken) {
    return null;
  }

  // SECURITY: Check custom claim, not Firestore role
  if (decodedToken.admin !== true) {
    console.warn(
      `[AUTH] Non-admin user ${decodedToken.uid} attempted admin access`
    );
    return null;
  }

  return decodedToken;
}

/**
 * Verify a Firebase ID token AND check for creator custom claim.
 * Returns the decoded token only if `token.creator === true` or `token.admin === true`.
 *
 * @param request - The incoming NextRequest
 * @returns DecodedIdToken or null
 */
export async function verifyCreatorToken(
  request: NextRequest
): Promise<DecodedIdToken | null> {
  const decodedToken = await verifyAuthToken(request);

  if (!decodedToken) {
    return null;
  }

  // SECURITY: Check custom claim. Admins also have creator access.
  if (decodedToken.creator !== true && decodedToken.admin !== true) {
    console.warn(
      `[AUTH] Non-creator user ${decodedToken.uid} attempted creator access`
    );
    return null;
  }

  return decodedToken;
}

/**
 * Set creator custom claims on a Firebase user.
 * This should only be callable by admins.
 *
 * @param uid - The Firebase user ID to grant creator access
 * @param isCreator - Whether to grant or revoke creator status
 */
export async function setCreatorClaim(
  uid: string,
  isCreator: boolean
): Promise<void> {
  const auth = getAdminAuth();
  
  // We want to preserve admin claim if it exists
  const user = await auth.getUser(uid);
  const existingClaims = user.customClaims || {};
  
  await auth.setCustomUserClaims(uid, { 
    ...existingClaims,
    creator: isCreator 
  });
  
  console.log(
    `[AUTH] Creator claim ${isCreator ? "granted" : "revoked"} for user ${uid}`
  );
}

/**
 * Set admin custom claims on a Firebase user.
 */
export async function setAdminClaim(
  uid: string,
  isAdmin: boolean
): Promise<void> {
  const auth = getAdminAuth();
  
  // We want to preserve creator claim if it exists
  const user = await auth.getUser(uid);
  const existingClaims = user.customClaims || {};

  await auth.setCustomUserClaims(uid, { 
    ...existingClaims,
    admin: isAdmin 
  });
  
  console.log(
    `[AUTH] Admin claim ${isAdmin ? "granted" : "revoked"} for user ${uid}`
  );
}
