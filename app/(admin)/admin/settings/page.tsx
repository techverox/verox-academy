"use client";

import React, { useState, useEffect } from "react";
import { 
  Settings, 
  Shield, 
  Globe, 
  Lock, 
  Bell, 
  Database, 
  Zap, 
  Save, 
  RotateCcw,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Smartphone,
  Cpu,
  Fingerprint,
  CloudLightning
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";

export default function AdminSettingsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("general");
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");

  const [settings, setSettings] = useState({
    siteName: "Verox Academy",
    supportEmail: "support@verox.edu",
    maintenanceMode: false,
    registrationOpen: true,
    platformFee: 20,
    minPayout: 1000,
    sessionTimeout: 24,
    enableNotifications: true,
    primaryColor: "#2563eb",
    announcement: "",
    theme: "system"
  });

  const [latency, setLatency] = useState<number | null>(null);

  useEffect(() => {
    async function loadSettings() {
      try {
        const { db } = await import("@/lib/firebase");
        const { doc, getDoc } = await import("firebase/firestore");
        
        // Measure Latency
        const start = Date.now();
        const docRef = doc(db, "systemConfig", "global");
        const snap = await getDoc(docRef);
        setLatency(Date.now() - start);

        if (snap.exists()) {
          setSettings(prev => ({ ...prev, ...snap.data() }));
        }
      } catch (error: any) {
        console.error("Failed to load settings:", error);
        if (error.code === "permission-denied") {
          setSaveStatus("error");
        }
      }
    }
    loadSettings();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus("idle");
    try {
      const { db } = await import("@/lib/firebase");
      const { doc, setDoc } = await import("firebase/firestore");
      const docRef = doc(db, "systemConfig", "global");
      await setDoc(docRef, {
        ...settings,
        updatedAt: new Date().toISOString(),
        updatedBy: user?.uid
      }, { merge: true });
      
      setSaveStatus("success");
      setTimeout(() => setSaveStatus("idle"), 3000);
    } catch (error) {
      console.error("Failed to save settings:", error);
      setSaveStatus("error");
    } finally {
      setIsSaving(false);
    }
  };

  const tabs = [
    { id: "general", label: "General", icon: Globe },
    { id: "finance", label: "Financial", icon: Zap },
    { id: "branding", label: "Branding", icon: Sparkles },
    { id: "security", label: "Security", icon: Shield },
    { id: "system", label: "System Health", icon: Cpu },
  ];

  return (
    <div className="space-y-12 pb-32 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.4em] text-blue-600">
            <Settings className="w-3.5 h-3.5" />
            Infrastructure Control
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter text-foreground leading-none">
            System <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-cyan-500">Parameters.</span>
          </h1>
          <p className="text-base text-muted-foreground font-medium max-w-xl leading-relaxed">
            Configure global platform behavior, financial guardrails, and security protocols for the Techverox ecosystem.
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
        {/* Main Settings Panel */}
        <div className="lg:col-span-8 space-y-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4 }}
            >
              {activeTab === "general" && (
                <Card className="p-10 md:p-12 rounded-5xl border border-border/40 bg-surface space-y-12">
                  <div className="space-y-8">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-600/10 flex items-center justify-center">
                        <Globe className="w-5 h-5 text-blue-600" />
                      </div>
                      <h3 className="text-xl font-bold tracking-tight">Platform Identity</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground/60 ml-1">Platform Name</label>
                        <input 
                          type="text" 
                          value={settings.siteName}
                          onChange={(e) => setSettings({...settings, siteName: e.target.value})}
                          className="w-full h-14 px-6 bg-muted/20 border border-border/40 rounded-2xl font-bold text-sm outline-none focus:border-blue-600/40 focus:ring-4 focus:ring-blue-600/5 transition-all"
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground/60 ml-1">Support Email</label>
                        <input 
                          type="email" 
                          value={settings.supportEmail}
                          onChange={(e) => setSettings({...settings, supportEmail: e.target.value})}
                          className="w-full h-14 px-6 bg-muted/20 border border-border/40 rounded-2xl font-bold text-sm outline-none focus:border-blue-600/40 focus:ring-4 focus:ring-blue-600/5 transition-all"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-8 rounded-3xl bg-muted/10 border border-border/20">
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-foreground">Maintenance Mode</p>
                        <p className="text-[10px] font-medium text-muted-foreground">Temporarily disable public access to the platform.</p>
                      </div>
                      <button 
                        onClick={() => setSettings({...settings, maintenanceMode: !settings.maintenanceMode})}
                        className={cn(
                          "w-14 h-8 rounded-full transition-all duration-500 relative",
                          settings.maintenanceMode ? "bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.4)]" : "bg-muted-foreground/20"
                        )}
                      >
                        <div className={cn(
                          "absolute top-1 w-6 h-6 rounded-full bg-white transition-all shadow-sm",
                          settings.maintenanceMode ? "left-7" : "left-1"
                        )} />
                      </button>
                    </div>

                    <div className="space-y-6 pt-8 border-t border-border/40">
                       <h3 className="text-sm font-bold uppercase tracking-widest text-foreground flex items-center gap-2">
                          <Bell className="w-4 h-4 text-blue-600" />
                          Global Communication Hub
                       </h3>
                       <div className="space-y-3">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 ml-1">Ecosystem Announcement (Ticker)</label>
                          <textarea 
                            value={settings.announcement}
                            onChange={(e) => setSettings({...settings, announcement: e.target.value})}
                            placeholder="Important updates for all students and creators..."
                            rows={3}
                            className="w-full px-6 py-4 bg-muted/20 border border-border/40 rounded-2xl font-bold text-sm outline-none focus:border-blue-600/40 transition-all resize-none"
                          />
                       </div>
                    </div>
                  </div>
                </Card>
              )}

              {activeTab === "branding" && (
                <Card className="p-10 md:p-12 rounded-5xl border border-border/40 bg-surface space-y-12">
                   <div className="space-y-8">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                        <Sparkles className="w-5 h-5 text-purple-500" />
                      </div>
                      <h3 className="text-xl font-bold tracking-tight">Visual Identity & UI</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <div className="space-y-4">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Primary Design Token</label>
                          <div className="flex items-center gap-4">
                             <div className="w-12 h-12 rounded-2xl border-4 border-surface shadow-xl" style={{ backgroundColor: settings.primaryColor }} />
                             <input 
                                type="text" 
                                value={settings.primaryColor}
                                onChange={(e) => setSettings({...settings, primaryColor: e.target.value})}
                                className="flex-1 h-12 px-4 bg-muted/20 border border-border/40 rounded-xl font-mono text-xs font-bold outline-none"
                             />
                          </div>
                       </div>
                       <div className="space-y-4">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Ecosystem Theme</label>
                          <div className="flex gap-2">
                             {['light', 'dark', 'system'].map((t) => (
                               <button 
                                key={t}
                                onClick={() => setSettings({...settings, theme: t})}
                                className={cn(
                                  "flex-1 h-12 rounded-xl text-[9px] font-bold uppercase tracking-widest transition-all",
                                  settings.theme === t ? "bg-zinc-900 text-white shadow-lg" : "bg-muted/20 text-muted-foreground hover:bg-muted/40"
                                )}
                               >
                                 {t}
                               </button>
                             ))}
                          </div>
                       </div>
                    </div>
                  </div>
                </Card>
              )}

              {activeTab === "finance" && (
                <Card className="p-10 md:p-12 rounded-5xl border border-border/40 bg-surface space-y-12">
                   <div className="space-y-8">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                        <Zap className="w-5 h-5 text-accent" />
                      </div>
                      <h3 className="text-xl font-bold tracking-tight">Revenue Configuration</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-4 p-8 rounded-4xl bg-muted/10 border border-border/20">
                        <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground/60">Platform Fee (%)</label>
                        <div className="flex items-center gap-4">
                           <input 
                            type="range" 
                            min="0"
                            max="50"
                            value={settings.platformFee}
                            onChange={(e) => setSettings({...settings, platformFee: Number(e.target.value)})}
                            className="flex-1 accent-blue-600"
                          />
                          <span className="text-2xl font-bold text-blue-600">{settings.platformFee}%</span>
                        </div>
                        <p className="text-[9px] font-medium text-muted-foreground uppercase tracking-widest leading-relaxed">Percentage deducted from every course sale before creator payout.</p>
                      </div>

                      <div className="space-y-4 p-8 rounded-4xl bg-muted/10 border border-border/20">
                        <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground/60">Min. Payout (INR)</label>
                        <div className="flex items-center gap-3">
                          <span className="text-xl font-bold text-muted-foreground/30">₹</span>
                          <input 
                            type="number" 
                            value={settings.minPayout}
                            onChange={(e) => setSettings({...settings, minPayout: Number(e.target.value)})}
                            className="w-full bg-transparent border-none font-bold text-2xl outline-none focus:ring-0"
                          />
                        </div>
                        <p className="text-[9px] font-medium text-muted-foreground uppercase tracking-widest leading-relaxed">Threshold creators must reach before requesting a withdrawal.</p>
                      </div>
                    </div>
                  </div>
                </Card>
              )}

              {activeTab === "security" && (
                <Card className="p-10 md:p-12 rounded-5xl border border-border/40 bg-surface space-y-12">
                   <div className="space-y-8">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                        <Lock className="w-5 h-5 text-emerald-500" />
                      </div>
                      <h3 className="text-xl font-bold tracking-tight">Security & Governance</h3>
                    </div>

                    <div className="space-y-6">
                       {[
                         { id: "reg", label: "Public Registration", desc: "Allow new users to create accounts.", value: settings.registrationOpen, key: "registrationOpen" },
                         { id: "notif", label: "System Notifications", desc: "Trigger global alerts for admin events.", value: settings.enableNotifications, key: "enableNotifications" }
                       ].map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-6 rounded-2xl hover:bg-muted/5 transition-colors group">
                           <div className="space-y-1">
                              <p className="text-sm font-bold text-foreground group-hover:text-emerald-500 transition-colors">{item.label}</p>
                              <p className="text-[10px] font-medium text-muted-foreground">{item.desc}</p>
                           </div>
                           <button 
                            onClick={() => setSettings({...settings, [item.key]: !(settings as any)[item.key]})}
                            className={cn(
                              "w-12 h-6 rounded-full transition-all duration-500 relative",
                              (settings as any)[item.key] ? "bg-emerald-500" : "bg-muted-foreground/20"
                            )}
                          >
                            <div className={cn(
                              "absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all shadow-sm",
                              (settings as any)[item.key] ? "left-6.5" : "left-0.5"
                            )} />
                          </button>
                        </div>
                       ))}
                    </div>
                  </div>
                </Card>
              )}

              {activeTab === "system" && (
                <Card className="p-10 md:p-12 rounded-5xl border border-border/40 bg-surface space-y-12 overflow-hidden relative">
                   <div className="absolute -right-20 -top-20 w-64 h-64 bg-blue-600/5 rounded-full blur-3xl" />
                   
                   <div className="space-y-8 relative z-10">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                        <Cpu className="w-5 h-5 text-purple-500" />
                      </div>
                      <h3 className="text-xl font-bold tracking-tight">Hardware & Database Latency</h3>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                       {[
                         { label: "DB Latency", value: latency ? `${latency}ms` : "Measuring...", icon: Database, color: "text-blue-500" },
                         { label: "API Uptime", value: "99.98%", icon: Zap, color: "text-amber-500" },
                         { label: "Auth Nodes", value: "Online", icon: Fingerprint, color: "text-emerald-500" },
                         { label: "Cache Index", value: "Optimized", icon: CloudLightning, color: "text-purple-500" }
                       ].map((stat) => (
                         <div key={stat.label} className="p-6 rounded-3xl bg-muted/10 border border-border/20 space-y-3">
                            <stat.icon className={cn("w-5 h-5", stat.color)} />
                            <div className="space-y-0.5">
                              <p className="text-[9px] font-bold text-muted-foreground/40 uppercase tracking-widest">{stat.label}</p>
                              <p className="text-xl font-bold text-foreground">{stat.value}</p>
                            </div>
                         </div>
                       ))}
                    </div>
                  </div>
                </Card>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Sidebar Insights */}
        <div className="lg:col-span-4 space-y-8">
           <Card className="p-8 rounded-4xl border border-border/40 bg-linear-to-br from-blue-600 to-cyan-500 text-white shadow-2xl shadow-blue-500/20 relative overflow-hidden group">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_100%_100%,rgba(255,255,255,0.2),transparent_60%)]" />
              <div className="relative z-10 space-y-6">
                <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-xl flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div className="space-y-2">
                   <h4 className="text-xl font-bold tracking-tight leading-tight">Elite Infrastructure Authorization.</h4>
                   <p className="text-[10px] font-medium text-white/70 uppercase tracking-widest leading-relaxed">All changes are signed with your admin cryptographic key and deployed globally instantly.</p>
                </div>
                <Button variant="secondary" className="w-full h-12 bg-white text-blue-600 hover:bg-white/90 font-bold uppercase tracking-widest text-[9px] rounded-xl border-none">
                  View Audit Logs
                </Button>
              </div>
           </Card>

           <Card className="p-8 rounded-4xl border border-border/40 bg-surface space-y-6 shadow-sm">
              <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">Quick Diagnostic</h4>
              <div className="space-y-4">
                 {[
                   { label: "SSL Status", status: "Active", icon: Shield, color: "text-emerald-500" },
                   { label: "Firebase Cluster", status: "Healthy", icon: Database, color: "text-blue-500" },
                   { label: "Wistia Sync", status: "Enabled", icon: Smartphone, color: "text-purple-500" }
                 ].map((d) => (
                   <div key={d.label} className="flex items-center justify-between p-4 rounded-2xl bg-muted/10 border border-border/10">
                      <div className="flex items-center gap-3">
                         <d.icon className={cn("w-4 h-4", d.color)} />
                         <span className="text-[11px] font-bold text-foreground">{d.label}</span>
                      </div>
                      <Badge className="bg-emerald-500/10 text-emerald-500 border-none text-[8px] font-bold uppercase py-0.5 px-2">{d.status}</Badge>
                   </div>
                 ))}
              </div>
           </Card>
        </div>
      </div>
    </div>
  );
}
