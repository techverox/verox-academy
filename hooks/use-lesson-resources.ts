"use client";

import { useState, useEffect } from "react";
import { Resource } from "@/types/firestore";
import { getResourcesByLessonId } from "@/lib/firestore";

export function useLessonResources(lessonId: string | undefined, courseId: string | null) {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!lessonId) return;

    setLoading(true);
    getResourcesByLessonId(lessonId, courseId || undefined).then((data) => {
      setResources(data);
      setLoading(false);
    });
  }, [lessonId, courseId]);

  return {
    resources,
    loading
  };
}
