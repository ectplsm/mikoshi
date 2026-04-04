"use client";

import { cn } from "@/lib/utils";

interface TerminalCardProps {
  title?: string;
  className?: string;
  children: React.ReactNode;
  variant?: "default" | "brand";
}

export function TerminalCard({
  title,
  className,
  children,
  variant = "default",
}: TerminalCardProps) {
  const borderColor = {
    default: "border-border",
    brand: "border-brand/40 box-glow-brand",
  }[variant];

  return (
    <div
      className={cn(
        "border rounded-sm bg-card overflow-hidden",
        borderColor,
        className
      )}
    >
      {title && (
        <div className="flex items-center gap-2 px-3 py-1.5 border-b border-border bg-secondary/50 text-xs">
          <span className="text-brand">$</span>
          <span className="text-muted-foreground font-medium">{title}</span>
          <div className="ml-auto flex gap-1.5">
            <div className="w-2 h-2 rounded-full bg-neon-green/60" />
            <div className="w-2 h-2 rounded-full bg-neon-yellow/60" />
            <div className="w-2 h-2 rounded-full bg-destructive/60" />
          </div>
        </div>
      )}
      <div className="p-4">{children}</div>
    </div>
  );
}
