import Link from "next/link";
import Image from "next/image";
import { Course } from "@/types/firestore";

interface CourseCardProps {
  course: Course;
}

export default function CourseCard({ course }: CourseCardProps) {
  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white transition-all hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950">
      {/* Thumbnail */}
      <Link href={`/courses/${course.id}`} className="relative aspect-video w-full overflow-hidden">
        <Image
          src={course.thumbnail}
          alt={course.title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute left-3 top-3">
          <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-zinc-900 backdrop-blur-sm dark:bg-black/90 dark:text-zinc-50">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {(course as any).category || "Coding"}
          </span>
        </div>
      </Link>

      {/* Content */}
      <div className="flex flex-1 flex-col p-5">
        <div className="flex flex-1 flex-col gap-2">
          <Link href={`/courses/${course.id}`}>
            <h3 className="text-lg font-bold text-zinc-900 line-clamp-1 hover:text-zinc-600 transition-colors dark:text-zinc-50 dark:hover:text-zinc-300">
              {course.title}
            </h3>
          </Link>
          <p className="text-sm text-zinc-600 line-clamp-2 dark:text-zinc-400">
            {course.description}
          </p>
        </div>

        {/* Footer */}
        <div className="mt-6 flex items-center justify-between border-t border-zinc-100 pt-4 dark:border-zinc-900">
          <div className="flex flex-col">
            <span className="text-xs text-zinc-500 dark:text-zinc-500">Price</span>
            <span className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
              ₹{course.price}
            </span>
          </div>
          <Link
            href={`/courses/${course.id}`}
            className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-zinc-50 transition-all hover:bg-zinc-800 active:scale-95 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            View Course
          </Link>
        </div>
      </div>
    </div>
  );
}
