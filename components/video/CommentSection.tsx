"use client";

import { useComments } from "@/hooks/use-comments";
import { CommentInput } from "./CommentInput";
import { CommentItem } from "./CommentItem";
import { Button } from "@/components/ui/Button";
import { Loader2, MessageSquare } from "lucide-react";

interface CommentSectionProps {
  lessonId: string | undefined;
}

export function CommentSection({ lessonId }: CommentSectionProps) {
  const { 
    comments, 
    likedCommentIds, 
    loading, 
    hasMore, 
    loadMore, 
    addComment, 
    updateComment, 
    deleteComment, 
    toggleLike,
    addReply
  } = useComments(lessonId);

  return (
    <div className="py-12 space-y-8 animate-in fade-in duration-700">
      <div className="flex items-center justify-between border-b border-zinc-900 pb-6">
        <div className="flex items-center gap-3">
          <MessageSquare className="w-5 h-5 text-accent" />
          <h3 className="text-xl font-bold tracking-tight text-white">
            {comments.length > 0 ? `${comments.length} Comments` : "Comments"}
          </h3>
        </div>
      </div>

      <div className="pt-2">
        <CommentInput onSave={addComment} />
      </div>

      <div className="space-y-8">
        {loading && comments.length === 0 ? (
          <div className="space-y-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-4 animate-pulse">
                <div className="h-10 w-10 rounded-full bg-zinc-900" />
                <div className="flex-1 space-y-3">
                  <div className="h-3 w-24 bg-zinc-900 rounded" />
                  <div className="h-12 w-full bg-zinc-900/50 rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          comments.map((comment) => (
            <CommentItem 
              key={comment.id}
              comment={comment}
              isLiked={likedCommentIds.includes(comment.id)}
              onLike={() => toggleLike(comment.id, "comment")}
              onReply={(content) => addReply(comment.id, content)}
              onEdit={(content) => updateComment(comment.id, content)}
              onDelete={() => deleteComment(comment.id)}
            />
          ))
        )}

        {loading && comments.length > 0 && (
          <div className="flex flex-col items-center justify-center py-12 gap-4">
            <Loader2 className="w-8 h-8 text-accent animate-spin" />
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-600">Syncing Conversations</p>
          </div>
        )}

        {!loading && hasMore && (
          <div className="flex justify-center pt-8">
            <Button 
              variant="outline" 
              onClick={loadMore}
              className="rounded-2xl border-zinc-800 text-[10px] font-bold uppercase tracking-widest px-10 h-12 hover:bg-zinc-900"
            >
              Load More Comments
            </Button>
          </div>
        )}

        {!loading && comments.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 bg-zinc-900/10 rounded-3xl border border-dashed border-zinc-800">
            <div className="p-4 rounded-full bg-zinc-900">
              <MessageSquare className="w-10 h-10 text-zinc-800" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-bold text-zinc-400">No discussions yet</p>
              <p className="text-[10px] uppercase tracking-widest text-zinc-600">Be the first to share your insights</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
