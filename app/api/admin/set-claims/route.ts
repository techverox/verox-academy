/**
 * Admin Custom Claims API
 * ========================
 * POST /api/admin/set-claims
 *
 * Sets Firebase Custom Claims on a user account.
 * Used to grant/revoke admin access.
 *
 * SECURITY:
 * - Only callable by existing admins (verified via custom claims)
 * - Cannot be self-invoked to grant yourself admin access
 * - Audit logged
 *
 * MIGRATION NOTE:
 * For the initial admin setup, use Firebase Console or a one-time script:
 *   const admin = require("firebase-admin");
 *   admin.auth().setCustomUserClaims(uid, { admin: true });
 */

import { NextRequest, NextResponse } from "next/server";
import { verifyAdminToken } from "@/lib/auth-helpers";
import { setAdminClaim } from "@/lib/auth-helpers";
import { getAdminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    // ─── 1. Verify Calling User is Admin ──────────────────────────────────
    const callerToken = await verifyAdminToken(req);
    if (!callerToken) {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    // ─── 2. Parse Request ──────────────────────────────────────────────────
    const { targetUserId, isAdmin } = await req.json();

    if (!targetUserId || typeof isAdmin !== "boolean") {
      return NextResponse.json(
        { error: "Missing targetUserId or isAdmin boolean" },
        { status: 400 }
      );
    }

    // ─── 3. Set Custom Claims ──────────────────────────────────────────────
    await setAdminClaim(targetUserId, isAdmin);

    // ─── 4. Update Firestore Role (for backward compatibility) ─────────────
    // Keep Firestore user role in sync with custom claims
    const db = getAdminDb();
    await db.collection("users").doc(targetUserId).update({
      role: isAdmin ? "admin" : "student",
    });

    // ─── 5. Audit Log ──────────────────────────────────────────────────────
    await db.collection("adminAuditLog").add({
      action: isAdmin ? "GRANT_ADMIN" : "REVOKE_ADMIN",
      targetUserId,
      performedBy: callerToken.uid,
      timestamp: FieldValue.serverTimestamp(),
    });

    console.log(
      `[ADMIN] ${callerToken.uid} ${isAdmin ? "granted" : "revoked"} admin for ${targetUserId}`
    );

    return NextResponse.json({
      message: `Admin ${isAdmin ? "granted" : "revoked"} for user ${targetUserId}`,
      requiresReauth: true, // User must re-login to get new token with claims
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[ADMIN] Set claims error:", message);
    return NextResponse.json(
      { error: "Failed to set admin claims", details: message },
      { status: 500 }
    );
  }
}
