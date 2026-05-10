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
    const { courseId } = body;

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

    // ─── 5. Create Razorpay Order ──────────────────────────────────────────
    const razorpay = new Razorpay({
      key_id: serverEnv.RAZORPAY_KEY_ID,
      key_secret: serverEnv.RAZORPAY_KEY_SECRET,
    });

    // Convert price from rupees to paise (Razorpay expects paise)
    const amountInPaise = Math.round(course.price * 100);

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
      },
    });

    // ─── 6. Store Payment Record (status: created) ─────────────────────────
    // This creates a preliminary record that the webhook will later update.
    const db = getAdminDb();
    await db.collection("payments").doc(order.id).set({
      id: order.id,
      userId,
      courseId,
      orderId: order.id,
      paymentId: "", // Will be set by webhook
      amount: amountInPaise,
      currency: "INR",
      status: "created",
      // Revenue tracking
      platformFee,
      creatorRevenue,
      creatorId: course.creatorId || "admin",
      payoutStatus: course.creatorId === "admin" ? "n/a" : "pending",
      createdAt: FieldValue.serverTimestamp(),
      metadata: {
        courseTitle: course.title,
        userEmail: decodedToken.email || "",
      },
    });

    // ─── 7. Return Order Details to Client ─────────────────────────────────
    return NextResponse.json({
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      courseTitle: course.title,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[RAZORPAY] Order creation error:", message);
    return NextResponse.json(
      { error: "Failed to create payment order", details: message },
      { status: 500 }
    );
  }
}
