import Image from "next/image";
import Link from "next/link";
import { Course } from "@/types/database";

interface CourseCardProps {
  course: Course;
}

export default function CourseCard({ course }: CourseCardProps) {
  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-zinc-100 bg-white transition-all hover:shadow-lg">
      {/* Thumbnail */}
      <div className="relative aspect-video w-full overflow-hidden">
        <Image
          src={course.thumbnail}
          alt={course.title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute left-3 top-3">
          <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold backdrop-blur-sm">
            {course.category}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-5">
        <h3 className="line-clamp-1 text-lg font-bold text-zinc-900 transition-colors group-hover:text-black">
          {course.title}
        </h3>
        <p className="mt-2 line-clamp-2 text-sm text-zinc-600">
          {course.description}
        </p>

        <div className="mt-auto pt-6">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-xs text-zinc-500 uppercase tracking-wider font-bold">
                Price
              </span>
              <span className="text-xl font-black text-zinc-900">
                ₹{course.price}
              </span>
            </div>
            <Link
              href={`/courses/${course.id}`}
              className="rounded-full bg-black px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-zinc-800"
            >
              View Course
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
