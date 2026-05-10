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
import { getCourseById, getLessonsByCourseId, isUserEnrolled, getReviewsByCourseId, addReview } from "@/lib/firestore";
import { Course, Lesson, Review } from "@/types/firestore";
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
  PlayCircle,
  Star,
  MessageSquare,
  User as UserIcon,
  CornerDownRight
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
  const [reviews, setReviews] = useState<Review[]>([]);
  const [userReview, setUserReview] = useState<Review | null>(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 5, comment: "" });
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

        const reviewsData = await getReviewsByCourseId(courseId);
        setReviews(reviewsData);

        if (user) {
          const enrolled = await isUserEnrolled(user.uid, courseId);
          setIsEnrolled(enrolled);
          
          const existing = reviewsData.find(r => r.userId === user.uid);
          if (existing) setUserReview(existing);
        }
      } catch (error) {
        console.error("Failed to fetch course details:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [courseId, user, router]);

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !course || !courseId) return;
    
    setSubmittingReview(true);
    try {
      await addReview({
        courseId,
        userId: user.uid,
        userName: user.displayName || "Anonymous Student",
        userPhoto: user.photoURL || undefined,
        rating: newReview.rating,
        comment: newReview.comment
      });
      
      // Refresh reviews
      const updated = await getReviewsByCourseId(courseId);
      setReviews(updated);
      setUserReview(updated.find(r => r.userId === user.uid) || null);
      setShowReviewForm(false);
      
      // Update course locally
      setCourse(prev => prev ? {
        ...prev,
        totalReviews: (prev.totalReviews || 0) + 1,
        averageRating: Number((( (prev.averageRating || 0) * (prev.totalReviews || 0) + newReview.rating ) / ((prev.totalReviews || 0) + 1)).toFixed(1))
      } : null);
      
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingReview(false);
    }
  };

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
            
            <div className="mt-8 flex flex-wrap items-center gap-6">
               <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex text-yellow-500">
                     {[...Array(5)].map((_, i) => (
                       <Star key={i} className={`w-4 h-4 ${i < Math.floor(course.averageRating || 5) ? "fill-current" : "opacity-30"}`} />
                     ))}
                  </div>
                  <span className="text-sm font-black text-white">{course.averageRating || "5.0"}</span>
                  <span className="text-[10px] font-bold text-secondary-text uppercase tracking-widest border-l border-white/10 pl-2">
                    {course.totalReviews || 0} Reviews
                  </span>
               </div>
               <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 border border-primary/20">
                  <Badge variant="success" className="h-4 px-1.5 text-[8px]">Verified</Badge>
                  <span className="text-xs font-black text-primary uppercase tracking-widest">Enrolled: 480+ Students</span>
               </div>
            </div>

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

          {/* Review System */}
          <section className="space-y-10">
             <div className="flex items-center justify-between">
                <h2 className="text-3xl font-black tracking-tight text-white">Student Testimonials</h2>
                {isEnrolled && !userReview && (
                  <Button 
                   variant="outline" 
                   className="rounded-xl border-primary/30 text-primary hover:bg-primary/5"
                   onClick={() => setShowReviewForm(true)}
                  >
                    Write Review
                  </Button>
                )}
             </div>

             {showReviewForm && (
               <Card className="p-8 border-primary/30 bg-primary/5 animate-in slide-in-from-top-4 duration-500">
                  <form onSubmit={handleAddReview} className="space-y-6">
                     <div className="flex flex-col gap-2">
                        <label className="text-xs font-black uppercase tracking-widest text-secondary-text">Select Rating</label>
                        <div className="flex gap-2">
                           {[1, 2, 3, 4, 5].map((s) => (
                             <button 
                               key={s}
                               type="button"
                               onClick={() => setNewReview({...newReview, rating: s})}
                               className={`p-2 transition-all ${newReview.rating >= s ? "text-yellow-500 scale-110" : "text-zinc-600 hover:text-zinc-400"}`}
                             >
                               <Star className={`w-8 h-8 ${newReview.rating >= s ? "fill-current" : ""}`} />
                             </button>
                           ))}
                        </div>
                     </div>
                     <div className="flex flex-col gap-2">
                        <label className="text-xs font-black uppercase tracking-widest text-secondary-text">Your Experience</label>
                        <textarea 
                         rows={4}
                         required
                         className="w-full rounded-2xl bg-zinc-950 border border-border/50 p-6 text-white outline-none focus:border-primary transition-all resize-none font-medium"
                         placeholder="What did you think of this course?"
                         value={newReview.comment}
                         onChange={(e) => setNewReview({...newReview, comment: e.target.value})}
                        />
                     </div>
                     <div className="flex gap-4">
                        <Button type="submit" disabled={submittingReview}>
                          {submittingReview ? "Syncing..." : "Submit Review"}
                        </Button>
                        <Button variant="ghost" onClick={() => setShowReviewForm(false)}>Cancel</Button>
                     </div>
                  </form>
               </Card>
             )}

             {reviews.length > 0 ? (
               <div className="grid gap-6">
                 {reviews.map((review) => (
                   <div key={review.id} className="p-8 rounded-[2rem] bg-[#151B2E]/30 border border-border/50 space-y-6">
                      <div className="flex items-center justify-between">
                         <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-2xl bg-zinc-800 flex items-center justify-center text-white font-black text-xl overflow-hidden">
                               {review.userPhoto ? <img src={review.userPhoto} className="h-full w-full object-cover" /> : review.userName.charAt(0)}
                            </div>
                            <div>
                               <p className="font-black text-white">{review.userName}</p>
                               <div className="flex text-yellow-500 mt-1">
                                  {[...Array(5)].map((_, i) => (
                                    <Star key={i} className={`w-3 h-3 ${i < review.rating ? "fill-current" : "opacity-30"}`} />
                                  ))}
                               </div>
                            </div>
                         </div>
                         <Badge variant="outline" className="text-[10px] opacity-50">Verified Student</Badge>
                      </div>
                      <p className="text-secondary-text font-medium leading-relaxed italic">
                        &ldquo;{review.comment}&rdquo;
                      </p>
                      {review.creatorReply && (
                        <div className="ml-8 pt-6 border-t border-border/20 space-y-3">
                           <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-primary">
                              <CornerDownRight className="w-4 h-4" />
                              Instructor Response
                           </div>
                           <p className="text-sm font-medium text-zinc-400 bg-white/5 p-4 rounded-2xl border border-white/5">
                              {review.creatorReply.text}
                           </p>
                        </div>
                      )}
                   </div>
                 ))}
               </div>
             ) : (
               <div className="p-20 text-center rounded-[3rem] border border-dashed border-border/50">
                  <MessageSquare className="w-12 h-12 text-zinc-700 mx-auto mb-6" />
                  <h4 className="text-xl font-bold text-white mb-2">No reviews yet</h4>
                  <p className="text-secondary-text max-w-sm mx-auto">Be the first to share your learning experience with the world.</p>
               </div>
             )}
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
