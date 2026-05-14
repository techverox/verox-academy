"use client";

import { useEffect, useState, Suspense } from "react";
import { getCourseById, isUserEnrolled, getReviewsByCourseId, addReview } from "@/lib/firestore";
import { getPublicCurriculum } from "@/lib/curriculum-server";
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
  CornerDownRight,
  CheckCircle2,
  Users,
  Calendar,
  Lock,
  ChevronDown,
  HelpCircle,
  Smartphone,
  Globe,
  Monitor
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import RazorpayCheckout from "@/components/RazorpayCheckout";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { SectionWrapper } from "@/components/layout/SectionWrapper";
import { ContentContainer } from "@/components/layout/ContentContainer";
import { PageHeader } from "@/components/layout/PageHeader";

function CourseViewContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const courseId = searchParams.get("id");
  
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<any[]>([]);
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
          getPublicCurriculum(courseId)
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
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-muted border-t-accent" />
        <p className="mt-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">Synchronizing Course Data</p>
      </div>
    );
  }

  if (!course) return null;

  const outcomes = [
    "Master the core architecture of the industry.",
    "Build high-performance, professional-grade projects.",
    "Implement enterprise-level security protocols.",
    "Collaborate with top-tier creators and engineers.",
    "Deploy scalable infrastructure with confidence.",
    "Obtain industry-recognized certification."
  ];

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Premium Hero Section - Responsive Spacing & Grid */}
      <SectionWrapper className="relative border-b border-border/40 overflow-hidden py-12 md:py-20 lg:py-32">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(37,99,235,0.06),transparent_50%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808005_1px,transparent_1px),linear-gradient(to_bottom,#80808005_1px,transparent_1px)] bg-size-[40px_40px]" />
        
        <ContentContainer className="relative z-10">
          <div className="flex flex-col lg:grid lg:grid-cols-12 gap-10 md:gap-16 lg:gap-20">
            {/* Left Content - Information Hierarchy */}
            <div className="lg:col-span-7 xl:col-span-8 space-y-8 md:space-y-12">
              <div className="space-y-6">
                <div className="flex items-center gap-2 text-accent text-[9px] md:text-[10px] font-bold uppercase tracking-[0.4em]">
                  <Sparkles className="w-3.5 h-3.5" />
                  Premium Masterclass
                </div>
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tighter text-foreground leading-[0.95] text-balance">
                  <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-cyan-500">{course.title}</span>
                </h1>
                
                <div className="flex flex-wrap items-center gap-4 md:gap-6 pt-2">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface border border-border/40 shadow-sm shrink-0">
                    <div className="flex text-amber-500">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-3 h-3 md:w-3.5 md:h-3.5 ${i < Math.floor(course.averageRating || 5) ? "fill-current" : "opacity-20"}`} />
                      ))}
                    </div>
                    <span className="text-xs md:text-sm font-bold text-foreground tracking-tight">{course.averageRating || "5.0"}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs md:text-sm font-bold text-muted-foreground">
                    <Users className="w-4 h-4 text-accent" />
                    <span>480+ Learners</span>
                  </div>
                </div>
              </div>

              {/* Video Preview Aspect - Mobile Centric */}
              <div className="relative aspect-video rounded-4xl md:rounded-5xl overflow-hidden border border-border/40 bg-zinc-950 shadow-2xl group cursor-pointer ring-1 ring-white/5">
                 <img src={course.thumbnail} className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:scale-105 transition-transform duration-1000" />
                 <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-16 w-16 md:h-20 md:w-20 rounded-full bg-accent/20 backdrop-blur-xl border border-accent/40 flex items-center justify-center text-white transition-all group-hover:scale-110 group-hover:bg-accent">
                       <Play className="w-6 h-6 md:w-8 md:h-8 fill-current ml-1" />
                    </div>
                 </div>
                 <div className="absolute bottom-4 left-6 md:bottom-6 md:left-8 flex items-center gap-3">
                    <Badge className="bg-black/60 backdrop-blur-md border border-white/10 px-3 md:px-4 py-1.5 md:py-2 rounded-lg md:rounded-xl text-[8px] md:text-[10px] font-bold tracking-widest">PREVIEW MODULE</Badge>
                 </div>
              </div>

              <div className="space-y-6">
                <h3 className="text-[9px] md:text-[10px] font-bold uppercase tracking-[0.4em] text-muted-foreground/40">Professional Description</h3>
                <p className="text-lg md:text-xl text-muted-foreground leading-relaxed font-medium max-w-4xl">
                  {course.description}
                </p>
              </div>

              {/* Meta Blocks - Responsive Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 md:gap-8 pt-4">
                {[
                  { icon: Clock, label: "Duration", value: "4 Hours" },
                  { icon: PlayCircle, label: "Lessons", value: `${lessons.length} Modules` },
                  { icon: Calendar, label: "Updated", value: "May 2024" },
                  { icon: Globe, label: "Access", value: "Global" }
                ].map((meta, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex items-center gap-2 text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">
                      <meta.icon className="w-3.5 h-3.5" />
                      {meta.label}
                    </div>
                    <p className="text-base md:text-lg font-bold tracking-tight">{meta.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Sticky Enrollment Card - High Visibility */}
            <div className="lg:col-span-5 xl:col-span-4 mt-12 lg:mt-0">
              <div className="sticky top-32">
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-6 md:p-10 rounded-4xl md:rounded-5xl bg-surface border border-border/40 shadow-2xl shadow-black/10 space-y-8 md:space-y-10"
                >
                  <div className="space-y-4">
                    <Badge variant="accent" className="bg-emerald-500/10 text-emerald-500 border-none px-3 py-1 rounded-lg text-[8px] md:text-[9px] font-bold tracking-widest uppercase">Limited Access Pricing</Badge>
                    <div className="flex items-baseline gap-3">
                      <span className="text-4xl md:text-5xl font-bold tracking-tighter text-foreground">₹{course.price.toLocaleString('en-IN')}</span>
                      <span className="text-base md:text-lg font-semibold text-muted-foreground/40 line-through">₹2,499</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {isEnrolled ? (
                      <Link href={`/learn/viewer/?id=${course.id}`} className="block">
                        <Button variant="primary" className="w-full h-14 md:h-16 rounded-xl md:rounded-2xl bg-linear-to-r from-blue-600 to-cyan-500 text-white font-bold uppercase tracking-[0.2em] text-[10px] md:text-[11px] shadow-2xl shadow-blue-500/20 group border-none">
                          Continue Mastery
                          <ChevronRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                        </Button>
                      </Link>
                    ) : (
                      <RazorpayCheckout
                        courseId={course.id}
                        courseName={course.title}
                        price={course.price}
                        autoOpen={searchParams.get("autoEnroll") === "true"}
                        onSuccess={() => setIsEnrolled(true)}
                        onError={(error) => console.error("Payment failed:", error)}
                      />
                    )}
                  </div>

                  <div className="space-y-4 md:space-y-5 pt-4">
                    {[
                      { icon: InfinityIcon, text: "Lifetime Access to Curriculum" },
                      { icon: Award, text: "Verified Completion Certificate" },
                      { icon: ShieldCheck, text: "Secure Institutional Enrollment" },
                      { icon: Monitor, text: "Access on all Global Nodes" }
                    ].map((feature, i) => (
                      <div key={i} className="flex items-center gap-3 md:gap-4 text-xs font-bold text-muted-foreground">
                        <feature.icon className="w-3.5 h-3.5 md:w-4 md:h-4 text-accent" />
                        {feature.text}
                      </div>
                    ))}
                  </div>

                  <div className="pt-8 border-t border-border/40">
                     <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-muted-foreground/30 text-center">
                        SECURED BY TECHVEROX PROTOCOLS
                     </p>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </ContentContainer>
      </SectionWrapper>

      {/* Main Content Sections - Adaptive Spacing */}
      <ContentContainer className="py-16 md:py-24 lg:py-32">
        <div className="grid gap-16 md:gap-24 lg:grid-cols-12">
          <div className="lg:col-span-8 space-y-24 md:space-y-32">
            {/* Key Outcomes */}
            <section className="space-y-10 md:space-y-12">
               <h2 className="text-3xl md:text-4xl font-bold tracking-tighter text-foreground">What you will master.</h2>
               <div className="grid gap-4 md:gap-6 sm:grid-cols-2">
                 {outcomes.map((outcome, i) => (
                   <div key={i} className="flex items-start gap-4 p-6 md:p-8 rounded-3xl md:rounded-4xl bg-surface border border-border/40 shadow-sm">
                      <CheckCircle2 className="w-4.5 h-4.5 md:w-5 md:h-5 text-accent shrink-0 mt-0.5" />
                      <p className="text-sm font-bold text-muted-foreground leading-relaxed">{outcome}</p>
                   </div>
                 ))}
               </div>
            </section>

            {/* Curriculum - Hardened List */}
            <section className="space-y-10 md:space-y-12">
              <div className="flex items-center justify-between px-2">
                <h2 className="text-3xl md:text-4xl font-bold tracking-tighter text-foreground">Curriculum.</h2>
                <Badge variant="outline" className="text-[9px] font-bold uppercase tracking-widest px-3 py-1 bg-muted border-none">{lessons.length} Modules</Badge>
              </div>
              <div className="space-y-4">
                <div className="rounded-4xl md:rounded-4xl border border-border/40 overflow-hidden bg-surface shadow-sm">
                   {lessons.map((lesson, idx) => (
                      <div 
                        key={lesson.id} 
                        className={cn(
                          "group flex items-center justify-between p-5 md:p-6 transition-all hover:bg-muted/30",
                          idx !== lessons.length - 1 && "border-b border-border/20"
                        )}
                      >
                        <div className="flex items-center gap-4 md:gap-6 min-w-0">
                           <span className="text-[10px] font-bold text-muted-foreground/30 uppercase tracking-[0.3em] shrink-0">{String(idx + 1).padStart(2, '0')}</span>
                           <div className="space-y-0.5 md:space-y-1 min-w-0">
                              <h4 className="text-sm md:text-base font-bold tracking-tight text-foreground group-hover:text-accent transition-colors truncate pr-2">{lesson.title}</h4>
                              <p className="text-[8px] md:text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Video Module</p>
                           </div>
                        </div>
                        <div className="flex items-center gap-4 md:gap-6 shrink-0">
                           <span className="text-[9px] md:text-[10px] font-bold text-muted-foreground/60">{lesson.duration}</span>
                           <div className="h-9 w-9 md:h-10 md:w-10 rounded-lg md:rounded-xl bg-muted border border-border/40 flex items-center justify-center text-muted-foreground/40 group-hover:bg-accent/10 group-hover:text-accent group-hover:border-accent/20 transition-all">
                              <Lock className="w-3.5 h-3.5 md:w-4 md:h-4" />
                           </div>
                        </div>
                      </div>
                   ))}
                </div>
              </div>
            </section>

            {/* Creator Profile - Adaptive Proportions */}
            <section className="space-y-10 md:space-y-12">
               <h2 className="text-3xl md:text-4xl font-bold tracking-tighter text-foreground">Meet your Instructor.</h2>
               <div className="p-6 md:p-12 rounded-4xl md:rounded-5xl bg-zinc-950 text-white relative overflow-hidden ring-1 ring-white/5">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_100%_0%,rgba(37,99,235,0.1),transparent_50%)]" />
                  <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start md:items-center gap-8 md:gap-12">
                     <div className="h-32 w-32 md:h-48 md:w-48 rounded-4xl md:rounded-5xl overflow-hidden border-2 border-white/10 shrink-0 shadow-2xl">
                        <img src={course.creatorPhoto || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200&h=200&auto=format&fit=crop"} className="w-full h-full object-cover" />
                     </div>
                     <div className="space-y-5 md:space-y-6 text-center sm:text-left">
                        <div className="space-y-1">
                           <h3 className="text-3xl md:text-4xl font-bold tracking-tighter leading-none">{course.creatorName || "Elite Instructor"}</h3>
                           <p className="text-[10px] md:text-[11px] font-bold uppercase tracking-[0.4em] text-accent">Lead Professional Creator</p>
                        </div>
                        <p className="text-zinc-400 font-medium leading-relaxed max-w-lg text-sm md:text-base">
                           With over a decade of industry experience architecting high-performance digital systems, our instructors bring unparalleled technical depth to every masterclass.
                        </p>
                        <div className="flex items-center justify-center sm:justify-start gap-8 md:gap-12 pt-2">
                           <div className="space-y-1">
                              <p className="text-2xl md:text-3xl font-bold tracking-tighter">45K+</p>
                              <p className="text-[8px] md:text-[9px] font-bold uppercase tracking-widest text-zinc-600">Total Students</p>
                           </div>
                           <div className="space-y-1">
                              <p className="text-2xl md:text-3xl font-bold tracking-tighter">4.9/5</p>
                              <p className="text-[8px] md:text-[9px] font-bold uppercase tracking-widest text-zinc-600">Mentor Rating</p>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            </section>
          </div>
        </div>
      </ContentContainer>
    </div>
  );
}

export default function CourseClient() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center bg-background text-white">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-muted border-t-accent" />
    </div>}>
      <CourseViewContent />
    </Suspense>
  );
}
