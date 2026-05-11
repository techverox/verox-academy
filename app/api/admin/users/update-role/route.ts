import { NextRequest, NextResponse } from "next/server";
import { verifyAdminToken } from "@/lib/auth-helpers";
import { updateUserRoleServer } from "@/lib/firestore-server";

export async function POST(request: NextRequest) {
  try {
    const adminToken = await verifyAdminToken(request);
    if (!adminToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId, role } = await request.json();
    if (!userId || !role) {
      return NextResponse.json({ error: "Missing user ID or role" }, { status: 400 });
    }

    if (!["admin", "creator", "student"].includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    await updateUserRoleServer(userId, role, adminToken.uid);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[API] Failed to update user role:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
