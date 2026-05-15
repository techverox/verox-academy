"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { CreatorApplication } from "@/types/firestore";
import { 
  Check, 
  X, 
  Eye, 
  Clock, 
  ShieldCheck, 
  AlertCircle, 
  Search, 
  Filter, 
  Trash2, 
  HelpCircle,
  Sparkles,
  ChevronRight,
  MoreVertical,
  ArrowLeft,
  Mail,
  User,
  ExternalLink,
  X as Twitter,
  Link2 as Linkedin,
  Award
} from "lucide-react";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminCreatorsPage() {
  const { user, firebaseUser, isAdmin, loading: authLoading, refreshClaims } = useAuth();
  const [applications, setApplications] = useState<CreatorApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectModal, setShowRejectModal] = useState<string | null>(null);
  const [selectedApp, setSelectedApp] = useState<CreatorApplication | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Modal State
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    type: "approve" | "delete" | null;
    applicationId: string;
  }>({ isOpen: false, type: null, applicationId: "" });

  const fetchApplications = async () => {
    try {
      const idToken = await firebaseUser?.getIdToken();
      const res = await fetch("/api/admin/creators", {
        headers: { Authorization: `Bearer ${idToken}` },
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        setApplications(data);
      } else {
        setApplications([]);
        console.error("API did not return an array:", data);
      }
    } catch (error) {
      console.error("Failed to fetch applications:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && isAdmin) fetchApplications();
  }, [user, isAdmin]);

  const handleApprove = async (applicationId: string) => {
    setConfirmModal({
      isOpen: true,
      type: "approve",
      applicationId
    });
  };

  const executeApprove = async () => {
    const { applicationId } = confirmModal;
    setConfirmModal(prev => ({ ...prev, isOpen: false }));
    
    setProcessingId(applicationId);
    try {
      const idToken = await firebaseUser?.getIdToken();
      const res = await fetch("/api/admin/creators/approve", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}` 
        },
        body: JSON.stringify({ applicationId }),
      });
      
      if (res.ok) {
        setApplications(apps => apps.map(app => 
          app.id === applicationId ? { ...app, status: "approved" as const } : app
        ));
        if (selectedApp?.id === applicationId) {
          setSelectedApp(prev => prev ? { ...prev, status: "approved" as const } : null);
        }
      }
    } catch (error) {
      console.error("Failed to approve creator:", error);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (applicationId: string) => {
    if (!rejectionReason) return alert("Please provide a rejection reason.");
    
    setProcessingId(applicationId);
    try {
      const idToken = await firebaseUser?.getIdToken();
      const res = await fetch("/api/admin/creators/reject", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}` 
        },
        body: JSON.stringify({ applicationId, reason: rejectionReason }),
      });
      
      if (res.ok) {
        setApplications(apps => apps.map(app => 
          app.id === applicationId ? { ...app, status: "rejected" as const, rejectionReason } : app
        ));
        setShowRejectModal(null);
        setRejectionReason("");
        if (selectedApp?.id === applicationId) {
          setSelectedApp(prev => prev ? { ...prev, status: "rejected" as const, rejectionReason } : null);
        }
      }
    } catch (error) {
      console.error("Failed to reject creator:", error);
    } finally {
      setProcessingId(null);
    }
  };

  const handleDelete = async (applicationId: string) => {
    setConfirmModal({
      isOpen: true,
      type: "delete",
      applicationId
    });
  };

  const executeDelete = async () => {
    const { applicationId } = confirmModal;
    setConfirmModal(prev => ({ ...prev, isOpen: false }));
    
    setProcessingId(applicationId);
    try {
      const idToken = await firebaseUser?.getIdToken();
      const res = await fetch("/api/admin/creators/delete", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}` 
        },
        body: JSON.stringify({ applicationId }),
      });
      
      if (res.ok) {
        setApplications(apps => apps.filter(app => app.id !== applicationId));
        if (selectedApp?.id === applicationId) {
          setSelectedApp(null);
        }
      }
    } catch (error) {
      console.error("Failed to delete application:", error);
    } finally {
      setProcessingId(null);
    }
  };

  if (authLoading) return (
    <div className="flex h-screen items-center justify-center bg-background text-foreground font-bold text-[10px] uppercase tracking-[0.5em] animate-pulse">
       Authorizing Access...
    </div>
  );

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center bg-surface rounded-6xl border border-destructive/20 shadow-sm mx-6">
        <div className="w-20 h-20 rounded-4xl bg-destructive/10 flex items-center justify-center text-destructive mb-8 shadow-inner">
          <AlertCircle className="w-10 h-10" />
        </div>
        <h1 className="text-3xl font-bold mb-3 text-foreground tracking-tighter">Access Denied.</h1>
        <p className="text-muted-foreground max-w-sm mb-10 font-medium">
          Administrative privileges are required for this section.
        </p>
        <Button 
          onClick={async () => {
            await refreshClaims();
            window.location.reload();
          }}
          className="h-14 px-10 rounded-2xl font-bold uppercase tracking-widest text-[11px]"
        >
          REFRESH PERMISSIONS
        </Button>
      </div>
    );
  }

  const filteredApplications = applications.filter(app => 
    app.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    app.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    app.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-16 pb-32 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Moderation Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.4em] text-blue-600">
            <ShieldCheck className="w-3.5 h-3.5" />
            Vetting System
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter text-foreground leading-none">
            Creator <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-cyan-500">Moderation.</span>
          </h1>
          <p className="text-base text-muted-foreground font-medium max-w-xl leading-relaxed">
            Review and authorize new creator applications. Audit strategic intent and ensure all applicants meet Techverox ecosystem standards.
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-foreground/40 group-focus-within:text-accent transition-colors" />
            <input 
              type="text" 
              placeholder="Search applications..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-14 pl-14 pr-8 bg-surface border border-border/40 rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-accent/5 transition-all text-foreground placeholder:text-muted-foreground/40 w-full md:w-80"
            />
          </div>
          <Button variant="outline" size="icon" className="h-14 w-14 rounded-2xl border-border/40 hover:border-accent/40">
            <Filter className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Application Analytics Cluster */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: "Pending Review", count: applications.filter(a => a.status === "pending").length, icon: Clock, color: "text-amber-500", bg: "bg-amber-500/10" },
          { label: "Approved Creators", count: applications.filter(a => a.status === "approved").length, icon: ShieldCheck, color: "text-emerald-500", bg: "bg-emerald-500/10" },
          { label: "Rejected Access", count: applications.filter(a => a.status === "rejected").length, icon: AlertCircle, color: "text-destructive", bg: "bg-destructive/10" },
        ].map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="p-10 rounded-5xl border border-border/40 bg-surface flex items-center justify-between group hover:border-accent/40 transition-all duration-500 relative overflow-hidden shadow-sm">
              <div className="space-y-1 relative z-10">
                <p className="text-[11px] font-bold text-muted-foreground/60 uppercase tracking-[0.3em]">{card.label}</p>
                <h3 className="text-5xl font-bold text-foreground tracking-tighter">{card.count}</h3>
              </div>
              <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-700 group-hover:scale-110 group-hover:rotate-6 relative z-10", card.bg)}>
                <card.icon className={cn("w-7 h-7", card.color)} />
              </div>
              <div className="absolute -bottom-6 -right-6 w-24 h-24 opacity-[0.02] group-hover:opacity-[0.06] transition-opacity duration-700">
                 <card.icon className="w-full h-full" />
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* High-Density Moderation Registry */}
      <Card className="rounded-6xl border border-border/40 bg-surface overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border/40 bg-muted/5">
                <th className="px-10 py-6 text-[10px] font-bold uppercase tracking-[0.4em] text-muted-foreground/60">Creator Applicant</th>
                <th className="px-10 py-6 text-[10px] font-bold uppercase tracking-[0.4em] text-muted-foreground/60">Category</th>
                <th className="px-10 py-6 text-[10px] font-bold uppercase tracking-[0.4em] text-muted-foreground/60">Status</th>
                <th className="px-10 py-6 text-[10px] font-bold uppercase tracking-[0.4em] text-muted-foreground/60 text-right">Moderation Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-10 py-32 text-center">
                    <div className="flex flex-col items-center justify-center gap-4 text-muted-foreground/40">
                      <div className="w-10 h-10 border-4 border-muted-foreground/10 border-t-accent rounded-full animate-spin" />
                      <p className="text-[10px] font-bold uppercase tracking-widest">Scanning Registry...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredApplications.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-10 py-32 text-center text-muted-foreground/40 font-medium">
                    <div className="flex flex-col items-center justify-center gap-4">
                       <Search className="w-12 h-12 opacity-10" />
                       <p className="text-[10px] font-bold uppercase tracking-widest">No matching applications in registry.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredApplications.map((app, i) => (
                  <motion.tr 
                    key={app.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="group hover:bg-muted/10 transition-all duration-300"
                  >
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-5">
                         <div className="h-12 w-12 rounded-2xl bg-accent/5 border border-accent/10 flex items-center justify-center text-accent font-bold text-sm shadow-inner group-hover:bg-accent/10 transition-all">
                            {app.fullName.charAt(0)}
                         </div>
                         <div className="flex flex-col">
                            <span className="font-bold text-foreground tracking-tight group-hover:text-accent transition-colors">{app.fullName}</span>
                            <span className="text-[10px] font-bold text-muted-foreground/40 mt-1 uppercase tracking-widest">{app.email}</span>
                         </div>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <Badge variant="outline" className="px-4 py-1.5 rounded-xl bg-muted/40 text-muted-foreground/60 border-none font-bold text-[9px] uppercase tracking-widest">
                        {app.category}
                      </Badge>
                    </td>
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-2.5 h-2.5 rounded-full shadow-sm",
                          app.status === "pending" ? "bg-amber-500 animate-pulse shadow-amber-500/50" :
                          app.status === "approved" ? "bg-emerald-500 shadow-emerald-500/50" : "bg-destructive shadow-destructive/50"
                        )} />
                        <span className={cn(
                          "text-[10px] font-bold uppercase tracking-widest",
                          app.status === "pending" ? "text-amber-500" :
                          app.status === "approved" ? "text-emerald-500" : "text-destructive"
                        )}>
                          {app.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-10 py-8 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0">
                        <Button 
                          variant="outline"
                          size="icon"
                          onClick={() => setSelectedApp(app)}
                          className="h-10 w-10 rounded-xl"
                        >
                          <Eye className="w-4.5 h-4.5" />
                        </Button>
                        
                        <div className="flex items-center gap-2">
                          {app.status !== "approved" && (
                            <Button 
                              variant="ghost"
                              size="icon"
                              onClick={() => handleApprove(app.id)}
                              disabled={processingId === app.id}
                              className="h-10 w-10 rounded-xl text-emerald-500 hover:bg-emerald-500/10 border border-emerald-500/20"
                            >
                              <Check className="w-5 h-5" />
                            </Button>
                          )}
                          {app.status !== "rejected" && (
                            <Button 
                              variant="ghost"
                              size="icon"
                              onClick={() => setShowRejectModal(app.id)}
                              disabled={processingId === app.id}
                              className="h-10 w-10 rounded-xl text-destructive hover:bg-destructive/10 border border-destructive/20"
                            >
                              <X className="w-5 h-5" />
                            </Button>
                          )}
                          <Button 
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(app.id)}
                            disabled={processingId === app.id}
                            className="h-10 w-10 rounded-xl text-muted-foreground/40 hover:text-destructive hover:bg-destructive/5"
                          >
                            <Trash2 className="w-4.5 h-4.5" />
                          </Button>
                        </div>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Application Intelligence Modal */}
      <AnimatePresence>
        {selectedApp && (
          <div className="fixed inset-0 z-100 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedApp(null)}
              className="absolute inset-0 bg-black/95 backdrop-blur-2xl"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-4xl bg-surface border border-white/10 rounded-7xl p-12 lg:p-20 shadow-2xl overflow-y-auto max-h-[90vh]"
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(37,99,235,0.05),transparent_70%)]" />
              
              <div className="relative z-10 space-y-16">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                   <div className="space-y-4">
                      <div className="flex items-center gap-3 text-accent font-bold text-[10px] uppercase tracking-[0.4em]">
                         <Award className="w-6 h-6" />
                         Application Profile
                      </div>
                      <h2 className="text-4xl md:text-5xl font-bold tracking-tighter text-foreground leading-none">{selectedApp.fullName}</h2>
                      <div className="flex flex-wrap gap-4">
                         <Badge variant="outline" className="bg-muted/40 text-muted-foreground/60 border-none font-bold text-[9px] tracking-widest px-4 py-2 rounded-xl">
                            <Mail className="w-3.5 h-3.5 mr-2" /> {selectedApp.email}
                         </Badge>
                         <Badge variant="outline" className="bg-muted/40 text-muted-foreground/60 border-none font-bold text-[9px] tracking-widest px-4 py-2 rounded-xl">
                            {selectedApp.category}
                         </Badge>
                         <Badge className={cn(
                           "border-none font-bold text-[9px] tracking-widest px-4 py-2 rounded-xl",
                           selectedApp.status === "pending" ? "bg-amber-500 text-white" :
                           selectedApp.status === "approved" ? "bg-emerald-500 text-white" : "bg-destructive text-white"
                         )}>
                             {selectedApp.status.toUpperCase()}
                         </Badge>
                      </div>
                   </div>
                   <Button onClick={() => setSelectedApp(null)} variant="outline" size="icon" className="h-16 w-16 rounded-4xl border-border/40">
                      <X className="w-8 h-8" />
                   </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                   <div className="lg:col-span-8 space-y-12">
                      <section className="space-y-4">
                        <label className="text-[10px] font-bold uppercase tracking-[0.4em] text-muted-foreground/60 ml-2">Applicant Biography</label>
                        <div className="p-8 rounded-5xl bg-muted/20 border border-border/40 shadow-inner">
                          <p className="text-base text-foreground leading-relaxed font-medium">{selectedApp.bio}</p>
                        </div>
                      </section>

                      <div className="grid md:grid-cols-2 gap-10">
                        <section className="space-y-4">
                          <label className="text-[10px] font-bold uppercase tracking-[0.4em] text-muted-foreground/60 ml-2">Core Expertise</label>
                          <div className="p-6 rounded-4xl bg-muted/20 border border-border/40 shadow-inner">
                            <p className="text-sm text-foreground font-bold leading-relaxed">{selectedApp.expertise}</p>
                          </div>
                        </section>
                        <section className="space-y-4">
                          <label className="text-[10px] font-bold uppercase tracking-[0.4em] text-muted-foreground/60 ml-2">Proposed Masterclass</label>
                          <div className="p-6 rounded-4xl bg-muted/20 border border-border/40 shadow-inner">
                            <p className="text-sm text-foreground font-bold leading-relaxed">{selectedApp.sampleCourseIdea}</p>
                          </div>
                        </section>
                      </div>

                      <section className="space-y-4">
                        <label className="text-[10px] font-bold uppercase tracking-[0.4em] text-muted-foreground/60 ml-2">Strategic Intent</label>
                        <div className="p-8 rounded-5xl bg-muted/20 border border-border/40 shadow-inner">
                          <p className="text-sm text-foreground italic leading-relaxed font-medium">"{selectedApp.whyJoin}"</p>
                        </div>
                      </section>
                   </div>

                   <div className="lg:col-span-4 space-y-12">
                      <section className="space-y-6">
                        <h4 className="text-[10px] font-bold uppercase tracking-[0.4em] text-muted-foreground/60">Digital Presence</h4>
                        <div className="space-y-4">
                           <a href={selectedApp.portfolioUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-5 rounded-2xl bg-muted/20 border border-border/40 hover:border-accent/40 hover:bg-accent/5 transition-all group">
                              <span className="text-xs font-bold uppercase tracking-widest text-foreground">Portfolio Portfolio</span>
                              <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-accent" />
                           </a>
                           {selectedApp.socialLinks && Object.entries(selectedApp.socialLinks).map(([platform, link]) => link ? (
                             <a key={platform} href={link as string} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-5 rounded-2xl bg-muted/20 border border-border/40 hover:border-accent/40 hover:bg-accent/5 transition-all group">
                                <span className="text-xs font-bold uppercase tracking-widest text-foreground">{platform}</span>
                                <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-accent" />
                             </a>
                           ) : null)}
                        </div>
                      </section>

                      {selectedApp.status === "rejected" && selectedApp.rejectionReason && (
                        <Card className="p-8 rounded-4xl bg-destructive/5 border-destructive/20 space-y-4">
                           <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-destructive">
                              <AlertCircle className="w-4 h-4" /> Rejection Context
                           </div>
                           <p className="text-sm text-destructive leading-relaxed font-bold italic">"{selectedApp.rejectionReason}"</p>
                        </Card>
                      )}
                   </div>
                </div>

                <div className="flex flex-wrap gap-6 pt-12 border-t border-border/40">
                  {selectedApp.status !== "approved" && (
                    <Button 
                      onClick={() => handleApprove(selectedApp.id)}
                      disabled={processingId === selectedApp.id}
                      className="flex-1 h-16 rounded-2xl font-bold uppercase tracking-[0.2em] text-[11px] bg-emerald-500 text-white hover:bg-emerald-600 shadow-2xl shadow-emerald-500/20"
                    >
                      Approve Creator Access
                    </Button>
                  )}
                  {selectedApp.status !== "rejected" && (
                    <Button 
                      onClick={() => setShowRejectModal(selectedApp.id)}
                      disabled={processingId === selectedApp.id}
                      variant="ghost"
                      className="flex-1 h-16 rounded-2xl font-bold uppercase tracking-[0.2em] text-[11px] text-destructive hover:bg-destructive/10"
                    >
                      Reject Application
                    </Button>
                  )}
                  <Button 
                    onClick={() => handleDelete(selectedApp.id)}
                    disabled={processingId === selectedApp.id}
                    variant="ghost"
                    className="h-16 w-16 rounded-2xl text-muted-foreground/40 hover:text-destructive hover:bg-destructive/5"
                  >
                    <Trash2 className="w-6 h-6" />
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Rejection Modal */}
      <AnimatePresence>
        {showRejectModal && (
          <div className="fixed inset-0 z-110 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowRejectModal(null)}
              className="absolute inset-0 bg-black/90 backdrop-blur-xl"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-surface border border-white/10 rounded-6xl p-12 shadow-2xl"
            >
              <div className="space-y-8">
                <div className="space-y-4">
                   <h2 className="text-3xl font-bold tracking-tighter text-foreground">Reject Access.</h2>
                   <p className="text-sm text-muted-foreground font-medium leading-relaxed">Please provide an operational reason for rejecting this application. This context will be shared with the applicant.</p>
                </div>
                
                <textarea 
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="e.g. Portfolio metrics do not align with platform growth strategy..."
                  className="w-full bg-muted/20 border border-border/40 rounded-2xl px-6 py-6 text-sm font-bold outline-none focus:border-destructive transition-all resize-none text-foreground placeholder:text-muted-foreground/20 shadow-inner"
                  rows={4}
                />
                
                <div className="flex gap-4">
                  <Button 
                    onClick={() => setShowRejectModal(null)}
                    variant="ghost"
                    className="flex-1 h-14 rounded-2xl font-bold uppercase tracking-widest text-[11px]"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={() => handleReject(showRejectModal)}
                    disabled={!rejectionReason || processingId === showRejectModal}
                    className="flex-1 h-14 bg-destructive text-white rounded-2xl font-bold uppercase tracking-widest text-[11px] shadow-2xl shadow-destructive/20"
                  >
                    Confirm Rejection
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ConfirmModal 
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={confirmModal.type === "approve" ? executeApprove : executeDelete}
        title={confirmModal.type === "approve" ? "Authorize Creator" : "Erase Application"}
        message={
          confirmModal.type === "approve" 
            ? "Are you sure you want to authorize this creator? This will grant immediate access to the Creator Workspace and publishing protocols."
            : "Are you sure you want to erase this application registry? This action is IRREVERSIBLE."
        }
        confirmText={confirmModal.type === "approve" ? "Authorize Now" : "Erase Permanently"}
        variant={confirmModal.type === "delete" ? "danger" : "info"}
        isLoading={processingId === confirmModal.applicationId}
      />
    </div>
  );
}
