import { NextRequest, NextResponse } from "next/server";
import { verifyAuthToken } from "@/lib/auth-helpers";
import { EmailService } from "@/lib/email/service";
import { WelcomeEmail } from "@/emails/StudentWelcome";
import { getAdminDb } from "@/lib/firebase-admin";

export async function POST(request: NextRequest) {
  try {
    const decodedToken = await verifyAuthToken(request);
    if (!decodedToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = decodedToken.uid;
    const db = getAdminDb();
    
    // Check if welcome email already sent (idempotency)
    const emailLogs = await db.collection("emailLogs")
      .where("recipientId", "==", userId)
      .where("template", "==", "student_welcome")
      .limit(1)
      .get();

    if (!emailLogs.empty) {
      return NextResponse.json({ success: true, message: "Welcome email already sent" });
    }

    // Send Welcome Email
    await EmailService.sendEmail({
      to: decodedToken.email || "",
      subject: "Welcome to Verox Academy!",
      template: "student_welcome",
      recipientId: userId,
      react: WelcomeEmail({
        userName: decodedToken.name || "Student",
      }),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[API] Onboarding failed:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
