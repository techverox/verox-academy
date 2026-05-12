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
    <div className="max-w-7xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-foreground md:text-5xl leading-tight">Financial <span className="text-primary">Clearance.</span></h1>
          <p className="text-muted-foreground font-medium text-lg mt-2">Audit and authorize pending liquidation requests from the creator network.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50 group-focus-within:text-primary transition-colors" />
            <input 
              type="text" 
              placeholder="Search Ledger..." 
              className="pl-12 pr-6 py-4 bg-secondary/30 border border-border rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-primary/5 transition-all text-foreground placeholder:text-muted-foreground/30 focus:border-primary/50 w-72"
            />
          </div>
          <button className="p-4 bg-secondary/30 border border-border rounded-2xl text-muted-foreground hover:text-primary hover:bg-secondary transition-all shadow-sm hover:border-primary/30">
            <Filter className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="bg-card border border-border rounded-[2.5rem] overflow-hidden shadow-2xl shadow-primary/5 backdrop-blur-3xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-secondary/20">
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Entity</th>
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground text-center">Valuation</th>
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Protocol</th>
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Vector</th>
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground text-right">Clearance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-8 py-12 text-center text-muted-foreground">
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-5 h-5 border-2 border-muted-foreground/20 border-t-primary rounded-full animate-spin" />
                      Loading requests...
                    </div>
                  </td>
                </tr>
              ) : requests.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-12 text-center text-muted-foreground font-medium">
                    No payout requests found.
                  </td>
                </tr>
              ) : (
                requests.map((req) => (
                  <tr key={req.id} className="group hover:bg-secondary/50 transition-colors">
                    <td className="px-10 py-8">
                      <div className="flex flex-col gap-2">
                        <span className="font-black text-foreground text-base tracking-tight">{req.creatorId}</span>
                        <span className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-black bg-secondary px-3 py-1 rounded-full w-max shadow-inner">
                          {new Date(((req.requestedAt as any)._seconds || (req.requestedAt as any).seconds || 0) * 1000).toLocaleDateString("en-IN", { day: '2-digit', month: 'short' })}
                        </span>
                      </div>
                    </td>
                    <td className="px-10 py-8 text-center">
                      <span className="text-sm font-black text-primary bg-primary/5 px-4 py-2 rounded-xl border border-primary/10 inline-block shadow-sm">
                        {formatCurrency(req.amount)}
                      </span>
                    </td>
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-3">
                        <div className={`w-2.5 h-2.5 rounded-full shadow-sm ${
                          req.status === "pending" ? "bg-warning animate-pulse shadow-warning/50" :
                          req.status === "paid" ? "bg-success shadow-success/50" : "bg-destructive shadow-destructive/50"
                        }`} />
                        <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${
                          req.status === "pending" ? "text-warning" :
                          req.status === "paid" ? "text-success" : "text-destructive"
                        }`}>
                          {req.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">{req.paymentMethod?.type}</span>
                        <span className="text-[10px] font-bold text-foreground truncate max-w-[200px] bg-secondary/50 px-2 py-0.5 rounded-md">
                          {req.paymentMethod?.details}
                        </span>
                      </div>
                    </td>
                    <td className="px-10 py-8 text-right">
                      <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0">
                        {req.status === "pending" && (
                          <>
                            <button 
                              onClick={() => handleProcess(req.id, "paid")}
                              disabled={processingId === req.id}
                              className="h-10 px-6 bg-success text-success-foreground text-[10px] font-black uppercase tracking-widest rounded-xl hover:scale-[1.05] active:scale-95 transition-all disabled:opacity-50 shadow-lg shadow-success/20"
                            >
                              AUTHORIZE
                            </button>
                            <button 
                              onClick={() => handleProcess(req.id, "rejected")}
                              disabled={processingId === req.id}
                              className="p-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition-all disabled:opacity-50 border border-border hover:border-destructive/30"
                              title="Reject Clearance"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        <button className="p-3 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all rounded-xl border border-border hover:border-primary/30">
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
