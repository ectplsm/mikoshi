"use client";

import { useCallback, useState } from "react";
import { TerminalCard } from "@/components/ui/terminal-card";
import { NeonButton } from "@/components/ui/neon-button";

interface UploadZoneProps {
  onUploadComplete?: () => void;
}

export function UploadZone({ onUploadComplete }: UploadZoneProps) {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const handleUpload = useCallback(
    async (file: File) => {
      setUploading(true);
      setStatus("uploading...");

      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("name", file.name.replace(/\.zip$/i, ""));

        const res = await fetch("/api/v1/engrams", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error ?? "Upload failed");
        }

        const data = await res.json();
        setStatus(`uploaded: ${data.id}`);
        onUploadComplete?.();
      } catch (err) {
        setStatus(`error: ${err instanceof Error ? err.message : "unknown"}`);
      } finally {
        setUploading(false);
      }
    },
    [onUploadComplete]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);

      const file = e.dataTransfer.files[0];
      if (file?.name.endsWith(".zip")) {
        handleUpload(file);
      } else {
        setStatus("error: only .zip files accepted");
      }
    },
    [handleUpload]
  );

  return (
    <TerminalCard title="upload.engram" variant="cyan">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-sm p-8 text-center transition-colors ${
          dragging
            ? "border-neon-cyan bg-neon-cyan/5"
            : "border-border hover:border-neon-cyan/40"
        }`}
      >
        <pre className="text-neon-cyan/40 text-xs mb-4 select-none">
          {`  ┌─────────────┐
  │  ▲ DROP ZIP  │
  │  │  HERE     │
  └─────────────┘`}
        </pre>

        <p className="text-sm text-muted-foreground mb-4">
          Drag & drop your Engram .zip file
        </p>

        <label>
          <NeonButton
            variant="cyan"
            size="sm"
            type="button"
            disabled={uploading}
            onClick={() =>
              document.getElementById("engram-file-input")?.click()
            }
          >
            {uploading ? "uploading..." : "or select file"}
          </NeonButton>
          <input
            id="engram-file-input"
            type="file"
            accept=".zip"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleUpload(file);
            }}
          />
        </label>

        {status && (
          <p
            className={`text-xs mt-4 font-mono ${
              status.startsWith("error")
                ? "text-destructive"
                : "text-neon-green"
            }`}
          >
            &gt; {status}
          </p>
        )}
      </div>
    </TerminalCard>
  );
}
