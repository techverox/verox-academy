/**
 * CourseClient — Course Detail Page (Client Component)
 * ======================================================
 * Displays course details, curriculum, and handles enrollment CTA.
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
      
      const updated = await getReviewsByCourseId(courseId);
      setReviews(updated);
      setUserReview(updated.find(r => r.userId === user.uid) || null);
      setShowReviewForm(false);
      
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
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted border-t-primary" />
        <p className="mt-4 text-xs font-medium text-muted-foreground">Loading course details...</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background text-center px-4">
        <h1 className="text-3xl font-bold text-foreground">Course Not Found</h1>
        <p className="mt-2 text-muted-foreground max-w-md">The course you are looking for might have been removed or the link is broken.</p>
        <Link href="/courses/" className="mt-8">
          <Button>Back to Courses</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative border-b border-border bg-secondary/30 py-16 lg:py-24 overflow-hidden">
        <div className="container relative mx-auto px-6 lg:px-12">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 text-primary font-bold text-[10px] uppercase tracking-wider mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              Premium Course
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-foreground md:text-5xl leading-tight">
              {course.title}
            </h1>
            
            <div className="mt-6 flex flex-wrap items-center gap-4">
               <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-background border border-border">
                  <div className="flex text-yellow-500">
                     {[...Array(5)].map((_, i) => (
                       <Star key={i} className={`w-3.5 h-3.5 ${i < Math.floor(course.averageRating || 5) ? "fill-current" : "opacity-30"}`} />
                     ))}
                  </div>
                  <span className="text-xs font-bold text-foreground">{course.averageRating || "5.0"}</span>
                  <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide border-l border-border pl-2">
                    {course.totalReviews || 0} Reviews
                  </span>
               </div>
               <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/5 border border-primary/10">
                  <Badge variant="success" className="h-4 px-1.5 text-[8px] rounded">Verified</Badge>
                  <span className="text-[10px] font-bold text-primary uppercase tracking-wide">480+ Students Enrolled</span>
               </div>
            </div>

            <p className="mt-8 text-lg text-muted-foreground leading-relaxed max-w-2xl">
              {course.description}
            </p>
            
            <div className="mt-10 flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-background border border-border flex items-center justify-center text-primary">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Duration</p>
                  <p className="text-sm font-semibold text-foreground">4 Hours</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-background border border-border flex items-center justify-center text-primary">
                  <PlayCircle className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Content</p>
                  <p className="text-sm font-semibold text-foreground">{lessons.length} Lessons</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto grid gap-12 px-6 py-16 lg:grid-cols-3 lg:px-12">
        <div className="lg:col-span-2 space-y-16">
          <section>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold tracking-tight text-foreground">Course Curriculum</h2>
              <Badge variant="outline" className="rounded-md">{lessons.length} Lessons</Badge>
            </div>
            <div className="grid gap-3">
              {lessons.map((lesson, idx) => (
                <div key={lesson.id} className="group flex items-center justify-between p-4 rounded-xl bg-secondary/20 border border-transparent hover:border-border hover:bg-secondary/40 transition-all">
                  <div className="flex items-center gap-4">
                    <span className="text-[10px] font-bold text-muted-foreground/60 tracking-wider uppercase">{String(idx + 1).padStart(2, '0')}</span>
                    <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{lesson.title}</h3>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-medium text-muted-foreground">{lesson.duration}</span>
                    <Play className="w-3 h-3 text-muted-foreground group-hover:text-primary transition-all" />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="grid gap-6 sm:grid-cols-2">
            <Card className="p-6 border-border bg-card shadow-sm rounded-xl">
               <ShieldCheck className="w-8 h-8 text-primary mb-4" />
               <h4 className="text-base font-bold text-foreground mb-1">Lifetime Access</h4>
               <p className="text-xs text-muted-foreground leading-relaxed">Enroll once and learn at your own pace. Content never expires.</p>
            </Card>
            <Card className="p-6 border-border bg-card shadow-sm rounded-xl">
               <Award className="w-8 h-8 text-primary mb-4" />
               <h4 className="text-base font-bold text-foreground mb-1">Certificate of Completion</h4>
               <p className="text-xs text-muted-foreground leading-relaxed">Receive a professional certificate to showcase your new skills.</p>
            </Card>
          </section>

          <section className="space-y-8">
             <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold tracking-tight text-foreground">Student Reviews</h2>
                {isEnrolled && !userReview && (
                  <Button 
                   variant="outline" 
                   size="sm"
                   className="rounded-lg"
                   onClick={() => setShowReviewForm(true)}
                  >
                    Write a Review
                  </Button>
                )}
             </div>

             {showReviewForm && (
               <Card className="p-6 border-primary/20 bg-primary/5 rounded-xl">
                  <form onSubmit={handleAddReview} className="space-y-4">
                     <div>
                        <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2 block">Rating</label>
                        <div className="flex gap-1">
                           {[1, 2, 3, 4, 5].map((s) => (
                             <button 
                               key={s}
                               type="button"
                               onClick={() => setNewReview({...newReview, rating: s})}
                               className={`p-1 transition-all ${newReview.rating >= s ? "text-yellow-500" : "text-muted-foreground"}`}
                             >
                               <Star className={`w-6 h-6 ${newReview.rating >= s ? "fill-current" : ""}`} />
                             </button>
                           ))}
                        </div>
                     </div>
                     <div>
                        <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2 block">Comment</label>
                        <textarea 
                         rows={3}
                         required
                         className="w-full rounded-lg bg-background border border-border p-4 text-sm text-foreground outline-none focus:border-primary transition-all resize-none"
                         placeholder="Share your experience..."
                         value={newReview.comment}
                         onChange={(e) => setNewReview({...newReview, comment: e.target.value})}
                        />
                     </div>
                     <div className="flex gap-3">
                        <Button type="submit" size="sm" disabled={submittingReview}>
                          {submittingReview ? "Submitting..." : "Post Review"}
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setShowReviewForm(false)}>Cancel</Button>
                     </div>
                  </form>
               </Card>
             )}

             {reviews.length > 0 ? (
               <div className="grid gap-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="p-6 rounded-xl bg-card border border-border shadow-sm space-y-4">
                      <div className="flex items-center justify-between">
                         <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center text-foreground font-bold text-sm overflow-hidden">
                               {review.userPhoto ? <img src={review.userPhoto} className="h-full w-full object-cover" /> : review.userName.charAt(0)}
                            </div>
                            <div>
                               <p className="text-sm font-bold text-foreground">{review.userName}</p>
                               <div className="flex text-yellow-500">
                                  {[...Array(5)].map((_, i) => (
                                    <Star key={i} className={`w-2.5 h-2.5 ${i < review.rating ? "fill-current" : "opacity-30"}`} />
                                  ))}
                               </div>
                            </div>
                         </div>
                         <Badge variant="outline" className="text-[8px] uppercase font-bold opacity-60 rounded">Verified</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        &ldquo;{review.comment}&rdquo;
                      </p>
                      {review.creatorReply && (
                        <div className="ml-6 pt-4 border-t border-border/50 space-y-2">
                           <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-primary">
                              <CornerDownRight className="w-3.5 h-3.5" />
                              Instructor Reply
                           </div>
                           <p className="text-xs text-muted-foreground bg-secondary/30 p-3 rounded-lg border border-border/30">
                              {review.creatorReply.text}
                           </p>
                        </div>
                      )}
                   </div>
                  ))}
               </div>
             ) : (
               <div className="py-16 text-center rounded-xl border border-dashed border-border">
                  <MessageSquare className="w-10 h-10 text-muted-foreground/30 mx-auto mb-4" />
                  <p className="text-sm text-muted-foreground">No reviews yet. Be the first to share your experience!</p>
               </div>
             )}
          </section>
        </div>

        <aside className="lg:col-start-3">
          <div className="sticky top-24 space-y-6">
            <Card className="p-8 border-border bg-card shadow-md rounded-xl relative overflow-hidden">
              <div className="relative z-10">
                <div className="mb-8">
                  <Badge variant="success" className="mb-3 rounded px-2">Limited Time Price</Badge>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Enrollment Fee</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-foreground">₹{course.price}</span>
                    <span className="text-sm font-medium text-muted-foreground line-through opacity-50">₹1,999</span>
                  </div>
                </div>

                {isEnrolled ? (
                  <Link href={`/learn/viewer/?id=${course.id}`} className="block">
                    <Button size="lg" className="w-full rounded-lg">
                      Continue Learning
                      <ChevronRight className="ml-2 w-4 h-4" />
                    </Button>
                  </Link>
                ) : (
                  <RazorpayCheckout
                    courseId={course.id}
                    courseName={course.title}
                    price={course.price}
                    onSuccess={() => setIsEnrolled(true)}
                    onError={(error) => console.error("Payment failed:", error)}
                  />
                )}

                <div className="mt-8 space-y-3">
                   <div className="flex items-center gap-2.5 text-xs font-medium text-muted-foreground">
                     <InfinityIcon className="w-3.5 h-3.5 text-primary" />
                     Full lifetime access
                   </div>
                   <div className="flex items-center gap-2.5 text-xs font-medium text-muted-foreground">
                     <Award className="w-3.5 h-3.5 text-primary" />
                     Certificate of completion
                   </div>
                   <div className="flex items-center gap-2.5 text-xs font-medium text-muted-foreground">
                     <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                     Secure payment verification
                   </div>
                </div>
              </div>
            </Card>

            <div className="p-6 rounded-xl border border-dashed border-border text-center">
              <p className="text-[10px] font-medium text-muted-foreground">
                Need help? <Link href="/contact" className="text-primary hover:underline">Contact Support</Link>
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
