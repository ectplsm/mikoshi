import JSZip from "jszip";
import { FileType } from "@/generated/prisma/enums";

/** Maps filenames (relative paths) to their FileType */
const FILENAME_TO_TYPE: Record<string, FileType> = {
  "SOUL.md": FileType.SOUL,
  "IDENTITY.md": FileType.IDENTITY,
  "AGENTS.md": FileType.AGENTS,
  "USER.md": FileType.USER,
  "MEMORY.md": FileType.MEMORY,
  "HEARTBEAT.md": FileType.HEARTBEAT,
};

const MEMORY_ENTRY_PATTERN = /^memory\/\d{4}-\d{2}-\d{2}\.md$/;

const IMAGE_EXTENSIONS = new Set([
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".webp",
  ".svg",
]);

export interface ParsedEngramFile {
  fileType: FileType;
  filename: string;
  content: string;
}

export interface ParsedAvatar {
  data: Buffer;
  filename: string;
  mimeType: string;
}

export interface ParsedEngram {
  files: ParsedEngramFile[];
  meta: Record<string, unknown> | null;
  avatar: ParsedAvatar | null;
}

/**
 * Parse an Engram Zip file into structured data.
 * Validates filenames against a whitelist and rejects path traversal.
 */
export async function parseEngramZip(buffer: Buffer): Promise<ParsedEngram> {
  const zip = await JSZip.loadAsync(buffer);
  const files: ParsedEngramFile[] = [];
  let meta: Record<string, unknown> | null = null;
  let avatar: ParsedAvatar | null = null;
  let avatarPath: string | null = null;

  // First pass: find avatar reference in IDENTITY.md frontmatter
  for (const [path, entry] of Object.entries(zip.files)) {
    if (entry.dir) continue;
    const normalized = normalizePath(path);
    if (normalized === "IDENTITY.md") {
      const content = await entry.async("text");
      avatarPath = extractAvatarPath(content);
      break;
    }
  }

  for (const [path, entry] of Object.entries(zip.files)) {
    if (entry.dir) continue;

    const normalized = normalizePath(path);

    // Reject path traversal
    if (normalized.includes("..") || normalized.startsWith("/")) {
      throw new Error(`Invalid path in zip: ${path}`);
    }

    // engram.json metadata
    if (normalized === "engram.json") {
      const text = await entry.async("text");
      meta = JSON.parse(text);
      continue;
    }

    // Check if this is the avatar image
    const ext = normalized.slice(normalized.lastIndexOf(".")).toLowerCase();
    if (IMAGE_EXTENSIONS.has(ext)) {
      // Match if it's the referenced avatar path, or if named "avatar.*"
      const basename = normalized.split("/").pop() ?? "";
      if (
        (avatarPath && normalized === normalizePath(avatarPath)) ||
        basename.startsWith("avatar.")
      ) {
        const data = await entry.async("nodebuffer");
        avatar = {
          data: Buffer.from(data),
          filename: basename,
          mimeType: getMimeType(ext),
        };
      }
      continue;
    }

    // Known top-level files
    const knownType = FILENAME_TO_TYPE[normalized];
    if (knownType) {
      const content = await entry.async("text");
      files.push({ fileType: knownType, filename: normalized, content });
      continue;
    }

    // Memory entries
    if (MEMORY_ENTRY_PATTERN.test(normalized)) {
      const content = await entry.async("text");
      files.push({
        fileType: FileType.MEMORY_ENTRY,
        filename: normalized,
        content,
      });
      continue;
    }

    // Skip unknown files silently
  }

  // Validate required files
  const hasRequiredFiles = files.some((f) => f.fileType === FileType.SOUL);
  if (!hasRequiredFiles) {
    throw new Error("SOUL.md is required in the Engram zip");
  }

  return { files, meta, avatar };
}

/**
 * Extract avatar path from IDENTITY.md frontmatter.
 * Looks for `avatar: ./path/to/image.png` in YAML frontmatter.
 */
function extractAvatarPath(content: string): string | null {
  const frontmatterMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!frontmatterMatch) return null;

  const avatarMatch = frontmatterMatch[1].match(
    /^avatar:\s*(.+)$/m
  );
  if (!avatarMatch) return null;

  return avatarMatch[1].trim().replace(/^["']|["']$/g, "");
}

/**
 * Remove leading directory prefix (e.g., "engramName/SOUL.md" -> "SOUL.md")
 * This handles zips where files are nested in a single root folder.
 */
function normalizePath(path: string): string {
  const parts = path.split("/").filter(Boolean);

  // If there's a memory/ directory, keep it
  const memIdx = parts.indexOf("memory");
  if (memIdx >= 0) {
    return parts.slice(memIdx).join("/");
  }

  // Return just the filename for top-level files
  return parts[parts.length - 1];
}

function getMimeType(ext: string): string {
  const types: Record<string, string> = {
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".gif": "image/gif",
    ".webp": "image/webp",
    ".svg": "image/svg+xml",
  };
  return types[ext] ?? "application/octet-stream";
}
