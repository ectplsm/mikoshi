"use client";

import { useState, useCallback } from "react";
import { TerminalCard } from "@/components/ui/terminal-card";
import { NeonButton } from "@/components/ui/neon-button";
import { ProfileAvatarControl } from "@/components/dashboard/profile-avatar-control";

interface ProfileEditorProps {
  currentUsername: string;
  currentDisplayName: string;
  currentImageUrl: string | null;
}

export function ProfileEditor({
  currentUsername,
  currentDisplayName,
  currentImageUrl,
}: ProfileEditorProps) {
  // ─── Display name state ───
  const [displayName, setDisplayName] = useState(currentDisplayName);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);

  const nameChanged = displayName !== currentDisplayName;
  const canSave = nameChanged && displayName.trim().length > 0 && !saving;

  const save = useCallback(async () => {
    if (!canSave) return;
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch("/api/v1/me/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName: displayName.trim() }),
      });

      if (res.ok) {
        setMessage({ text: "Display name updated.", type: "success" });
      } else {
        const data = await res.json().catch(() => null);
        setMessage({
          text: data?.error ?? "Something went wrong.",
          type: "error",
        });
      }
    } catch {
      setMessage({ text: "Network error.", type: "error" });
    } finally {
      setSaving(false);
    }
  }, [canSave, displayName]);

  return (
    <TerminalCard title="Profile" variant="brand">
      <div className="space-y-6">
        <ProfileAvatarControl
          username={currentUsername}
          displayName={currentDisplayName}
          currentImageUrl={currentImageUrl}
        />

        <div className="border-t border-border" />

        {/* ─── Username (locked) ─── */}
        <div className="space-y-2">
          <div className="text-xs text-muted-foreground font-medium">
            Username
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-mono text-foreground">
              {currentUsername}
            </span>
            <span className="text-muted-foreground/50 text-xs">[locked]</span>
          </div>
          <div className="text-xs text-muted-foreground/50">
            &gt; /@{currentUsername}
          </div>
        </div>

        {/* ─── Display name ─── */}
        <div className="space-y-3">
          <div className="text-xs text-muted-foreground font-medium">
            Display Name
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={displayName}
              onChange={(e) => {
                setDisplayName(e.target.value);
                setMessage(null);
              }}
              placeholder="Your display name"
              className="flex-1 bg-input border border-border rounded-sm px-3 py-1.5 text-sm font-mono text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-brand/60"
              onKeyDown={(e) => e.key === "Enter" && save()}
            />
            <NeonButton
              variant="brand"
              size="sm"
              onClick={save}
              disabled={!canSave}
            >
              {saving ? "saving..." : "save"}
            </NeonButton>
          </div>

          {message && (
            <p
              className={`text-xs ${
                message.type === "success"
                  ? "text-neon-green"
                  : "text-destructive/80"
              }`}
            >
              &gt; {message.text}
            </p>
          )}
        </div>
      </div>
    </TerminalCard>
  );
}
