import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface ContentContainerProps {
  children: ReactNode;
  className?: string;
  variant?: "default" | "narrow" | "wide" | "full";
}

export function ContentContainer({ 
  children, 
  className, 
  variant = "default" 
}: ContentContainerProps) {
  const variants = {
    narrow: "max-w-4xl",
    default: "max-w-7xl",
    wide: "max-w-[1440px]",
    full: "max-w-full",
  };

  return (
    <div className={cn(
      "mx-auto w-full px-4 sm:px-6 lg:px-8",
      variants[variant],
      className
    )}>
      {children}
    </div>
  );
}
