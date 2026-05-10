/**
 * Razorpay Create Order API
 * ==========================
 * POST /api/razorpay/create-order
 *
 * Creates a Razorpay order for course enrollment.
 *
 * SECURITY:
 * - Requires authenticated Firebase user (Bearer token)
 * - Validates course exists and is published
 * - Checks user is not already enrolled
 * - Stores order metadata for webhook verification
 * - Uses server-side price (not client-provided) to prevent price manipulation
 *
 * FLOW:
 * Client → This Route → Razorpay API → Returns order details → Client opens checkout
 */

import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import { verifyAuthToken } from "@/lib/auth-helpers";
import { serverEnv } from "@/lib/env";
import {
  getCourseByIdServer,
  isUserEnrolledServer,
} from "@/lib/firestore-server";
import { getAdminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import { validateCoupon } from "@/lib/coupons";
import { createEnrollmentServer } from "@/lib/firestore-server";
import { incrementPlatformStats, incrementCourseStats } from "@/lib/aggregation";

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

    const userId = decodedToken.uid;

    // ─── 2. Validate Request Body ──────────────────────────────────────────
    const body = await req.json();
    const { courseId, couponCode } = body;

    if (!courseId || typeof courseId !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid courseId" },
        { status: 400 }
      );
    }

    // ─── 3. Validate Course Exists & Get Server-Side Price ─────────────────
    // SECURITY: We use the server-side price, NOT the client-provided amount.
    // This prevents price manipulation attacks.
    const course = await getCourseByIdServer(courseId);

    if (!course) {
      return NextResponse.json(
        { error: "Course not found or not published" },
        { status: 404 }
      );
    }

    if (course.price <= 0) {
      return NextResponse.json(
        { error: "Course price is invalid" },
        { status: 400 }
      );
    }

    // ─── 4. Check Existing Enrollment ──────────────────────────────────────
    const alreadyEnrolled = await isUserEnrolledServer(userId, courseId);
    if (alreadyEnrolled) {
      return NextResponse.json(
        { error: "You are already enrolled in this course" },
        { status: 409 } // Conflict
      );
    }

    // ─── 5. Handle Coupons ────────────────────────────────────────────────
    let amountInPaise = Math.round(course.price * 100);
    let discountAmount = 0;
    let appliedCouponId = null;

    if (couponCode) {
      const validation = await validateCoupon(
        couponCode,
        courseId,
        amountInPaise,
        course.creatorId || "admin"
      );

      if (!validation.isValid) {
        return NextResponse.json({ error: validation.error }, { status: 400 });
      }

      discountAmount = validation.discountAmount;
      amountInPaise -= discountAmount;
      appliedCouponId = validation.coupon?.id || null;
    }

    // ─── 6. Handle 100% Discount (FREE) ────────────────────────────────────
    if (amountInPaise <= 0) {
      // Direct enrollment for free courses or 100% discount
      const created = await createEnrollmentServer(userId, courseId, "FREE_" + Date.now());
      if (created) {
        await Promise.all([
          incrementPlatformStats({ totalEnrollments: 1 }),
          incrementCourseStats(courseId, { totalEnrollments: 1 }),
        ]);

        if (appliedCouponId) {
          const db = getAdminDb();
          await db.collection("coupons").doc(appliedCouponId).update({
            usageCount: FieldValue.increment(1)
          });
        }
      }

      return NextResponse.json({
        id: "free_enrollment",
        amount: 0,
        currency: "INR",
        courseTitle: course.title,
        status: "completed"
      });
    }

    // ─── 7. Create Razorpay Order ──────────────────────────────────────────
    const razorpay = new Razorpay({
      key_id: serverEnv.RAZORPAY_KEY_ID,
      key_secret: serverEnv.RAZORPAY_KEY_SECRET,
    });

    // REVENUE BREAKDOWN (80/20 Split)
    const platformFee = Math.round(amountInPaise * 0.2);
    const creatorRevenue = amountInPaise - platformFee;

    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: `receipt_${courseId}_${userId}_${Date.now()}`,
      notes: {
        courseId,
        userId,
        courseTitle: course.title,
        userEmail: decodedToken.email || "",
        creatorId: course.creatorId || "admin",
        couponCode: appliedCouponId || "",
        discountAmount: discountAmount.toString(),
      },
    });

    // ─── 8. Store Payment Record (status: created) ─────────────────────────
    const db = getAdminDb();
    await db.collection("payments").doc(order.id).set({
      id: order.id,
      userId,
      courseId,
      orderId: order.id,
      paymentId: "",
      amount: amountInPaise,
      currency: "INR",
      status: "created",
      platformFee,
      creatorRevenue,
      creatorId: course.creatorId || "admin",
      payoutStatus: course.creatorId === "admin" ? "n/a" : "pending",
      couponCode: appliedCouponId,
      discountAmount,
      createdAt: FieldValue.serverTimestamp(),
      metadata: {
        courseTitle: course.title,
        userEmail: decodedToken.email || "",
      },
    });

    return NextResponse.json({
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      courseTitle: course.title,
    });
  } catch (error: any) {
    let message = "Unknown error";
    
    // Razorpay often throws objects that aren't instances of Error
    if (error instanceof Error) {
      message = error.message;
    } else if (error?.error?.description) {
      message = error.error.description;
    } else if (typeof error === 'object') {
      message = JSON.stringify(error);
    } else {
      message = String(error);
    }
    
    console.error("[RAZORPAY] Order creation error Payload:", error);
    console.error("[RAZORPAY] Order creation error:", message);
    
    return NextResponse.json(
      { error: "Failed to create payment order", details: message },
      { status: 500 }
    );
  }
}
