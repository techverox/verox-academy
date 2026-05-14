"use client";

import { Resource } from "@/types/firestore";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from "@/components/ui/Dialog";
import { FileText, Link as LinkIcon, Download, ExternalLink, Archive, FileImage } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface ResourcesModalProps {
  isOpen: boolean;
  onClose: () => void;
  resources: Resource[];
  loading: boolean;
}

const getIcon = (type: string) => {
  switch (type) {
    case "pdf": return <FileText className="w-5 h-5 text-red-400" />;
    case "zip": return <Archive className="w-5 h-5 text-amber-400" />;
    case "image": return <FileImage className="w-5 h-5 text-blue-400" />;
    case "link": return <LinkIcon className="w-5 h-5 text-emerald-400" />;
    default: return <FileText className="w-5 h-5 text-zinc-400" />;
  }
};

export function ResourcesModal({ isOpen, onClose, resources, loading }: ResourcesModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-zinc-950 border-zinc-800 rounded-3xl p-6">
        <DialogHeader className="space-y-3 pb-4 border-b border-zinc-900">
          <DialogTitle className="text-xl font-bold tracking-tight text-white">Lesson Resources</DialogTitle>
          <DialogDescription className="text-xs font-medium text-zinc-500 uppercase tracking-widest">
            Assets, documents, and reference links
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-3">
          {loading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="h-16 w-full animate-pulse rounded-2xl bg-zinc-900" />
              ))}
            </div>
          ) : resources.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
              <div className="p-4 rounded-full bg-zinc-900">
                <FileText className="w-8 h-8 text-zinc-700" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold text-zinc-400">No resources available</p>
                <p className="text-[10px] uppercase tracking-widest text-zinc-600">Check back later for updates</p>
              </div>
            </div>
          ) : (
            resources.map((resource) => (
              <a 
                key={resource.id}
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-between p-4 rounded-2xl bg-zinc-900/50 border border-zinc-900 hover:bg-zinc-900 hover:border-accent/20 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-xl bg-zinc-950 group-hover:scale-110 transition-transform">
                    {getIcon(resource.type)}
                  </div>
                  <div className="space-y-0.5 text-left">
                    <p className="text-sm font-bold text-zinc-200 group-hover:text-white transition-colors">{resource.title}</p>
                    <p className="text-[9px] uppercase tracking-[0.2em] text-zinc-500 font-bold">
                      {resource.type} {resource.size ? `• ${(resource.size / 1024 / 1024).toFixed(1)} MB` : ""}
                    </p>
                  </div>
                </div>
                {resource.type === "link" ? (
                  <ExternalLink className="w-4 h-4 text-zinc-600 group-hover:text-accent transition-colors" />
                ) : (
                  <Download className="w-4 h-4 text-zinc-600 group-hover:text-accent transition-colors" />
                )}
              </a>
            ))
          )}
        </div>

        <div className="pt-4 flex justify-end">
          <Button 
            variant="outline" 
            onClick={onClose}
            className="rounded-xl border-zinc-800 text-[10px] font-bold uppercase tracking-widest px-6"
          >
            Dismiss
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
