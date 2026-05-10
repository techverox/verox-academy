"use client";

import { useEffect, useState } from "react";
import { Trophy, Award, ArrowRight, Home, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

interface CourseCompletionModalProps {
  courseTitle: string;
  courseId: string;
  userId: string;
  onClose: () => void;
}

export function CourseCompletionModal({ courseTitle, courseId, userId, onClose }: CourseCompletionModalProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`fixed inset-0 z-[100] flex items-center justify-center p-4 transition-all duration-700 ${isVisible ? "bg-black/90 backdrop-blur-md" : "bg-transparent opacity-0"}`}>
      <div className={`relative w-full max-w-2xl overflow-hidden rounded-[2.5rem] border border-primary/20 bg-[#0B0F19] p-8 text-center transition-all duration-1000 md:p-16 ${isVisible ? "translate-y-0 scale-100 opacity-100 shadow-[0_0_100px_rgba(124,58,237,0.3)]" : "translate-y-20 scale-90 opacity-0"}`}>
        
        {/* Animated Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div 
              key={i}
              className="absolute animate-float opacity-20"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                width: `${Math.random() * 10 + 5}px`,
                height: `${Math.random() * 10 + 5}px`,
                backgroundColor: i % 2 === 0 ? 'var(--primary)' : 'var(--success)',
                borderRadius: '50%'
              }}
            />
          ))}
        </div>

        {/* Success Icon */}
        <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-3xl bg-primary/10 text-primary shadow-[0_0_30px_rgba(124,58,237,0.2)] animate-bounce-slow">
          <Trophy className="h-12 w-12" />
        </div>

        <div className="relative space-y-6">
          <div className="flex items-center justify-center gap-2 text-primary font-black text-xs uppercase tracking-[0.4em] mb-4">
             <Sparkles className="w-4 h-4" />
             Certification Achievement
          </div>
          
          <h2 className="text-4xl font-black tracking-tight text-white md:text-5xl lg:text-6xl">
            Course Completed!
          </h2>
          
          <p className="mx-auto max-w-md text-lg font-medium text-secondary-text">
            Congratulations! You&apos;ve successfully mastered <span className="text-white font-bold">{courseTitle}</span>. Your certificate is now available.
          </p>

          <div className="pt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
             <Link href="/dashboard/" className="w-full sm:w-auto">
               <Button size="lg" variant="outline" className="w-full gap-2 border-white/10 hover:bg-white/5 h-14 px-8">
                 <Home className="w-4 h-4" />
                 Back to Dashboard
               </Button>
             </Link>
             
             <Link href={`/verify-certificate/${userId}_${courseId}`} className="w-full sm:w-auto">
               <Button size="lg" className="w-full gap-2 h-14 px-8 group bg-success hover:bg-success-hover text-white border-none">
                 View Certificate
                 <Award className="w-4 h-4 group-hover:rotate-12 transition-transform" />
               </Button>
             </Link>
          </div>
        </div>

        <button 
          onClick={onClose}
          className="absolute top-6 right-6 text-secondary-text hover:text-white transition-colors"
        >
          <ArrowRight className="w-6 h-6 rotate-45" />
        </button>
      </div>
      
      <style jsx global>{`
        @keyframes float {
          0% { transform: translateY(0) rotate(0deg); opacity: 0; }
          50% { opacity: 0.5; }
          100% { transform: translateY(-100vh) rotate(360deg); opacity: 0; }
        }
        .animate-float {
          animation: float 8s infinite linear;
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 3s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
}
