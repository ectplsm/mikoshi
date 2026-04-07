"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { NeonButton } from "@/components/ui/neon-button";
import { VisibilityBadge } from "@/components/ui/visibility-badge";

type Visibility = "PRIVATE" | "UNLISTED" | "PUBLIC";

const VISIBILITY_OPTIONS: Array<{
  value: Visibility;
  label: string;
  hint: string;
}> = [
  {
    value: "PRIVATE",
    label: "Private",
    hint: "Only you can open this Engram.",
  },
  {
    value: "UNLISTED",
    label: "Unlisted",
    hint: "Anyone with the link can open it.",
  },
  {
    value: "PUBLIC",
    label: "Public",
    hint: "Visible on your public profile.",
  },
];

const CONFIRM_COPY: Record<
  Visibility,
  { title: string; body: string }
> = {
  PRIVATE: {
    title: "Set visibility to private?",
    body: "Only you will be able to open this Engram.",
  },
  UNLISTED: {
    title: "Set visibility to unlisted?",
    body: "Anyone with the link will be able to open this Engram.",
  },
  PUBLIC: {
    title: "Set visibility to public?",
    body: "This Engram will appear on your public profile and anyone can open it.",
  },
};

interface EngramVisibilityControlProps {
  engramId: string;
  currentVisibility: Visibility;
}

export function EngramVisibilityControl({
  engramId,
  currentVisibility,
}: EngramVisibilityControlProps) {
  const router = useRouter();
  const [visibility, setVisibility] = useState<Visibility>(currentVisibility);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [pendingVisibility, setPendingVisibility] = useState<Visibility | null>(
    null
  );
  const [message, setMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);

  useEffect(() => {
    setVisibility(currentVisibility);
  }, [currentVisibility]);

  const save = async (nextVisibility: Visibility) => {
    if (nextVisibility === visibility || saving) {
      setOpen(false);
      setPendingVisibility(null);
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch(`/api/v1/engrams/${engramId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visibility: nextVisibility }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        setMessage({
          text: data?.error ?? "Failed to update visibility.",
          type: "error",
        });
        return;
      }

      setVisibility(nextVisibility);
      setMessage({
        text: `Visibility updated to ${nextVisibility.toLowerCase()}.`,
        type: "success",
      });
      setOpen(false);
      setPendingVisibility(null);
      router.refresh();
    } catch {
      setMessage({ text: "Network error.", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const handleSelect = (nextVisibility: Visibility) => {
    if (nextVisibility === visibility || saving) {
      setOpen(false);
      return;
    }
    setPendingVisibility(nextVisibility);
  };

  const close = () => {
    if (saving) return;
    setOpen(false);
    setPendingVisibility(null);
  };

  const confirmCopy = pendingVisibility
    ? CONFIRM_COPY[pendingVisibility]
    : null;

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="cursor-pointer"
        disabled={saving}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Change visibility"
      >
        <VisibilityBadge
          visibility={visibility}
          className="hover:border-brand/60 hover:text-brand"
        />
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/60"
            onClick={close}
          />
          <div className="fixed left-1/2 top-1/2 z-50 w-[min(28rem,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 rounded-sm border border-brand/30 bg-card p-4 shadow-lg shadow-brand/10">
            {pendingVisibility ? (
              <div className="space-y-2">
                <h2 className="text-sm font-mono text-foreground">
                  {confirmCopy?.title}
                </h2>
                <p className="text-sm text-muted-foreground/80">
                  Confirm this visibility change for the Engram.
                </p>
                <p className="text-xs text-muted-foreground/70">
                  {confirmCopy?.body}
                </p>
                <div className="flex items-center gap-2 pt-2">
                  <NeonButton
                    variant="brand"
                    size="sm"
                    onClick={() => void save(pendingVisibility)}
                    disabled={saving}
                  >
                    {saving ? "saving..." : "confirm"}
                  </NeonButton>
                  <NeonButton
                    variant="ghost"
                    size="sm"
                    onClick={() => setPendingVisibility(null)}
                    disabled={saving}
                  >
                    back
                  </NeonButton>
                </div>
              </div>
            ) : (
              <>
                <div className="mb-3 space-y-1">
                  <h2 className="text-sm font-mono text-foreground">
                    Change visibility
                  </h2>
                  <p className="text-xs text-muted-foreground/70">
                    Choose who can access this Engram
                  </p>
                </div>
                <div className="grid gap-1">
                  {VISIBILITY_OPTIONS.map((option) => {
                    const selected = option.value === visibility;

                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => handleSelect(option.value)}
                        className={[
                          "rounded-sm border px-2.5 py-2 text-left transition-colors",
                          selected
                            ? "border-brand/60 bg-brand/10"
                            : "border-transparent hover:border-brand/30 hover:bg-brand/5",
                        ].join(" ")}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <div className="text-sm font-mono text-foreground">
                              {option.label}
                            </div>
                            <div className="text-xs text-muted-foreground/70">
                              {option.hint}
                            </div>
                          </div>
                          <VisibilityBadge visibility={option.value} />
                        </div>
                      </button>
                    );
                  })}
                </div>
                <div className="flex items-center gap-2 pt-3">
                  <NeonButton
                    variant="ghost"
                    size="sm"
                    onClick={close}
                    disabled={saving}
                  >
                    close
                  </NeonButton>
                </div>
              </>
            )}
          </div>
        </>
      )}

      {message && (
        <p
          className={`mt-2 text-xs ${
            message.type === "success"
              ? "text-neon-green"
              : "text-destructive/80"
          }`}
        >
          &gt; {message.text}
        </p>
      )}

    </div>
  );
}
