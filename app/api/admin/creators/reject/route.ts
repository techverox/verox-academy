import { NextRequest, NextResponse } from "next/server";
import { verifyAdminToken } from "@/lib/auth-helpers";
import { rejectCreatorServer } from "@/lib/firestore-server";

export async function POST(request: NextRequest) {
  try {
    const adminToken = await verifyAdminToken(request);
    if (!adminToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { applicationId, reason } = await request.json();
    if (!applicationId || !reason) {
      return NextResponse.json({ error: "Missing application ID or reason" }, { status: 400 });
    }

    await rejectCreatorServer(applicationId, reason, adminToken.uid);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[API] Failed to reject creator:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
