"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { submitCreatorApplication, getCreatorApplicationStatus } from "@/lib/firestore";
import { CreatorApplication } from "@/types/firestore";
import { CheckCircle2, AlertCircle, Rocket, Users, Target, ShieldCheck, Camera, Send, Video, Briefcase, Globe, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { SectionWrapper } from "@/components/layout/SectionWrapper";
import { ContentContainer } from "@/components/layout/ContentContainer";
import { motion, AnimatePresence } from "framer-motion";

export default function BecomeCreatorPage() {
  const { user, profile, loading, isCreator } = useAuth();
  const router = useRouter();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    bio: "",
    expertise: "",
    category: "technology",
    socialLinks: {
      twitter: "",
      linkedin: "",
      youtube: "",
      instagram: "",
    },
    portfolioUrl: "",
    sampleCourseIdea: "",
    whyJoin: "",
  });

  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [existingApp, setExistingApp] = useState<CreatorApplication | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        fullName: user.displayName || "",
        email: user.email || "",
      }));

      const checkStatus = async () => {
        const app = await getCreatorApplicationStatus(user.uid);
        setExistingApp(app);
      };
      checkStatus();
    }
  }, [user]);

  useEffect(() => {
    if (isCreator) {
      router.push("/creator");
    }
  }, [isCreator, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      router.push("/login?callbackUrl=/become-creator");
      return;
    }

    setStatus("loading");
    try {
      await submitCreatorApplication({
        userId: user.uid,
        ...formData,
      });
      setStatus("success");
    } catch (error) {
      console.error("Failed to submit application:", error);
      setStatus("error");
      setErrorMessage("Something went wrong. Please try again later.");
    }
  };

  if (loading) return <div className="min-h-screen bg-background" />;
  if (isCreator) return null;

  if (existingApp) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full bg-surface border border-border/60 rounded-5xl p-10 text-center space-y-8 shadow-xl shadow-black/5 dark:shadow-none">
          <div className="mx-auto w-20 h-20 rounded-3xl bg-blue-50 flex items-center justify-center">
            {existingApp.status === "pending" ? (
              <Rocket className="w-10 h-10 text-blue-600 animate-pulse" />
            ) : existingApp.status === "approved" ? (
              <CheckCircle2 className="w-10 h-10 text-emerald-500" />
            ) : (
              <AlertCircle className="w-10 h-10 text-rose-500" />
            )}
          </div>
          <div className="space-y-3">
            <h1 className="text-3xl font-bold tracking-tight">
              {existingApp.status === "pending" ? "Application Pending" : 
               existingApp.status === "approved" ? "Application Approved!" : 
               "Application Rejected"}
            </h1>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {existingApp.status === "pending" ? "Your application is being reviewed by our team. We'll get back to you soon via email." : 
               existingApp.status === "approved" ? "Welcome to the creator community! You can now access your creator dashboard." : 
               `Unfortunately, your application was not approved. Reason: ${existingApp.rejectionReason || "Not specified."}`}
            </p>
          </div>
          {existingApp.status === "approved" && (
            <Button 
              onClick={() => router.push("/creator")}
              className="w-full h-14 bg-linear-to-r from-blue-600 to-cyan-500 text-white font-semibold rounded-2xl shadow-lg shadow-blue-500/20"
            >
              GO TO CREATOR DASHBOARD
            </Button>
          )}
          <Button 
            variant="outline"
            onClick={() => router.push("/")}
            className="w-full h-14 rounded-2xl font-semibold border-border/60"
          >
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full bg-surface border border-border/60 rounded-5xl p-12 text-center space-y-8 shadow-xl shadow-black/5 dark:shadow-none">
          <div className="mx-auto w-24 h-24 rounded-3xl bg-emerald-50 flex items-center justify-center">
            <CheckCircle2 className="w-12 h-12 text-emerald-500" />
          </div>
          <div className="space-y-3">
            <h1 className="text-3xl font-bold tracking-tight">Application Sent!</h1>
            <p className="text-muted-foreground text-base leading-relaxed">
              We've received your request. Our team will review your profile and get back to you within 48 hours.
            </p>
          </div>
          <Button 
            onClick={() => router.push("/dashboard")}
            className="w-full h-14 bg-linear-to-r from-blue-600 to-cyan-500 text-white font-semibold rounded-2xl shadow-lg shadow-blue-500/20"
          >
            BACK TO DASHBOARD
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Hero Section */}
      <SectionWrapper className="relative pt-24 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(37,99,235,0.06),transparent_70%)] pointer-events-none" />
        
        <ContentContainer>
          <div className="max-w-4xl text-center mx-auto">
            <Badge variant="outline" className="h-8 px-5 rounded-full border-blue-200 bg-blue-50 text-blue-600 text-[10px] font-bold uppercase tracking-[0.2em] mb-8">
              Creator Economy
            </Badge>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter leading-[0.9] mb-8">
              Share your <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-cyan-500">expertise.</span><br />
              Build your legacy.
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto mb-12">
              Join the next generation of digital masters. Verox Academy provides the platform, tools, and audience you need to transform your knowledge into a scalable business.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left max-w-4xl mx-auto">
              {/* Stats Cards */}
              {[
                { icon: Users, title: "Elite Audience", desc: "Reach thousands of motivated students globally." },
                { icon: Target, title: "80% Revenue", desc: "Industry-leading revenue split for creators." },
                { icon: ShieldCheck, title: "Smart CMS", desc: "Advanced tools to manage and scale your courses." }
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-4 p-6 rounded-3xl bg-surface border border-border/50 shadow-sm">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center shrink-0">
                    <item.icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground mb-1">{item.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ContentContainer>
      </SectionWrapper>

      {/* Form Section */}
      <ContentContainer className="pb-24">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="bg-surface border border-border/60 rounded-5xl p-8 md:p-16 shadow-2xl shadow-black/3 dark:shadow-none space-y-16">
            
            {/* Personal Info */}
            <div className="space-y-8">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-blue-600/20">01</div>
                <h2 className="text-2xl font-bold tracking-tight">Personal Details</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Full Name</label>
                  <input 
                    type="text" 
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                    placeholder="John Doe"
                    className="w-full bg-muted/30 border border-border/60 rounded-2xl px-6 py-4 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-sm font-medium text-foreground"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Professional Email</label>
                  <input 
                    type="email" 
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="john@example.com"
                    className="w-full bg-muted/30 border border-border/60 rounded-2xl px-6 py-4 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-sm font-medium text-foreground"
                  />
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Professional Bio</label>
                <textarea 
                  required
                  value={formData.bio}
                  onChange={(e) => setFormData({...formData, bio: e.target.value})}
                  rows={4}
                  placeholder="Tell us about your background and achievements..."
                  className="w-full bg-muted/30 border border-border/60 rounded-2xl px-6 py-4 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all resize-none text-sm font-medium leading-relaxed text-foreground"
                />
              </div>
            </div>

            {/* Expertise */}
            <div className="space-y-8">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-2xl bg-cyan-500 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-cyan-500/20">02</div>
                <h2 className="text-2xl font-bold tracking-tight">Expertise & Content</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Primary Expertise</label>
                  <input 
                    type="text" 
                    required
                    value={formData.expertise}
                    onChange={(e) => setFormData({...formData, expertise: e.target.value})}
                    placeholder="e.g. Next.js, Cloud Architecture"
                    className="w-full bg-muted/30 border border-border/60 rounded-2xl px-6 py-4 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-sm font-medium text-foreground"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Content Category</label>
                  <select 
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full bg-muted/30 border border-border/60 rounded-2xl px-6 py-4 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all appearance-none text-sm font-medium text-foreground"
                  >
                    <option value="technology">Technology</option>
                    <option value="design">Design</option>
                    <option value="business">Business</option>
                    <option value="marketing">Marketing</option>
                    <option value="ai">Artificial Intelligence</option>
                  </select>
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Sample Course Idea</label>
                <input 
                  type="text" 
                  required
                  value={formData.sampleCourseIdea}
                  onChange={(e) => setFormData({...formData, sampleCourseIdea: e.target.value})}
                  placeholder="e.g. Masterclass: Building Multi-tenant SaaS"
                  className="w-full bg-muted/30 border border-border/60 rounded-2xl px-6 py-4 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-sm font-medium"
                />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Why do you want to join Verox?</label>
                <textarea 
                  required
                  value={formData.whyJoin}
                  onChange={(e) => setFormData({...formData, whyJoin: e.target.value})}
                  rows={3}
                  className="w-full bg-muted/30 border border-border/60 rounded-2xl px-6 py-4 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all resize-none text-sm font-medium leading-relaxed text-foreground"
                />
              </div>
            </div>

            {/* Social & Portfolio */}
            <div className="space-y-8">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-2xl bg-indigo-500 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-indigo-500/20">03</div>
                <h2 className="text-2xl font-bold tracking-tight">Presence & Proof</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 ml-1">
                    <Send className="w-3.5 h-3.5 text-muted-foreground/60" />
                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Twitter URL</label>
                  </div>
                  <input 
                    type="url" 
                    value={formData.socialLinks.twitter}
                    onChange={(e) => setFormData({...formData, socialLinks: {...formData.socialLinks, twitter: e.target.value}})}
                    placeholder="https://twitter.com/..."
                    className="w-full bg-muted/30 border border-border/60 rounded-2xl px-6 py-4 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-sm font-medium text-foreground"
                  />
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 ml-1">
                    <Briefcase className="w-3.5 h-3.5 text-muted-foreground/60" />
                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">LinkedIn URL</label>
                  </div>
                  <input 
                    type="url" 
                    value={formData.socialLinks.linkedin}
                    onChange={(e) => setFormData({...formData, socialLinks: {...formData.socialLinks, linkedin: e.target.value}})}
                    placeholder="https://linkedin.com/in/..."
                    className="w-full bg-muted/30 border border-border/60 rounded-2xl px-6 py-4 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-sm font-medium text-foreground"
                  />
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 ml-1">
                    <Video className="w-3.5 h-3.5 text-muted-foreground/60" />
                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">YouTube URL</label>
                  </div>
                  <input 
                    type="url" 
                    value={formData.socialLinks.youtube}
                    onChange={(e) => setFormData({...formData, socialLinks: {...formData.socialLinks, youtube: e.target.value}})}
                    placeholder="https://youtube.com/..."
                    className="w-full bg-muted/30 border border-border/60 rounded-2xl px-6 py-4 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-sm font-medium text-foreground"
                  />
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 ml-1">
                    <Globe className="w-3.5 h-3.5 text-muted-foreground/60" />
                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Portfolio/Website</label>
                  </div>
                  <input 
                    type="url" 
                    required
                    value={formData.portfolioUrl}
                    onChange={(e) => setFormData({...formData, portfolioUrl: e.target.value})}
                    placeholder="https://yourwebsite.com"
                    className="w-full bg-muted/30 border border-border/60 rounded-2xl px-6 py-4 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-sm font-medium text-foreground"
                  />
                </div>
              </div>
            </div>

            <div className="pt-10">
              {status === "error" && (
                <div className="mb-8 p-5 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-600 text-sm font-semibold">
                  <AlertCircle className="w-5 h-5" />
                  {errorMessage}
                </div>
              )}
              
              <Button 
                type="submit"
                disabled={status === "loading"}
                className="w-full h-20 bg-linear-to-r from-blue-600 to-cyan-500 text-white font-bold rounded-2xl text-lg hover:scale-[1.01] transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-2xl shadow-blue-600/30 border-none"
              >
                {status === "loading" ? (
                  <>
                    <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                    SUBMITTING...
                  </>
                ) : (
                  <>
                    APPLY AS CREATOR
                    <Rocket className="w-6 h-6" />
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </ContentContainer>
    </div>
  );
}
