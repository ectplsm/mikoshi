import { cn } from "@/lib/utils";

type Visibility = "PUBLIC" | "UNLISTED" | "PRIVATE";

const config: Record<Visibility, { label: string; className: string }> = {
  PUBLIC: {
    label: "PUBLIC",
    className: "text-neon-green border-neon-green/40",
  },
  UNLISTED: {
    label: "UNLISTED",
    className: "text-neon-yellow border-neon-yellow/40",
  },
  PRIVATE: {
    label: "PRIVATE",
    className: "text-destructive border-destructive/40",
  },
};

interface VisibilityBadgeProps {
  visibility: Visibility;
  className?: string;
}

export function VisibilityBadge({
  visibility,
  className,
}: VisibilityBadgeProps) {
  const { label, className: badgeClass } = config[visibility];

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 text-[10px] font-mono border rounded-sm tracking-wider",
        badgeClass,
        className
      )}
    >
      {label}
    </span>
  );
}
