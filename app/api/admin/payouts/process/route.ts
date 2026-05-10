import { NextRequest, NextResponse } from "next/server";
import { verifyAdminToken } from "@/lib/auth-helpers";
import { getAdminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

export async function POST(request: NextRequest) {
  try {
    const adminToken = await verifyAdminToken(request);
    if (!adminToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { requestId, status } = await request.json();
    if (!requestId || !status) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const db = getAdminDb();
    const payoutRef = db.collection("payoutRequests").doc(requestId);
    const payoutSnap = await payoutRef.get();

    if (!payoutSnap.exists) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    const payoutData = payoutSnap.data()!;
    if (payoutData.status !== "pending") {
      return NextResponse.json({ error: "Request already processed" }, { status: 400 });
    }

    // Atomic transaction to update payout and creator stats
    await db.runTransaction(async (transaction) => {
      transaction.update(payoutRef, {
        status,
        processedAt: FieldValue.serverTimestamp(),
        processedBy: adminToken.uid
      });

      if (status === "paid") {
        const statsRef = db.collection("creatorStats").doc(payoutData.creatorId);
        transaction.update(statsRef, {
          pendingRevenue: FieldValue.increment(-payoutData.amount),
          paidRevenue: FieldValue.increment(payoutData.amount),
          lastUpdated: FieldValue.serverTimestamp()
        });
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[API] Failed to process payout:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
