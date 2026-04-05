"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { NeonButton } from "@/components/ui/neon-button";

interface EngramCardActionsProps {
  engramId: string;
  isOwner: boolean;
  isAuthenticated: boolean;
  visibility: "PUBLIC" | "UNLISTED" | "PRIVATE";
}

export function EngramCardActions({
  engramId,
  isOwner,
  isAuthenticated,
  visibility,
}: EngramCardActionsProps) {
  const router = useRouter();
  const [showClonePopup, setShowClonePopup] = useState(false);
  const [copied, setCopied] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const engramUrl = typeof window !== "undefined"
    ? `${window.location.origin}/e/${engramId}`
    : `/e/${engramId}`;

  const cloneCommand = `relic clone ${engramUrl}`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(cloneCommand);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDelete = async () => {
    if (!confirm("Delete this Engram? This cannot be undone.")) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/v1/engrams/${engramId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        router.push("/dashboard");
      }
    } finally {
      setDeleting(false);
    }
  };

  const showClone = isAuthenticated && !isOwner && visibility !== "PRIVATE";

  if (!showClone && !isOwner) return null;

  return (
    <div className="relative flex items-center gap-1">
      {showClone && (
        <NeonButton
          variant="ghost"
          size="sm"
          className="px-1.5 py-0.5"
          onClick={() => setShowClonePopup((v) => !v)}
        >
          [ clone ]
        </NeonButton>
      )}
      {isOwner && (
        <NeonButton
          variant="ghost-destructive"
          size="sm"
          className="px-1.5 py-0.5"
          onClick={handleDelete}
          disabled={deleting}
        >
          {deleting ? "deleting..." : "[ delete ]"}
        </NeonButton>
      )}

      {/* Clone command modal */}
      {showClonePopup && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50"
            onClick={() => setShowClonePopup(false)}
          />
          <div className="fixed top-1/3 left-1/2 -translate-x-1/2 z-50 w-[min(24rem,calc(100vw-2rem))] border border-brand/30 bg-card rounded-sm shadow-lg shadow-brand/5 p-4 space-y-3">
            <div className="text-xs text-muted-foreground font-medium">
              Clone with Relic CLI
            </div>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-xs font-mono text-foreground bg-input border border-border rounded-sm px-2 py-1.5 overflow-x-auto whitespace-nowrap">
                {cloneCommand}
              </code>
              <button
                onClick={handleCopy}
                className="shrink-0 text-xs font-mono text-brand border border-brand/40 rounded-sm px-2 py-1.5 hover:bg-brand/10 transition-colors cursor-pointer"
              >
                {copied ? "copied!" : "copy"}
              </button>
            </div>
            <p className="text-[10px] text-muted-foreground/50">
              Requires{" "}
              <a
                href="https://github.com/ectplsm/relic"
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand/70 hover:underline"
              >
                Relic CLI
              </a>
            </p>
          </div>
        </>
      )}
    </div>
  );
}
