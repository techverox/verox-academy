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

  if (authLoading) return <div className="p-8 text-zinc-500 animate-pulse">Checking credentials...</div>;

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 mb-6">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-black mb-2">Access Denied</h1>
        <p className="text-zinc-500 max-w-md mb-8">You do not have administrative privileges.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">User Management</h1>
          <p className="text-zinc-500 dark:text-zinc-400 font-medium">Control roles and access for all platform members.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input 
              type="text" 
              placeholder="Search by name or email..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all w-full md:w-64"
            />
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-3xl">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
              <UserIcon className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-zinc-500 text-sm uppercase tracking-widest">Total Students</h3>
          </div>
          <p className="text-4xl font-black text-zinc-900 dark:text-zinc-50">
            {users.filter(u => u.role === "student" || !u.role).length}
          </p>
        </div>
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-3xl">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500">
              <GraduationCap className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-zinc-500 text-sm uppercase tracking-widest">Creators</h3>
          </div>
          <p className="text-4xl font-black text-zinc-900 dark:text-zinc-50">
            {users.filter(u => u.role === "creator").length}
          </p>
        </div>
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-3xl">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-zinc-500 text-sm uppercase tracking-widest">Admins</h3>
          </div>
          <p className="text-4xl font-black text-zinc-900 dark:text-zinc-50">
            {users.filter(u => u.role === "admin").length}
          </p>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-zinc-400">User</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-zinc-400">Role</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-zinc-400">Joined</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-zinc-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-zinc-500">
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-5 h-5 border-2 border-zinc-500/20 border-t-zinc-500 rounded-full animate-spin" />
                      Fetching users...
                    </div>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-zinc-500">No users found matching your search.</td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.uid} className="group hover:bg-zinc-50/50 dark:hover:bg-zinc-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center overflow-hidden">
                          {u.photoURL ? (
                            <img src={u.photoURL} alt={u.name || ""} className="w-full h-full object-cover" />
                          ) : (
                            <UserIcon className="w-5 h-5 text-zinc-400" />
                          )}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-zinc-900 dark:text-zinc-50">{u.name || "Anonymous User"}</span>
                          <span className="text-xs text-zinc-500 flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {u.email}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                          u.role === "admin" ? "bg-red-500/10 text-red-500" :
                          u.role === "creator" ? "bg-purple-500/10 text-purple-500" :
                          "bg-blue-500/10 text-blue-500"
                        }`}>
                          {u.role || "student"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col text-xs text-zinc-500 font-medium">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
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
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Role Switcher */}
                        <div className="relative group/menu">
                          <button 
                            className="p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg transition-all flex items-center gap-1"
                            disabled={processingId === u.uid}
                          >
                            <span className="text-[10px] font-black uppercase tracking-widest">Change Role</span>
                            <ChevronDown className="w-4 h-4" />
                          </button>
                          
                          <div className="absolute right-0 top-full mt-2 w-40 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl py-2 z-10 opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all transform origin-top-right group-hover/menu:translate-y-0 translate-y-2">
                            <button 
                              onClick={() => handleUpdateRole(u.uid, "student")}
                              className="w-full px-4 py-2 text-left text-xs font-bold hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                            >
                              Make Student
                            </button>
                            <button 
                              onClick={() => handleUpdateRole(u.uid, "creator")}
                              className="w-full px-4 py-2 text-left text-xs font-bold text-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
                            >
                              Make Creator
                            </button>
                            <button 
                              onClick={() => handleUpdateRole(u.uid, "admin")}
                              className="w-full px-4 py-2 text-left text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                            >
                              Make Admin
                            </button>
                          </div>
                        </div>

                        <button 
                          onClick={() => handleDeleteUser(u.uid)}
                          disabled={processingId === u.uid || u.uid === currentUser?.uid}
                          className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all disabled:opacity-30"
                          title="Delete User"
                        >
                          <Trash2 className="w-5 h-5" />
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
