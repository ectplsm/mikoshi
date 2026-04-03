import { PersonaFileType } from "@/generated/prisma/enums";

/**
 * Persona file types visible to non-owners on Public/Unlisted Engrams.
 * All persona files are public-safe by definition.
 */
export const PUBLIC_PERSONA_FILE_TYPES: ReadonlySet<PersonaFileType> = new Set([
  PersonaFileType.SOUL,
  PersonaFileType.IDENTITY,
  PersonaFileType.ENGRAM_JSON,
]);

/**
 * Filter persona files based on ownership.
 * Non-owners see SOUL.md and IDENTITY.md only (no engram.json for now).
 * Owner sees all persona files.
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
