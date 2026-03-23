"use client";

import { cn } from "@/lib/utils";

interface TerminalCardProps {
  title?: string;
  className?: string;
  children: React.ReactNode;
  variant?: "default" | "cyan" | "magenta";
}

export function TerminalCard({
  title,
  className,
  children,
  variant = "default",
}: TerminalCardProps) {
  const borderColor = {
    default: "border-border",
    cyan: "border-neon-cyan/40 box-glow-cyan",
    magenta: "border-neon-magenta/40 box-glow-magenta",
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
          <span className="text-neon-cyan">$</span>
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
