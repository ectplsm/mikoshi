"use client";

import { cn } from "@/lib/utils";

interface UserAvatarProps {
  username: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizes = {
  sm: "w-8 h-8 text-xs",
  md: "w-12 h-12 text-sm",
  lg: "w-16 h-16 text-lg",
};

export function UserAvatar({ username, size = "md", className }: UserAvatarProps) {
  const initial = (username[0] ?? "?").toUpperCase();

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-sm border border-border bg-secondary font-mono font-bold text-brand select-none",
        sizes[size],
        className
      )}
    >
      {initial}
    </div>
  );
}
