import { FileType } from "@/generated/prisma/enums";

/**
 * File types visible to non-owners on Public/Unlisted Engrams.
 */
export const PUBLIC_FILE_TYPES: ReadonlySet<FileType> = new Set([
  FileType.SOUL,
  FileType.IDENTITY,
]);

/**
 * File types that are always private (owner-only).
 */
export const PRIVATE_FILE_TYPES: ReadonlySet<FileType> = new Set([
  FileType.USER,
  FileType.MEMORY,
  FileType.HEARTBEAT,
  FileType.AGENTS,
  FileType.MEMORY_ENTRY,
]);

/**
 * Filter Engram files based on ownership.
 * Non-owners only see SOUL.md and IDENTITY.md.
 */
export function filterEngramFiles<T extends { fileType: FileType }>(
  files: T[],
  isOwner: boolean
): T[] {
  if (isOwner) return files;
  return files.filter((f) => PUBLIC_FILE_TYPES.has(f.fileType));
}
