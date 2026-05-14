import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

interface EmptyStateProps {
  title: string;
  description: string;
  icon: LucideIcon;
  children?: ReactNode;
  className?: string;
}

export function EmptyState({ 
  title, 
  description, 
  icon: Icon, 
  children,
  className 
}: EmptyStateProps) {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center py-24 px-8 text-center rounded-[3rem] border border-dashed border-border/60 bg-surface/30 relative overflow-hidden",
      className
    )}>
      {/* Subtle Grid Pattern Overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[24px_24px]" />
      
      <div className="relative z-10 flex flex-col items-center">
        <div className="w-20 h-20 rounded-4xl bg-muted/50 border border-border/50 flex items-center justify-center text-muted-foreground/40 mb-8 group-hover:scale-110 transition-transform duration-500">
          <Icon className="w-10 h-10" />
        </div>
        
        <h3 className="text-2xl font-bold text-foreground tracking-tight mb-3">
          {title}
        </h3>
        <p className="text-muted-foreground max-w-sm mb-10 font-medium leading-relaxed">
          {description}
        </p>
        
        {children && (
          <div className="flex items-center gap-4">
            {children}
          </div>
        )}
      </div>
    </div>
  );
}
