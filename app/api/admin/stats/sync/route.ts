import { NextRequest, NextResponse } from "next/server";
import { verifyAdminToken } from "@/lib/auth-helpers";
import { rebuildPlatformStats } from "@/lib/aggregation";

export async function POST(req: NextRequest) {
  try {
    const isAdmin = await verifyAdminToken(req);
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await rebuildPlatformStats();

    return NextResponse.json({ message: "Platform stats synchronized successfully" });
  } catch (error) {
    console.error("[API] Stats sync error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
