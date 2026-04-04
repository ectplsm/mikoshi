import { NextRequest } from "next/server";
import { Prisma } from "@/generated/prisma/client";
import { authenticateRequest } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { UpdateProfileSchema, isUsernameEmpty } from "@/lib/username";
import { checkRateLimit } from "@/lib/rate-limit";
import {
  ok,
  err,
  unauthorized,
  rateLimited,
  handleApiError,
} from "@/lib/api-response";

/**
 * PATCH /api/v1/me/profile — Update the authenticated user's profile.
 *
 * Username can only be set once: while it is still a temporary auto-generated
 * slug (prefixed "u-"). Once confirmed, the username is permanently locked.
 *
 * Display name can be changed freely at any time.
 *
 * Returns 400 for invalid format, 403 if username is already confirmed,
 * 409 if username is taken.
 */
export async function PATCH(request: NextRequest) {
  try {
    const authed = await authenticateRequest(request);
    if (!authed) return unauthorized();

    const limit = checkRateLimit(`profile:${authed.userId}`, 10);
    if (!limit.allowed) return rateLimited(limit.resetAt);

    const body = await request.json();
    const input = UpdateProfileSchema.parse(body);

    // Build the update payload
    const data: { username?: string; name?: string } = {};

    // Handle username change request
    if (input.username !== undefined) {
      // Check current username — only temporary usernames can be changed
      const current = await db.user.findUniqueOrThrow({
        where: { id: authed.userId },
        select: { username: true },
      });

      if (!isUsernameEmpty(current.username)) {
        return err("Username is already confirmed and cannot be changed", 403);
      }

      data.username = input.username;
    }

    // Handle display name change request
    if (input.displayName !== undefined) {
      data.name = input.displayName;
    }

    if (Object.keys(data).length === 0) {
      return err("No fields to update", 400);
    }

    // Attempt the update — let the DB unique constraint catch races
    let updated;
    try {
      updated = await db.user.update({
        where: { id: authed.userId },
        data,
        select: { id: true, username: true, name: true },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        return err("Username already taken", 409);
      }
      throw error;
    }

    return ok({
      id: updated.id,
      username: updated.username,
      displayName: updated.name,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
