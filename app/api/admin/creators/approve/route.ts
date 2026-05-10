import { NextRequest, NextResponse } from "next/server";
import { verifyAdminToken } from "@/lib/auth-helpers";
import { approveCreatorServer } from "@/lib/firestore-server";
import { EmailService } from "@/lib/email/service";
import { CreatorApprovedEmail } from "@/emails/CreatorApproved";
import { getAdminDb } from "@/lib/firebase-admin";

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

    await approveCreatorServer(applicationId, adminToken.uid);

    // ─── Trigger Approval Email ─────────────────────────────────────
    try {
      const db = getAdminDb();
      const appSnap = await db.collection("creatorApplications").doc(applicationId).get();
      if (appSnap.exists) {
        const appData = appSnap.data()!;
        await EmailService.sendEmail({
          to: appData.email,
          subject: "Welcome to the Verox Creator Program!",
          template: "creator_approved",
          recipientId: appData.userId,
          react: CreatorApprovedEmail({
            userName: appData.fullName || "Creator",
          }),
        });
      }
    } catch (emailError) {
      console.error("[API] Failed to send creator approval email:", emailError);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[API] Failed to approve creator:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
