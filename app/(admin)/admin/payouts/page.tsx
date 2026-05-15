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
  ExternalLink,
  ShieldCheck,
  TrendingUp,
  History,
  CreditCard,
  Building,
  Smartphone,
  ArrowUpRight,
  MoreVertical,
  ChevronRight,
  Sparkles,
  ArrowRight
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminPayoutsPage() {
  const { user, firebaseUser } = useAuth();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [selectedPayout, setSelectedPayout] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchRequests = async () => {
    try {
      const idToken = await firebaseUser?.getIdToken();
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
    if (!confirm(`Are you sure you want to mark this transaction as ${status}?`)) return;

    setProcessingId(requestId);
    try {
      const idToken = await firebaseUser?.getIdToken();
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
        {[1, 2, 3].map(i => <div key={i} className="h-36 bg-muted rounded-4xl border border-border/40" />)}
      </div>
      <div className="h-96 bg-muted rounded-5xl" />
    </div>
  );

  const filteredRequests = requests.filter(req => 
    req.creator?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    req.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-16 pb-32 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Financial Moderation Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.4em] text-blue-600">
            <ShieldCheck className="w-3.5 h-3.5" />
            Financial Governance
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter text-foreground leading-none">
            Payout <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-cyan-500">Moderation.</span>
          </h1>
          <p className="text-base text-muted-foreground font-medium max-w-xl leading-relaxed">
            Audit and authorize creator withdrawal requests. Maintain financial integrity and ecosystem liquidity.
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-foreground/40 group-focus-within:text-accent transition-colors" />
            <input 
              type="text" 
              placeholder="Search payout registry..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-14 pl-14 pr-8 bg-surface border border-border/40 rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-accent/5 transition-all text-foreground placeholder:text-muted-foreground/40 w-full md:w-80"
            />
          </div>
          <Button variant="secondary" size="icon" className="h-14 w-14 rounded-2xl border-border/40 hover:border-accent/40">
            <Filter className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Financial Matrix Cluster */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: "Pending Authorization", amount: requests.filter(r => r.status === "pending").reduce((acc, curr) => acc + curr.amount, 0), count: requests.filter(r => r.status === "pending").length, icon: Clock, color: "text-amber-500", bg: "bg-amber-500/10" },
          { label: "Successfully Disbursed", amount: requests.filter(r => r.status === "paid").reduce((acc, curr) => acc + curr.amount, 0), count: requests.filter(r => r.status === "paid").length, icon: ShieldCheck, color: "text-emerald-500", bg: "bg-emerald-500/10" },
          { label: "Flagged / Rejected", amount: requests.filter(r => r.status === "rejected").reduce((acc, curr) => acc + curr.amount, 0), count: requests.filter(r => r.status === "rejected").length, icon: AlertCircle, color: "text-destructive", bg: "bg-destructive/10" },
        ].map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="p-10 rounded-4xl border border-border/40 bg-surface flex items-center justify-between group hover:border-accent/40 transition-all duration-500 relative overflow-hidden shadow-sm">
              <div className="space-y-1 relative z-10">
                <p className="text-[11px] font-bold text-muted-foreground/60 uppercase tracking-[0.3em]">{card.label}</p>
                <h3 className="text-4xl font-bold text-foreground tracking-tighter">{formatCurrency(card.amount)}</h3>
                <p className="text-[10px] font-bold text-muted-foreground/30 uppercase tracking-widest pt-1">{card.count} Transactions</p>
              </div>
              <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-700 group-hover:scale-110 group-hover:rotate-6 relative z-10", card.bg)}>
                <card.icon className={cn("w-7 h-7", card.color)} />
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Transaction Moderation Registry */}
      <Card className="rounded-5xl border border-border/40 bg-surface overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border/40 bg-muted/5">
                <th className="px-10 py-6 text-[10px] font-bold uppercase tracking-[0.4em] text-muted-foreground/60">Creator Entity</th>
                <th className="px-10 py-6 text-[10px] font-bold uppercase tracking-[0.4em] text-muted-foreground/60">Amount (INR)</th>
                <th className="px-10 py-6 text-[10px] font-bold uppercase tracking-[0.4em] text-muted-foreground/60">Status</th>
                <th className="px-10 py-6 text-[10px] font-bold uppercase tracking-[0.4em] text-muted-foreground/60">Payment Details</th>
                <th className="px-10 py-6 text-[10px] font-bold uppercase tracking-[0.4em] text-muted-foreground/60 text-right">Processing</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-10 py-32 text-center">
                    <div className="flex flex-col items-center justify-center gap-4 text-muted-foreground/40">
                      <div className="w-10 h-10 border-4 border-muted-foreground/10 border-t-accent rounded-full animate-spin" />
                      <p className="text-[10px] font-bold uppercase tracking-widest">Auditing Ledger...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-10 py-32 text-center text-muted-foreground/40 font-medium">
                    <div className="flex flex-col items-center justify-center gap-4">
                       <DollarSign className="w-12 h-12 opacity-10" />
                       <p className="text-[10px] font-bold uppercase tracking-widest">No transactions found matching search.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredRequests.map((req, i) => (
                  <motion.tr 
                    key={req.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="group hover:bg-muted/10 transition-all duration-300"
                  >
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl border border-border/40 overflow-hidden shrink-0 bg-muted/20">
                          {req.creator?.photoURL ? (
                            <img src={req.creator.photoURL} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground/30">
                              <DollarSign className="w-6 h-6" />
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <span className="font-bold text-foreground tracking-tight group-hover:text-blue-600 transition-colors">
                            {req.creator?.name || "Unknown Creator"}
                          </span>
                          <span className="text-[9px] font-bold text-muted-foreground/40 uppercase tracking-[0.2em]">
                            {new Date(((req.requestedAt as any)._seconds || (req.requestedAt as any).seconds || 0) * 1000).toLocaleDateString("en-IN", { day: '2-digit', month: 'short', year: 'numeric' })}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <span className="text-2xl font-bold text-foreground tracking-tighter">
                        {formatCurrency(req.amount)}
                      </span>
                    </td>
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-2.5 h-2.5 rounded-full shadow-sm",
                          req.status === "pending" ? "bg-amber-500 animate-pulse shadow-amber-500/50" :
                          req.status === "paid" ? "bg-emerald-500 shadow-emerald-500/50" : "bg-destructive shadow-destructive/50"
                        )} />
                        <span className={cn(
                          "text-[10px] font-bold uppercase tracking-widest",
                          req.status === "pending" ? "text-amber-500" :
                          req.status === "paid" ? "text-emerald-500" : "text-destructive"
                        )}>
                          {req.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-2">
                           {req.paymentMethod?.type === "upi" ? <Smartphone className="w-3.5 h-3.5 text-accent" /> : <Building className="w-3.5 h-3.5 text-accent" />}
                           <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">{req.paymentMethod?.type}</span>
                        </div>
                        <span className="text-[10px] font-bold text-foreground truncate max-w-[240px] bg-muted/40 px-3 py-1 rounded-lg border border-border/20">
                          {req.paymentMethod?.details}
                        </span>
                      </div>
                    </td>
                    <td className="px-10 py-8 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0">
                        {req.status === "pending" && (
                          <>
                            <Button 
                              onClick={() => handleProcess(req.id, "paid")}
                              disabled={processingId === req.id}
                              className="h-10 px-6 bg-linear-to-r from-blue-600 to-cyan-500 text-white text-[10px] font-bold uppercase tracking-widest rounded-xl hover:scale-[1.05] transition-all shadow-xl shadow-blue-600/20 border-none"
                            >
                              Authorize
                            </Button>
                            <Button 
                              variant="ghost"
                              size="icon"
                              onClick={() => handleProcess(req.id, "rejected")}
                              disabled={processingId === req.id}
                              className="h-10 w-10 rounded-xl text-destructive hover:bg-destructive/10 border border-destructive/20"
                              title="Reject Clearance"
                            >
                              <X className="w-4.5 h-4.5" />
                            </Button>
                          </>
                        )}
                          <Button 
                            variant="secondary" 
                            size="icon" 
                            onClick={() => setSelectedPayout(req)}
                            className="h-10 w-10 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                          >
                            <ExternalLink className="w-4.5 h-4.5" />
                          </Button>
                        </div>
                      </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
      {/* Sales Breakdown Detail Modal */}
      <AnimatePresence>
        {selectedPayout && (
          <div className="fixed inset-0 z-100 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedPayout(null)}
              className="absolute inset-0 bg-black/95 backdrop-blur-2xl"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              className="relative w-full max-w-4xl bg-surface border border-white/5 rounded-6xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]"
            >
              <div className="absolute top-0 inset-x-0 h-1 bg-linear-to-r from-blue-600 to-cyan-500" />
              
              {/* Modal Header */}
              <div className="p-10 border-b border-border/40 bg-muted/5 flex items-start justify-between">
                <div className="flex items-center gap-6">
                  <div className="h-16 w-16 rounded-3xl border border-border/40 overflow-hidden bg-muted/20">
                    <img src={selectedPayout.creator?.photoURL || ""} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="space-y-1">
                    <h2 className="text-3xl font-bold tracking-tighter">{selectedPayout.creator?.name}</h2>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.4em]">Audit Registry for {selectedPayout.id}</p>
                  </div>
                </div>
                <div className="text-right space-y-1">
                  <p className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">Withdrawal Total</p>
                  <p className="text-3xl font-bold text-blue-600 tracking-tighter">{formatCurrency(selectedPayout.amount)}</p>
                </div>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-10 space-y-10 custom-scrollbar">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold tracking-tighter flex items-center gap-3">
                      <TrendingUp className="w-5 h-5 text-accent" />
                      Sales Audit Ledger
                    </h3>
                    <Badge className="bg-muted text-muted-foreground border-none font-bold text-[9px] uppercase tracking-widest px-3 py-1">Verified Receipts</Badge>
                  </div>

                  <div className="rounded-3xl border border-border/40 overflow-hidden bg-muted/10">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-muted/20 border-b border-border/40">
                          <th className="px-6 py-4 text-[9px] font-bold uppercase tracking-widest text-muted-foreground/60">Asset Title</th>
                          <th className="px-6 py-4 text-[9px] font-bold uppercase tracking-widest text-muted-foreground/60">Buyer Identity</th>
                          <th className="px-6 py-4 text-[9px] font-bold uppercase tracking-widest text-muted-foreground/60">Revenue</th>
                          <th className="px-6 py-4 text-[9px] font-bold uppercase tracking-widest text-muted-foreground/60 text-right">Timestamp</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/20">
                        {selectedPayout.sales?.map((sale: any) => (
                          <tr key={sale.id} className="hover:bg-muted/20 transition-colors">
                            <td className="px-6 py-4">
                              <span className="text-xs font-bold text-foreground block truncate max-w-[200px]">{sale.metadata?.courseTitle || "Premium Access"}</span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-[10px] font-medium text-muted-foreground block">{sale.metadata?.userEmail}</span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-xs font-bold text-emerald-500">+{formatCurrency(sale.creatorRevenue)}</span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <span className="text-[9px] font-bold text-muted-foreground/40 uppercase">
                                {new Date(((sale.createdAt as any)._seconds || (sale.createdAt as any).seconds || 0) * 1000).toLocaleDateString()}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-8 pt-6 border-t border-border/40">
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 flex items-center gap-2">
                      <CreditCard className="w-4 h-4" />
                      Verification Nodes
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/10 border border-border/20">
                        <span className="text-[10px] font-bold uppercase text-muted-foreground/40">Ecosystem Tax (20%)</span>
                        <span className="text-sm font-bold text-foreground">{formatCurrency(selectedPayout.amount * 0.25)}</span>
                      </div>
                      <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/10 border border-border/20">
                        <span className="text-[10px] font-bold uppercase text-muted-foreground/40">Liquidity Status</span>
                        <span className="text-xs font-bold text-emerald-500 uppercase tracking-widest">Optimized</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 flex items-center gap-2">
                      <Building className="w-4 h-4" />
                      Destination Parameters
                    </h4>
                    <div className="p-5 rounded-2xl bg-muted/10 border border-border/20 space-y-2">
                      <p className="text-[10px] font-bold uppercase text-muted-foreground/40 tracking-widest">{selectedPayout.paymentMethod?.type}</p>
                      <p className="text-sm font-bold text-foreground break-all">{selectedPayout.paymentMethod?.details}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-10 border-t border-border/40 bg-muted/5 flex items-center justify-end gap-4">
                <Button variant="ghost" onClick={() => setSelectedPayout(null)} className="h-14 px-8 rounded-2xl font-bold uppercase tracking-widest text-[10px]">Close Audit</Button>
                {selectedPayout.status === "pending" && (
                   <Button 
                    onClick={() => {
                      handleProcess(selectedPayout.id, "paid");
                      setSelectedPayout(null);
                    }}
                    className="h-14 px-10 rounded-2xl bg-linear-to-r from-blue-600 to-cyan-500 text-white font-bold uppercase tracking-widest text-[10px] shadow-2xl shadow-blue-600/20 border-none"
                   >
                     Authorize Disbursement
                   </Button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
