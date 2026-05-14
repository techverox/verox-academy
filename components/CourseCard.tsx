import { memo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Course } from "@/types/firestore";
import { BookOpen, Users, Star, ArrowRight, Clock, ShieldCheck, Zap, Award } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

interface CourseCardProps {
  course: Course;
}

function CourseCardComponent({ course }: CourseCardProps) {
  const levelLabel = (course as any).level || "All Levels";
  const category = (course as any).category || "Premium Course";
  const duration = (course as any).duration || "8h 30m";
  const enrolledCount = (course as any).enrolledCount || (course as any).totalEnrollments || 1240;

  return (
    <div className="group relative flex flex-col h-full bg-surface-elevated/40 border border-border/40 rounded-4xl overflow-hidden transition-all duration-700 hover:-translate-y-2 hover:shadow-2xl hover:shadow-black/20 hover:border-accent/40">
      {/* Thumbnail Container */}
      <Link href={`/courses/view/?id=${course.id}`} className="relative aspect-video w-full overflow-hidden bg-zinc-900 shrink-0">
        <Image
          src={course.thumbnail}
          alt={course.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-1000 group-hover:scale-110"
        />
        
        {/* Cinematic Overlays */}
        <div className="absolute inset-0 bg-linear-to-t from-zinc-950 via-zinc-950/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity" />
        
        <div className="absolute top-5 left-5">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-xl border border-white/10 text-white text-[9px] font-bold uppercase tracking-[0.2em] shadow-2xl">
             <Award className="w-3 h-3 text-accent fill-current" />
             {category}
          </div>
        </div>

        <div className="absolute bottom-5 left-5 right-5 flex items-center justify-between opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-500">
           <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest bg-emerald-500/20 border border-emerald-500/40 px-3 py-1.5 rounded-lg backdrop-blur-md">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Professional Certificate
           </div>
        </div>
      </Link>

      {/* Content Area */}
      <div className="flex flex-1 flex-col p-8">
        <div className="flex-1 space-y-6">
          {/* Metadata Grid */}
          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/60">
             <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                   <Clock className="w-3.5 h-3.5" />
                   {duration}
                </div>
                <div className="flex items-center gap-1.5">
                   <BookOpen className="w-3.5 h-3.5" />
                   {levelLabel}
                </div>
             </div>
             <div className="flex items-center gap-1.5 text-accent">
                <Star className="w-3.5 h-3.5 fill-current" />
                {course.averageRating?.toFixed(1) || "5.0"}
             </div>
          </div>

          {/* Title */}
          <Link href={`/courses/view/?id=${course.id}`}>
            <h3 className="text-xl font-bold text-foreground tracking-tight line-clamp-2 leading-[1.1] transition-colors group-hover:text-accent">
              {course.title}
            </h3>
          </Link>

          {/* Creator Profile */}
          <div className="flex items-center gap-3 pt-2">
            <div className="relative h-7 w-7 rounded-full overflow-hidden border border-border/60 bg-muted">
              {course.creatorPhoto ? (
                <Image src={course.creatorPhoto} alt={course.creatorName || ""} fill className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-accent">
                   {course.creatorName?.charAt(0) || "C"}
                </div>
              )}
            </div>
            <div className="flex flex-col">
               <span className="text-[11px] font-bold text-foreground leading-none">{course.creatorName || "Expert Mentor"}</span>
               <span className="text-[9px] font-semibold text-muted-foreground uppercase tracking-widest mt-1">Lead Instructor</span>
            </div>
          </div>
        </div>

        {/* Pricing & Footer Actions */}
        <div className="mt-8 pt-6 border-t border-border/40 flex items-center justify-between">
           <div className="flex flex-col">
              <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.2em] leading-none mb-1">Course Enrollment</span>
              <span className="text-2xl font-bold text-foreground tracking-tighter">
                 ₹{course.price.toLocaleString("en-IN")}
              </span>
           </div>
           
           <Link href={`/courses/view/?id=${course.id}`}>
              <div className="flex items-center justify-center h-12 w-12 rounded-2xl bg-accent text-white transition-all duration-500 group-hover:w-36 group-hover:px-4 group-hover:gap-2 shadow-lg shadow-accent/20">
                 <span className="hidden group-hover:inline text-[9px] font-bold uppercase tracking-widest whitespace-nowrap overflow-hidden">View Course</span>
                 <ArrowRight className="w-5 h-5 shrink-0" />
              </div>
           </Link>
        </div>
      </div>

      {/* Hover Status Bar */}
      <div className="absolute top-0 left-0 w-full h-1 bg-accent/0 group-hover:bg-accent transition-all duration-500" />
    </div>
  );
}

export default memo(CourseCardComponent);
