import { NextRequest, NextResponse } from "next/server";
import { verifyAuthToken } from "@/lib/auth-helpers";
import { enrollStudentManuallyServer } from "@/lib/firestore-server";

export async function POST(request: NextRequest) {
  try {
    const decodedToken = await verifyAuthToken(request);
    if (!decodedToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { studentEmail, courseId } = await request.json();

    if (!studentEmail || !courseId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Check if user is creator or admin
    const isCreator = decodedToken.creator === true;
    const isAdmin = decodedToken.admin === true;

    if (!isCreator && !isAdmin) {
      return NextResponse.json({ error: "Forbidden: Creators and Admins only" }, { status: 403 });
    }

    const result = await enrollStudentManuallyServer(
      studentEmail,
      courseId,
      decodedToken.uid,
      isAdmin
    );

    if (result.success) {
      return NextResponse.json({ message: result.message });
    } else {
      return NextResponse.json({ error: result.message }, { status: 400 });
    }

  } catch (error) {
    console.error("[API-ENROLL-MANUAL] Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
