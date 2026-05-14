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
    
    // 1. Fetch all payout requests
    const snapshot = await db.collection("payoutRequests").orderBy("requestedAt", "desc").get();
    const requests = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];

    // 2. Enrich with Creator Profile and Pending Payments
    // We'll use a Map to avoid redundant fetches for the same creator
    const creatorCache = new Map();

    const enrichedRequests = await Promise.all(requests.map(async (payout) => {
      const creatorId = payout.creatorId;

      // Get Creator Profile
      if (!creatorCache.has(creatorId)) {
        const userDoc = await db.collection("users").doc(creatorId).get();
        creatorCache.set(creatorId, userDoc.exists ? userDoc.data() : { name: "Unknown Creator", photoURL: null });
      }
      const creatorProfile = creatorCache.get(creatorId);

      // Get Related Payments (Sales Breakdown)
      // For pending payouts, we show what's currently pending.
      // For paid payouts, we might want historical data, but for now let's focus on the 'pending' pool
      // that justified this specific request amount.
      const paymentsSnap = await db.collection("payments")
        .where("creatorId", "==", creatorId)
        .where("status", "==", "captured")
        // Note: For historical payout requests, this logic might be more complex (using a payoutId),
        // but for current operational needs, showing the pending/recent pool is what's requested.
        .limit(20)
        .get();

      const sales = paymentsSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      return {
        ...payout,
        creator: creatorProfile,
        sales: sales
      };
    }));

    return NextResponse.json(enrichedRequests);
  } catch (error) {
    console.error("[API] Failed to fetch enriched payouts:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
