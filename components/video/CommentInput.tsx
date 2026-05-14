"use client";

import { useState, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface CommentInputProps {
  initialValue?: string;
  placeholder?: string;
  onSave: (content: string) => Promise<void>;
  onCancel?: () => void;
  autoFocus?: boolean;
  className?: string;
  submitLabel?: string;
}

export function CommentInput({ 
  initialValue = "", 
  placeholder = "Add a comment...", 
  onSave, 
  onCancel,
  autoFocus,
  className,
  submitLabel = "Comment"
}: CommentInputProps) {
  const { user } = useAuth();
  const [content, setContent] = useState(initialValue);
  const [isFocused, setIsFocused] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = async () => {
    if (!content.trim() || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await onSave(content);
      setContent("");
      setIsFocused(false);
    } catch (error) {
      console.error("Failed to save comment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  if (!user) return null;

  return (
    <div className={cn("flex gap-4 group", className)}>
      <Avatar className="h-10 w-10 rounded-full shrink-0">
        {user.photoURL && <AvatarImage src={user.photoURL} alt={user.name || "User"} />}
        <AvatarFallback className="bg-zinc-800 text-xs text-white">
          {(user.name || "U").charAt(0)}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 space-y-3">
        <div className="relative">
          <textarea
            ref={textareaRef}
            autoFocus={autoFocus}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            rows={isFocused || content ? 3 : 1}
            className={cn(
              "w-full bg-transparent border-b border-zinc-800 py-2 resize-none text-sm transition-all focus:border-accent focus:outline-none placeholder:text-zinc-600",
              (isFocused || content) && "border-zinc-700"
            )}
          />
        </div>

        {(isFocused || content) && (
          <div className="flex items-center justify-end gap-3 animate-in fade-in slide-in-from-top-1 duration-200">
            {onCancel && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => {
                  setContent(initialValue);
                  setIsFocused(false);
                  onCancel();
                }}
                className="text-[10px] font-bold uppercase tracking-widest h-9 rounded-xl hover:bg-zinc-900"
              >
                Cancel
              </Button>
            )}
            <Button 
              size="sm"
              disabled={!content.trim() || isSubmitting}
              onClick={handleSubmit}
              className="text-[10px] font-bold uppercase tracking-widest h-9 rounded-xl px-6 bg-accent hover:bg-accent/90 text-white disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="w-3 h-3 animate-spin" /> : submitLabel}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
