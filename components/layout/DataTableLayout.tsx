import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Search, Filter, ArrowUpDown, ChevronLeft, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

interface DataTableLayoutProps {
  title: string;
  description?: string;
  children: ReactNode;
  actions?: ReactNode;
  searchPlaceholder?: string;
  onSearchChange?: (val: string) => void;
}

export function DataTableLayout({ 
  title, 
  description, 
  children, 
  actions,
  searchPlaceholder = "Filter records...",
  onSearchChange 
}: DataTableLayoutProps) {
  return (
    <div className="space-y-6">
      {/* Table Header Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-surface/50 p-4 rounded-[2rem] border border-border/50">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative flex-1 max-w-sm group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-accent transition-colors" />
            <Input 
              placeholder={searchPlaceholder} 
              className="pl-10 h-10 bg-background/50 border-border/60"
              onChange={(e) => onSearchChange?.(e.target.value)}
            />
          </div>
          <Button variant="secondary" size="icon" className="h-10 w-10 shrink-0">
            <Filter className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex items-center gap-3">
          {actions}
        </div>
      </div>

      {/* Table Content Container */}
      <div className="bg-surface/30 rounded-[2.5rem] border border-border/50 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          {children}
        </div>
        
        {/* Table Footer / Pagination */}
        <div className="flex items-center justify-between p-6 border-t border-border/50 bg-background/20">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">
            Showing 10 of 240 Nodes
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" className="h-9 w-9 rounded-xl">
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <div className="flex items-center gap-1 px-2">
              {[1, 2, 3].map(i => (
                <button key={i} className={cn(
                  "h-8 w-8 rounded-lg text-[10px] font-bold transition-all",
                  i === 1 ? "bg-accent text-white shadow-lg shadow-accent/20" : "text-muted-foreground hover:bg-muted"
                )}>
                  {i}
                </button>
              ))}
            </div>
            <Button variant="outline" size="icon" className="h-9 w-9 rounded-xl">
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
