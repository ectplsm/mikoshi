import { randomBytes, createHash } from "crypto";
import { db } from "@/lib/db";

const PREFIX = "mk_";
const KEY_LENGTH = 32;

export function generateApiKey(): string {
  return PREFIX + randomBytes(KEY_LENGTH).toString("base64url");
}

export function hashApiKey(key: string): string {
  return createHash("sha256").update(key).digest("hex");
}

export function getKeyPrefix(key: string): string {
  return key.slice(0, 8) + "..." + key.slice(-4);
}

export async function validateApiKey(
  key: string
): Promise<{ userId: string } | null> {
  const hashed = hashApiKey(key);
  const apiKey = await db.apiKey.findUnique({
    where: { hashedKey: hashed },
    select: { userId: true, expiresAt: true, id: true },
  });

  if (!apiKey) return null;
  if (apiKey.expiresAt && apiKey.expiresAt < new Date()) return null;

  // Update last used timestamp (fire-and-forget)
  db.apiKey
    .update({
      where: { id: apiKey.id },
      data: { lastUsedAt: new Date() },
    })
    .catch(() => {});

  return { userId: apiKey.userId };
}
