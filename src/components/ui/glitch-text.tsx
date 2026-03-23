"use client";

import { cn } from "@/lib/utils";

interface GlitchTextProps {
  children: string;
  className?: string;
  as?: "h1" | "h2" | "h3" | "span" | "p";
}

export function GlitchText({
  children,
  className,
  as: Tag = "span",
}: GlitchTextProps) {
  return (
    <Tag
      className={cn("relative inline-block glitch-text", className)}
      data-text={children}
    >
      <style>{`
        .glitch-text {
          animation: glitch-skew 4s infinite linear alternate-reverse;
        }
        .glitch-text::before,
        .glitch-text::after {
          content: attr(data-text);
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
        }
        .glitch-text::before {
          left: 2px;
          text-shadow: -2px 0 oklch(0.7 0.25 330);
          clip-path: inset(0 0 80% 0);
          animation: glitch-top 3s infinite linear alternate-reverse;
        }
        .glitch-text::after {
          left: -2px;
          text-shadow: 2px 0 oklch(0.85 0.15 192);
          clip-path: inset(80% 0 0 0);
          animation: glitch-bottom 2.5s infinite linear alternate-reverse;
        }
        @keyframes glitch-top {
          0%, 90% { clip-path: inset(0 0 80% 0); }
          92% { clip-path: inset(10% 0 60% 0); transform: translate(2px, -1px); }
          94% { clip-path: inset(30% 0 40% 0); transform: translate(-1px, 1px); }
          96% { clip-path: inset(50% 0 20% 0); transform: translate(1px, 0); }
          100% { clip-path: inset(0 0 80% 0); }
        }
        @keyframes glitch-bottom {
          0%, 90% { clip-path: inset(80% 0 0 0); }
          93% { clip-path: inset(60% 0 10% 0); transform: translate(-2px, 1px); }
          96% { clip-path: inset(40% 0 30% 0); transform: translate(1px, -1px); }
          100% { clip-path: inset(80% 0 0 0); }
        }
        @keyframes glitch-skew {
          0%, 98% { transform: skew(0deg); }
          99% { transform: skew(0.5deg); }
          100% { transform: skew(0deg); }
        }
      `}</style>
      {children}
    </Tag>
  );
}
