"use client";

import { cn } from "@/lib/utils/cn";
import { forwardRef, type ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "premium";
  size?: "sm" | "md" | "lg";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center font-medium transition-all duration-300 cursor-pointer",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-gold",
          {
            // Variants
            "bg-accent-dark text-white hover:bg-[#1a1a1a]":
              variant === "primary",
            "bg-surface text-text-primary hover:bg-surface-hover":
              variant === "secondary",
            "border border-border text-text-primary bg-transparent hover:bg-surface":
              variant === "outline",
            "bg-transparent text-text-primary hover:bg-surface":
              variant === "ghost",
            "bg-accent-gold text-white hover:bg-accent-gold-dark":
              variant === "premium",
            // Sizes
            "text-sm px-4 py-2 rounded-[var(--radius-md)]": size === "sm",
            "text-base px-6 py-3 rounded-[var(--radius-md)]": size === "md",
            "text-lg px-8 py-4 rounded-[var(--radius-lg)]": size === "lg",
          },
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button };
export type { ButtonProps };
