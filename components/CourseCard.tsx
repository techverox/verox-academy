"use client";

import { memo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Course } from "@/types/firestore";
import { BookOpen, Users, Star, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

interface CourseCardProps {
  course: Course;
}

function CourseCardComponent({ course }: CourseCardProps) {
  return (
    <Card className="group overflow-hidden border-border/50 hover:border-primary/20 bg-[#111827]/50 flex flex-col h-full transition-all duration-300">
      <Link href={`/courses/view/?id=${course.id}`} className="relative aspect-video w-full overflow-hidden">
        <Image
          src={course.thumbnail}
          alt={course.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F19] to-transparent opacity-60" />
        <div className="absolute top-4 left-4">
          <Badge variant="default" className="bg-black/50 backdrop-blur-md border-white/10 text-white">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {(course as any).category || "Premium"}
          </Badge>
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-6">
        <div className="flex-1 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-primary">
              <Star className="w-3 h-3 fill-primary" />
              Bestseller
            </div>
            <div className="flex items-center gap-1 text-xs text-secondary-text font-bold">
              <Users className="w-3.5 h-3.5" />
              1.2k+ Students
            </div>
          </div>
          
          <Link href={`/courses/view/?id=${course.id}`}>
            <h3 className="text-lg font-bold text-white line-clamp-2 hover:text-primary transition-colors leading-tight">
              {course.title}
            </h3>
          </Link>
          
          <div className="flex items-center gap-4 py-2">
            <div className="flex items-center gap-1.5 text-xs text-secondary-text font-semibold">
              <BookOpen className="w-3.5 h-3.5" />
              12 Modules
            </div>
            <div className="h-1 w-1 rounded-full bg-border" />
            <div className="text-xs text-secondary-text font-semibold">
              Advanced Level
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-border/50 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-widest text-secondary-text mb-0.5">Price</span>
            <span className="text-xl font-black text-white">
              ₹{course.price}
            </span>
          </div>
          <Link href={`/courses/view/?id=${course.id}`}>
            <Button size="sm" className="group/btn">
              Enroll Now
              <ArrowRight className="ml-2 w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
}

export default memo(CourseCardComponent);
