import JSZip from "jszip";
import { PersonaFileType } from "@/generated/prisma/enums";

/** Maps filenames to their PersonaFileType (persona files only) */
const PERSONA_FILENAME_TO_TYPE: Record<string, PersonaFileType> = {
  "SOUL.md": PersonaFileType.SOUL,
  "IDENTITY.md": PersonaFileType.IDENTITY,
};

/** Memory file patterns — recognized but stored separately */
const MEMORY_FILENAMES = new Set(["USER.md", "MEMORY.md"]);
const MEMORY_ENTRY_PATTERN = /^memory\/\d{4}-\d{2}-\d{2}\.md$/;

const IMAGE_EXTENSIONS = new Set([
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".webp",
  ".svg",
]);

export interface ParsedPersonaFile {
  fileType: PersonaFileType;
  filename: string;
  content: string;
}

export interface ParsedMemoryFile {
  filename: string;
  content: string;
}

export interface ParsedAvatar {
  data: Buffer;
  filename: string;
  mimeType: string;
}

export interface ParsedEngram {
  personaFiles: ParsedPersonaFile[];
  memoryFiles: ParsedMemoryFile[];
  meta: Record<string, unknown> | null;
  avatar: ParsedAvatar | null;
}

/**
 * Parse an Engram Zip file into structured data.
 * Persona files and memory files are separated at parse time.
 * Validates filenames against a whitelist and rejects path traversal.
 */
export async function parseEngramZip(buffer: Buffer): Promise<ParsedEngram> {
  const zip = await JSZip.loadAsync(buffer);
  const personaFiles: ParsedPersonaFile[] = [];
  const memoryFiles: ParsedMemoryFile[] = [];
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

    // Persona files (SOUL.md, IDENTITY.md)
    const personaType = PERSONA_FILENAME_TO_TYPE[normalized];
    if (personaType) {
      const content = await entry.async("text");
      personaFiles.push({ fileType: personaType, filename: normalized, content });
      continue;
    }

    // Memory files (USER.md, MEMORY.md)
    if (MEMORY_FILENAMES.has(normalized)) {
      const content = await entry.async("text");
      memoryFiles.push({ filename: normalized, content });
      continue;
    }

    // Memory entries (memory/YYYY-MM-DD.md)
    if (MEMORY_ENTRY_PATTERN.test(normalized)) {
      const content = await entry.async("text");
      memoryFiles.push({ filename: normalized, content });
      continue;
    }

    // Skip unknown files silently
  }

  // Validate required files
  const hasSoul = personaFiles.some((f) => f.fileType === PersonaFileType.SOUL);
  if (!hasSoul) {
    throw new Error("SOUL.md is required in the Engram zip");
  }

  return { personaFiles, memoryFiles, meta, avatar };
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
