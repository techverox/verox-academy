"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { CreatorApplication } from "@/types/firestore";
import { Check, X, Eye, Clock, ShieldCheck, AlertCircle, Search, Filter } from "lucide-react";

export default function AdminCreatorsPage() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<CreatorApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectModal, setShowRejectModal] = useState<string | null>(null);

  const fetchApplications = async () => {
    try {
      const idToken = await user?.getIdToken();
      const res = await fetch("/api/admin/creators", {
        headers: { Authorization: `Bearer ${idToken}` },
      });
      const data = await res.json();
      setApplications(data);
    } catch (error) {
      console.error("Failed to fetch applications:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchApplications();
  }, [user]);

  const handleApprove = async (applicationId: string) => {
    if (!confirm("Are you sure you want to approve this creator? This will grant them creator privileges.")) return;
    
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
      }
    } catch (error) {
      console.error("Failed to reject creator:", error);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">Creator Management</h1>
          <p className="text-zinc-500 dark:text-zinc-400 font-medium">Review and manage creator applications.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input 
              type="text" 
              placeholder="Search applications..." 
              className="pl-10 pr-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
          <button className="p-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors">
            <Filter className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-3xl">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-zinc-500 text-sm uppercase tracking-widest">Pending</h3>
          </div>
          <p className="text-4xl font-black text-zinc-900 dark:text-zinc-50">
            {applications.filter(a => a.status === "pending").length}
          </p>
        </div>
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-3xl">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center text-green-500">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-zinc-500 text-sm uppercase tracking-widest">Approved</h3>
          </div>
          <p className="text-4xl font-black text-zinc-900 dark:text-zinc-50">
            {applications.filter(a => a.status === "approved").length}
          </p>
        </div>
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-3xl">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500">
              <AlertCircle className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-zinc-500 text-sm uppercase tracking-widest">Rejected</h3>
          </div>
          <p className="text-4xl font-black text-zinc-900 dark:text-zinc-50">
            {applications.filter(a => a.status === "rejected").length}
          </p>
        </div>
      </div>

      {/* Applications Table */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800">
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-zinc-400">Creator</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-zinc-400">Category</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-zinc-400">Status</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-zinc-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <div className="flex items-center justify-center gap-3 text-zinc-500">
                      <div className="w-5 h-5 border-2 border-zinc-500/20 border-t-zinc-500 rounded-full animate-spin" />
                      Loading applications...
                    </div>
                  </td>
                </tr>
              ) : applications.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-zinc-500">
                    No applications found.
                  </td>
                </tr>
              ) : (
                applications.map((app) => (
                  <tr key={app.id} className="group hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-zinc-900 dark:text-zinc-50">{app.fullName}</span>
                        <span className="text-xs text-zinc-500">{app.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800 text-[10px] font-black uppercase tracking-tighter text-zinc-600 dark:text-zinc-400">
                        {app.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${
                          app.status === "pending" ? "bg-blue-500 animate-pulse" :
                          app.status === "approved" ? "bg-green-500" : "bg-red-500"
                        }`} />
                        <span className={`text-xs font-bold uppercase tracking-widest ${
                          app.status === "pending" ? "text-blue-500" :
                          app.status === "approved" ? "text-green-500" : "text-red-500"
                        }`}>
                          {app.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          className="p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        
                        {app.status === "pending" && (
                          <>
                            <button 
                              onClick={() => handleApprove(app.id)}
                              disabled={processingId === app.id}
                              className="p-2 text-green-500 hover:bg-green-500/10 rounded-lg transition-all disabled:opacity-50"
                              title="Approve"
                            >
                              <Check className="w-5 h-5" />
                            </button>
                            <button 
                              onClick={() => setShowRejectModal(app.id)}
                              disabled={processingId === app.id}
                              className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-all disabled:opacity-50"
                              title="Reject"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Rejection Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-[2rem] p-8 shadow-2xl">
            <h2 className="text-2xl font-black tracking-tight mb-4">Reject Application</h2>
            <p className="text-zinc-500 text-sm mb-6">Please provide a clear reason for rejecting this application. This will be shown to the applicant.</p>
            
            <textarea 
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g. Portfolio does not meet our quality standards..."
              className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-4 py-4 text-sm outline-none focus:ring-2 focus:ring-red-500/20 transition-all resize-none mb-6"
              rows={4}
            />
            
            <div className="flex gap-3">
              <button 
                onClick={() => setShowRejectModal(null)}
                className="flex-1 py-4 font-bold text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-2xl transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={() => handleReject(showRejectModal)}
                disabled={!rejectionReason || processingId === showRejectModal}
                className="flex-1 py-4 font-black bg-red-500 text-white rounded-2xl hover:bg-red-600 transition-all disabled:opacity-50 active:scale-95"
              >
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
