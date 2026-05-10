import { NextRequest, NextResponse } from "next/server";
import { verifyAdminToken } from "@/lib/auth-helpers";
import { getAdminDb } from "@/lib/firebase-admin";

export async function GET(request: NextRequest) {
  try {
    const adminToken = await verifyAdminToken(request);
    if (!adminToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = getAdminDb();
    const snapshot = await db.collection("payoutRequests").orderBy("requestedAt", "desc").get();
    const requests = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    return NextResponse.json(requests);
  } catch (error) {
    console.error("[API] Failed to fetch payouts:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
