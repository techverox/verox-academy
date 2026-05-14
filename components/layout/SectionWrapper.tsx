import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface SectionWrapperProps {
  children: ReactNode;
  className?: string;
  id?: string;
  py?: "sm" | "md" | "lg" | "xl" | "none";
}

export function SectionWrapper({ 
  children, 
  className, 
  id,
  py = "md" 
}: SectionWrapperProps) {
  const spacings = {
    none: "py-0",
    sm: "py-6 md:py-10",
    md: "py-10 md:py-16",
    lg: "py-16 md:py-24",
    xl: "py-24 md:py-32",
  };

  return (
    <section 
      id={id}
      className={cn(
        spacings[py],
        className
      )}
    >
      {children}
    </section>
  );
}
