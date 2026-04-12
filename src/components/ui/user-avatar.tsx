"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

interface UserAvatarProps {
  username: string;
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

export function UserAvatar({
  username,
  imageUrl,
  size = "md",
  className,
}: UserAvatarProps) {
  const initial = (username[0] ?? "?").toUpperCase();

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
        initial
      )}
    </div>
  );
}
