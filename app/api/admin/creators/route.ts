import { NextRequest, NextResponse } from "next/server";
import { verifyAdminToken } from "@/lib/auth-helpers";
import { getCreatorApplicationsServer } from "@/lib/firestore-server";

export async function GET(request: NextRequest) {
  try {
    const adminToken = await verifyAdminToken(request);
    if (!adminToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const applications = await getCreatorApplicationsServer();
    return NextResponse.json(applications);
  } catch (error) {
    console.error("[API] Failed to fetch applications:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
