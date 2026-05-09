import * as React from "react";

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "success" | "warning" | "danger" | "outline";
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variants = {
    default: "bg-muted text-zinc-300",
    success: "bg-success/10 text-success border border-success/20",
    warning: "bg-amber-500/10 text-amber-500 border border-amber-500/20",
    danger: "bg-danger/10 text-danger border border-danger/20",
    outline: "border border-border text-zinc-400",
  };

  return (
    <div
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider ${variants[variant]} ${className}`}
      {...props}
    />
  );
}
