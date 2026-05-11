import { NextRequest, NextResponse } from "next/server";
import { verifyAdminToken } from "@/lib/auth-helpers";
import { deleteUserServer } from "@/lib/firestore-server";

export async function POST(request: NextRequest) {
  try {
    const adminToken = await verifyAdminToken(request);
    if (!adminToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId } = await request.json();
    if (!userId) {
      return NextResponse.json({ error: "Missing user ID" }, { status: 400 });
    }

    // Prevent admin from deleting themselves
    if (userId === adminToken.uid) {
      return NextResponse.json({ error: "You cannot delete your own account" }, { status: 400 });
    }

    await deleteUserServer(userId, adminToken.uid);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[API] Failed to delete user:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
