"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { TerminalCard } from "@/components/ui/terminal-card";
import { NeonButton } from "@/components/ui/neon-button";
import { ProfileAvatarControl } from "@/components/dashboard/profile-avatar-control";
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

type AvailabilityStatus = "idle" | "checking" | "available" | "taken";

interface UsernameSetupProps {
  initialDisplayName?: string;
  currentImageUrl: string | null;
}

export function UsernameSetup({
  initialDisplayName = "",
  currentImageUrl,
}: UsernameSetupProps) {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState(initialDisplayName);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [availability, setAvailability] = useState<AvailabilityStatus>("idle");
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

  const validationError = username
    ? usernameErrorMessage(validateUsername(username))
    : null;

  // Debounced availability check
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    // Skip check if empty or has validation errors
    if (!username || validationError) {
      setAvailability("idle");
      return;
    }

    setAvailability("checking");

    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/v1/me/username-availability?username=${encodeURIComponent(username)}`
        );
        if (res.ok) {
          const data = await res.json();
          setAvailability(data.available ? "available" : "taken");
        } else {
          setAvailability("idle");
        }
      } catch {
        setAvailability("idle");
      }
    }, 400);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [username, validationError]);

  const canSave =
    username.length > 0 &&
    !validationError &&
    !saving &&
    availability !== "checking" &&
    availability !== "taken";

  const confirm = useCallback(async () => {
    if (!canSave) return;
    setSaving(true);
    setErrorMessage(null);

    try {
      const body: Record<string, string> = { username };
      if (displayName.trim()) {
        body.displayName = displayName.trim();
      }

      const res = await fetch("/api/v1/me/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        router.push("/dashboard");
      } else if (res.status === 409) {
        setErrorMessage("Username already taken.");
        setAvailability("taken");
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
  }, [canSave, username, displayName, router]);

  return (
    <TerminalCard variant="brand">
      <div className="space-y-5">
        <div className="space-y-2">
          <ProfileAvatarControl
            username={displayName.trim() || username || "?"}
            displayName={displayName.trim() || undefined}
            currentImageUrl={currentImageUrl}
          />
          <p className="text-xs text-muted-foreground/50">
            Optional. You can change this later in Settings.
          </p>
        </div>

        <div className="border-t border-border" />

        {/* Username section */}
        <div className="space-y-2">
          <div className="text-xs text-muted-foreground font-medium">
            Username
          </div>
          <div className="text-xs text-muted-foreground">
            <span className="text-muted-foreground/50">
              &gt; profile url:{" "}
            </span>
            <span className="text-foreground font-mono">
              /@{username || "..."}
            </span>
          </div>
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
          />
          {validationError && (
            <p className="text-xs text-destructive/80">{validationError}</p>
          )}
          {!validationError && availability === "checking" && (
            <p className="text-xs text-muted-foreground/50">checking...</p>
          )}
          {!validationError && availability === "available" && (
            <p className="text-xs text-neon-green">&gt; available</p>
          )}
          {!validationError && availability === "taken" && (
            <p className="text-xs text-destructive/80">
              &gt; username already taken
            </p>
          )}
          <div className="border border-amber-500/30 bg-amber-500/5 rounded-sm px-3 py-2">
            <p className="text-xs text-amber-500/90">
              Username is permanent and cannot be changed later.
            </p>
          </div>
        </div>

        {/* Display name section */}
        <div className="space-y-2">
          <div className="text-xs text-muted-foreground font-medium">
            Display Name
            <span className="text-muted-foreground/50 ml-1">(optional)</span>
          </div>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Your display name"
            className="w-full bg-input border border-border rounded-sm px-3 py-2 text-sm font-mono text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-brand/60"
          />
          <p className="text-xs text-muted-foreground/50">
            You can change this later in Settings.
          </p>
        </div>

        {/* API error */}
        {errorMessage && (
          <p className="text-xs text-destructive/80">&gt; {errorMessage}</p>
        )}

        {/* Confirm button */}
        <NeonButton
          variant="brand"
          size="md"
          onClick={confirm}
          disabled={!canSave}
          className="w-full"
        >
          {saving ? "confirming..." : "confirm"}
        </NeonButton>
      </div>
    </TerminalCard>
  );
}
