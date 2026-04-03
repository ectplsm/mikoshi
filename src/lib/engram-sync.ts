import { createHash } from "node:crypto";
import { PersonaFileType } from "@/generated/prisma/enums";
import type { MemoryManifest } from "@/lib/schemas/engram";

type PersonaFileForSync = {
  fileType: PersonaFileType;
  content: string;
  updatedAt: Date;
};

type MemoryBlobForSync = {
  version: number;
  updatedAt: Date;
  memoryContentHash: string;
  bundleHash: string;
  manifestJson: unknown;
};

export const PERSONA_HASH_VERSION = "mikoshi.persona.v1";
export const MEMORY_HASH_VERSION = "mikoshi.memory.v1";

function normalizeText(content: string) {
  return content
    .replace(/^\uFEFF/, "")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n");
}

export function normalizePersonaText(content: string) {
  return normalizeText(content).replace(/\n+$/u, "");
}

export function normalizeMemoryText(content: string) {
  return normalizeText(content);
}

export function buildPersonaCanonicalPayload(
  soulContent: string,
  identityContent: string
) {
  const normalizedSoul = normalizePersonaText(soulContent);
  const normalizedIdentity = normalizePersonaText(identityContent);

  return [
    PERSONA_HASH_VERSION,
    "SOUL.md",
    String(Buffer.byteLength(normalizedSoul, "utf8")),
    normalizedSoul,
    "IDENTITY.md",
    String(Buffer.byteLength(normalizedIdentity, "utf8")),
    normalizedIdentity,
  ].join("\n");
}

export function hashPersonaFiles(soulContent: string, identityContent: string) {
  return `sha256:${createHash("sha256")
    .update(buildPersonaCanonicalPayload(soulContent, identityContent))
    .digest("hex")}`;
}

export function buildMemoryCanonicalPayload(files: Record<string, string>) {
  const entries = Object.entries(files)
    .filter(([path]) =>
      path === "USER.md" ||
      path === "MEMORY.md" ||
      path.startsWith("memory/")
    )
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([path, content]) => {
      const normalized = normalizeMemoryText(content);
      return [
        path,
        String(Buffer.byteLength(normalized, "utf8")),
        normalized,
      ];
    })
    .flat();

  if (entries.length === 0) return null;

  return [MEMORY_HASH_VERSION, ...entries].join("\n");
}

export function hashMemoryFiles(files: Record<string, string>) {
  const payload = buildMemoryCanonicalPayload(files);
  if (payload === null) return null;

  return `sha256:${createHash("sha256").update(payload).digest("hex")}`;
}

export function buildPersonaSyncStatus(files: PersonaFileForSync[]) {
  const soul = files.find((file) => file.fileType === PersonaFileType.SOUL);
  const identity = files.find((file) => file.fileType === PersonaFileType.IDENTITY);

  const hasSoul = !!soul;
  const hasIdentity = !!identity;

  if (!hasSoul || !hasIdentity) {
    return {
      exists: hasSoul || hasIdentity,
      token: null,
      files: {
        hasSoul,
        hasIdentity,
      },
    };
  }

  const latestUpdatedAt =
    soul.updatedAt > identity.updatedAt ? soul.updatedAt : identity.updatedAt;

  return {
    exists: true,
    token: {
      hash: hashPersonaFiles(soul.content, identity.content),
      updatedAt: latestUpdatedAt.toISOString(),
    },
    files: {
      hasSoul: true,
      hasIdentity: true,
    },
  };
}

export function buildMemorySyncStatus(blob: MemoryBlobForSync | null) {
  if (!blob) {
    return {
      exists: false,
      token: null,
      summary: null,
    };
  }

  const manifest = blob.manifestJson as Partial<MemoryManifest> | null;

  return {
    exists: true,
    token: {
      memoryContentHash: blob.memoryContentHash,
      bundleHash: blob.bundleHash,
      version: blob.version,
      updatedAt: blob.updatedAt.toISOString(),
    },
    summary: {
      hasUserFile: manifest?.hasUserFile === true,
      hasMemoryIndex: manifest?.hasMemoryIndex === true,
      memoryEntryCount:
        typeof manifest?.memoryEntryCount === "number"
          ? manifest.memoryEntryCount
          : 0,
      latestMemoryDate:
        typeof manifest?.latestMemoryDate === "string"
          ? manifest.latestMemoryDate
          : null,
    },
  };
}
