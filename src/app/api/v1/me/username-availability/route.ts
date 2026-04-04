import { NextRequest } from "next/server";
import { authenticateRequest } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { validateUsername } from "@/lib/username";
import { checkRateLimit } from "@/lib/rate-limit";
import { ok, err, unauthorized, rateLimited } from "@/lib/api-response";

/**
 * GET /api/v1/me/username-availability?username=foo
 *
 * Returns whether the given username is available.
 * Requires authentication to prevent enumeration abuse.
 */
export async function GET(request: NextRequest) {
  const authed = await authenticateRequest(request);
  if (!authed) return unauthorized();

  const limit = checkRateLimit(`username-check:${authed.userId}`, 30);
  if (!limit.allowed) return rateLimited(limit.resetAt);

  const username = request.nextUrl.searchParams.get("username");
  if (!username) return err("username query parameter is required", 400);

  // Validate format first
  const validationError = validateUsername(username);
  if (validationError) {
    return ok({ available: false, reason: "invalid" });
  }

  // Check DB
  const existing = await db.user.findUnique({
    where: { username },
    select: { id: true },
  });

  return ok({ available: !existing });
}
