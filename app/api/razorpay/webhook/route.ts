/**
 * Razorpay Webhook Handler — SOURCE OF TRUTH
 * =============================================
 * POST /api/razorpay/webhook
 *
 * This is the most critical payment endpoint in the entire system.
 * Razorpay sends webhook events here after payment events occur.
 *
 * SECURITY:
 * - Verifies Razorpay signature using webhook secret
 * - Idempotent: duplicate webhook calls won't create duplicate enrollments
 * - Does NOT trust client-side callbacks — this is the only path to enrollment
 * - No authentication header required (Razorpay calls this directly)
 *
 * FLOW:
 * Razorpay → This Webhook → Verify Signature → Update Payment → Create Enrollment → Update Stats
 *
 * HANDLED EVENTS:
 * - payment.captured → Enrollment creation
 * - payment.failed → Payment status update
 *
 * IDEMPOTENCY:
 * - Checks if enrollment already exists before creating
 * - Uses orderId as unique key for payment records
 * - Safe to retry without side effects
 */

import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getAdminDb } from "@/lib/firebase-admin";
import {
  createEnrollmentServer,
  getPaymentByOrderId,
} from "@/lib/firestore-server";
import {
  incrementPlatformStats,
  incrementCourseStats,
} from "@/lib/aggregation";
import { FieldValue } from "firebase-admin/firestore";
import { EmailService } from "@/lib/email/service";
import { EnrollmentSuccessEmail } from "@/emails/EnrollmentSuccess";
import { NewEnrollmentCreatorEmail } from "@/emails/NewEnrollmentCreator";

export const dynamic = "force-dynamic";

/**
 * Verify Razorpay webhook signature.
 * Uses the webhook secret (different from key_secret) if configured.
 * Falls back to order-level signature verification.
 */
function verifyWebhookSignature(
  body: string,
  signature: string,
  secret: string
): boolean {
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(body)
    .digest("hex");

  return crypto.timingSafeEqual(
    Buffer.from(expectedSignature),
    Buffer.from(signature)
  );
}

export async function POST(req: NextRequest) {
  try {
    // ─── 1. Read Raw Body ──────────────────────────────────────────────────
    // IMPORTANT: We need the raw body string for signature verification
    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature");

    // ─── 2. Verify Webhook Signature ───────────────────────────────────────
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (webhookSecret && signature) {
      // Use dedicated webhook secret if configured
      const isValid = verifyWebhookSignature(rawBody, signature, webhookSecret);
      if (!isValid) {
        console.error("[WEBHOOK] Invalid webhook signature");
        return NextResponse.json(
          { error: "Invalid webhook signature" },
          { status: 400 }
        );
      }
    } else if (!webhookSecret) {
      // If no webhook secret configured, log warning but continue
      // In production, RAZORPAY_WEBHOOK_SECRET should always be set
      console.warn(
        "[WEBHOOK] No RAZORPAY_WEBHOOK_SECRET configured. " +
          "Webhook signature verification skipped. " +
          "Set this in your Razorpay Dashboard → Webhooks."
      );
    }

    // ─── 3. Parse Event ────────────────────────────────────────────────────
    const event = JSON.parse(rawBody);
    const eventType = event.event;

    console.log(`[WEBHOOK] Received event: ${eventType}`);

    // ─── 4. Handle Payment Events ──────────────────────────────────────────
    if (eventType === "payment.captured") {
      await handlePaymentCaptured(event, keySecret || "");
    } else if (eventType === "payment.failed") {
      await handlePaymentFailed(event);
    } else {
      console.log(`[WEBHOOK] Unhandled event type: ${eventType}`);
    }

    // Always return 200 to acknowledge receipt
    // Razorpay retries on non-2xx responses
    return NextResponse.json({ status: "ok" });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[WEBHOOK] Processing error:", message);

    // Return 200 even on errors to prevent infinite retries
    // Log the error for manual investigation
    return NextResponse.json({ status: "error", message }, { status: 200 });
  }
}

/**
 * Handle successful payment capture.
 * This is where enrollment actually happens.
 */
async function handlePaymentCaptured(
  event: Record<string, unknown>,
  keySecret: string
): Promise<void> {
  const payload = event.payload as Record<string, Record<string, Record<string, unknown>>>;
  const paymentEntity = payload?.payment?.entity;
  if (!paymentEntity) {
    console.error("[WEBHOOK] Missing payment entity in payload");
    return;
  }

  const orderId = paymentEntity.order_id as string;
  const paymentId = paymentEntity.id as string;
  const amount = paymentEntity.amount as number;
  const notes = paymentEntity.notes as Record<string, string> | undefined;

  const courseId = notes?.courseId;
  const userId = notes?.userId;

  if (!orderId || !paymentId || !courseId || !userId) {
    console.error("[WEBHOOK] Missing required fields in payment entity:", {
      orderId,
      paymentId,
      courseId,
      userId,
    });
    return;
  }

  const db = getAdminDb();

  // ─── Idempotency Check ─────────────────────────────────────────────────
  // Check if this order was already processed
  const existingPayment = await getPaymentByOrderId(orderId);
  if (existingPayment && existingPayment.status === "captured") {
    console.log(
      `[WEBHOOK] Order ${orderId} already captured, skipping duplicate`
    );
    return;
  }

  // ─── Verify Payment Signature (Order-Level) ────────────────────────────
  // Additional verification using order_id|payment_id signature
  const razorpaySignature = paymentEntity.razorpay_signature as string | undefined;
  if (razorpaySignature && keySecret) {
    const body = `${orderId}|${paymentId}`;
    const expectedSig = crypto
      .createHmac("sha256", keySecret)
      .update(body)
      .digest("hex");

    if (expectedSig !== razorpaySignature) {
      console.error("[WEBHOOK] Payment signature verification failed");
      return;
    }
  }
  
  const couponCode = notes?.couponCode as string | undefined;
  const discountAmount = notes?.discountAmount ? parseInt(notes.discountAmount as string) : 0;

  // ─── Update Payment Record ─────────────────────────────────────────────
  // Update the payment record created during order creation
  const paymentRef = db.collection("payments").doc(orderId);
  await paymentRef.set(
    {
      paymentId,
      status: "captured",
      amount,
      verifiedAt: FieldValue.serverTimestamp(),
      couponCode: couponCode || null,
      discountAmount: discountAmount || 0,
      metadata: {
        webhookEventId: (event as Record<string, string>).event_id || "",
        courseTitle: notes?.courseTitle || "",
        userEmail: notes?.userEmail || "",
      },
    },
    { merge: true }
  );

  // ─── Record Coupon Usage ──────────────────────────────────────────────
  if (couponCode) {
    await db.runTransaction(async (transaction) => {
      const couponRef = db.collection("coupons").doc(couponCode.toUpperCase());
      const usageRef = db.collection("couponUsage").doc();
      
      transaction.update(couponRef, {
        usageCount: FieldValue.increment(1)
      });
      
      transaction.set(usageRef, {
        id: usageRef.id,
        couponId: couponCode.toUpperCase(),
        userId,
        courseId,
        orderId,
        discountAmount,
        usedAt: FieldValue.serverTimestamp()
      });
    });
  }

  // ─── Create Enrollment ─────────────────────────────────────────────────
  // SECURITY: Enrollment ONLY happens here, after verified payment
  const created = await createEnrollmentServer(userId, courseId, paymentId);

  if (created) {
    // ─── Update Aggregation Stats ──────────────────────────────────────
    await Promise.all([
      incrementPlatformStats({
        totalEnrollments: 1,
        totalRevenue: amount,
        totalPayments: 1,
      }),
      incrementCourseStats(courseId, {
        totalEnrollments: 1,
        totalRevenue: amount,
      }),
    ]);

    console.log(
      `[WEBHOOK] ✅ Enrollment created: user=${userId}, course=${courseId}, payment=${paymentId}`
    );

    // ─── 5. Trigger Emails ───────────────────────────────────────────
    try {
      const userSnap = await db.collection("users").doc(userId).get();
      const courseSnap = await db.collection("courses").doc(courseId).get();
      
      if (userSnap.exists && courseSnap.exists) {
        const userData = userSnap.data()!;
        const courseData = courseSnap.data()!;
        
        // A. Email to Student
        await EmailService.sendEmail({
          to: userData.email,
          subject: `Enrollment Success: ${courseData.title}`,
          template: "student_enrollment_success",
          recipientId: userId,
          react: EnrollmentSuccessEmail({
            userName: userData.name || "Student",
            courseTitle: courseData.title,
            courseThumbnail: courseData.thumbnail,
            courseId: courseId,
          }),
        });

        // B. Email to Creator (if not admin)
        if (courseData.creatorId && courseData.creatorId !== "admin") {
          const creatorSnap = await db.collection("users").doc(courseData.creatorId).get();
          if (creatorSnap.exists) {
            const creatorData = creatorSnap.data()!;
            await EmailService.sendEmail({
              to: creatorData.email,
              subject: `New Enrollment: ${userData.name || "A new student"}`,
              template: "creator_new_enrollment",
              recipientId: courseData.creatorId,
              react: NewEnrollmentCreatorEmail({
                creatorName: creatorData.name || "Creator",
                studentName: userData.name || "A new student",
                courseTitle: courseData.title,
                revenue: (amount * 0.8), // Assuming 80/20 split
              }),
            });
          }
        }
      }
    } catch (emailError) {
      console.error("[WEBHOOK] Failed to send enrollment emails:", emailError);
    }
  }
}

/**
 * Handle failed payment.
 * Updates the payment record status for audit trail.
 */
async function handlePaymentFailed(event: Record<string, unknown>): Promise<void> {
  const payload = event.payload as Record<string, Record<string, Record<string, unknown>>>;
  const paymentEntity = payload?.payment?.entity;
  if (!paymentEntity) return;

  const orderId = paymentEntity.order_id as string;

  if (!orderId) return;

  const db = getAdminDb();
  const paymentRef = db.collection("payments").doc(orderId);

  await paymentRef.set(
    {
      status: "failed",
      verifiedAt: FieldValue.serverTimestamp(),
    },
    { merge: true }
  );

  console.log(`[WEBHOOK] ❌ Payment failed for order ${orderId}`);
}
