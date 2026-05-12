"use client";

import { memo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Course } from "@/types/firestore";
import { BookOpen, Users, Star, ArrowRight, Clock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface CourseCardProps {
  course: Course;
}

function CourseCardComponent({ course }: CourseCardProps) {
  return (
    <div className="group surface-elevated rounded-4xl overflow-hidden flex flex-col h-full transition-all duration-500 hover:border-primary/40 relative">
      <Link href={`/courses/view/?id=${course.id}`} className="relative aspect-video w-full overflow-hidden">
        <Image
          src={course.thumbnail}
          alt={course.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-1000 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-linear-to-t from-background/90 via-background/20 to-transparent opacity-80" />
        <div className="absolute top-6 left-6">
           <div className="px-4 py-2 rounded-2xl bg-card/80 backdrop-blur-xl border border-white/10 text-[10px] font-black uppercase tracking-widest text-foreground shadow-2xl">
              {(course as any).category || "MASTERCLASS"}
           </div>
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-10">
        <div className="flex-1 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-primary">
              <Sparkles className="w-3.5 h-3.5" />
              Elite Path
            </div>
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
               <Users className="w-3.5 h-3.5" />
               1.2k+ Enrolled
            </div>
          </div>
          
          <Link href={`/courses/view/?id=${course.id}`}>
            <h3 className="text-2xl font-black text-foreground line-clamp-2 group-hover:text-primary transition-colors leading-tight tracking-tight">
              {course.title}
            </h3>
          </Link>
          
          <div className="flex items-center gap-6 text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em]">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-primary" />
              12 Modules
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              Advanced
            </div>
          </div>
        </div>

        <div className="mt-10 pt-8 border-t border-border/50 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground mb-1">Tuition</span>
            <span className="text-3xl font-black text-foreground">
              ₹{course.price}
            </span>
          </div>
          <Link href={`/courses/view/?id=${course.id}`}>
            <button className="btn-primary-premium h-14 px-8">
              Initialize
              <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
        </div>
      </div>
      
      {/* Decorative Glow */}
      <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-primary/10 rounded-full blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
}

export default memo(CourseCardComponent);
