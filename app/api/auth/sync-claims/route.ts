import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin";
import { verifyAuthToken } from "@/lib/auth-helpers";

export async function POST(request: NextRequest) {
  try {
    // 1. Verify the user is logged in
    const decodedToken = await verifyAuthToken(request);
    if (!decodedToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const uid = decodedToken.uid;
    const db = getAdminDb();
    const auth = getAdminAuth();

    // 2. Fetch the user's document from Firestore
    const userDoc = await db.collection("users").doc(uid).get();
    
    if (!userDoc.exists) {
      return NextResponse.json({ error: "User document not found" }, { status: 404 });
    }

    const userData = userDoc.data();
    const firestoreRole = userData?.role;
    
    // 3. Determine required claims based on Firestore role
    const currentClaims = decodedToken;
    const needsAdmin = firestoreRole === "admin";
    const needsCreator = firestoreRole === "creator" || firestoreRole === "admin"; // Admins are also creators

    // 4. Check if claims are already correct to avoid unnecessary updates
    if (
      !!currentClaims.admin === needsAdmin && 
      !!currentClaims.creator === needsCreator
    ) {
      return NextResponse.json({ 
        message: "Claims are already up to date", 
        claims: { admin: !!currentClaims.admin, creator: !!currentClaims.creator } 
      });
    }

    // 5. Update Custom Claims
    const user = await auth.getUser(uid);
    const existingClaims = user.customClaims || {};

    await auth.setCustomUserClaims(uid, {
      ...existingClaims,
      admin: needsAdmin,
      creator: needsCreator
    });

    console.log(`[AUTH-SYNC] Synced claims for ${uid}: admin=${needsAdmin}, creator=${needsCreator}`);

    return NextResponse.json({ 
      success: true, 
      message: "Claims synchronized successfully. Please refresh your token.",
      claims: { admin: needsAdmin, creator: needsCreator }
    });

  } catch (error) {
    console.error("[AUTH-SYNC] Error syncing claims:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
