"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface DescriptionBoxProps {
  description: string;
  notes?: string;
}

export function DescriptionBox({ description, notes }: DescriptionBoxProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-muted/30 rounded-3xl p-6 md:p-8 border border-border/40 group hover:border-accent/20 transition-all shadow-sm">
      <div className={cn(
        "relative overflow-hidden transition-all duration-500",
        isExpanded ? "max-h-[2000px]" : "max-h-[160px]"
      )}>
        <div className="space-y-6">
          <div className="prose prose-zinc dark:prose-invert max-w-none text-sm font-medium text-muted-foreground leading-relaxed">
            <p>{description}</p>
          </div>
          
          {notes && (
            <div className="pt-6 border-t border-border/40">
              <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-accent mb-4">Instructor Insights</h4>
              <div className="prose prose-zinc dark:prose-invert max-w-none prose-sm font-medium text-muted-foreground leading-relaxed">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {notes}
                </ReactMarkdown>
              </div>
            </div>
          )}
        </div>

        {!isExpanded && (
          <div className="absolute bottom-0 left-0 right-0 h-20 bg-linear-to-t from-muted/80 to-transparent pointer-events-none" />
        )}
      </div>

      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="mt-6 text-[10px] font-bold uppercase tracking-[0.2em] text-foreground hover:text-accent transition-colors"
      >
        {isExpanded ? "Show Less" : "Read More"}
      </button>
    </div>
  );
}
