"use client";

import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";

interface CodeBlockProps {
  children: string;
  className?: string;
}

export function CodeBlock({ children, className }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(() => {
    navigator.clipboard.writeText(children);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [children]);

  return (
    <div
      className={cn(
        "relative group flex items-center bg-secondary/50 border border-border rounded-sm max-w-lg overflow-hidden",
        className
      )}
    >
      <pre className="flex-1 px-5 py-4 pr-16 text-xs font-mono text-brand overflow-x-auto">
        {children}
      </pre>
      <button
        onClick={copy}
        className="absolute right-3 px-2 py-1 text-[10px] font-mono border border-border rounded-sm bg-card text-muted-foreground hover:text-foreground hover:border-brand/40 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
      >
        {copied ? "copied" : "copy"}
      </button>
    </div>
  );
}
