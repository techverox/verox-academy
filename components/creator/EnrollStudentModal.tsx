"use client";

import React, { useState } from "react";
import { X, Mail, BookOpen, ShieldCheck, Loader2 } from "lucide-react";

interface EnrollStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseId: string;
  courseTitle: string;
}

export const EnrollStudentModal = ({ isOpen, onClose, courseId, courseTitle }: EnrollStudentModalProps) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error" | null, message: string }>({ type: null, message: "" });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setStatus({ type: null, message: "" });

    try {
      const res = await fetch("/api/creator/enroll-manual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentEmail: email, courseId }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus({ type: "success", message: data.message });
        setEmail("");
        setTimeout(() => {
          onClose();
          setStatus({ type: null, message: "" });
        }, 2000);
      } else {
        setStatus({ type: "error", message: data.error || "Enrollment failed" });
      }
    } catch (error) {
      console.error("Manual enrollment failed:", error);
      setStatus({ type: "error", message: "Something went wrong. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300" 
        onClick={onClose} 
      />
      
      <div className="relative w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="p-8 border-b border-zinc-800 bg-gradient-to-br from-primary/5 to-transparent">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-zinc-800 rounded-full text-zinc-500 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <h2 className="text-2xl font-black tracking-tight text-white">Grant Free Access</h2>
          <p className="text-zinc-500 text-sm font-medium mt-1">Enroll a student manually into your course.</p>
        </div>

        {/* Content */}
        <div className="p-8">
          <div className="mb-8 p-4 bg-zinc-900/50 border border-zinc-800 rounded-2xl">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-400">
                <BookOpen className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 leading-none mb-1">Selected Course</p>
                <p className="text-sm font-bold text-white truncate leading-none">{courseTitle}</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-zinc-500 ml-1">Student's Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@example.com"
                  required
                  className="w-full pl-11 pr-4 py-4 bg-zinc-900 border border-zinc-800 rounded-2xl text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all text-white"
                />
              </div>
            </div>

            {status.type && (
              <div className={`p-4 rounded-2xl text-xs font-bold ${
                status.type === "success" ? "bg-green-500/10 text-green-500 border border-green-500/20" : "bg-red-500/10 text-red-500 border border-red-500/20"
              }`}>
                {status.message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-primary text-black font-black rounded-2xl hover:scale-[1.02] transition-transform active:scale-95 shadow-[0_0_40px_-10px_rgba(var(--primary-rgb),0.5)] flex items-center justify-center gap-2 disabled:opacity-50 disabled:scale-100"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  ENROLLING...
                </>
              ) : (
                "CONFIRM ENROLLMENT"
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="px-8 py-4 bg-zinc-900/50 border-t border-zinc-800 text-center">
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Manual Access System v1.0</p>
        </div>
      </div>
    </div>
  );
};
