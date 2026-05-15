"use client";

import { useState, useEffect } from "react";
import { 
  Search, 
  User as UserIcon, 
  Check, 
  X,
  Shield,
  Loader2
} from "lucide-react";
import { 
  doc, 
  getDoc, 
  collection, 
  getDocs, 
  query, 
  where 
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { User } from "@/types/firestore";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface AssignCreatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAssign: (creator: User) => Promise<void>;
  currentCreatorName?: string | null;
}

export function AssignCreatorModal({ 
  isOpen, 
  onClose, 
  onAssign,
  currentCreatorName 
}: AssignCreatorModalProps) {
  const [search, setSearch] = useState("");
  const [creators, setCreators] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [assigning, setAssigning] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchCreators();
    } else {
      setSearch("");
      setCreators([]);
    }
  }, [isOpen]);

  const fetchCreators = async () => {
    setLoading(true);
    try {
      const q = query(
        collection(db, "users"), 
        where("role", "in", ["creator", "admin"])
      );
      const snap = await getDocs(q);
      const data = snap.docs.map(doc => ({ uid: doc.id, ...doc.data() } as User));
      setCreators(data);
    } catch (err) {
      console.error("Failed to fetch creators:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredCreators = creators.filter(c => 
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase())
  );

  const handleAssign = async (creator: User) => {
    setAssigning(creator.uid);
    try {
      await onAssign(creator);
      onClose();
    } catch (err) {
      console.error("Assignment failed:", err);
    } finally {
      setAssigning(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-lg bg-surface border border-border/40 rounded-4xl shadow-2xl overflow-hidden"
      >
        <div className="p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-xl font-bold tracking-tight">Assign Course Ownership</h3>
              <p className="text-xs text-muted-foreground">Transfer this course to a verified creator.</p>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="rounded-xl h-10 w-10">
              <X className="w-5 h-5" />
            </Button>
          </div>

          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40 group-focus-within:text-blue-600 transition-colors" />
            <input 
              type="text" 
              placeholder="Search by name or email..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-12 pl-12 pr-4 bg-muted/20 border border-border/40 rounded-xl text-sm font-medium outline-none focus:ring-4 focus:ring-blue-600/5 transition-all"
            />
          </div>

          <div className="max-h-[300px] overflow-y-auto space-y-2 pr-2 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
            {loading ? (
              <div className="py-12 flex flex-col items-center gap-4 text-muted-foreground/40">
                <Loader2 className="w-8 h-8 animate-spin" />
                <p className="text-[10px] font-bold uppercase tracking-widest">Accessing Registry...</p>
              </div>
            ) : filteredCreators.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground/40">
                <p className="text-[10px] font-bold uppercase tracking-widest">No creators found</p>
              </div>
            ) : (
              filteredCreators.map((creator) => (
                <div 
                  key={creator.uid}
                  className="flex items-center justify-between p-4 rounded-2xl bg-muted/5 border border-transparent hover:border-border/40 hover:bg-muted/10 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-blue-600/10 flex items-center justify-center text-blue-600">
                      <UserIcon className="w-5 h-5" />
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-sm font-bold tracking-tight">{creator.name}</p>
                      <p className="text-[10px] text-muted-foreground font-medium">{creator.email}</p>
                    </div>
                  </div>
                  <Button 
                    onClick={() => handleAssign(creator)}
                    disabled={!!assigning}
                    className={cn(
                      "h-9 px-4 rounded-lg text-[10px] font-bold uppercase tracking-widest",
                      assigning === creator.uid ? "bg-muted text-muted-foreground" : "bg-blue-600 text-white hover:bg-blue-700"
                    )}
                  >
                    {assigning === creator.uid ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Assign"}
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="p-6 bg-muted/5 border-t border-border/40 flex items-center gap-3">
          <Shield className="w-4 h-4 text-amber-500" />
          <p className="text-[10px] font-medium text-muted-foreground leading-relaxed">
            Assigning will update all metadata including creator name, photo, and payouts. 
            The current owner is <span className="text-foreground font-bold">{currentCreatorName || "System Admin"}</span>.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
