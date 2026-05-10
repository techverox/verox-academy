import { NextRequest, NextResponse } from "next/server";
import { verifyAuthToken } from "@/lib/auth-helpers";
import { getAdminDb } from "@/lib/firebase-admin";
import { EmailService } from "@/lib/email/service";
import { ReviewReminderEmail } from "@/emails/ReviewReminder";

export async function POST(request: NextRequest) {
  try {
    const decodedToken = await verifyAuthToken(request);
    if (!decodedToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { courseId } = await request.json();
    const userId = decodedToken.uid;
    const db = getAdminDb();

    // Idempotency: only send once per course
    const emailLogs = await db.collection("emailLogs")
      .where("recipientId", "==", userId)
      .where("template", "==", "student_review_reminder")
      .where("metadata.courseId", "==", courseId)
      .limit(1)
      .get();

    if (!emailLogs.empty) {
      return NextResponse.json({ success: true, message: "Reminder already sent" });
    }

    const courseSnap = await db.collection("courses").doc(courseId).get();
    if (!courseSnap.exists) return NextResponse.json({ error: "Course not found" }, { status: 404 });
    const courseData = courseSnap.data()!;

    await EmailService.sendEmail({
      to: decodedToken.email || "",
      subject: `How is your experience with ${courseData.title}?`,
      template: "student_review_reminder",
      recipientId: userId,
      metadata: { courseId },
      react: ReviewReminderEmail({
        userName: decodedToken.name || "Student",
        courseTitle: courseData.title,
        courseId: courseId,
      }),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[API] Review reminder failed:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
