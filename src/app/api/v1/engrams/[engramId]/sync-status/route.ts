import { NextRequest } from "next/server";
import { authenticateRequest } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { buildMemorySyncStatus, buildPersonaSyncStatus } from "@/lib/engram-sync";
import { checkRateLimit } from "@/lib/rate-limit";
import { EngramSyncStatusResponse } from "@/lib/schemas/engram";
import {
  ok,
  unauthorized,
  forbidden,
  notFound,
  rateLimited,
  handleApiError,
} from "@/lib/api-response";

type RouteParams = { params: Promise<{ engramId: string }> };

/**
 * GET /api/v1/engrams/:engramId/sync-status
 *
 * Owner-only status endpoint for comparing local Relic state with the cloud copy.
 * Returns comparison tokens and safe summary metadata only.
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { engramId } = await params;
    const authed = await authenticateRequest(request);
    if (!authed) return unauthorized();

    const limit = checkRateLimit(`sync-status:${authed.userId}`, 60);
    if (!limit.allowed) return rateLimited(limit.resetAt);

    const engram = await db.engram.findUnique({
      where: { id: engramId },
      select: {
        id: true,
        ownerId: true,
        personaFiles: {
          where: {
            fileType: {
              in: ["SOUL", "IDENTITY"],
            },
          },
          select: {
            fileType: true,
            content: true,
            updatedAt: true,
          },
        },
        memoryBlob: {
          select: {
            version: true,
            updatedAt: true,
            memoryContentHash: true,
            bundleHash: true,
            manifestJson: true,
          },
        },
      },
    });

    if (!engram) return notFound();
    if (engram.ownerId !== authed.userId) return forbidden();

    const response = EngramSyncStatusResponse.parse({
      engramId: engram.id,
      persona: buildPersonaSyncStatus(engram.personaFiles),
      memory: buildMemorySyncStatus(engram.memoryBlob),
    });

    return ok(response);
  } catch (error) {
    return handleApiError(error);
  }
}
