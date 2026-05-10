import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";
import { EmailService } from "@/lib/email/service";
import UnfinishedCourseReminder from "@/emails/UnfinishedCourseReminder";
import React from "react";
import { APP_URL } from "@/lib/constants";

/**
 * CRON Job: Unfinished Course Reminders
 * =====================================
 * This route scans for students who haven't been active in a course for more than 3 days
 * and sends them a reminder email.
 * 
 * Frequency: Once per day.
 */
export async function GET(request: Request) {
  // Simple protection: check for cron secret if provided in env
  const authHeader = request.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const db = getAdminDb();
    
    // Calculate timestamp for 3 days ago
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    // 1. Fetch active enrollments with progress < 100 that haven't been active for 3+ days
    // In Firestore, we query for lastActivityAt < threeDaysAgo
    const enrollmentsSnap = await db.collection("enrollments")
      .where("status", "==", "active")
      .where("progress", "<", 100)
      .where("lastActivityAt", "<=", threeDaysAgo)
      .limit(100) // Batching to avoid timeouts
      .get();

    if (enrollmentsSnap.empty) {
      return NextResponse.json({ message: "No reminders to send." });
    }

    const results = [];

    for (const doc of enrollmentsSnap.docs) {
      const enrollment = doc.data();
      const userId = enrollment.userId;
      const courseId = enrollment.courseId;

      // 2. Fetch User and Course details
      const [userSnap, courseSnap] = await Promise.all([
        db.collection("users").doc(userId).get(),
        db.collection("courses").doc(courseId).get()
      ]);

      if (!userSnap.exists || !courseSnap.exists) continue;

      const userData = userSnap.data()!;
      const courseData = courseSnap.data()!;

      // 3. Send Email
      const emailResult = await EmailService.sendEmail({
        to: userData.email,
        subject: `Don't forget: ${courseData.title}`,
        template: "unfinished-course-reminder",
        recipientId: userId,
        react: React.createElement(UnfinishedCourseReminder, {
          studentName: userData.name || "Student",
          courseTitle: courseData.title,
          progress: enrollment.progress || 0,
          courseUrl: `${APP_URL}/learn/?courseId=${courseId}`
        }),
        metadata: { courseId, enrollmentId: doc.id }
      });

      // 4. Update enrollment so we don't spam them every day (optional: add lastRemindedAt)
      await doc.ref.update({
        lastRemindedAt: new Date(),
        // To prevent immediate re-triggering, we can artificially "bump" lastActivityAt 
        // or just rely on the lastRemindedAt filter in the next run.
      });

      results.push({ userId, status: emailResult.success ? "sent" : "failed" });
    }

    return NextResponse.json({ 
      processed: results.length,
      successCount: results.filter(r => r.status === "sent").length 
    });

  } catch (error: any) {
    console.error("[CRON_REMINDERS] Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
