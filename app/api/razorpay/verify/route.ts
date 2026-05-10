/**
 * Razorpay Payment Verification (Client-Side Callback)
 * ======================================================
 * POST /api/razorpay/verify
 *
 * This endpoint is called by the client AFTER Razorpay checkout closes.
 * It verifies the payment signature from the client callback.
 *
 * IMPORTANT: This is NOT the source of truth for enrollment.
 * The webhook handler (/api/razorpay/webhook) is the source of truth.
 *
 * This endpoint serves two purposes:
 * 1. Immediate feedback to the user (success/failure)
 * 2. Fallback enrollment creation if webhook hasn't fired yet
 *
 * SECURITY:
 * - Requires authenticated Firebase user
 * - Verifies Razorpay signature
 * - Checks payment record exists (created during order creation)
 * - Idempotent: won't create duplicate enrollments
 */

import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { verifyAuthToken } from "@/lib/auth-helpers";
import { serverEnv } from "@/lib/env";
import { getAdminDb } from "@/lib/firebase-admin";
import {
  createEnrollmentServer,
  isUserEnrolledServer,
} from "@/lib/firestore-server";
import {
  incrementPlatformStats,
  incrementCourseStats,
  incrementCreatorStats,
} from "@/lib/aggregation";
import { FieldValue } from "firebase-admin/firestore";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    // ─── 1. Authenticate User ──────────────────────────────────────────────
    const decodedToken = await verifyAuthToken(req);
    if (!decodedToken) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // ─── 2. Parse Request ──────────────────────────────────────────────────
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      courseId,
    } = await req.json();

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature ||
      !courseId
    ) {
      return NextResponse.json(
        { error: "Missing required verification fields" },
        { status: 400 }
      );
    }

    // ─── 3. Verify Signature ───────────────────────────────────────────────
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", serverEnv.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    const isAuthentic = crypto.timingSafeEqual(
      Buffer.from(expectedSignature),
      Buffer.from(razorpay_signature)
    );

    if (!isAuthentic) {
      return NextResponse.json(
        { error: "Invalid payment signature" },
        { status: 400 }
      );
    }

    // ─── 4. Verify Payment Record Exists ───────────────────────────────────
    // The order should have been created by our create-order endpoint
    const db = getAdminDb();
    const paymentRef = db.collection("payments").doc(razorpay_order_id);
    const paymentSnap = await paymentRef.get();

    if (!paymentSnap.exists) {
      return NextResponse.json(
        { error: "Payment record not found. Possible tampering." },
        { status: 400 }
      );
    }

    const paymentData = paymentSnap.data()!;

    // Verify the payment belongs to this user
    if (paymentData.userId !== decodedToken.uid) {
      return NextResponse.json(
        { error: "Payment does not belong to this user" },
        { status: 403 }
      );
    }

    // ─── 5. Update Payment Record ──────────────────────────────────────────
    await paymentRef.set(
      {
        paymentId: razorpay_payment_id,
        signature: razorpay_signature,
        status: "captured",
        verifiedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    // ─── 6. Create Enrollment (Idempotent) ─────────────────────────────────
    // This may already exist if the webhook fired first — that's fine
    const alreadyEnrolled = await isUserEnrolledServer(
      decodedToken.uid,
      courseId
    );

    if (!alreadyEnrolled) {
      const created = await createEnrollmentServer(
        decodedToken.uid,
        courseId,
        razorpay_payment_id
      );

      if (created) {
        // Update stats (only if we actually created the enrollment)
        await Promise.all([
          incrementPlatformStats({
            totalEnrollments: 1,
            totalRevenue: paymentData.amount,
            totalPayments: 1,
          }),
          incrementCourseStats(courseId, {
            totalEnrollments: 1,
            totalRevenue: paymentData.amount,
          }),
          incrementCreatorStats(paymentData.creatorId || "admin", {
            totalEnrollments: 1,
            totalRevenue: paymentData.creatorRevenue || 0,
            pendingRevenue: paymentData.creatorRevenue || 0,
            totalStudents: 1,
          }),
        ]);
      }
    }

    // ─── 7. Return Success ─────────────────────────────────────────────────
    return NextResponse.json({
      message: "Payment verified successfully",
      enrolled: true,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[VERIFY] Payment verification error:", message);
    return NextResponse.json(
      { error: "Internal Server Error", details: message },
      { status: 500 }
    );
  }
}
