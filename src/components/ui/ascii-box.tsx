"use client";

import { cn } from "@/lib/utils";

interface AsciiBoxProps {
  children: React.ReactNode;
  className?: string;
  variant?: "single" | "double";
}

const CHARS = {
  single: { tl: "┌", tr: "┐", bl: "└", br: "┘", h: "─", v: "│" },
  double: { tl: "╔", tr: "╗", bl: "╚", br: "╝", h: "═", v: "║" },
};

export function AsciiBox({
  children,
  className,
  variant = "single",
}: AsciiBoxProps) {
  const c = CHARS[variant];

  return (
    <div className={cn("font-mono text-sm", className)}>
      <div className="text-neon-cyan/60 select-none" aria-hidden>
        {c.tl}
        {c.h.repeat(40)}
        {c.tr}
      </div>
      <div className="flex">
        <span className="text-neon-cyan/60 select-none" aria-hidden>
          {c.v}
        </span>
        <div className="flex-1 px-2">{children}</div>
        <span className="text-neon-cyan/60 select-none" aria-hidden>
          {c.v}
        </span>
      </div>
      <div className="text-neon-cyan/60 select-none" aria-hidden>
        {c.bl}
        {c.h.repeat(40)}
        {c.br}
      </div>
    </div>
  );
}
