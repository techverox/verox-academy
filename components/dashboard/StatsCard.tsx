import { Card } from "@/components/ui/Card";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendType?: "positive" | "negative";
}

export function StatsCard({ title, value, icon: Icon, trend, trendType = "positive" }: StatsCardProps) {
  return (
    <Card className="p-6 group hover:border-primary/30 transition-all duration-300 shadow-sm hover:shadow-md bg-card">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
            {title}
          </p>
          <p className="text-3xl font-bold text-foreground">{value}</p>
        </div>
        <div className="h-12 w-12 rounded-2xl bg-secondary/50 border border-border flex items-center justify-center text-primary group-hover:scale-110 group-hover:bg-primary/10 transition-all shadow-sm">
          <Icon className="h-6 w-6" />
        </div>
      </div>
      {trend && (
        <div className="mt-4 flex items-center gap-2">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
            trendType === "positive" ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
          }`}>
            {trend}
          </span>
          <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">vs last month</span>
        </div>
      )}
    </Card>
  );
}
