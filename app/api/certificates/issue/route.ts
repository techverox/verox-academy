import { NextRequest, NextResponse } from "next/server";
import { verifyAuthToken } from "@/lib/auth-helpers";
import { getAdminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import { EmailService } from "@/lib/email/service";
import { CertificateUnlockedEmail } from "@/emails/CertificateUnlocked";
import { APP_URL } from "@/lib/constants";

export async function POST(request: NextRequest) {
  try {
    const decodedToken = await verifyAuthToken(request);
    if (!decodedToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { courseId } = await request.json();
    const userId = decodedToken.uid;
    const db = getAdminDb();

    // 1. Check if enrollment is completed
    const enrollmentId = `${userId}_${courseId}`;
    const enrollmentSnap = await db.collection("enrollments").doc(enrollmentId).get();
    
    if (!enrollmentSnap.exists || enrollmentSnap.data()?.status !== "completed") {
      return NextResponse.json({ error: "Course not completed" }, { status: 400 });
    }

    // 2. Issue Certificate (Idempotent)
    const certId = `${userId}_${courseId}`;
    const certRef = db.collection("certificates").doc(certId);
    const certSnap = await certRef.get();

    if (!certSnap.exists) {
      const courseSnap = await db.collection("courses").doc(courseId).get();
      if (!courseSnap.exists) return NextResponse.json({ error: "Course not found" }, { status: 404 });
      
      const courseData = courseSnap.data()!;
      const serialNumber = `VX-${courseId.slice(0, 4)}-${userId.slice(0, 4)}-${Math.floor(Date.now() / 100000)}`.toUpperCase();

      await certRef.set({
        id: certId,
        userId,
        courseId,
        creatorId: courseData.creatorId,
        studentName: decodedToken.name || "Verox Student",
        courseTitle: courseData.title,
        creatorName: courseData.creatorName || "Verox Academy",
        serialNumber,
        issuedAt: FieldValue.serverTimestamp(),
      });

      // 3. Send Email
      await EmailService.sendEmail({
        to: decodedToken.email || "",
        subject: `Certificate Earned: ${courseData.title}`,
        template: "student_certificate_unlocked",
        recipientId: userId,
        react: CertificateUnlockedEmail({
          userName: decodedToken.name || "Student",
          courseTitle: courseData.title,
          certificateUrl: `${APP_URL}/certificates/${certId}`,
        }),
      });
    }

    return NextResponse.json({ success: true, certId });
  } catch (error) {
    console.error("[API] Certificate issuance failed:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
