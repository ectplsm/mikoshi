import { z } from "zod";

// ─── Constants ───

/** Lowercase alphanumeric with hyphens, no leading/trailing/consecutive hyphens */
export const USERNAME_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export const USERNAME_MIN_LENGTH = 3;
export const USERNAME_MAX_LENGTH = 30;

/**
 * Route segments and system names that must never be claimed as usernames.
 * Keep sorted for readability; the Set lookup is O(1) regardless.
 */
export const RESERVED_USERNAMES = new Set([
  "admin",
  "api",
  "auth",
  "dashboard",
  "e",
  "login",
  "logout",
  "onboarding",
  "settings",
]);

/**
 * Returns true if the user has not yet chosen a username.
 * The default value in the DB schema is "" (empty string).
 */
export function isUsernameEmpty(username: string): boolean {
  return username === "";
}

// ─── Validation helpers ───

export type UsernameError =
  | { code: "too_short"; min: number }
  | { code: "too_long"; max: number }
  | { code: "invalid_format" }
  | { code: "reserved" };

/**
 * Validate a username candidate. Returns null on success or a UsernameError.
 */
export function validateUsername(value: string): UsernameError | null {
  if (value.length < USERNAME_MIN_LENGTH) {
    return { code: "too_short", min: USERNAME_MIN_LENGTH };
  }
  if (value.length > USERNAME_MAX_LENGTH) {
    return { code: "too_long", max: USERNAME_MAX_LENGTH };
  }
  if (!USERNAME_PATTERN.test(value)) {
    return { code: "invalid_format" };
  }
  if (RESERVED_USERNAMES.has(value)) {
    return { code: "reserved" };
  }
  return null;
}

// ─── Zod schema ───

export const UsernameSchema = z
  .string()
  .min(USERNAME_MIN_LENGTH, `Must be at least ${USERNAME_MIN_LENGTH} characters`)
  .max(USERNAME_MAX_LENGTH, `Must be at most ${USERNAME_MAX_LENGTH} characters`)
  .regex(
    USERNAME_PATTERN,
    "Lowercase letters, digits, and hyphens only (e.g. 'my-name')"
  )
  .refine((v) => !RESERVED_USERNAMES.has(v), {
    message: "This username is reserved",
  });

export const UpdateProfileSchema = z.object({
  username: UsernameSchema.optional(),
  displayName: z.string().min(1).max(50).optional(),
}).refine((data) => data.username !== undefined || data.displayName !== undefined, {
  message: "At least one field (username or displayName) is required",
});

export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>;
