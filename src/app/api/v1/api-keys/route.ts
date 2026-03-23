import { NextRequest } from "next/server";
import { authenticateRequest } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { generateApiKey, hashApiKey, getKeyPrefix } from "@/lib/api-key";
import { CreateApiKeySchema } from "@/lib/schemas/api-key";
import {
  ok,
  created,
  unauthorized,
  notFound,
  handleApiError,
} from "@/lib/api-response";

/**
 * POST /api/v1/api-keys — Create a new API key
 * Returns the plaintext key ONLY on creation.
 */
export async function POST(request: NextRequest) {
  try {
    const authed = await authenticateRequest(request);
    if (!authed) return unauthorized();

    const body = await request.json();
    const { name, expiresAt } = CreateApiKeySchema.parse(body);

    const plainKey = generateApiKey();
    const hashedKey = hashApiKey(plainKey);
    const prefix = getKeyPrefix(plainKey);

    const apiKey = await db.apiKey.create({
      data: {
        name,
        hashedKey,
        prefix,
        userId: authed.userId,
        expiresAt: expiresAt ? new Date(expiresAt) : undefined,
      },
    });

    return created({
      id: apiKey.id,
      name: apiKey.name,
      prefix: apiKey.prefix,
      key: plainKey, // Only returned once
      createdAt: apiKey.createdAt.toISOString(),
    });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * GET /api/v1/api-keys — List user's API keys (no secrets)
 */
export async function GET(request: NextRequest) {
  try {
    const authed = await authenticateRequest(request);
    if (!authed) return unauthorized();

    const keys = await db.apiKey.findMany({
      where: { userId: authed.userId },
      select: {
        id: true,
        name: true,
        prefix: true,
        lastUsedAt: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return ok(
      keys.map((k) => ({
        ...k,
        lastUsedAt: k.lastUsedAt?.toISOString() ?? null,
        createdAt: k.createdAt.toISOString(),
      }))
    );
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * DELETE /api/v1/api-keys — Delete an API key by id (passed in body)
 */
export async function DELETE(request: NextRequest) {
  try {
    const authed = await authenticateRequest(request);
    if (!authed) return unauthorized();

    const { id } = await request.json();
    if (!id || typeof id !== "string") {
      return ok({ error: "id is required" }, 400);
    }

    const key = await db.apiKey.findUnique({ where: { id } });
    if (!key || key.userId !== authed.userId) return notFound();

    await db.apiKey.delete({ where: { id } });

    return ok({ deleted: true });
  } catch (error) {
    return handleApiError(error);
  }
}
