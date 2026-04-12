"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

interface UserAvatarProps {
  username: string;
  displayName?: string | null;
  imageUrl?: string | null;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizes = {
  sm: "w-8 h-8 text-xs",
  md: "w-12 h-12 text-sm",
  lg: "w-16 h-16 text-lg",
  xl: "w-24 h-24 text-2xl",
};

function getInitials(displayName: string | null | undefined, username: string) {
  const source = displayName?.trim() || username.trim();
  if (!source) return "?";

  const tokens = source.split(/\s+/).filter(Boolean);
  if (tokens.length >= 2) {
    return tokens
      .slice(0, 2)
      .map((token) => token[0] ?? "")
      .join("")
      .toUpperCase();
  }

  return (source[0] ?? "?").toUpperCase();
}

export function UserAvatar({
  username,
  displayName,
  imageUrl,
  size = "md",
  className,
}: UserAvatarProps) {
  const initial = getInitials(displayName, username);

  return (
    <div
      className={cn(
        "relative flex items-center justify-center overflow-hidden rounded-sm border border-border bg-secondary font-mono font-bold text-brand select-none",
        sizes[size],
        className
      )}
    >
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt=""
          fill
          sizes="96px"
          className="object-cover"
          unoptimized
        />
      ) : (
        <span suppressHydrationWarning>{initial}</span>
      )}
    </div>
  );
}
