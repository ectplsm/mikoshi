"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { TerminalCard } from "@/components/ui/terminal-card";
import { NeonButton } from "@/components/ui/neon-button";
import { validateUsername } from "@/lib/username";

function usernameErrorMessage(
  error: ReturnType<typeof validateUsername>
): string | null {
  if (!error) return null;
  switch (error.code) {
    case "too_short":
      return `Must be at least ${error.min} characters`;
    case "too_long":
      return `Must be at most ${error.max} characters`;
    case "invalid_format":
      return "Lowercase letters, digits, and hyphens only";
    case "reserved":
      return "This username is reserved";
  }
}

export function UsernameSetup() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const validationError = username
    ? usernameErrorMessage(validateUsername(username))
    : null;
  const canSave = username.length > 0 && !validationError && !saving;

  const confirm = useCallback(async () => {
    if (!canSave) return;
    setSaving(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/v1/me/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });

      if (res.ok) {
        router.push("/dashboard");
      } else if (res.status === 409) {
        setErrorMessage("Username already taken.");
      } else if (res.status === 403) {
        setErrorMessage("Username is already set.");
        router.push("/dashboard");
      } else {
        const data = await res.json().catch(() => null);
        setErrorMessage(data?.error ?? "Something went wrong.");
      }
    } catch {
      setErrorMessage("Network error.");
    } finally {
      setSaving(false);
    }
  }, [canSave, username, router]);

  return (
    <TerminalCard variant="brand">
      <div className="space-y-5">
        {/* URL preview */}
        <div className="text-xs text-muted-foreground">
          <span className="text-muted-foreground/50">&gt; profile url: </span>
          <span className="text-foreground font-mono">
            /@{username || "..."}
          </span>
        </div>

        {/* Input */}
        <input
          type="text"
          value={username}
          onChange={(e) => {
            setUsername(e.target.value.toLowerCase());
            setErrorMessage(null);
          }}
          placeholder="your-username"
          autoFocus
          className="w-full bg-input border border-border rounded-sm px-3 py-2 text-sm font-mono text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-brand/60"
          onKeyDown={(e) => e.key === "Enter" && confirm()}
        />

        {/* Validation hint */}
        {validationError && (
          <p className="text-xs text-destructive/80">{validationError}</p>
        )}

        {/* API error */}
        {errorMessage && (
          <p className="text-xs text-destructive/80">&gt; {errorMessage}</p>
        )}

        {/* Warning */}
        <div className="border border-amber-500/30 bg-amber-500/5 rounded-sm px-3 py-2">
          <p className="text-xs text-amber-500/90">
            This username is permanent and cannot be changed later.
          </p>
        </div>

        {/* Confirm button */}
        <NeonButton
          variant="brand"
          size="md"
          onClick={confirm}
          disabled={!canSave}
          className="w-full"
        >
          {saving ? "confirming..." : "confirm username"}
        </NeonButton>
      </div>
    </TerminalCard>
  );
}
