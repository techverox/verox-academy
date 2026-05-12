"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
import { User } from "@/types/firestore";
import { subscribeToAllUsers } from "@/lib/firestore";
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
  HelpCircle
} from "lucide-react";
import { ConfirmModal } from "@/components/ui/confirm-modal";

export default function AdminUsersPage() {
  const { user: currentUser, isAdmin, loading: authLoading } = useAuth();
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
      const unsub = subscribeToAllUsers((data) => {
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
      const idToken = await currentUser?.getIdToken();
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
      const idToken = await currentUser?.getIdToken();
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

  if (authLoading) return <div className="p-8 text-muted-foreground animate-pulse">Checking credentials...</div>;

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center bg-card rounded-xl border border-destructive/10 shadow-sm">
        <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center text-destructive mb-6 shadow-inner">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h1 className="text-xl font-bold mb-2 text-foreground">Access Denied</h1>
        <p className="text-sm text-muted-foreground max-w-md mb-8">You do not have administrative privileges.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">User Management</h1>
          <p className="mt-2 text-sm text-muted-foreground max-w-2xl">Manage identities and system-wide access for all platform members.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative group w-full md:w-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50 group-focus-within:text-primary transition-colors" />
            <input 
              type="text" 
              placeholder="Search users..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-11 pr-4 py-2.5 bg-secondary/30 border border-border rounded-lg text-sm font-medium outline-none focus:ring-4 focus:ring-primary/5 transition-all text-foreground placeholder:text-muted-foreground/30 focus:border-primary/50 w-full md:w-80 shadow-sm"
            />
          </div>
          <button className="p-2.5 bg-secondary/30 border border-border rounded-lg text-muted-foreground hover:text-primary transition-all shadow-sm">
            <Filter className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card border border-border p-6 rounded-xl relative overflow-hidden group shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 rounded-lg bg-blue-500/5 flex items-center justify-center text-blue-500 border border-blue-500/10">
              <UserIcon className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-muted-foreground text-[10px] uppercase tracking-wider">Students</h3>
          </div>
          <p className="text-3xl font-bold text-foreground tracking-tight">
            {users.filter(u => u.role === "student" || !u.role).length}
          </p>
          <div className="mt-6 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-blue-500 bg-blue-500/5 w-fit px-3 py-1 rounded-md border border-blue-500/10">
            Active Learners
          </div>
        </div>
        <div className="bg-card border border-border p-6 rounded-xl relative overflow-hidden group shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 rounded-lg bg-purple-500/5 flex items-center justify-center text-purple-500 border border-purple-500/10">
              <GraduationCap className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-muted-foreground text-[10px] uppercase tracking-wider">Creators</h3>
          </div>
          <p className="text-3xl font-bold text-foreground tracking-tight">
            {users.filter(u => u.role === "creator").length}
          </p>
          <div className="mt-6 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-purple-500 bg-purple-500/5 w-fit px-3 py-1 rounded-md border border-purple-500/10">
            Content Creators
          </div>
        </div>
        <div className="bg-card border border-border p-6 rounded-xl relative overflow-hidden group shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 rounded-lg bg-destructive/5 flex items-center justify-center text-destructive border border-destructive/10">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-muted-foreground text-[10px] uppercase tracking-wider">Admins</h3>
          </div>
          <p className="text-3xl font-bold text-foreground tracking-tight">
            {users.filter(u => u.role === "admin").length}
          </p>
           <div className="mt-6 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-destructive bg-destructive/5 w-fit px-3 py-1 rounded-md border border-destructive/10">
            Platform Administrators
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-secondary/20">
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">User</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Role</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Joined</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-muted-foreground text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-8 py-12 text-center text-muted-foreground">
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-5 h-5 border-2 border-muted-foreground/20 border-t-primary rounded-full animate-spin" />
                      Fetching users...
                    </div>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-8 py-12 text-center text-muted-foreground font-medium">No users found matching your search.</td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.uid} className="group hover:bg-secondary/50 transition-colors">
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-5">
                        <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center overflow-hidden shadow-inner group/avatar">
                          {u.photoURL ? (
                            <img src={u.photoURL} alt={u.name || ""} className="w-full h-full object-cover group-hover/avatar:scale-110 transition-transform duration-500" />
                          ) : (
                            <UserIcon className="w-6 h-6 text-muted-foreground/30" />
                          )}
                        </div>
                        <div className="flex flex-col gap-1.5">
                        <span className="font-bold text-foreground text-sm group-hover:text-primary transition-colors">{u.name || "Anonymous User"}</span>
                          <span className="text-[10px] font-bold text-muted-foreground flex items-center gap-2">
                            <Mail className="w-3.5 h-3.5 text-primary/30" />
                            {u.email}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full shadow-sm ${
                          u.role === "admin" ? "bg-destructive shadow-destructive/50" :
                          u.role === "creator" ? "bg-purple-500 shadow-purple-500/50" : "bg-blue-500 shadow-blue-500/50"
                        }`} />
                        <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${
                          u.role === "admin" ? "text-destructive" :
                          u.role === "creator" ? "text-purple-500" : "text-blue-500"
                        }`}>
                          {u.role || "student"}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col text-[10px] font-black uppercase tracking-widest text-muted-foreground bg-background border border-border px-3 py-1.5 rounded-full shadow-sm w-max">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" />
                          {u.createdAt ? (() => {
                            try {
                              // Handle Firestore Timestamp (seconds/nanoseconds)
                              if (typeof u.createdAt === 'object' && 'seconds' in u.createdAt) {
                                return new Date(u.createdAt.seconds * 1000).toLocaleDateString();
                              }
                              // Handle standard Date string or object
                              const date = new Date(u.createdAt as any);
                              if (isNaN(date.getTime())) return "N/A";
                              return date.toLocaleDateString();
                            } catch (e) {
                              return "N/A";
                            }
                          })() : "N/A"}
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-8 text-right">
                      <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0">
                        {/* Role Switcher */}
                        <div className="relative group/menu">
                          <button 
                            className="h-9 px-4 text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground bg-secondary/50 border border-border rounded-lg transition-all flex items-center gap-2 hover:border-primary/50 shadow-sm"
                            disabled={processingId === u.uid}
                          >
                            Set Role
                            <ChevronDown className="w-3 h-3" />
                          </button>
                          
                          <div className="absolute right-0 top-full mt-2 w-48 bg-card border border-border rounded-xl shadow-xl py-2 z-50 opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all transform origin-top-right group-hover/menu:translate-y-0 translate-y-2 backdrop-blur-xl">
                            <button 
                              onClick={() => handleUpdateRole(u.uid, "student")}
                              className="w-full px-4 py-2 text-left text-[10px] font-bold uppercase tracking-wider hover:bg-secondary transition-all text-blue-500 flex items-center justify-between"
                            >
                              Student
                              <GraduationCap className="w-3.5 h-3.5" />
                            </button>
                            <button 
                              onClick={() => handleUpdateRole(u.uid, "creator")}
                              className="w-full px-4 py-2 text-left text-[10px] font-bold uppercase tracking-wider hover:bg-secondary transition-all text-purple-500 flex items-center justify-between"
                            >
                              Creator
                              <Shield className="w-3.5 h-3.5" />
                            </button>
                            <button 
                              onClick={() => handleUpdateRole(u.uid, "admin")}
                              className="w-full px-4 py-2 text-left text-[10px] font-bold uppercase tracking-wider hover:bg-secondary transition-all text-destructive flex items-center justify-between"
                            >
                              Admin
                              <Shield className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <button 
                          onClick={() => handleDeleteUser(u.uid)}
                          disabled={processingId === u.uid || u.uid === currentUser?.uid}
                          className="p-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition-all disabled:opacity-30 border border-border hover:border-destructive/30 shadow-sm"
                          title="Purge Identity"
                        >
                          <Trash2 className="w-4 h-4" />
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
      {/* Custom Confirmation Modal */}
      <ConfirmModal 
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={confirmModal.type === "role" ? executeRoleUpdate : executeDeleteUser}
        title={confirmModal.type === "role" ? "Change User Role" : "Delete Account"}
        message={
          confirmModal.type === "role" 
            ? `Are you sure you want to change this user's role to ${confirmModal.data?.newRole}? This will update their permissions immediately.`
            : "CRITICAL: Are you sure you want to delete this user? This will remove their profile and authentication account. This action is IRREVERSIBLE."
        }
        confirmText={confirmModal.type === "role" ? "Update Role" : "Delete Permanently"}
        variant={confirmModal.type === "delete" ? "danger" : "info"}
        isLoading={processingId === confirmModal.userId}
      />
    </div>
  );
}
