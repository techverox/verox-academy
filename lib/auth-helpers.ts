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
 * Set admin custom claims on a Firebase user.
 * This should only be callable by existing admins.
 *
 * @param uid - The Firebase user ID to grant admin access
 * @param isAdmin - Whether to grant or revoke admin status
 */
export async function setAdminClaim(
  uid: string,
  isAdmin: boolean
): Promise<void> {
  const auth = getAdminAuth();
  await auth.setCustomUserClaims(uid, { admin: isAdmin });
  console.log(
    `[AUTH] Admin claim ${isAdmin ? "granted" : "revoked"} for user ${uid}`
  );
}
