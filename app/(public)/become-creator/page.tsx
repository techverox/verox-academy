"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { submitCreatorApplication, getCreatorApplicationStatus } from "@/lib/firestore";
import { CreatorApplication } from "@/types/firestore";
import { CheckCircle2, AlertCircle, Rocket, Users, Target, ShieldCheck, Camera, Send, Video, Briefcase, Globe } from "lucide-react";

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

      // Check if already applied
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

  if (loading) return <div className="min-h-screen bg-black" />;

  if (isCreator) return null;

  if (existingApp) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full bg-zinc-900/50 border border-zinc-800 rounded-3xl p-8 text-center space-y-6 backdrop-blur-xl">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            {existingApp.status === "pending" ? (
              <Rocket className="w-8 h-8 text-primary animate-pulse" />
            ) : existingApp.status === "approved" ? (
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            ) : (
              <AlertCircle className="w-8 h-8 text-red-500" />
            )}
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-black tracking-tight">
              {existingApp.status === "pending" ? "Application Pending" : 
               existingApp.status === "approved" ? "Application Approved!" : 
               "Application Rejected"}
            </h1>
            <p className="text-zinc-400 text-sm leading-relaxed">
              {existingApp.status === "pending" ? "Your application is being reviewed by our team. We'll get back to you soon via email." : 
               existingApp.status === "approved" ? "Welcome to the creator community! You can now access your creator dashboard." : 
               `Unfortunately, your application was not approved. Reason: ${existingApp.rejectionReason || "Not specified."}`}
            </p>
          </div>
          {existingApp.status === "approved" && (
            <button 
              onClick={() => router.push("/creator")}
              className="w-full py-4 bg-white text-black font-black rounded-2xl hover:scale-[1.02] transition-transform active:scale-95"
            >
              GO TO CREATOR DASHBOARD
            </button>
          )}
          <button 
            onClick={() => router.push("/dashboard")}
            className="w-full py-4 bg-zinc-800 text-white font-bold rounded-2xl hover:bg-zinc-700 transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full bg-zinc-900/50 border border-zinc-800 rounded-3xl p-12 text-center space-y-6 backdrop-blur-xl">
          <div className="mx-auto w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10 text-green-500" />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-black tracking-tight">Application Sent!</h1>
            <p className="text-zinc-400 text-lg">
              We've received your request. Our team will review your profile and get back to you within 48 hours.
            </p>
          </div>
          <button 
            onClick={() => router.push("/dashboard")}
            className="w-full py-4 bg-white text-black font-black rounded-2xl hover:scale-[1.02] transition-transform active:scale-95"
          >
            BACK TO DASHBOARD
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white selection:bg-primary selection:text-black">
      {/* Hero Section */}
      <div className="relative pt-24 pb-12 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-primary/20 blur-[120px] rounded-full opacity-20 pointer-events-none" />
        
        <div className="container mx-auto px-6 relative">
          <div className="max-w-3xl">
            <span className="inline-block px-4 py-2 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-black uppercase tracking-widest text-primary mb-6">
              CREATOR ECONOMY ENGINE
            </span>
            <h1 className="text-6xl md:text-7xl font-black tracking-tighter leading-[0.9] mb-8">
              SHARE YOUR <span className="text-primary">EXPERTISE.</span><br />
              BUILD YOUR <span className="text-zinc-500 text-outline">EMPIRE.</span>
            </h1>
            <p className="text-xl text-zinc-400 leading-relaxed max-w-2xl mb-12">
              Join the next generation of elite tech educators. Verox Academy provides the platform, tools, and audience you need to transform your knowledge into a scalable business.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold mb-1">Elite Audience</h3>
                  <p className="text-sm text-zinc-500">Reach thousands of motivated tech students.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0">
                  <Target className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold mb-1">80% Revenue</h3>
                  <p className="text-sm text-zinc-500">Industry-leading revenue split for creators.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold mb-1">Smart CMS</h3>
                  <p className="text-sm text-zinc-500">Advanced tools to manage and scale your courses.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Form Section */}
      <div className="container mx-auto px-6 pb-24">
        <div className="max-w-4xl">
          <form onSubmit={handleSubmit} className="bg-zinc-900/50 border border-zinc-800 rounded-[2rem] p-8 md:p-12 backdrop-blur-xl space-y-12">
            
            {/* Personal Info */}
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-black font-black text-sm">01</div>
                <h2 className="text-2xl font-black tracking-tight">Personal Details</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-zinc-500">Full Name</label>
                  <input 
                    type="text" 
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                    placeholder="John Doe"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-4 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-zinc-500">Professional Email</label>
                  <input 
                    type="email" 
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="john@example.com"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-4 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-zinc-500">Professional Bio</label>
                <textarea 
                  required
                  value={formData.bio}
                  onChange={(e) => setFormData({...formData, bio: e.target.value})}
                  rows={4}
                  placeholder="Tell us about your background and achievements..."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-4 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-none"
                />
              </div>
            </div>

            {/* Expertise */}
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-black font-black text-sm">02</div>
                <h2 className="text-2xl font-black tracking-tight">Expertise & Content</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-zinc-500">Primary Expertise</label>
                  <input 
                    type="text" 
                    required
                    value={formData.expertise}
                    onChange={(e) => setFormData({...formData, expertise: e.target.value})}
                    placeholder="e.g. Next.js, Cloud Architecture"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-4 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-zinc-500">Content Category</label>
                  <select 
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-4 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all appearance-none"
                  >
                    <option value="technology">Technology</option>
                    <option value="design">Design</option>
                    <option value="business">Business</option>
                    <option value="marketing">Marketing</option>
                    <option value="ai">Artificial Intelligence</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-zinc-500">Sample Course Idea</label>
                <input 
                  type="text" 
                  required
                  value={formData.sampleCourseIdea}
                  onChange={(e) => setFormData({...formData, sampleCourseIdea: e.target.value})}
                  placeholder="e.g. Masterclass: Building Multi-tenant SaaS"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-4 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-zinc-500">Why do you want to join Verox?</label>
                <textarea 
                  required
                  value={formData.whyJoin}
                  onChange={(e) => setFormData({...formData, whyJoin: e.target.value})}
                  rows={3}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-4 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-none"
                />
              </div>
            </div>

            {/* Social & Portfolio */}
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-black font-black text-sm">03</div>
                <h2 className="text-2xl font-black tracking-tight">Presence & Proof</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 mb-2">
                    <Send className="w-4 h-4 text-zinc-500" />
                    <label className="text-xs font-black uppercase tracking-widest text-zinc-500">Twitter URL</label>
                  </div>
                  <input 
                    type="url" 
                    value={formData.socialLinks.twitter}
                    onChange={(e) => setFormData({...formData, socialLinks: {...formData.socialLinks, twitter: e.target.value}})}
                    placeholder="https://twitter.com/..."
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-4 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 mb-2">
                    <Briefcase className="w-4 h-4 text-zinc-500" />
                    <label className="text-xs font-black uppercase tracking-widest text-zinc-500">LinkedIn URL</label>
                  </div>
                  <input 
                    type="url" 
                    value={formData.socialLinks.linkedin}
                    onChange={(e) => setFormData({...formData, socialLinks: {...formData.socialLinks, linkedin: e.target.value}})}
                    placeholder="https://linkedin.com/in/..."
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-4 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 mb-2">
                    <Video className="w-4 h-4 text-zinc-500" />
                    <label className="text-xs font-black uppercase tracking-widest text-zinc-500">YouTube URL</label>
                  </div>
                  <input 
                    type="url" 
                    value={formData.socialLinks.youtube}
                    onChange={(e) => setFormData({...formData, socialLinks: {...formData.socialLinks, youtube: e.target.value}})}
                    placeholder="https://youtube.com/..."
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-4 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 mb-2">
                    <Globe className="w-4 h-4 text-zinc-500" />
                    <label className="text-xs font-black uppercase tracking-widest text-zinc-500">Portfolio/Website</label>
                  </div>
                  <input 
                    type="url" 
                    required
                    value={formData.portfolioUrl}
                    onChange={(e) => setFormData({...formData, portfolioUrl: e.target.value})}
                    placeholder="https://yourwebsite.com"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-4 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="pt-6">
              {status === "error" && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-500 text-sm font-bold">
                  <AlertCircle className="w-5 h-5" />
                  {errorMessage}
                </div>
              )}
              
              <button 
                type="submit"
                disabled={status === "loading"}
                className="w-full py-6 bg-primary text-black font-black rounded-2xl text-lg hover:scale-[1.01] transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-[0_0_40px_-10px_rgba(var(--primary-rgb),0.5)]"
              >
                {status === "loading" ? (
                  <>
                    <div className="w-6 h-6 border-4 border-black/20 border-t-black rounded-full animate-spin" />
                    SUBMITTING...
                  </>
                ) : (
                  <>
                    APPLY AS CREATOR
                    <Rocket className="w-6 h-6" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
