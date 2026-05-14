import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  description?: string;
  children?: ReactNode;
  badge?: string;
  className?: string;
  align?: "left" | "center";
}

export function PageHeader({
  title,
  description,
  children,
  badge,
  className,
  align = "left",
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "space-y-3",
        align === "center" && "text-center",
        className
      )}
    >
      {badge && (
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-500">
          {badge}
        </p>
      )}
      <h2 className="text-4xl md:text-5xl font-bold tracking-[-0.03em] text-foreground leading-tight">
        {title}
      </h2>
      {description && (
        <p className="text-lg text-muted-foreground font-normal leading-relaxed max-w-2xl">
          {description}
        </p>
      )}
      {children && (
        <div className="flex items-center gap-3 pt-2">{children}</div>
      )}
    </div>
  );
}
