"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
import { User } from "@/types/firestore";
import { subscribeToRecentUsers } from "@/lib/firestore";
import { 
  Search, 
  Filter, 
  User as UserIcon, 
  Shield, 
  GraduationCap, 
  Trash2, 
  MoreHorizontal,
  ChevronDown,
  Mail,
  Calendar,
  AlertCircle,
  HelpCircle,
  Sparkles,
  ShieldCheck,
  UserCheck,
  MoreVertical,
  Fingerprint,
  Activity,
  History,
  Lock,
  ArrowRight
} from "lucide-react";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminUsersPage() {
  const { user: currentUser, firebaseUser, isAdmin, loading: authLoading } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Modal State
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    type: "role" | "delete" | null;
    userId: string;
    data?: any;
  }>({ isOpen: false, type: null, userId: "" });

  useEffect(() => {
    if (currentUser && isAdmin) {
      setLoading(true);
      const unsub = subscribeToRecentUsers(50, (data) => {
        setUsers(data);
        setLoading(false);
      });
      return () => unsub();
    }
  }, [currentUser, isAdmin]);

  const handleUpdateRole = async (userId: string, newRole: "admin" | "creator" | "student") => {
    setConfirmModal({
      isOpen: true,
      type: "role",
      userId,
      data: { newRole }
    });
  };

  const executeRoleUpdate = async () => {
    const { userId, data } = confirmModal;
    const newRole = data.newRole;
    
    setConfirmModal(prev => ({ ...prev, isOpen: false }));
    setProcessingId(userId);
    try {
      const idToken = await firebaseUser?.getIdToken();
      const res = await fetch("/api/admin/users/update-role", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}` 
        },
        body: JSON.stringify({ userId, role: newRole }),
      });
      
      if (res.ok) {
        setUsers(prev => prev.map(u => u.uid === userId ? { ...u, role: newRole } : u));
      } else {
        const err = await res.json();
        alert(err.error || "Failed to update role");
      }
    } catch (error) {
      console.error("Failed to update role:", error);
    } finally {
      setProcessingId(null);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    setConfirmModal({
      isOpen: true,
      type: "delete",
      userId
    });
  };

  const executeDeleteUser = async () => {
    const { userId } = confirmModal;
    setConfirmModal(prev => ({ ...prev, isOpen: false }));
    
    setProcessingId(userId);
    try {
      const idToken = await firebaseUser?.getIdToken();
      const res = await fetch("/api/admin/users/delete", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}` 
        },
        body: JSON.stringify({ userId }),
      });
      
      if (res.ok) {
        setUsers(prev => prev.filter(u => u.uid !== userId));
      } else {
        const err = await res.json();
        alert(err.error || "Failed to delete user");
      }
    } catch (error) {
      console.error("Failed to delete user:", error);
    } finally {
      setProcessingId(null);
    }
  };

  const filteredUsers = users.filter(u => 
    u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (authLoading) return (
    <div className="flex h-screen items-center justify-center bg-background text-foreground font-bold text-[10px] uppercase tracking-[0.5em] animate-pulse">
       Authorizing Security Context...
    </div>
  );

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center bg-surface rounded-6xl border border-destructive/20 shadow-sm mx-6">
        <div className="w-20 h-20 rounded-4xl bg-destructive/10 flex items-center justify-center text-destructive mb-8 shadow-inner">
          <Lock className="w-10 h-10" />
        </div>
        <h1 className="text-3xl font-bold mb-3 text-foreground tracking-tighter">Security Violation.</h1>
        <p className="text-muted-foreground max-w-sm mb-10 font-medium">
          Insufficient permissions to access the Identity Registry.
        </p>
        <Button 
          onClick={async () => {
            window.location.reload();
          }}
          className="h-14 px-10 rounded-2xl font-bold uppercase tracking-widest text-[11px]"
        >
          RE-VERIFY IDENTITY
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-16 pb-32 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Identity Management Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.4em] text-blue-600">
            <ShieldCheck className="w-3.5 h-3.5" />
            Security & Governance
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter text-foreground leading-none">
            Identity <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-cyan-500">Registry.</span>
          </h1>
          <p className="text-base text-muted-foreground font-medium max-w-xl leading-relaxed">
            Administer platform-wide user identities and security access protocols. Maintain the integrity of the Techverox member network.
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-foreground/40 group-focus-within:text-accent transition-colors" />
            <input 
              type="text" 
              placeholder="Search identity registry..." 
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

      {/* Population Matrix Cluster */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: "Total Students", count: users.filter(u => u.role === "student" || !u.role).length, icon: UserIcon, color: "text-blue-500", bg: "bg-blue-500/10" },
          { label: "Authorized Creators", count: users.filter(u => u.role === "creator").length, icon: GraduationCap, color: "text-purple-500", bg: "bg-purple-500/10" },
          { label: "System Administrators", count: users.filter(u => u.role === "admin").length, icon: Shield, color: "text-destructive", bg: "bg-destructive/10" },
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
                <h3 className="text-5xl font-bold text-foreground tracking-tighter">{card.count}</h3>
              </div>
              <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-700 group-hover:scale-110 group-hover:rotate-6 relative z-10", card.bg)}>
                <card.icon className={cn("w-7 h-7", card.color)} />
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Identity Registry Table */}
      <Card className="rounded-5xl border border-border/40 bg-surface overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border/40 bg-muted/5">
                <th className="px-10 py-6 text-[10px] font-bold uppercase tracking-[0.4em] text-muted-foreground/60">Member Identity</th>
                <th className="px-10 py-6 text-[10px] font-bold uppercase tracking-[0.4em] text-muted-foreground/60">Authorization</th>
                <th className="px-10 py-6 text-[10px] font-bold uppercase tracking-[0.4em] text-muted-foreground/60">System Entry</th>
                <th className="px-10 py-6 text-[10px] font-bold uppercase tracking-[0.4em] text-muted-foreground/60 text-right">Access Controls</th>
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
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-10 py-32 text-center text-muted-foreground/40 font-medium">
                    <div className="flex flex-col items-center justify-center gap-4">
                       <Fingerprint className="w-12 h-12 opacity-10" />
                       <p className="text-[10px] font-bold uppercase tracking-widest">No matching identities in registry.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u, i) => (
                  <motion.tr 
                    key={u.uid}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="group hover:bg-muted/10 transition-all duration-300"
                  >
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-5">
                        <div className="w-12 h-12 rounded-2xl bg-muted/40 border border-border/40 flex items-center justify-center overflow-hidden shadow-inner group/avatar">
                          {u.photoURL ? (
                            <img src={u.photoURL} alt={u.name || ""} className="w-full h-full object-cover group-hover/avatar:scale-110 transition-transform duration-1000" />
                          ) : (
                            <UserIcon className="w-5 h-5 text-muted-foreground/20" />
                          )}
                        </div>
                        <div className="flex flex-col">
                           <span className="font-bold text-foreground tracking-tight group-hover:text-accent transition-colors">{u.name || "Anonymous Member"}</span>
                           <span className="text-[10px] font-bold text-muted-foreground/40 mt-1 uppercase tracking-widest flex items-center gap-2">
                             <Mail className="w-3 h-3" />
                             {u.email}
                           </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-2 h-2 rounded-full shadow-sm",
                          u.role === "admin" ? "bg-destructive shadow-destructive/50" :
                          u.role === "creator" ? "bg-purple-500 shadow-purple-500/50" : "bg-blue-500 shadow-blue-500/50"
                        )} />
                        <span className={cn(
                          "text-[10px] font-bold uppercase tracking-[0.2em]",
                          u.role === "admin" ? "text-destructive" :
                          u.role === "creator" ? "text-purple-500" : "text-blue-500"
                        )}>
                          {u.role || "student"}
                        </span>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <Badge variant="outline" className="px-4 py-1.5 rounded-xl bg-muted/40 text-muted-foreground/60 border-none font-bold text-[9px] uppercase tracking-widest">
                        <Calendar className="w-3 h-3 mr-2 opacity-40" />
                        {u.createdAt ? (() => {
                          try {
                            if (typeof u.createdAt === 'object' && 'seconds' in u.createdAt) {
                              return new Date(u.createdAt.seconds * 1000).toLocaleDateString("en-IN", { day: '2-digit', month: 'short', year: 'numeric' });
                            }
                            const date = new Date(u.createdAt as any);
                            return date.toLocaleDateString("en-IN", { day: '2-digit', month: 'short', year: 'numeric' });
                          } catch (e) { return "N/A"; }
                        })() : "N/A"}
                      </Badge>
                    </td>
                    <td className="px-10 py-8 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0">
                        <div className="relative group/menu">
                           <Button variant="secondary" className="h-10 px-6 rounded-xl text-[10px] font-bold uppercase tracking-widest border-border/40">
                              Authorize <ChevronDown className="ml-2 w-3.5 h-3.5" />
                           </Button>
                           
                           <div className="absolute right-0 top-full mt-2 w-48 bg-surface border border-border/40 rounded-2xl shadow-2xl py-3 z-50 opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all transform origin-top-right group-hover/menu:translate-y-0 translate-y-2 backdrop-blur-3xl">
                              <button onClick={() => handleUpdateRole(u.uid, "student")} className="w-full px-5 py-2.5 text-left text-[9px] font-bold uppercase tracking-widest hover:bg-muted/40 transition-all text-blue-500 flex items-center justify-between">
                                Student <UserIcon className="w-3.5 h-3.5" />
                              </button>
                              <button onClick={() => handleUpdateRole(u.uid, "creator")} className="w-full px-5 py-2.5 text-left text-[9px] font-bold uppercase tracking-widest hover:bg-muted/40 transition-all text-purple-500 flex items-center justify-between">
                                Creator <GraduationCap className="w-3.5 h-3.5" />
                              </button>
                              <div className="h-px bg-border/40 my-2" />
                              <button onClick={() => handleUpdateRole(u.uid, "admin")} className="w-full px-5 py-2.5 text-left text-[9px] font-bold uppercase tracking-widest hover:bg-muted/40 transition-all text-destructive flex items-center justify-between">
                                System Admin <Shield className="w-3.5 h-3.5" />
                              </button>
                           </div>
                        </div>

                        <Button 
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteUser(u.uid)}
                          disabled={processingId === u.uid || u.uid === currentUser?.uid}
                          className="h-10 w-10 rounded-xl text-muted-foreground/40 hover:text-destructive hover:bg-destructive/5"
                        >
                          <Trash2 className="w-4.5 h-4.5" />
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

      <ConfirmModal 
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={confirmModal.type === "role" ? executeRoleUpdate : executeDeleteUser}
        title={confirmModal.type === "role" ? "Authorize New Role" : "Terminate Identity"}
        message={
          confirmModal.type === "role" 
            ? `Are you sure you want to re-authorize this member as a ${confirmModal.data?.newRole?.toUpperCase()}? Access protocols will update immediately.`
            : "SECURITY WARNING: You are about to permanently erase this member's identity registry. This action will terminate all platform access and is IRREVERSIBLE."
        }
        confirmText={confirmModal.type === "role" ? "Authorize Now" : "Erase Permanently"}
        variant={confirmModal.type === "delete" ? "danger" : "info"}
        isLoading={processingId === confirmModal.userId}
      />
    </div>
  );
}
