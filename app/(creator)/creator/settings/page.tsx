"use client";

import React, { useState, useEffect } from "react";
import { 
  User, 
  Settings, 
  CreditCard, 
  Globe, 
  Shield, 
  Bell, 
  Camera, 
  Save, 
  RotateCcw,
  CheckCircle2,
  Smartphone,
  Building,
  Send,
  Briefcase,
  Terminal,
  Mail,
  Sparkles,
  Link as LinkIcon
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { getUserProfile, updateUserProfile } from "@/lib/firestore";

export default function CreatorSettingsPage() {
  const { user, profile } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");

  const [formData, setFormData] = useState({
    name: "",
    bio: "",
    website: "",
    twitter: "",
    linkedin: "",
    upi: "",
    bankAccount: "",
    emailNotifications: true,
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || "",
        bio: profile.bio || "",
        website: profile.website || "",
        twitter: profile.twitter || "",
        linkedin: profile.linkedin || "",
        upi: profile.payoutMethod?.upi || "",
        bankAccount: profile.payoutMethod?.bankAccount || "",
        emailNotifications: true,
      });
    }
  }, [profile]);

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      await updateUserProfile(user.uid, {
        name: formData.name,
        bio: formData.bio,
        website: formData.website,
        twitter: formData.twitter,
        linkedin: formData.linkedin,
        // In a real app, you'd structure payout methods properly
      });
      setSaveStatus("success");
      setTimeout(() => setSaveStatus("idle"), 3000);
    } catch (error) {
      console.error("Failed to update profile:", error);
      setSaveStatus("error");
    } finally {
      setIsSaving(false);
    }
  };

  const tabs = [
    { id: "profile", label: "Studio Profile", icon: User },
    { id: "payouts", label: "Payout Methods", icon: CreditCard },
    { id: "notifications", label: "Alerts", icon: Bell },
  ];

  return (
    <div className="space-y-12 pb-32 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.4em] text-blue-600">
            <Settings className="w-3.5 h-3.5" />
            Creator Configuration
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter text-foreground leading-none">
            Studio <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-cyan-500">Preferences.</span>
          </h1>
          <p className="text-base text-muted-foreground font-medium max-w-xl leading-relaxed">
            Manage your professional identity, withdrawal destinations, and platform interaction protocols.
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <Button 
            onClick={handleSave} 
            disabled={isSaving}
            className="h-14 px-8 bg-linear-to-r from-blue-600 to-cyan-500 text-white rounded-2xl font-bold uppercase tracking-widest text-[10px] shadow-2xl shadow-blue-500/20 group border-none"
          >
            {isSaving ? (
              <RotateCcw className="w-4 h-4 animate-spin mr-2" />
            ) : saveStatus === "success" ? (
              <CheckCircle2 className="w-4 h-4 mr-2" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            {isSaving ? "Syncing..." : saveStatus === "success" ? "Saved" : "Save Changes"}
          </Button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 p-1.5 bg-muted/20 border border-border/40 rounded-3xl w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-2.5 px-6 py-3 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all duration-500",
              activeTab === tab.id 
                ? "bg-surface text-blue-600 shadow-xl shadow-blue-600/5 border border-border/40 scale-105" 
                : "text-muted-foreground/60 hover:text-foreground hover:bg-muted/40"
            )}
          >
            <tab.icon className={cn("w-4 h-4", activeTab === tab.id ? "text-blue-600" : "text-muted-foreground/40")} />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4 }}
            >
              {activeTab === "profile" && (
                <Card className="p-10 md:p-12 rounded-5xl border border-border/40 bg-surface space-y-12">
                  <div className="space-y-12">
                    {/* Profile Branding */}
                    <div className="flex flex-col md:flex-row gap-10">
                       <div className="relative group">
                          <div className="w-32 h-32 rounded-4xl bg-muted border-2 border-dashed border-border/40 overflow-hidden flex items-center justify-center group-hover:border-blue-600/40 transition-all cursor-pointer">
                            {user?.photoURL ? (
                              <img src={user.photoURL} alt="" className="w-full h-full object-cover group-hover:opacity-50 transition-opacity" />
                            ) : (
                              <User className="w-10 h-10 text-muted-foreground/20" />
                            )}
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                               <Camera className="w-6 h-6 text-blue-600" />
                            </div>
                          </div>
                          <Badge className="absolute -bottom-2 -right-2 bg-blue-600 text-white border-4 border-surface font-bold text-[8px] uppercase tracking-widest py-1 px-3">VERIFIED</Badge>
                       </div>
                       
                       <div className="flex-1 space-y-6">
                          <div className="space-y-2">
                             <h3 className="text-xl font-bold tracking-tight">Public Identity</h3>
                             <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest leading-relaxed">This information is displayed on your creator portfolio and course pages.</p>
                          </div>
                          <div className="grid grid-cols-1 gap-6">
                             <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 ml-1">Creator Name</label>
                                <input 
                                  type="text" 
                                  value={formData.name}
                                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                                  className="w-full h-14 px-6 bg-muted/20 border border-border/40 rounded-2xl font-bold text-sm outline-none focus:border-blue-600/40 transition-all"
                                />
                             </div>
                             <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 ml-1">Professional Bio</label>
                                <textarea 
                                  value={formData.bio}
                                  onChange={(e) => setFormData({...formData, bio: e.target.value})}
                                  rows={4}
                                  className="w-full px-6 py-4 bg-muted/20 border border-border/40 rounded-2xl font-bold text-sm outline-none focus:border-blue-600/40 transition-all resize-none"
                                  placeholder="Tell students about your expertise..."
                                />
                             </div>
                          </div>
                       </div>
                    </div>

                    <div className="space-y-6 pt-8 border-t border-border/40">
                       <h3 className="text-sm font-bold uppercase tracking-widest text-foreground flex items-center gap-2">
                          <Globe className="w-4 h-4 text-blue-600" />
                          Social & Professional Connect
                       </h3>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {[
                            { id: "website", label: "Website URL", icon: LinkIcon, placeholder: "https://" },
                            { id: "twitter", label: "Twitter handle", icon: Send, placeholder: "@username" },
                            { id: "linkedin", label: "LinkedIn Profile", icon: Briefcase, placeholder: "https://linkedin.com/in/..." },
                            { id: "github", label: "GitHub Profile", icon: Terminal, placeholder: "https://github.com/..." }
                          ].map((social) => (
                            <div key={social.id} className="relative group">
                               <social.icon className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-blue-600 transition-colors" />
                               <input 
                                  type="text" 
                                  value={(formData as any)[social.id]}
                                  onChange={(e) => setFormData({...formData, [social.id]: e.target.value})}
                                  placeholder={social.placeholder}
                                  className="w-full h-14 pl-14 pr-6 bg-muted/20 border border-border/40 rounded-2xl font-bold text-sm outline-none focus:border-blue-600/40 transition-all"
                               />
                            </div>
                          ))}
                       </div>
                    </div>
                  </div>
                </Card>
              )}

              {activeTab === "payouts" && (
                <Card className="p-10 md:p-12 rounded-5xl border border-border/40 bg-surface space-y-12">
                   <div className="space-y-10">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                        <CreditCard className="w-5 h-5 text-accent" />
                      </div>
                      <h3 className="text-xl font-bold tracking-tight">Withdrawal Hub</h3>
                    </div>

                    <div className="space-y-8">
                       <div className="p-8 rounded-4xl bg-muted/10 border border-border/20 space-y-6">
                          <div className="flex items-center gap-3">
                             <Smartphone className="w-5 h-5 text-accent" />
                             <p className="text-sm font-bold">UPI Identification (VPA)</p>
                          </div>
                          <input 
                            type="text" 
                            value={formData.upi}
                            onChange={(e) => setFormData({...formData, upi: e.target.value})}
                            placeholder="username@bank"
                            className="w-full h-14 px-6 bg-surface border border-border/40 rounded-2xl font-bold text-sm outline-none focus:border-accent/40 transition-all"
                          />
                          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest leading-relaxed">Most creators use UPI for near-instant settlements.</p>
                       </div>

                       <div className="p-8 rounded-4xl bg-muted/10 border border-border/20 space-y-6">
                          <div className="flex items-center gap-3">
                             <Building className="w-5 h-5 text-accent" />
                             <p className="text-sm font-bold">Direct Bank Deposit</p>
                          </div>
                          <textarea 
                            value={formData.bankAccount}
                            onChange={(e) => setFormData({...formData, bankAccount: e.target.value})}
                            placeholder="Account Number: XXXXXXXXXX\nIFSC Code: XXXXXXXXXX"
                            rows={3}
                            className="w-full px-6 py-4 bg-surface border border-border/40 rounded-2xl font-bold text-sm outline-none focus:border-accent/40 transition-all resize-none"
                          />
                       </div>
                    </div>
                  </div>
                </Card>
              )}

              {activeTab === "notifications" && (
                <Card className="p-10 md:p-12 rounded-5xl border border-border/40 bg-surface space-y-12">
                   <div className="space-y-8">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                        <Bell className="w-5 h-5 text-purple-500" />
                      </div>
                      <h3 className="text-xl font-bold tracking-tight">Platform Interaction Alerts</h3>
                    </div>

                    <div className="space-y-4">
                       {[
                         { id: "sale", label: "Course Enrollment Alerts", desc: "Notify me every time a student enrolls in my course.", value: true },
                         { id: "review", label: "Review Notifications", desc: "Notify me when a student leaves a rating or feedback.", value: true },
                         { id: "payout", label: "Payout Confirmations", desc: "Get notified when your withdrawal is processed.", value: true },
                         { id: "system", label: "System Announcements", desc: "Receive updates about platform features and policies.", value: true }
                       ].map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-6 rounded-2xl hover:bg-muted/5 transition-colors group border border-transparent hover:border-border/20">
                           <div className="space-y-1">
                              <p className="text-sm font-bold text-foreground transition-colors">{item.label}</p>
                              <p className="text-[10px] font-medium text-muted-foreground">{item.desc}</p>
                           </div>
                           <button 
                            onClick={() => {}}
                            className={cn(
                              "w-12 h-6 rounded-full transition-all duration-500 relative bg-emerald-500"
                            )}
                          >
                            <div className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all shadow-sm left-6.5" />
                          </button>
                        </div>
                       ))}
                    </div>
                  </div>
                </Card>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Sidebar Status */}
        <div className="lg:col-span-4 space-y-8">
           <Card className="p-8 rounded-4xl border border-border/40 bg-linear-to-br from-blue-600 to-cyan-500 text-white shadow-2xl shadow-blue-500/20 relative overflow-hidden group">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_100%_100%,rgba(255,255,255,0.2),transparent_60%)]" />
              <div className="relative z-10 space-y-6">
                <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-xl flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div className="space-y-2">
                   <h4 className="text-xl font-bold tracking-tight leading-tight">Elite Creator Registry Authorization.</h4>
                   <p className="text-[10px] font-medium text-white/70 uppercase tracking-widest leading-relaxed">Your professional credentials are hashed and stored on the Techverox secure network.</p>
                </div>
              </div>
           </Card>

           <Card className="p-8 rounded-4xl border border-border/40 bg-surface space-y-6 shadow-sm">
              <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">Profile Completeness</h4>
              <div className="space-y-6">
                 <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div className="h-full w-4/5 bg-linear-to-r from-blue-600 to-cyan-500 rounded-full" />
                 </div>
                 <div className="space-y-4">
                    {[
                      { label: "Photo Verified", status: true },
                      { label: "Payout Details", status: true },
                      { label: "Social Connect", status: false }
                    ].map((step) => (
                      <div key={step.label} className="flex items-center justify-between">
                         <span className="text-[11px] font-bold text-muted-foreground">{step.label}</span>
                         {step.status ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <div className="w-4 h-4 rounded-full border-2 border-muted" />}
                      </div>
                    ))}
                 </div>
              </div>
           </Card>
        </div>
      </div>
    </div>
  );
}
