"use client";

import { cn } from "@/lib/utils";

interface TerminalCardProps {
  title?: string;
  titleActions?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
  variant?: "default" | "brand";
}

export function TerminalCard({
  title,
  titleActions,
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
        <div className={cn("flex items-center justify-between pl-3 py-1.5 border-b border-border bg-secondary/50 text-xs", titleActions ? "pr-1" : "pr-3")}>
          <span className="text-muted-foreground font-medium">{title}</span>
          {titleActions}
        </div>
      )}
      <div className="p-4">{children}</div>
    </div>
  );
}
