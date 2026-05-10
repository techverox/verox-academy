"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { PayoutRequest } from "@/types/firestore";
import { 
  DollarSign, 
  Clock, 
  Check, 
  X, 
  AlertCircle, 
  Filter,
  Search,
  ExternalLink
} from "lucide-react";

export default function AdminPayoutsPage() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<PayoutRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchRequests = async () => {
    try {
      const idToken = await user?.getIdToken();
      const res = await fetch("/api/admin/payouts", {
        headers: { Authorization: `Bearer ${idToken}` },
      });
      const data = await res.json();
      setRequests(data);
    } catch (error) {
      console.error("Failed to fetch payouts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchRequests();
  }, [user]);

  const handleProcess = async (requestId: string, status: "paid" | "rejected") => {
    if (!confirm(`Are you sure you want to mark this as ${status}?`)) return;

    setProcessingId(requestId);
    try {
      const idToken = await user?.getIdToken();
      const res = await fetch("/api/admin/payouts/process", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}` 
        },
        body: JSON.stringify({ requestId, status }),
      });
      
      if (res.ok) {
        setRequests(reqs => reqs.map(r => 
          r.id === requestId ? { ...r, status } : r
        ));
      }
    } catch (error) {
      console.error("Failed to process payout:", error);
    } finally {
      setProcessingId(null);
    }
  };

  const formatCurrency = (paise: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(paise / 100);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">Payout Management</h1>
          <p className="text-zinc-500 dark:text-zinc-400 font-medium">Review and process creator withdrawal requests.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input 
              type="text" 
              placeholder="Search requests..." 
              className="pl-10 pr-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
          <button className="p-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors">
            <Filter className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
                <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-zinc-400">Creator</th>
                <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-zinc-400">Amount</th>
                <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-zinc-400">Status</th>
                <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-zinc-400">Method</th>
                <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-zinc-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-8 py-12 text-center text-zinc-500">
                    Loading requests...
                  </td>
                </tr>
              ) : requests.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-12 text-center text-zinc-500 font-medium">
                    No payout requests found.
                  </td>
                </tr>
              ) : (
                requests.map((req) => (
                  <tr key={req.id} className="group hover:bg-zinc-50/50 dark:hover:bg-zinc-800/50 transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="font-bold text-zinc-900 dark:text-zinc-50 text-sm">{req.creatorId}</span>
                        <span className="text-[10px] text-zinc-400 uppercase tracking-widest font-black mt-1">
                          {new Date(((req.requestedAt as any)._seconds || (req.requestedAt as any).seconds || 0) * 1000).toLocaleDateString()}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-sm font-black text-zinc-900 dark:text-zinc-50">
                        {formatCurrency(req.amount)}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${
                          req.status === "pending" ? "bg-orange-500" :
                          req.status === "paid" ? "bg-emerald-500" : "bg-red-500"
                        }`} />
                        <span className={`text-[10px] font-black uppercase tracking-widest ${
                          req.status === "pending" ? "text-orange-500" :
                          req.status === "paid" ? "text-emerald-500" : "text-red-500"
                        }`}>
                          {req.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{req.paymentMethod?.type}</span>
                        <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400 truncate max-w-[150px]">
                          {req.paymentMethod?.details}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {req.status === "pending" && (
                          <>
                            <button 
                              onClick={() => handleProcess(req.id, "paid")}
                              disabled={processingId === req.id}
                              className="px-4 py-2 bg-emerald-500 text-black text-[10px] font-black uppercase tracking-widest rounded-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                            >
                              MARK PAID
                            </button>
                            <button 
                              onClick={() => handleProcess(req.id, "rejected")}
                              disabled={processingId === req.id}
                              className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-all disabled:opacity-50"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </>
                        )}
                        <button className="p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors">
                          <ExternalLink className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
