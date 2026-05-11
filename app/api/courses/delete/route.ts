import { NextRequest, NextResponse } from "next/server";
import { verifyAuthToken, verifyAdminToken } from "@/lib/auth-helpers";
import { deleteCourseServer } from "@/lib/firestore-server";

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate user
    const userToken = await verifyAuthToken(request);
    if (!userToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { courseId } = await request.json();
    if (!courseId) {
      return NextResponse.json({ error: "Course ID is required" }, { status: 400 });
    }

    // 2. Check if Admin
    const adminToken = await verifyAdminToken(request);
    const isAdmin = !!adminToken;

    // 3. Execute Deletion
    const result = await deleteCourseServer(courseId, userToken.uid, isAdmin);

    if (result.success) {
      return NextResponse.json({ message: "Course deleted successfully" });
    } else {
      return NextResponse.json({ error: result.error || "Failed to delete course" }, { status: 403 });
    }
  } catch (error) {
    console.error("[API] Course delete error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
