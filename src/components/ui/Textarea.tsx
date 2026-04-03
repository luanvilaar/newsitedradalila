"use client";

import { cn } from "@/lib/utils/cn";
import { forwardRef, type TextareaHTMLAttributes } from "react";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, id, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={id}
            className="text-sm font-medium text-text-secondary"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={id}
          className={cn(
            "w-full px-4 py-3 bg-white border border-border rounded-[var(--radius-md)]",
            "text-text-primary placeholder:text-text-muted",
            "transition-all duration-200 resize-y min-h-[100px]",
            "focus:outline-none focus:ring-2 focus:ring-accent-gold/30 focus:border-accent-gold",
            error && "border-error focus:ring-error/30 focus:border-error",
            className
          )}
          {...props}
        />
        {error && <p className="text-sm text-error">{error}</p>}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";

export { Textarea };
export type { TextareaProps };
