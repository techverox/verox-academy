"use client";

import { useState, useEffect, useCallback } from "react";
import { Lesson } from "@/types/firestore";
import { subscribeToLessons } from "@/lib/firestore";
import { useRouter, useSearchParams } from "next/navigation";

export function useLessonPlayer(courseId: string | null) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!courseId) return;

    setLoading(true);
    const unsubscribe = subscribeToLessons(
      courseId, 
      (fetchedLessons) => {
        setLessons(fetchedLessons);
        
        if (fetchedLessons.length === 0) {
          setError("No lessons found for this course.");
          setLoading(false);
          return;
        }

        // Determine active lesson from URL or default to first
        const lessonIdFromUrl = searchParams.get("lesson");
        const currentLesson = fetchedLessons.find(l => l.id === lessonIdFromUrl) || fetchedLessons[0];
        
        setActiveLesson(currentLesson);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error("useLessonPlayer error:", err);
        setError(err.message || "Failed to synchronize lessons.");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [courseId, searchParams]);

  const switchLesson = useCallback((lesson: Lesson) => {
    setActiveLesson(lesson);
    const params = new URLSearchParams(searchParams.toString());
    params.set("lesson", lesson.id);
    router.replace(`?${params.toString()}`, { scroll: false });
  }, [router, searchParams]);

  return {
    lessons,
    activeLesson,
    loading,
    error,
    switchLesson
  };
}
