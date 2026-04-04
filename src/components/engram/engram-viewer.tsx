"use client";

import { useState } from "react";
import { TerminalCard } from "@/components/ui/terminal-card";

interface EngramFile {
  fileType: string;
  filename: string;
  content: string;
}

interface EngramViewerProps {
  files: EngramFile[];
}

export function EngramViewer({ files }: EngramViewerProps) {
  const [activeTab, setActiveTab] = useState(0);

  if (files.length === 0) {
    return (
      <TerminalCard title="files.empty">
        <p className="text-sm text-muted-foreground">
          &gt; No files available to display.
        </p>
      </TerminalCard>
    );
  }

  const activeFile = files[activeTab];

  return (
    <div className="space-y-2">
      {/* Tab bar */}
      <div className="flex gap-0.5 overflow-x-auto">
        {files.map((file, idx) => (
          <button
            key={file.filename}
            onClick={() => setActiveTab(idx)}
            className={`px-3 py-1.5 text-xs font-mono border rounded-t-sm transition-colors cursor-pointer whitespace-nowrap ${
              idx === activeTab
                ? "border-brand/40 border-b-transparent text-brand bg-card"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {file.filename}
          </button>
        ))}
      </div>

      {/* Content */}
      <TerminalCard title={`cat ${activeFile.filename}`} variant="brand">
        <pre className="text-sm text-foreground/90 whitespace-pre-wrap break-words overflow-x-auto max-h-[600px] overflow-y-auto">
          {activeFile.content}
        </pre>
      </TerminalCard>
    </div>
  );
}
