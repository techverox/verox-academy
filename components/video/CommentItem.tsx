"use client";

import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { ThumbsUp, MoreVertical, MessageSquare, ChevronDown, ChevronUp, Edit2, Trash2 } from "lucide-react";
import { Comment, CommentReply, FirestoreTimestamp } from "@/types/firestore";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "@/hooks/use-auth";
import { CommentInput } from "./CommentInput";
import { subscribeToReplies } from "@/lib/firestore";
import { cn } from "@/lib/utils";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";

interface CommentItemProps {
  comment: Comment;
  isLiked: boolean;
  onLike: () => void;
  onReply: (content: string) => Promise<void>;
  onEdit: (content: string) => Promise<void>;
  onDelete: () => void;
}

export function CommentItem({ 
  comment, 
  isLiked, 
  onLike, 
  onReply, 
  onEdit, 
  onDelete 
}: CommentItemProps) {
  const { user } = useAuth();
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showReplies, setShowReplies] = useState(false);
  const [replies, setReplies] = useState<CommentReply[]>([]);
  const [repliesLoading, setRepliesLoading] = useState(false);

  const isOwner = user?.uid === comment.userId;

  // Real-time replies
  useEffect(() => {
    if (!showReplies) return;

    setRepliesLoading(true);
    const unsubscribe = subscribeToReplies(comment.id, (data) => {
      setReplies(data);
      setRepliesLoading(false);
    });

    return () => unsubscribe();
  }, [showReplies, comment.id]);

  const getTime = (ts: FirestoreTimestamp) => {
    if (!ts) return "Just now";
    const date = (ts as any).toDate ? (ts as any).toDate() : new Date((ts as any).seconds * 1000);
    return formatDistanceToNow(date, { addSuffix: true });
  };

  return (
    <div className="flex gap-4 group">
      <Avatar className="h-10 w-10 rounded-full shrink-0 mt-1">
        {comment.userPhoto && <AvatarImage src={comment.userPhoto} alt={comment.userName} />}
        <AvatarFallback className="bg-zinc-800 text-xs text-white">
          {comment.userName.charAt(0)}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-foreground">{comment.userName}</span>
            <span className="text-[10px] font-medium text-muted-foreground/60">
              {getTime(comment.createdAt)} {comment.isEdited && "(edited)"}
            </span>
          </div>

          {isOwner && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreVertical className="w-4 h-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-zinc-950 border-zinc-800 text-white rounded-xl">
                <DropdownMenuItem onClick={() => setIsEditing(true)} className="gap-2 text-xs font-medium cursor-pointer hover:bg-zinc-900">
                  <Edit2 className="w-3.5 h-3.5" /> Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onDelete} className="gap-2 text-xs font-medium cursor-pointer text-red-400 hover:bg-red-500/10 hover:text-red-500">
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {isEditing ? (
          <CommentInput 
            initialValue={comment.content}
            submitLabel="Save"
            onSave={async (content) => {
              await onEdit(content);
              setIsEditing(false);
            }}
            onCancel={() => setIsEditing(false)}
            autoFocus
          />
        ) : (
          <p className="text-sm font-medium text-muted-foreground/90 leading-relaxed whitespace-pre-wrap">
            {comment.content}
          </p>
        )}

        <div className="flex items-center gap-4 pt-1">
          <div className="flex items-center gap-1">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onLike}
              className={cn(
                "h-8 px-2 gap-2 rounded-lg hover:bg-accent/5 transition-all",
                isLiked ? "text-accent" : "text-muted-foreground"
              )}
            >
              <ThumbsUp className={cn("w-3.5 h-3.5", isLiked && "fill-accent")} />
              <span className="text-[11px] font-bold">{comment.likes || 0}</span>
            </Button>
          </div>

          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setShowReplyInput(!showReplyInput)}
            className="h-8 px-3 rounded-lg text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:bg-accent/5 hover:text-accent transition-all"
          >
            Reply
          </Button>
        </div>

        {showReplyInput && (
          <div className="pt-2 animate-in slide-in-from-top-2 duration-200">
            <CommentInput 
              placeholder="Add a reply..."
              submitLabel="Reply"
              onSave={async (content) => {
                await onReply(content);
                setShowReplyInput(false);
                setShowReplies(true);
              }}
              onCancel={() => setShowReplyInput(false)}
              autoFocus
            />
          </div>
        )}

        {comment.replyCount > 0 && (
          <div className="pt-2">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setShowReplies(!showReplies)}
              className="h-8 px-0 text-accent text-[11px] font-bold gap-2 hover:bg-transparent"
            >
              {showReplies ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              {comment.replyCount} {comment.replyCount === 1 ? 'reply' : 'replies'}
            </Button>

            {showReplies && (
              <div className="space-y-4 pl-4 border-l border-zinc-800 mt-4 animate-in fade-in duration-300">
                {repliesLoading ? (
                  <div className="h-10 w-full animate-pulse bg-zinc-900 rounded-xl" />
                ) : (
                  replies.map(reply => (
                    <div key={reply.id} className="flex gap-3">
                      <Avatar className="h-8 w-8 rounded-full shrink-0">
                        {reply.userPhoto && <AvatarImage src={reply.userPhoto} alt={reply.userName} />}
                        <AvatarFallback className="bg-zinc-800 text-[10px] text-white">
                          {reply.userName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-foreground">{reply.userName}</span>
                          <span className="text-[9px] font-medium text-muted-foreground/60">{getTime(reply.createdAt)}</span>
                        </div>
                        <p className="text-xs font-medium text-muted-foreground/80 leading-relaxed">
                          {reply.content}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
