"use client";

import { useState, useEffect, useCallback } from "react";
import { TerminalCard } from "@/components/ui/terminal-card";
import { NeonButton } from "@/components/ui/neon-button";

interface ApiKeyItem {
  id: string;
  name: string;
  prefix: string;
  lastUsedAt: string | null;
  createdAt: string;
}

export function ApiKeyManager() {
  const [keys, setKeys] = useState<ApiKeyItem[]>([]);
  const [newKeyName, setNewKeyName] = useState("");
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchKeys = useCallback(async () => {
    const res = await fetch("/api/v1/api-keys");
    if (res.ok) {
      setKeys(await res.json());
    }
  }, []);

  useEffect(() => {
    fetchKeys();
  }, [fetchKeys]);

  const createKey = async () => {
    if (!newKeyName.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/v1/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newKeyName.trim() }),
      });
      if (res.ok) {
        const data = await res.json();
        setCreatedKey(data.key);
        setNewKeyName("");
        fetchKeys();
      }
    } finally {
      setLoading(false);
    }
  };

  const deleteKey = async (id: string) => {
    await fetch("/api/v1/api-keys", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    fetchKeys();
  };

  return (
    <TerminalCard title="api_keys.manage" variant="magenta">
      <div className="space-y-4">
        {/* Create new key */}
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="key name"
            value={newKeyName}
            onChange={(e) => setNewKeyName(e.target.value)}
            className="flex-1 bg-input border border-border rounded-sm px-3 py-1.5 text-sm font-mono text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-neon-cyan/60"
            onKeyDown={(e) => e.key === "Enter" && createKey()}
          />
          <NeonButton
            variant="cyan"
            size="sm"
            onClick={createKey}
            disabled={loading || !newKeyName.trim()}
          >
            generate
          </NeonButton>
        </div>

        {/* Show newly created key */}
        {createdKey && (
          <div className="bg-neon-green/5 border border-neon-green/30 rounded-sm p-3">
            <p className="text-xs text-neon-green mb-1">
              &gt; Key created. Copy it now — it will not be shown again.
            </p>
            <code className="text-xs text-foreground break-all select-all">
              {createdKey}
            </code>
            <NeonButton
              variant="cyan"
              size="sm"
              className="mt-2"
              onClick={() => {
                navigator.clipboard.writeText(createdKey);
                setCreatedKey(null);
              }}
            >
              copy & dismiss
            </NeonButton>
          </div>
        )}

        {/* Key list */}
        <div className="space-y-2">
          {keys.map((key) => (
            <div
              key={key.id}
              className="flex items-center justify-between text-xs border border-border rounded-sm px-3 py-2"
            >
              <div>
                <span className="text-foreground">{key.name}</span>
                <span className="text-muted-foreground ml-2">
                  {key.prefix}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-muted-foreground/50">
                  {key.lastUsedAt
                    ? `used ${new Date(key.lastUsedAt).toLocaleDateString()}`
                    : "never used"}
                </span>
                <button
                  onClick={() => deleteKey(key.id)}
                  className="text-destructive/60 hover:text-destructive transition-colors cursor-pointer"
                >
                  [del]
                </button>
              </div>
            </div>
          ))}
          {keys.length === 0 && (
            <p className="text-xs text-muted-foreground/50">
              &gt; no api keys configured
            </p>
          )}
        </div>
      </div>
    </TerminalCard>
  );
}
