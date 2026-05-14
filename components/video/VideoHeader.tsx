"use client";

import { Badge } from "@/components/ui/Badge";
import { Clock, Calendar } from "lucide-react";

interface VideoHeaderProps {
  title: string;
  moduleName?: string;
  duration?: string;
  lastUpdated?: string;
}

export function VideoHeader({ title, moduleName = "Core Module", duration, lastUpdated }: VideoHeaderProps) {
  return (
    <div className="space-y-4 py-6 border-b border-border/40">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline" className="text-[10px] uppercase tracking-widest font-bold py-1 px-3 bg-accent/5 text-accent border-accent/20 rounded-lg">
          {moduleName}
        </Badge>
      </div>
      
      <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground leading-tight">
        {title}
      </h1>

      <div className="flex flex-wrap items-center gap-6 text-[11px] font-bold uppercase tracking-widest text-muted-foreground/60">
        {duration && (
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-accent" />
            {duration}
          </div>
        )}
        {lastUpdated && (
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-accent" />
            Updated {lastUpdated}
          </div>
        )}
      </div>
    </div>
  );
}
