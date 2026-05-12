"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { CreatorApplication } from "@/types/firestore";
import { Check, X, Eye, Clock, ShieldCheck, AlertCircle, Search, Filter, Trash2, HelpCircle } from "lucide-react";
import { ConfirmModal } from "@/components/ui/confirm-modal";

export default function AdminCreatorsPage() {
  const { user, isAdmin, loading: authLoading, refreshClaims } = useAuth();
  const [applications, setApplications] = useState<CreatorApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectModal, setShowRejectModal] = useState<string | null>(null);

  const [selectedApp, setSelectedApp] = useState<CreatorApplication | null>(null);

  // Modal State
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    type: "approve" | "delete" | null;
    applicationId: string;
  }>({ isOpen: false, type: null, applicationId: "" });

  const fetchApplications = async () => {
    try {
      const idToken = await user?.getIdToken();
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
      const idToken = await user?.getIdToken();
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
      const idToken = await user?.getIdToken();
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
      const idToken = await user?.getIdToken();
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

  if (authLoading) return <div className="p-8 text-muted-foreground animate-pulse">Checking credentials...</div>;

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center bg-card rounded-5xl border border-destructive/20 shadow-sm">
        <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center text-destructive mb-6 shadow-inner">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-black mb-2 text-foreground">Access Denied</h1>
        <p className="text-muted-foreground max-w-md mb-8">
          You do not have the required administrative privileges to view this page. 
          If you were recently granted admin rights, try refreshing your session.
        </p>
        <button 
          onClick={async () => {
            await refreshClaims();
            window.location.reload();
          }}
          className="btn-primary-premium h-14"
        >
          REFRESH PERMISSIONS
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-foreground">Creator Management</h1>
          <p className="text-muted-foreground font-medium mt-1">Review and manage creator applications.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search applications..." 
              className="pl-10 pr-4 py-2.5 bg-background border border-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all text-foreground placeholder:text-muted-foreground shadow-sm focus:border-primary"
            />
          </div>
          <button className="p-2.5 bg-background border border-border rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors shadow-sm hover:border-primary/50">
            <Filter className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card border border-border p-6 rounded-4xl shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-muted-foreground text-[10px] uppercase tracking-[0.2em]">Pending</h3>
          </div>
          <p className="text-4xl font-black text-foreground">
            {applications.filter(a => a.status === "pending").length}
          </p>
        </div>
        <div className="bg-card border border-border p-6 rounded-4xl shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-muted-foreground text-[10px] uppercase tracking-[0.2em]">Approved</h3>
          </div>
          <p className="text-4xl font-black text-foreground">
            {applications.filter(a => a.status === "approved").length}
          </p>
        </div>
        <div className="bg-card border border-border p-6 rounded-4xl shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center text-destructive">
              <AlertCircle className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-muted-foreground text-[10px] uppercase tracking-[0.2em]">Rejected</h3>
          </div>
          <p className="text-4xl font-black text-foreground">
            {applications.filter(a => a.status === "rejected").length}
          </p>
        </div>
      </div>

      {/* Applications Table */}
      <div className="bg-card border border-border rounded-4xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Creator</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Category</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Status</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <div className="flex items-center justify-center gap-3 text-muted-foreground">
                      <div className="w-5 h-5 border-2 border-muted-foreground/20 border-t-primary rounded-full animate-spin" />
                      Loading applications...
                    </div>
                  </td>
                </tr>
              ) : applications.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground font-medium">
                    No applications found.
                  </td>
                </tr>
              ) : (
                applications.map((app) => (
                  <tr key={app.id} className="group hover:bg-secondary/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-foreground line-clamp-1">{app.fullName}</span>
                        <span className="text-[10px] font-medium text-muted-foreground mt-0.5">{app.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 rounded-full bg-background border border-border text-[10px] font-black uppercase tracking-widest text-muted-foreground shadow-sm inline-block">
                        {app.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full shadow-sm ${
                          app.status === "pending" ? "bg-blue-500 animate-pulse shadow-blue-500/50" :
                          app.status === "approved" ? "bg-emerald-500 shadow-emerald-500/50" : "bg-destructive shadow-destructive/50"
                        }`} />
                        <span className={`text-[10px] font-black uppercase tracking-widest ${
                          app.status === "pending" ? "text-blue-500" :
                          app.status === "approved" ? "text-emerald-500" : "text-destructive"
                        }`}>
                          {app.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => setSelectedApp(app)}
                          className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors rounded-xl"
                          title="View Details"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        
                        <div className="flex items-center gap-1">
                          {app.status !== "approved" && (
                            <button 
                              onClick={() => handleApprove(app.id)}
                              disabled={processingId === app.id}
                              className="p-2 text-emerald-500 hover:bg-emerald-500/10 rounded-xl transition-all disabled:opacity-50 border border-transparent hover:border-emerald-500/20"
                              title="Approve"
                            >
                              <Check className="w-5 h-5" />
                            </button>
                          )}
                          {app.status !== "rejected" && (
                            <button 
                              onClick={() => setShowRejectModal(app.id)}
                              disabled={processingId === app.id}
                              className="p-2 text-destructive hover:bg-destructive/10 rounded-xl transition-all disabled:opacity-50 border border-transparent hover:border-destructive/20"
                              title="Reject"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          )}
                          <button 
                            onClick={() => handleDelete(app.id)}
                            disabled={processingId === app.id}
                            className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition-all disabled:opacity-50 border border-transparent hover:border-destructive/20"
                            title="Delete"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Application Details Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-background/80 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-2xl bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-2xl my-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black tracking-tight text-foreground">Application Details</h2>
              <button 
                onClick={() => setSelectedApp(null)}
                className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-secondary"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block mb-1">Applicant Name</label>
                  <p className="font-bold text-foreground">{selectedApp.fullName}</p>
                </div>
                <div>
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block mb-1">Email Address</label>
                  <p className="font-medium text-foreground">{selectedApp.email}</p>
                </div>
                <div>
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block mb-1">Category</label>
                  <span className="px-3 py-1 rounded-full bg-background border border-border text-[10px] font-black uppercase tracking-widest text-muted-foreground shadow-sm inline-block">
                    {selectedApp.category}
                  </span>
                </div>
                <div>
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block mb-1">Status</label>
                  <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border inline-block shadow-sm ${
                    selectedApp.status === "pending" ? "text-blue-500 bg-blue-500/10 border-blue-500/20" :
                    selectedApp.status === "approved" ? "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" : "text-destructive bg-destructive/10 border-destructive/20"
                  }`}>
                    {selectedApp.status}
                  </span>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block mb-1">Portfolio Link</label>
                <a href={selectedApp.portfolioUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium break-all">
                  {selectedApp.portfolioUrl}
                </a>
              </div>

              {selectedApp.socialLinks && Object.keys(selectedApp.socialLinks).length > 0 && (
                <div>
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block mb-2">Social Links</label>
                  <div className="flex flex-wrap gap-4">
                    {Object.entries(selectedApp.socialLinks).map(([platform, link]) => link ? (
                      <a key={platform} href={link as string} target="_blank" rel="noopener noreferrer" className="text-sm font-bold capitalize text-muted-foreground hover:text-primary transition-colors bg-secondary px-3 py-1.5 rounded-lg">
                        {platform}
                      </a>
                    ) : null)}
                  </div>
                </div>
              )}

              <div>
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block mb-2">Bio / Introduction</label>
                <div className="p-4 rounded-2xl bg-secondary/50 border border-border shadow-inner">
                  <p className="text-sm text-foreground leading-relaxed">{selectedApp.bio}</p>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block mb-2">Expertise</label>
                <div className="p-4 rounded-2xl bg-secondary/50 border border-border shadow-inner">
                  <p className="text-sm text-foreground leading-relaxed">{selectedApp.expertise}</p>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block mb-2">Sample Course Idea</label>
                <div className="p-4 rounded-2xl bg-secondary/50 border border-border shadow-inner">
                  <p className="text-sm text-foreground leading-relaxed">{selectedApp.sampleCourseIdea}</p>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block mb-2">Why Join Verox Academy?</label>
                <div className="p-4 rounded-2xl bg-secondary/50 border border-border shadow-inner">
                  <p className="text-sm text-foreground leading-relaxed">{selectedApp.whyJoin}</p>
                </div>
              </div>

              {selectedApp.status === "rejected" && selectedApp.rejectionReason && (
                <div>
                  <label className="text-[10px] font-black text-destructive uppercase tracking-widest block mb-2">Rejection Reason</label>
                  <div className="p-4 rounded-2xl bg-destructive/10 border border-destructive/20 shadow-inner">
                    <p className="text-sm text-destructive leading-relaxed font-medium">{selectedApp.rejectionReason}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-3 mt-8 pt-6 border-t border-border">
              {selectedApp.status !== "approved" && (
                <button 
                  onClick={() => handleApprove(selectedApp.id)}
                  disabled={processingId === selectedApp.id}
                  className="flex-1 min-w-[140px] py-4 text-xs font-black uppercase tracking-widest bg-emerald-500 text-white rounded-2xl hover:bg-emerald-600 transition-all disabled:opacity-50 active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
                >
                  <Check className="w-4 h-4" />
                  Approve
                </button>
              )}
              {selectedApp.status !== "rejected" && (
                <button 
                  onClick={() => setShowRejectModal(selectedApp.id)}
                  disabled={processingId === selectedApp.id}
                  className="flex-1 min-w-[140px] py-4 text-xs font-black uppercase tracking-widest bg-destructive text-destructive-foreground rounded-2xl hover:opacity-90 transition-all disabled:opacity-50 active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-destructive/20"
                >
                  <X className="w-4 h-4" />
                  Reject
                </button>
              )}
              <button 
                onClick={() => handleDelete(selectedApp.id)}
                disabled={processingId === selectedApp.id}
                className="flex-1 min-w-[140px] py-4 text-xs font-black uppercase tracking-widest text-muted-foreground hover:bg-secondary hover:text-foreground rounded-2xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 border border-border hover:border-primary/50"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-6 bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-card border border-border rounded-3xl p-8 shadow-2xl">
            <h2 className="text-2xl font-black tracking-tight mb-4 text-foreground">Reject Application</h2>
            <p className="text-muted-foreground text-sm mb-6 font-medium">Please provide a clear reason for rejecting this application. This will be shown to the applicant.</p>
            
            <textarea 
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g. Portfolio does not meet our quality standards..."
              className="w-full bg-background border border-border rounded-2xl px-4 py-4 text-sm outline-none focus:ring-2 focus:ring-destructive/20 transition-all resize-none mb-6 text-foreground placeholder:text-muted-foreground shadow-sm focus:border-destructive"
              rows={4}
            />
            
            <div className="flex gap-3">
              <button 
                onClick={() => setShowRejectModal(null)}
                className="flex-1 py-4 text-xs font-black uppercase tracking-widest text-muted-foreground hover:bg-secondary hover:text-foreground rounded-2xl transition-all border border-border"
              >
                Cancel
              </button>
              <button 
                onClick={() => handleReject(showRejectModal)}
                disabled={!rejectionReason || processingId === showRejectModal}
                className="flex-1 py-4 text-xs font-black uppercase tracking-widest bg-destructive text-destructive-foreground rounded-2xl hover:opacity-90 transition-all disabled:opacity-50 active:scale-95 shadow-lg shadow-destructive/20"
              >
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Custom Confirmation Modal */}
      <ConfirmModal 
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={confirmModal.type === "approve" ? executeApprove : executeDelete}
        title={confirmModal.type === "approve" ? "Approve Creator" : "Delete Application"}
        message={
          confirmModal.type === "approve" 
            ? "Are you sure you want to approve this creator? This will grant them creator privileges and access to the Creator Studio immediately."
            : "Are you sure you want to delete this creator application? This action cannot be undone."
        }
        confirmText={confirmModal.type === "approve" ? "Approve Now" : "Delete Permanently"}
        variant={confirmModal.type === "delete" ? "danger" : "info"}
        isLoading={processingId === confirmModal.applicationId}
      />
    </div>
  );
}
