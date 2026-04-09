import { PersonaFileType } from "@/generated/prisma/enums";

/**
 * Filter persona files based on ownership.
 * Non-owners see SOUL.md and IDENTITY.md only.
 * Owners see all persona files, including engram.json.
 */
export function filterPersonaFiles<T extends { fileType: PersonaFileType }>(
  files: T[],
  isOwner: boolean
): T[] {
  if (isOwner) return files;
  return files.filter(
    (f) =>
      f.fileType === PersonaFileType.SOUL ||
      f.fileType === PersonaFileType.IDENTITY
  );
}
