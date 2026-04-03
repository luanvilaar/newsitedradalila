"use client";

import { cn } from "@/lib/utils/cn";
import { forwardRef, type HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  padding?: "sm" | "md" | "lg" | "none";
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, hover = false, padding = "md", children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "bg-white rounded-[var(--radius-lg)] border border-border-light",
          "shadow-[var(--shadow-card)]",
          {
            "transition-all duration-300 hover:shadow-[var(--shadow-hover)] hover:-translate-y-1":
              hover,
            "p-4": padding === "sm",
            "p-6": padding === "md",
            "p-8": padding === "lg",
            "p-0": padding === "none",
          },
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";

export { Card };
export type { CardProps };
