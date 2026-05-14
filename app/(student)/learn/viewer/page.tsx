import { Metadata } from "next";
import LearnClient from "./LearnClient";
import { getCourseById } from "@/lib/firestore-server";

interface Props {
  searchParams: Promise<{ id?: string; lesson?: string }>;
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { id: courseId } = await searchParams;
  if (!courseId) return { title: "Learn | Verox Academy" };

  try {
    const course = await getCourseById(courseId);
    if (!course) return { title: "Course Not Found | Verox Academy" };

    return {
      title: `${course.title} | Verox Academy`,
      description: course.description || "Master new skills with professional-grade curriculum at Verox Academy.",
      openGraph: {
        title: course.title,
        description: course.description,
        images: [course.thumbnail],
      },
    };
  } catch (error) {
    return { title: "Learn | Verox Academy" };
  }
}

export default async function LearnViewerPage({ searchParams }: Props) {
  // We await searchParams here to satisfy Next.js 15 requirements, 
  // though LearnClient will also use useSearchParams() on the client side.
  await searchParams;
  return <LearnClient />;
}
