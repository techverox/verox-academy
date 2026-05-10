/**
 * CourseClient — Course Detail Page (Client Component)
 * ======================================================
 * Displays course details, curriculum, and handles enrollment CTA.
 *
 * SECURITY CHANGE:
 * - Removed direct `enrollUserInCourse()` call (was free enrollment bypass)
 * - Now uses RazorpayCheckout component for payment-gated enrollment
 * - Enrollment only happens after verified payment (server-side)
 */

"use client";

import { useEffect, useState, Suspense } from "react";
import { getCourseById, getLessonsByCourseId, isUserEnrolled } from "@/lib/firestore";
import { Course, Lesson } from "@/types/firestore";
import { useAuth } from "@/context/auth-context";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  Clock, 
  Play, 
  ShieldCheck, 
  Award, 
  Infinity as InfinityIcon, 
  ChevronRight,
  Sparkles,
  PlayCircle
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import RazorpayCheckout from "@/components/RazorpayCheckout";

function CourseViewContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const courseId = searchParams.get("id");
  
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    async function fetchData() {
      if (!courseId) {
        router.push("/courses/");
        return;
      }
      
      setLoading(true);
      try {
        const [courseData, lessonsData] = await Promise.all([
          getCourseById(courseId),
          getLessonsByCourseId(courseId)
        ]);
        
        setCourse(courseData);
        setLessons(lessonsData);

        if (user) {
          const enrolled = await isUserEnrolled(user.uid, courseId);
          setIsEnrolled(enrolled);
        }
      } catch (error) {
        console.error("Failed to fetch course details:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [courseId, user, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-muted border-t-primary" />
        <p className="mt-4 text-[10px] font-black uppercase tracking-[0.3em] text-secondary-text">Verox Academy Preview Engine</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background text-center px-4">
        <h1 className="text-4xl font-black text-white">Course Not Found</h1>
        <p className="mt-4 text-secondary-text max-w-md">The course you are looking for might have been removed or the link is broken.</p>
        <Link href="/courses/" className="mt-10">
          <Button size="lg">Back to Courses</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative border-b border-border/50 bg-[#111827] py-24 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <img src={course.thumbnail} alt="" className="h-full w-full object-cover blur-[100px] scale-150" />
        </div>
        <div className="container relative mx-auto px-6 lg:px-12">
          <div className="max-w-4xl">
            <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-[0.3em] mb-6">
              <Sparkles className="w-4 h-4" />
              Verified Premium Course
            </div>
            <h1 className="text-5xl font-black tracking-tight text-white md:text-7xl lg:text-8xl leading-[0.9]">
              {course.title}
            </h1>
            <p className="mt-10 text-xl font-medium text-secondary-text leading-relaxed max-w-2xl">
              {course.description}
            </p>
            
            <div className="mt-12 flex flex-wrap items-center gap-8">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-secondary-text">Duration</p>
                  <p className="font-bold text-white">Approx. 4 Hours</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                  <PlayCircle className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-secondary-text">Curriculum</p>
                  <p className="font-bold text-white">{lessons.length} Professional Lessons</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="container mx-auto grid gap-16 px-6 py-20 lg:grid-cols-3 lg:px-12">
        {/* Left Side: Info & Curriculum */}
        <div className="lg:col-span-2 space-y-20">
          <section>
            <div className="flex items-center justify-between mb-10">
              <h2 className="text-3xl font-black tracking-tight text-white">Course Curriculum</h2>
              <Badge variant="outline">{lessons.length} Modules</Badge>
            </div>
            <div className="grid gap-4">
              {lessons.map((lesson, idx) => (
                <div key={lesson.id} className="group flex items-center justify-between p-6 rounded-2xl bg-[#151B2E]/50 border border-border/50 hover:border-primary/20 hover:bg-[#151B2E] transition-all cursor-default">
                  <div className="flex items-center gap-6">
                    <span className="text-xs font-black text-zinc-600 tracking-widest uppercase bg-muted px-2 py-1 rounded">M{idx + 1}</span>
                    <h3 className="text-base font-bold text-white group-hover:text-primary transition-colors">{lesson.title}</h3>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs font-bold text-secondary-text">{lesson.duration}</span>
                    <div className="h-8 w-8 rounded-full border border-border flex items-center justify-center text-zinc-600 group-hover:text-primary group-hover:border-primary/50 transition-all">
                      <Play className="w-3 h-3 fill-current" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Features / Benefits */}
          <section className="grid gap-8 sm:grid-cols-2">
            <Card className="p-8 border-border/50 bg-[#151B2E]/30">
               <ShieldCheck className="w-10 h-10 text-primary mb-6" />
               <h4 className="text-lg font-bold text-white mb-2">Lifetime Access</h4>
               <p className="text-sm text-secondary-text leading-relaxed font-medium">Buy once and learn at your own pace. The course content never expires and is always available.</p>
            </Card>
            <Card className="p-8 border-border/50 bg-[#151B2E]/30">
               <Award className="w-10 h-10 text-primary mb-6" />
               <h4 className="text-lg font-bold text-white mb-2">Verified Certificate</h4>
               <p className="text-sm text-secondary-text leading-relaxed font-medium">Receive a professional certificate upon completion to showcase your skills to the world.</p>
            </Card>
          </section>
        </div>

        {/* Right Side: Pricing & CTA */}
        <aside className="lg:col-start-3">
          <div className="sticky top-24 space-y-8">
            <Card className="p-10 border-border/50 bg-[#151B2E] shadow-2xl relative overflow-hidden group">
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000" />
              
              <div className="relative z-10">
                <div className="mb-10">
                  <Badge variant="success" className="mb-4">Limited Offer</Badge>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-secondary-text mb-4">Investment Price</p>
                  <div className="flex items-baseline gap-3">
                    <span className="text-6xl font-black text-white tracking-tighter">₹{course.price}</span>
                    <span className="text-lg font-bold text-secondary-text line-through opacity-50">₹1,999</span>
                  </div>
                </div>

                {isEnrolled ? (
                  <Link href={`/learn/viewer/?id=${course.id}`} className="block">
                    <Button size="lg" className="w-full">
                      Continue Learning
                      <ChevronRight className="ml-2 w-4 h-4" />
                    </Button>
                  </Link>
                ) : (
                  /* SECURE PAYMENT FLOW — Replaces old free enrollment */
                  <RazorpayCheckout
                    courseId={course.id}
                    courseName={course.title}
                    price={course.price}
                    onSuccess={() => setIsEnrolled(true)}
                    onError={(error) => console.error("Payment failed:", error)}
                  />
                )}

                <div className="mt-10 space-y-4">
                   <div className="flex items-center gap-3 text-xs font-bold text-secondary-text">
                     <InfinityIcon className="w-4 h-4 text-primary" />
                     Lifetime updates included
                   </div>
                   <div className="flex items-center gap-3 text-xs font-bold text-secondary-text">
                     <Award className="w-4 h-4 text-primary" />
                     Professional certificate
                   </div>
                   <div className="flex items-center gap-3 text-xs font-bold text-secondary-text">
                     <ShieldCheck className="w-4 h-4 text-primary" />
                     7-day money back guarantee
                   </div>
                </div>
              </div>
            </Card>

            <div className="p-8 rounded-3xl border border-dashed border-border bg-muted/5 text-center">
              <p className="text-xs font-bold text-secondary-text">
                Have questions? <Link href="/contact" className="text-primary hover:underline">Contact our support team</Link>
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default function CourseClient() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center bg-background text-white">Loading...</div>}>
      <CourseViewContent />
    </Suspense>
  );
}
