import { NextRequest, NextResponse } from "next/server";
import { verifyAuthToken } from "@/lib/auth-helpers";
import { getAdminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import { EmailService } from "@/lib/email/service";
import { AdminAlertEmail } from "@/emails/AdminAlert";
import { APP_URL } from "@/lib/constants";

export async function POST(request: NextRequest) {
  try {
    const decodedToken = await verifyAuthToken(request);
    if (!decodedToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const application = await request.json();
    const db = getAdminDb();

    // 1. Save Application
    const appRef = db.collection("creatorApplications").doc();
    await appRef.set({
      ...application,
      userId: decodedToken.uid,
      status: "pending",
      createdAt: FieldValue.serverTimestamp(),
    });

    // 2. Notify Admins
    // In a real app, you'd fetch admin emails from Firestore
    const adminEmails = ["admin@techverox.com"]; // Placeholder
    
    await EmailService.sendEmail({
      to: adminEmails,
      subject: "New Creator Application Received",
      template: "admin_creator_application_alert",
      react: AdminAlertEmail({
        title: "New Creator Application",
        description: `A new user has applied to become a creator on Verox Academy.`,
        details: {
          "Applicant Name": application.fullName,
          "Email": application.email,
          "Expertise": application.expertise,
          "Portfolio": application.portfolioUrl,
        },
        actionLabel: "Review Application",
        actionUrl: `${APP_URL}/admin/creators`,
      }),
    });

    return NextResponse.json({ success: true, id: appRef.id });
  } catch (error) {
    console.error("[API] Creator application failed:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
