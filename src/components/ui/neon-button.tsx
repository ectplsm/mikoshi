"use client";

import { cn } from "@/lib/utils";

interface NeonButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "brand";
  size?: "sm" | "md" | "lg";
}

export function NeonButton({
  variant = "brand",
  size = "md",
  className,
  children,
  ...props
}: NeonButtonProps) {
  const colors = {
    brand:
      "border-brand/60 text-brand hover:bg-brand/10 hover:box-glow-brand",
  }[variant];

  const sizes = {
    sm: "px-3 py-1 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  }[size];

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 border rounded-sm font-mono transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed",
        colors,
        sizes,
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
