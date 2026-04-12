export const AVATAR_MAX_BYTES = 2 * 1024 * 1024;
export const AVATAR_MAX_DIMENSION = 2048;
export const AVATAR_OUTPUT_SIZE = 512;

export const AVATAR_ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export type AvatarAllowedMimeType = (typeof AVATAR_ALLOWED_MIME_TYPES)[number];

export function isAllowedAvatarMimeType(
  value: string
): value is AvatarAllowedMimeType {
  return (AVATAR_ALLOWED_MIME_TYPES as readonly string[]).includes(value);
}

export function isManagedAvatarUrl(url: string | null | undefined): boolean {
  if (!url) return false;

  const publicUrl = process.env.R2_PUBLIC_URL;
  return !!publicUrl && url.startsWith(`${publicUrl}/`);
}

