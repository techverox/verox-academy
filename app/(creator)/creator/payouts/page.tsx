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
  Plus,
  ArrowRight,
  TrendingUp,
  History,
  Wallet,
  Sparkles,
  ArrowLeft,
  Smartphone,
  ShieldCheck,
  ChevronDown
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

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
      maximumFractionDigits: 0
    }).format(paise / 100);
  };

  if (loading) return (
    <div className="space-y-12 animate-pulse pb-20">
      <div className="flex justify-between items-end">
        <div className="space-y-4">
          <div className="h-4 w-32 bg-muted rounded-full" />
          <div className="h-10 w-64 bg-muted rounded-xl" />
        </div>
        <div className="h-12 w-48 bg-muted rounded-2xl" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map(i => <div key={i} className="h-36 bg-muted rounded-5xl border border-border/40" />)}
      </div>
      <div className="h-96 bg-muted rounded-6xl" />
    </div>
  );

  return (
    <div className="space-y-16 pb-32 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Payouts Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="space-y-4">
          <Link href="/creator/" className="text-[10px] font-bold uppercase tracking-[0.4em] text-muted-foreground/60 hover:text-blue-600 transition-all flex items-center gap-2 group w-fit">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Dashboard
          </Link>
          <div className="space-y-2">
             <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.4em] text-blue-600">
                <Sparkles className="w-3.5 h-3.5" />
                Payout Center
             </div>
             <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter text-foreground leading-none">
               Manage <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-cyan-500">Earnings.</span>
             </h1>
          </div>
          <p className="text-base text-muted-foreground font-medium max-w-xl leading-relaxed">
             Review your platform earnings, manage secure payment methods, and request withdrawals across the Techverox network.
          </p>
        </div>
        <Button onClick={() => setShowRequestModal(true)} className="h-16 px-10 rounded-2xl bg-linear-to-r from-blue-600 to-cyan-500 text-white font-bold uppercase tracking-widest text-[11px] shadow-2xl shadow-blue-500/20 group border-none">
          <Plus className="mr-2 w-5 h-5 transition-transform group-hover:rotate-90" /> Request Withdrawal
        </Button>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: "Total Revenue", value: formatCurrency(stats?.totalRevenue || 0), icon: DollarSign, color: "text-accent", bg: "bg-accent/10", desc: "Lifetime earnings" },
          { label: "Pending Balance", value: formatCurrency(stats?.pendingRevenue || 0), icon: Clock, color: "text-amber-500", bg: "bg-amber-500/10", desc: "Available to withdraw" },
          { label: "Total Paid", value: formatCurrency(stats?.paidRevenue || 0), icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-500/10", desc: "Successfully disbursed" },
        ].map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="p-10 rounded-5xl border border-border/40 bg-surface group hover:border-accent/40 transition-all duration-500 relative overflow-hidden shadow-sm">
              <div className="flex items-start justify-between mb-8 relative z-10">
                <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-700 group-hover:scale-110 group-hover:rotate-6", card.bg)}>
                  <card.icon className={cn("w-7 h-7", card.color)} />
                </div>
                <Badge className="bg-muted/40 text-muted-foreground border-none font-bold text-[8px] uppercase tracking-widest py-1 px-3">Live Data</Badge>
              </div>
              <div className="relative z-10 space-y-1">
                <p className="text-[11px] font-bold text-muted-foreground/60 uppercase tracking-[0.3em]">{card.label}</p>
                <h3 className="text-4xl font-bold text-foreground tracking-tighter">{card.value}</h3>
                <p className="text-[10px] font-bold text-muted-foreground/30 uppercase tracking-widest pt-2">{card.desc}</p>
              </div>
              <div className="absolute -bottom-8 -right-8 w-32 h-32 opacity-[0.02] group-hover:opacity-[0.06] transition-opacity duration-700">
                 <card.icon className="w-full h-full" />
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Payout History Table */}
      <div className="space-y-10">
        <div className="flex items-center justify-between">
           <h2 className="text-2xl font-bold tracking-tighter text-foreground flex items-center gap-3">
             <History className="w-6 h-6 text-accent" />
             Withdrawal History
           </h2>
           <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">{history.length} Transactions</span>
        </div>
        
        <Card className="rounded-6xl border border-border/40 bg-surface overflow-hidden shadow-sm">
          {history.length === 0 ? (
            <div className="p-32 text-center space-y-6">
               <div className="w-20 h-20 bg-muted/40 rounded-4xl flex items-center justify-center mx-auto mb-4 border border-border/40 shadow-inner">
                  <CreditCard className="w-10 h-10 text-muted-foreground/20" />
               </div>
               <div className="space-y-2">
                 <h3 className="text-xl font-bold tracking-tight">No history found.</h3>
                 <p className="text-sm text-muted-foreground max-w-xs mx-auto font-medium">Your withdrawal history will appear here once you initiate your first payout.</p>
               </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-border/40 bg-muted/5">
                    <th className="px-10 py-6 text-[10px] font-bold uppercase tracking-[0.4em] text-muted-foreground/60">Reference Date</th>
                    <th className="px-10 py-6 text-[10px] font-bold uppercase tracking-[0.4em] text-muted-foreground/60">Withdrawal Amount</th>
                    <th className="px-10 py-6 text-[10px] font-bold uppercase tracking-[0.4em] text-muted-foreground/60">Status</th>
                    <th className="px-10 py-6 text-[10px] font-bold uppercase tracking-[0.4em] text-muted-foreground/60 text-right">Method</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {history.map((payout, i) => (
                    <motion.tr 
                      key={payout.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="group hover:bg-muted/10 transition-all duration-300"
                    >
                      <td className="px-10 py-8 text-sm font-bold text-foreground">
                        {new Date(((payout.requestedAt as any)._seconds || (payout.requestedAt as any).seconds || 0) * 1000).toLocaleDateString("en-IN", { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-10 py-8 text-2xl font-bold text-foreground tracking-tighter">
                        {formatCurrency(payout.amount)}
                      </td>
                      <td className="px-10 py-8">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-2.5 h-2.5 rounded-full shadow-sm",
                            payout.status === "pending" ? "bg-amber-500 animate-pulse shadow-amber-500/50" :
                            payout.status === "paid" ? "bg-emerald-500 shadow-emerald-500/50" :
                            payout.status === "approved" ? "bg-accent shadow-accent/50" : "bg-destructive shadow-destructive/50"
                          )} />
                          <span className={cn(
                            "text-[10px] font-bold uppercase tracking-[0.25em]",
                            payout.status === "pending" ? "text-amber-500" :
                            payout.status === "paid" ? "text-emerald-500" :
                            payout.status === "approved" ? "text-accent" : "text-destructive"
                          )}>
                            {payout.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-10 py-8 text-right">
                        <Badge variant="outline" className="px-4 py-1.5 rounded-xl text-[9px] font-bold uppercase tracking-widest bg-muted/40 text-muted-foreground border-none">
                          {payout.paymentMethod?.type}
                        </Badge>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      {/* Withdrawal Request Modal */}
      <AnimatePresence>
        {showRequestModal && (
          <div className="fixed inset-0 z-100 flex items-center justify-center p-6">
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setShowRequestModal(false)}
               className="absolute inset-0 bg-black/90 backdrop-blur-xl"
             />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-surface border border-white/10 rounded-4xl p-8 md:p-10 shadow-2xl overflow-hidden"
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(37,99,235,0.05),transparent_70%)]" />
              
              <div className="relative z-10 space-y-8">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-accent font-bold text-[9px] uppercase tracking-[0.4em]">
                     <ShieldCheck className="w-4 h-4" />
                     Secure Withdrawal
                  </div>
                  <h2 className="text-3xl font-bold tracking-tighter text-foreground leading-none">Request Payout.</h2>
                  <p className="text-sm text-muted-foreground font-medium">Funds are processed within 3-5 business days.</p>
                </div>
                
                <form onSubmit={handleRequestPayout} className="space-y-8">
                  <div className="space-y-4">
                    <label className="text-[10px] font-bold uppercase tracking-[0.4em] text-muted-foreground/60 ml-2">Withdrawal Amount (INR)</label>
                    <div className="relative group">
                       <span className="absolute left-6 top-1/2 -translate-y-1/2 font-bold text-muted-foreground/20 text-2xl transition-colors group-focus-within:text-accent/30">₹</span>
                      <input 
                        type="number" 
                        required
                        min="1000"
                        value={requestAmount}
                        onChange={(e) => setRequestAmount(e.target.value)}
                        placeholder="Min ₹1,000"
                        className="w-full bg-muted/20 border border-border/40 rounded-2xl pl-12 pr-6 py-5 font-bold text-3xl outline-none focus:border-accent/40 focus:ring-4 focus:ring-accent/5 transition-all text-foreground tracking-tighter"
                      />
                    </div>
                    <div className="flex items-center justify-between px-2">
                      <p className="text-[10px] text-muted-foreground/40 font-bold uppercase tracking-widest">Available Balance</p>
                      <p className="text-[10px] text-accent font-bold uppercase tracking-widest">{formatCurrency(stats?.pendingRevenue || 0)}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-bold uppercase tracking-[0.4em] text-muted-foreground/60 ml-2">Payment Method</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button 
                        type="button"
                        onClick={() => setPayoutMethod("upi")}
                        className={cn(
                          "flex flex-col items-center justify-center gap-3 py-5 rounded-3xl border transition-all duration-700 shadow-sm",
                          payoutMethod === "upi" ? "bg-accent text-white border-accent shadow-2xl shadow-accent/20 scale-[1.02]" : "bg-muted/10 border-border/40 text-muted-foreground/40 hover:bg-muted/20 hover:text-foreground"
                        )}
                      >
                        <Smartphone className="w-6 h-6" />
                        <span className="font-bold text-[9px] uppercase tracking-[0.3em]">UPI Transfer</span>
                      </button>
                      <button 
                        type="button"
                        onClick={() => setPayoutMethod("bank")}
                        className={cn(
                          "flex flex-col items-center justify-center gap-3 py-5 rounded-3xl border transition-all duration-700 shadow-sm",
                          payoutMethod === "bank" ? "bg-accent text-white border-accent shadow-2xl shadow-accent/20 scale-[1.02]" : "bg-muted/10 border-border/40 text-muted-foreground/40 hover:bg-muted/20 hover:text-foreground"
                        )}
                      >
                        <Building className="w-6 h-6" />
                        <span className="font-bold text-[9px] uppercase tracking-[0.3em]">Bank Wire</span>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-bold uppercase tracking-[0.4em] text-muted-foreground/60 ml-2">
                      {payoutMethod === "upi" ? "UPI Identifier (VPA)" : "Bank Account Details"}
                    </label>
                    <input 
                      type="text" 
                      required
                      value={payoutDetails}
                      onChange={(e) => setPayoutDetails(e.target.value)}
                      placeholder={payoutMethod === "upi" ? "username@upi" : "Acc No: XXXXXX, IFSC: XXXXX"}
                      className="w-full bg-muted/20 border border-border/40 rounded-2xl px-8 py-6 font-bold outline-none focus:border-accent/40 transition-all text-foreground"
                    />
                  </div>

                  <div className="flex gap-4 pt-8 border-t border-border/40">
                    <Button 
                      type="button"
                      variant="ghost"
                      onClick={() => setShowRequestModal(false)}
                      className="flex-1 h-14 rounded-xl text-[10px] font-bold uppercase tracking-widest"
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit"
                      isLoading={isSubmitting}
                      className="flex-[1.5] h-14 bg-linear-to-r from-blue-600 to-cyan-500 text-white rounded-xl font-bold uppercase tracking-[0.2em] text-[10px] shadow-2xl shadow-blue-500/20 group border-none"
                    >
                      Confirm Payout <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
