"use client";

import { Button } from "@/components/ui/Button";
import { ThumbsUp, ThumbsDown, FileText, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ActionButtonsProps {
  likes: number;
  dislikes: number;
  userReaction: "like" | "dislike" | null;
  onLike: () => void;
  onDislike: () => void;
  onShowResources: () => void;
}

export function ActionButtons({ 
  likes, 
  dislikes, 
  userReaction, 
  onLike, 
  onDislike, 
  onShowResources 
}: ActionButtonsProps) {
  
  const formatCount = (count: number) => {
    if (count >= 1000) return (count / 1000).toFixed(1) + "k";
    return count;
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: document.title,
        url: window.location.href,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-3 py-6">
      <div className="flex items-center gap-px bg-muted/40 rounded-2xl border border-border/40 overflow-hidden shadow-sm">
        <Button 
          variant="ghost" 
          onClick={onLike}
          className={cn(
            "h-11 px-5 gap-2 rounded-none hover:bg-muted font-bold text-[11px] uppercase tracking-widest transition-all",
            userReaction === "like" ? "text-accent bg-accent/5" : "text-foreground"
          )}
        >
          <ThumbsUp className={cn("w-4 h-4", userReaction === "like" ? "fill-accent" : "text-accent")} />
          {formatCount(likes)}
        </Button>
        <div className="w-px h-6 bg-border/40" />
        <Button 
          variant="ghost" 
          onClick={onDislike}
          className={cn(
            "h-11 px-5 rounded-none hover:bg-muted transition-all",
            userReaction === "dislike" ? "text-accent bg-accent/5" : "text-foreground"
          )}
        >
          <ThumbsDown className={cn("w-4 h-4", userReaction === "dislike" ? "fill-accent" : "text-muted-foreground/60")} />
        </Button>
      </div>

      <Button 
        variant="outline" 
        onClick={onShowResources}
        className="h-11 px-6 rounded-2xl border-border/40 bg-muted/20 font-bold uppercase tracking-widest text-[10px] gap-2 hover:bg-muted transition-all shadow-sm"
      >
        <FileText className="w-4 h-4 text-accent" />
        Notes & Resources
      </Button>

      <Button 
        variant="outline" 
        onClick={handleShare}
        className="h-11 px-6 rounded-2xl border-border/40 bg-muted/20 font-bold uppercase tracking-widest text-[10px] gap-2 hover:bg-muted transition-all shadow-sm"
      >
        <Share2 className="w-4 h-4 text-accent" />
        Share
      </Button>
    </div>
  );
}
