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

  if (loading) return <div className="min-h-screen bg-black" />;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight mb-2">Earnings & <span className="text-emerald-500">Payouts</span></h1>
          <p className="text-zinc-500 font-medium tracking-tight">Track your revenue and manage your withdrawals.</p>
        </div>
        <button 
          onClick={() => setShowRequestModal(true)}
          className="flex items-center gap-2 px-8 py-4 bg-emerald-500 text-black font-black rounded-2xl hover:scale-[1.02] transition-transform active:scale-95 shadow-[0_0_40px_-10px_rgba(16,185,129,0.5)]"
        >
          <Plus className="w-5 h-5" />
          REQUEST PAYOUT
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-zinc-900/50 border border-zinc-800 p-8 rounded-[2.5rem]">
          <p className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-2">Total Revenue</p>
          <h3 className="text-3xl font-black text-white">{formatCurrency(stats?.totalRevenue || 0)}</h3>
          <div className="mt-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-500 bg-emerald-500/10 w-fit px-2 py-1 rounded-full">
            Lifetime Earnings
          </div>
        </div>
        <div className="bg-zinc-900/50 border border-zinc-800 p-8 rounded-[2.5rem]">
          <p className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-2">Pending Balance</p>
          <h3 className="text-3xl font-black text-white">{formatCurrency(stats?.pendingRevenue || 0)}</h3>
          <div className="mt-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-orange-500 bg-orange-500/10 w-fit px-2 py-1 rounded-full">
            Available for Withdrawal
          </div>
        </div>
        <div className="bg-zinc-900/50 border border-zinc-800 p-8 rounded-[2.5rem]">
          <p className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-2">Total Withdrawn</p>
          <h3 className="text-3xl font-black text-white">{formatCurrency(stats?.paidRevenue || 0)}</h3>
          <div className="mt-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-blue-500 bg-blue-500/10 w-fit px-2 py-1 rounded-full">
            Successfully Processed
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <h2 className="text-2xl font-black tracking-tight">Payout History</h2>
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-[2.5rem] overflow-hidden">
          {history.length === 0 ? (
            <div className="p-12 text-center text-zinc-500">
              No payout history found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-zinc-800">
                    <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-zinc-500">Date</th>
                    <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-zinc-500">Amount</th>
                    <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-zinc-500">Status</th>
                    <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-zinc-500 text-right">Method</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {history.map((payout) => (
                    <tr key={payout.id} className="group hover:bg-zinc-800/30 transition-colors">
                      <td className="px-8 py-6 text-sm font-bold text-zinc-300">
                        {new Date(((payout.requestedAt as any)._seconds || (payout.requestedAt as any).seconds || 0) * 1000).toLocaleDateString()}
                      </td>
                      <td className="px-8 py-6 text-sm font-black text-white">
                        {formatCurrency(payout.amount)}
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${
                            payout.status === "pending" ? "bg-orange-500 animate-pulse" :
                            payout.status === "paid" ? "bg-emerald-500" :
                            payout.status === "approved" ? "bg-blue-500" : "bg-red-500"
                          }`} />
                          <span className={`text-[10px] font-black uppercase tracking-widest ${
                            payout.status === "pending" ? "text-orange-500" :
                            payout.status === "paid" ? "text-emerald-500" :
                            payout.status === "approved" ? "text-blue-500" : "text-red-500"
                          }`}>
                            {payout.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-[3rem] p-10 shadow-2xl">
            <h2 className="text-3xl font-black tracking-tight mb-2">Request Payout</h2>
            <p className="text-zinc-500 text-sm mb-8 font-medium">Funds will be transferred within 3-5 business days after approval.</p>
            
            <form onSubmit={handleRequestPayout} className="space-y-6">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Withdraw Amount (₹)</label>
                <input 
                  type="number" 
                  required
                  min="1000"
                  value={requestAmount}
                  onChange={(e) => setRequestAmount(e.target.value)}
                  placeholder="Min ₹1,000"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl px-6 py-4 font-black text-xl outline-none focus:border-emerald-500 transition-all"
                />
                <p className="text-[10px] text-zinc-500 font-bold px-1">Available: {formatCurrency(stats?.pendingRevenue || 0)}</p>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Payment Method</label>
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    type="button"
                    onClick={() => setPayoutMethod("upi")}
                    className={`flex items-center justify-center gap-2 py-4 rounded-2xl border transition-all ${
                      payoutMethod === "upi" ? "bg-zinc-800 border-emerald-500 text-white" : "bg-zinc-900 border-zinc-800 text-zinc-500"
                    }`}
                  >
                    <CreditCard className="w-4 h-4" />
                    <span className="font-black text-xs uppercase tracking-widest">UPI</span>
                  </button>
                  <button 
                    type="button"
                    onClick={() => setPayoutMethod("bank")}
                    className={`flex items-center justify-center gap-2 py-4 rounded-2xl border transition-all ${
                      payoutMethod === "bank" ? "bg-zinc-800 border-emerald-500 text-white" : "bg-zinc-900 border-zinc-800 text-zinc-500"
                    }`}
                  >
                    <Building className="w-4 h-4" />
                    <span className="font-black text-xs uppercase tracking-widest">Bank</span>
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">
                  {payoutMethod === "upi" ? "UPI ID (VPA)" : "Account Details (Number, IFSC)"}
                </label>
                <input 
                  type="text" 
                  required
                  value={payoutDetails}
                  onChange={(e) => setPayoutDetails(e.target.value)}
                  placeholder={payoutMethod === "upi" ? "username@upi" : "Acc: XXXXXX, IFSC: XXXXX"}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl px-6 py-4 font-bold outline-none focus:border-emerald-500 transition-all"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  type="button"
                  onClick={() => setShowRequestModal(false)}
                  className="flex-1 py-4 font-bold text-zinc-500 hover:bg-zinc-900 rounded-2xl transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-2 px-8 py-4 bg-emerald-500 text-black font-black rounded-2xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? "PROCESSING..." : "SUBMIT REQUEST"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
