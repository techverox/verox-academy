"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { getCreatorStats, getPayoutHistory, requestPayout } from "@/lib/firestore";
import { CreatorStats, PayoutRequest } from "@/types/firestore";
import { 
  DollarSign, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight, 
  CreditCard,
  Building,
  Plus
} from "lucide-react";

export default function CreatorPayoutsPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<CreatorStats | null>(null);
  const [history, setHistory] = useState<PayoutRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestAmount, setRequestAmount] = useState("");
  const [payoutMethod, setPayoutMethod] = useState<"upi" | "bank">("upi");
  const [payoutDetails, setPayoutDetails] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    if (!user) return;
    const [statsData, historyData] = await Promise.all([
      getCreatorStats(user.uid),
      getPayoutHistory(user.uid)
    ]);
    setStats(statsData);
    setHistory(historyData);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleRequestPayout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !stats) return;

    const amountPaise = Number(requestAmount) * 100;
    if (amountPaise > stats.pendingRevenue) {
      return alert("Insufficient balance.");
    }
    if (amountPaise < 100000) { // ₹1,000 minimum
      return alert("Minimum payout is ₹1,000.");
    }

    setIsSubmitting(true);
    try {
      await requestPayout(user.uid, amountPaise, {
        type: payoutMethod,
        details: payoutDetails
      });
      setShowRequestModal(false);
      fetchData();
    } catch (error) {
      console.error("Failed to request payout:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (paise: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(paise / 100);
  };

  if (loading) return (
    <div className="max-w-6xl mx-auto space-y-8 animate-pulse">
      <div className="h-10 w-48 bg-secondary/50 rounded-lg" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map(i => <div key={i} className="h-32 bg-secondary/30 rounded-xl border border-border" />)}
      </div>
      <div className="h-96 bg-secondary/20 rounded-xl border border-border" />
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Payouts</h1>
          <p className="mt-2 text-sm text-muted-foreground max-w-xl">Manage your earnings and monitor your educational performance.</p>
        </div>
        <button 
          onClick={() => setShowRequestModal(true)}
          className="flex items-center justify-center gap-2 h-11 px-6 bg-primary text-primary-foreground font-bold rounded-lg hover:bg-primary/90 transition-all shadow-sm text-xs"
        >
          <Plus className="w-4 h-4" />
          Request Payout
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card border border-border p-6 rounded-xl relative overflow-hidden group shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-4">Total Revenue</p>
          <h3 className="text-2xl font-bold text-foreground tracking-tight">{formatCurrency(stats?.totalRevenue || 0)}</h3>
          <div className="mt-6 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/5 w-fit px-3 py-1 rounded-md border border-primary/10">
            Lifetime Earnings
          </div>
        </div>
        <div className="bg-card border border-border p-6 rounded-xl relative overflow-hidden group shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-4">Pending Balance</p>
          <h3 className="text-2xl font-bold text-foreground tracking-tight">{formatCurrency(stats?.pendingRevenue || 0)}</h3>
          <div className="mt-6 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-warning bg-warning/5 w-fit px-3 py-1 rounded-md border border-warning/10">
            Available for withdrawal
          </div>
        </div>
        <div className="bg-card border border-border p-6 rounded-xl relative overflow-hidden group shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-4">Total Paid</p>
          <h3 className="text-2xl font-bold text-foreground tracking-tight">{formatCurrency(stats?.paidRevenue || 0)}</h3>
          <div className="mt-6 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-success bg-success/5 w-fit px-3 py-1 rounded-md border border-success/10">
            Successfully Disbursed
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-3">
          Payout History
          <span className="h-px flex-1 bg-border" />
        </h2>
        <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
          {history.length === 0 ? (
            <div className="p-16 text-center space-y-4">
              <p className="text-xs font-medium text-muted-foreground">No payout history found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-border bg-secondary/30">
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Date</th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Amount</th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Status</th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-muted-foreground text-right">Method</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {history.map((payout) => (
                    <tr key={payout.id} className="group hover:bg-secondary/20 transition-all duration-300">
                      <td className="px-10 py-8 text-sm font-bold text-foreground">
                        {new Date(((payout.requestedAt as any)._seconds || (payout.requestedAt as any).seconds || 0) * 1000).toLocaleDateString("en-IN", { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-10 py-8 text-lg font-black text-foreground">
                        {formatCurrency(payout.amount)}
                      </td>
                      <td className="px-10 py-8">
                        <div className="flex items-center gap-3">
                          <div className={`w-2.5 h-2.5 rounded-full shadow-sm ${
                            payout.status === "pending" ? "bg-warning animate-pulse shadow-warning/50" :
                            payout.status === "paid" ? "bg-success shadow-success/50" :
                            payout.status === "approved" ? "bg-primary shadow-primary/50" : "bg-destructive shadow-destructive/50"
                          }`} />
                          <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${
                            payout.status === "pending" ? "text-warning" :
                            payout.status === "paid" ? "text-success" :
                            payout.status === "approved" ? "text-primary" : "text-destructive"
                          }`}>
                            {payout.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-10 py-8 text-right">
                        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] bg-secondary px-3 py-1 rounded-md shadow-inner">
                          {payout.paymentMethod?.type}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Request Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-background/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="w-full max-w-lg bg-card border border-border rounded-xl p-8 shadow-xl relative overflow-hidden">
            <h2 className="text-2xl font-bold tracking-tight mb-2 text-foreground">Request Withdrawal</h2>
            <p className="text-muted-foreground text-sm mb-8">Payouts are processed within 3-5 business days after verification.</p>
            
            <form onSubmit={handleRequestPayout} className="space-y-8">
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground ml-2">Liquidation Value (INR)</label>
                <div className="relative">
                   <span className="absolute left-8 top-1/2 -translate-y-1/2 font-black text-muted-foreground/30 text-2xl">₹</span>
                  <input 
                    type="number" 
                    required
                    min="1000"
                    value={requestAmount}
                    onChange={(e) => setRequestAmount(e.target.value)}
                    placeholder="Min ₹1,000"
                    className="w-full bg-secondary/30 border border-border rounded-2xl pl-16 pr-8 py-6 font-black text-2xl outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all text-foreground"
                  />
                </div>
                <div className="flex items-center justify-between px-2">
                  <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">Available Capital</p>
                  <p className="text-[10px] text-primary font-black uppercase tracking-widest">{formatCurrency(stats?.pendingRevenue || 0)}</p>
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground ml-2">Transfer Protocol</label>
                <div className="grid grid-cols-2 gap-4">
                  <button 
                    type="button"
                    onClick={() => setPayoutMethod("upi")}
                    className={`flex flex-col items-center justify-center gap-3 py-6 rounded-4xl border transition-all duration-500 shadow-sm ${
                      payoutMethod === "upi" ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20 scale-[1.02]" : "bg-secondary/30 border-border text-muted-foreground hover:bg-secondary/50"
                    }`}
                  >
                    <CreditCard className="w-6 h-6" />
                    <span className="font-black text-[10px] uppercase tracking-[0.2em]">Unified Payment (UPI)</span>
                  </button>
                  <button 
                    type="button"
                    onClick={() => setPayoutMethod("bank")}
                    className={`flex flex-col items-center justify-center gap-3 py-6 rounded-4xl border transition-all duration-500 shadow-sm ${
                      payoutMethod === "bank" ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20 scale-[1.02]" : "bg-secondary/30 border-border text-muted-foreground hover:bg-secondary/50"
                    }`}
                  >
                    <Building className="w-6 h-6" />
                    <span className="font-black text-[10px] uppercase tracking-[0.2em]">SWIFT / Bank Wire</span>
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground ml-2">
                  {payoutMethod === "upi" ? "Virtual Private Address (VPA)" : "Account Metadata (ID, Routing)"}
                </label>
                <input 
                  type="text" 
                  required
                  value={payoutDetails}
                  onChange={(e) => setPayoutDetails(e.target.value)}
                  placeholder={payoutMethod === "upi" ? "username@upi" : "ID: XXXXXX, ROUTE: XXXXX"}
                  className="w-full bg-secondary/30 border border-border rounded-2xl px-8 py-5 font-bold outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all text-foreground"
                />
              </div>

              <div className="flex gap-4 pt-6 border-t border-border">
                <button 
                  type="button"
                  onClick={() => setShowRequestModal(false)}
                  className="flex-1 h-11 text-xs font-bold text-muted-foreground hover:bg-secondary rounded-lg transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-[1.5] h-11 bg-primary text-primary-foreground font-bold rounded-lg hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-xs"
                >
                  {isSubmitting ? (
                    <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  ) : (
                    <>
                      Request Payout
                      <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
