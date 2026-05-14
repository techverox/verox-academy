import * as React from "react";
import { cn } from "@/lib/utils";

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "default" | "narrow" | "full";
}

export function Container({ className, size = "default", ...props }: ContainerProps) {
  const sizes = {
    default: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",
    narrow: "max-w-3xl mx-auto px-4 sm:px-6",
    full: "max-w-full px-4 sm:px-6 lg:px-8",
  };

  return (
    <div
      className={cn(sizes[size], className)}
      {...props}
    />
  );
}
