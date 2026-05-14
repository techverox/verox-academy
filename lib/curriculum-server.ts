"use server";

import { getLessonsByCourseIdServer } from "./firestore-server";

/**
 * Fetches a sanitized curriculum for public display.
 * Removes sensitive fields like videoUrl and notes if the user shouldn't see them.
 */
export async function getPublicCurriculum(courseId: string, userId?: string) {
  const lessons = await getLessonsByCourseIdServer(courseId);
  
  // If no userId is provided, or user is not enrolled (handled by checking enrollment elsewhere)
  // we sanitize the lessons.
  // Actually, for the Course View page, we ALWAYS want to sanitize unless we know they are enrolled.
  
  return lessons.map(lesson => ({
    id: lesson.id,
    title: lesson.title,
    duration: lesson.duration,
    order: lesson.order,
    isPreviewFree: lesson.isPreviewFree || false,
    // explicitly exclude videoUrl and notes
  }));
}
