import { TerminalCard } from "@/components/ui/terminal-card";

interface MemoryStatusProps {
  hasMemory: boolean;
  manifest: Record<string, unknown> | null;
  memoryUpdatedAt: string | null;
}

export function MemoryStatus({
  hasMemory,
  manifest,
  memoryUpdatedAt,
}: MemoryStatusProps) {
  if (!hasMemory) {
    return (
      <TerminalCard title="memory.status">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="text-neon-yellow/60">&#9679;</span>
          <span>No encrypted memory uploaded</span>
        </div>
      </TerminalCard>
    );
  }

  const entryCount =
    typeof manifest?.memoryEntryCount === "number"
      ? manifest.memoryEntryCount
      : null;
  const latestDate =
    typeof manifest?.latestMemoryDate === "string"
      ? manifest.latestMemoryDate
      : null;
  const hasUserFile = manifest?.hasUserFile === true;
  const hasMemoryIndex = manifest?.hasMemoryIndex === true;

  return (
    <TerminalCard title="memory.status">
      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-neon-green">&#9679;</span>
          <span className="text-foreground/90">Encrypted memory stored</span>
        </div>

        <div className="grid grid-cols-2 gap-x-6 gap-y-1 pl-5 text-xs text-muted-foreground">
          <span>USER.md</span>
          <span className={hasUserFile ? "text-neon-green/80" : "text-muted-foreground/40"}>
            {hasUserFile ? "present" : "absent"}
          </span>

          <span>MEMORY.md</span>
          <span className={hasMemoryIndex ? "text-neon-green/80" : "text-muted-foreground/40"}>
            {hasMemoryIndex ? "present" : "absent"}
          </span>

          <span>memory entries</span>
          <span>{entryCount !== null ? entryCount : "unknown"}</span>

          {latestDate && (
            <>
              <span>latest entry</span>
              <span>{latestDate}</span>
            </>
          )}

          {memoryUpdatedAt && (
            <>
              <span>last synced</span>
              <span>{new Date(memoryUpdatedAt).toLocaleDateString()}</span>
            </>
          )}
        </div>
      </div>
    </TerminalCard>
  );
}
