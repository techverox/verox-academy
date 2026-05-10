import { NextRequest, NextResponse } from "next/server";
import { verifyCreatorToken } from "@/lib/auth-helpers";
import { getAdminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import { EmailService } from "@/lib/email/service";
import { AdminAlertEmail } from "@/emails/AdminAlert";
import { APP_URL } from "@/lib/constants";

export async function POST(request: NextRequest) {
  try {
    const decodedToken = await verifyCreatorToken(request);
    if (!decodedToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { amount, paymentMethod } = await request.json();
    const db = getAdminDb();

    // 1. Save Payout Request
    const payoutRef = db.collection("payoutRequests").doc();
    await payoutRef.set({
      creatorId: decodedToken.uid,
      amount,
      paymentMethod,
      status: "pending",
      requestedAt: FieldValue.serverTimestamp(),
    });

    // 2. Notify Admins
    const adminEmails = ["admin@techverox.com"]; 
    const formattedAmount = new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount / 100);

    await EmailService.sendEmail({
      to: adminEmails,
      subject: `New Payout Request: ${formattedAmount}`,
      template: "admin_payout_request_alert",
      react: AdminAlertEmail({
        title: "Payout Request Pending",
        description: `A creator has requested a payout of ${formattedAmount}.`,
        details: {
          "Creator": decodedToken.name || decodedToken.email || "Unknown",
          "Amount": formattedAmount,
          "Method": paymentMethod.type.toUpperCase(),
        },
        actionLabel: "Process Payout",
        actionUrl: `${APP_URL}/admin/payouts`,
      }),
    });

    return NextResponse.json({ success: true, id: payoutRef.id });
  } catch (error) {
    console.error("[API] Payout request failed:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
