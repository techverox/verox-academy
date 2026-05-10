import { Metadata } from "next";
import { getCourseByIdServer } from "@/lib/firestore-server";
import CourseClient from "./CourseClient";
import SchemaOrg from "@/components/SEO/SchemaOrg";
import { APP_URL } from "@/lib/constants";

interface Props {
  searchParams: Promise<{ id?: string }>;
}

/**
 * Dynamic Metadata Generation
 * ===========================
 * Fetches course data on the server to provide accurate SEO tags.
 * This ensures that when a course is shared on social media,
 * it displays the correct title, description, and thumbnail.
 */
export async function generateMetadata(props: Props): Promise<Metadata> {
  const searchParams = await props.searchParams;
  const courseId = searchParams.id;
  if (!courseId) return { title: "Course Details" };

  const course = await getCourseByIdServer(courseId);
  if (!course) return { title: "Course Not Found" };

  const title = `${course.title} | Verox Academy`;
  const description = course.description.slice(0, 160);

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [course.thumbnail],
      type: "article",
      url: `${APP_URL}/courses/view/?id=${courseId}`,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [course.thumbnail],
    },
  };
}

export default async function CourseViewPage(props: Props) {
  const searchParams = await props.searchParams;
  const courseId = searchParams.id;
  const course = courseId ? await getCourseByIdServer(courseId) : null;

  // Generate Course Structured Data (JSON-LD)
  const schema = course ? {
    "@context": "https://schema.org",
    "@type": "Course",
    "name": course.title,
    "description": course.description,
    "provider": {
      "@type": "Organization",
      "name": "Verox Academy",
      "sameAs": APP_URL
    },
    "image": course.thumbnail,
    "offers": {
      "@type": "Offer",
      "price": course.price,
      "priceCurrency": "INR",
      "availability": "https://schema.org/InStock",
      "url": `${APP_URL}/courses/view/?id=${courseId}`
    }
  } : null;

  return (
    <>
      {schema && <SchemaOrg data={schema} />}
      <CourseClient />
    </>
  );
}
