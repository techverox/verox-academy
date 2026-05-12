"use client";

import { memo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Course } from "@/types/firestore";
import { BookOpen, Users, Star, ArrowRight, Clock } from "lucide-react";

interface CourseCardProps {
  course: Course;
}

function CourseCardComponent({ course }: CourseCardProps) {
  const levelLabel = (course as any).level || "All Levels";
  const category = (course as any).category || "Course";
  const duration = (course as any).duration || null;
  const enrolledCount = (course as any).enrolledCount || (course as any).totalEnrollments || null;

  return (
    <div className="group bg-card border border-border rounded-xl overflow-hidden flex flex-col h-full transition-all duration-200 hover:shadow-md hover:border-border/60 hover:-translate-y-0.5">
      {/* Thumbnail */}
      <Link href={`/courses/view/?id=${course.id}`} className="relative aspect-video w-full overflow-hidden bg-secondary flex-shrink-0">
        <Image
          src={course.thumbnail}
          alt={course.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {/* Category badge */}
        <div className="absolute top-3 left-3">
          <div className="px-2.5 py-1 rounded-md bg-black/60 backdrop-blur-sm text-white text-[10px] font-medium uppercase tracking-wide">
            {category}
          </div>
        </div>
        {/* Level badge */}
        <div className="absolute top-3 right-3">
          <div className="px-2.5 py-1 rounded-md bg-black/60 backdrop-blur-sm text-white text-[10px] font-medium">
            {levelLabel}
          </div>
        </div>
      </Link>

      {/* Content */}
      <div className="flex flex-1 flex-col p-5">
        <div className="flex-1">
          {/* Rating row */}
          <div className="flex items-center gap-2 mb-3">
            <div className="flex items-center gap-1 text-amber-500">
              <Star className="w-3.5 h-3.5 fill-current" />
              <span className="text-xs font-semibold text-foreground">
                {course.averageRating?.toFixed(1) || "5.0"}
              </span>
            </div>
            <span className="text-xs text-muted-foreground">
              ({course.totalReviews || 0} reviews)
            </span>
            {enrolledCount && (
              <>
                <span className="text-border">·</span>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Users className="w-3 h-3" />
                  <span className="text-xs">{enrolledCount.toLocaleString()} enrolled</span>
                </div>
              </>
            )}
          </div>

          {/* Title */}
          <Link href={`/courses/view/?id=${course.id}`}>
            <h3 className="text-sm font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors leading-snug mb-3">
              {course.title}
            </h3>
          </Link>

          {/* Meta row */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            {duration && (
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{duration}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <BookOpen className="w-3 h-3" />
              <span>{levelLabel}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 pt-4 border-t border-border flex items-center justify-between gap-3">
          <div>
            <span className="text-lg font-bold text-foreground tracking-tight">
              ₹{course.price.toLocaleString("en-IN")}
            </span>
          </div>
          <Link href={`/courses/view/?id=${course.id}`}>
            <button className="h-9 px-4 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary-hover active:scale-[0.98] transition-all flex items-center gap-1.5">
              View Course
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default memo(CourseCardComponent);
