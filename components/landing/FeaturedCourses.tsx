import { getFeaturedCourses } from "@/lib/firestore-server";
import { Course } from "@/types/firestore";
import CourseCard from "@/components/CourseCard";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { MotionGrid } from "./MotionGrid";

/**
 * FeaturedCourses - Server Component
 * ==================================
 * Fetches the top-rated courses on the server for optimal LCP.
 * Uses a Client Component (MotionGrid) to handle reveal animations.
 */
export default async function FeaturedCourses() {
  const featuredCourses = await getFeaturedCourses(4);

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="max-w-2xl space-y-3">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-blue-500">Top Rated</p>
          <h2 className="text-4xl md:text-5xl font-bold tracking-[-0.03em] text-foreground leading-tight">
            Popular Masterclasses.
          </h2>
          <p className="text-lg text-muted-foreground font-normal leading-relaxed">
            Accelerate your career with premium learning modules designed by the industry's most successful creators.
          </p>
        </div>
        <Link href="/courses" className="shrink-0">
          <Button className="h-12 px-7 rounded-full bg-foreground text-background font-semibold text-sm hover:opacity-90 transition-all gap-2">
            Browse All Courses
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>

      <MotionGrid courses={featuredCourses} />
    </div>
  );
}
