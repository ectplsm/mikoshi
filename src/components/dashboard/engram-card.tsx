"use client";

import Image from "next/image";
import Link from "next/link";
import { TerminalCard } from "@/components/ui/terminal-card";
import { VisibilityBadge } from "@/components/ui/visibility-badge";

interface EngramCardProps {
  id: string;
  name: string;
  description?: string | null;
  visibility: "PUBLIC" | "UNLISTED" | "PRIVATE";
  tags: string[];
  avatarUrl?: string | null;
  updatedAt: string;
  hasMemory?: boolean;
}

export function EngramCard({
  id,
  name,
  description,
  visibility,
  tags,
  avatarUrl,
  updatedAt,
  hasMemory,
}: EngramCardProps) {
  return (
    <Link href={`/e/${id}`} className="block group">
      <TerminalCard
        title={id}
        className="h-full transition-all duration-200 group-hover:box-glow-cyan"
      >
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            {avatarUrl && (
              <Image
                src={avatarUrl}
                alt=""
                className="w-10 h-10 rounded-sm border border-border object-cover"
                width={40}
                height={40}
                unoptimized
              />
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-foreground truncate">
                  {name}
                </h3>
                <VisibilityBadge visibility={visibility} />
              </div>
              {description && (
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  {description}
                </p>
              )}
            </div>
          </div>

          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] text-neon-cyan/70 border border-neon-cyan/20 px-1.5 py-0.5 rounded-sm"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center gap-3 text-[10px] text-muted-foreground/50">
            <span>updated {new Date(updatedAt).toLocaleDateString()}</span>
            {hasMemory && (
              <span className="flex items-center gap-1 text-neon-green/60" title="Encrypted memory stored">
                <span>&#9679;</span> memory
              </span>
            )}
          </div>
        </div>
      </TerminalCard>
    </Link>
  );
}
