import { NextRequest, NextResponse } from "next/server";
import { verifyAdminToken } from "@/lib/auth-helpers";
import { deleteCreatorApplicationServer } from "@/lib/firestore-server";

export async function POST(request: NextRequest) {
  try {
    const adminToken = await verifyAdminToken(request);
    if (!adminToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { applicationId } = await request.json();
    if (!applicationId) {
      return NextResponse.json({ error: "Missing application ID" }, { status: 400 });
    }

    await deleteCreatorApplicationServer(applicationId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[API] Failed to delete creator application:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
