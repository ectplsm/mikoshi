import { NextRequest } from "next/server";
import { authenticateRequest } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { filterPersonaFiles } from "@/lib/engram-privacy";
import { UpdateEngramSchema } from "@/lib/schemas/engram";
import { checkRateLimit } from "@/lib/rate-limit";
import { deleteAvatar } from "@/lib/r2";
import {
  ok,
  unauthorized,
  forbidden,
  notFound,
  rateLimited,
  handleApiError,
} from "@/lib/api-response";
import { Visibility } from "@/generated/prisma/enums";

type RouteParams = { params: Promise<{ engramId: string }> };

/**
 * GET /api/v1/engrams/:engramId — Fetch Engram data.
 * Returns persona files and (for owner only) memory summary metadata.
 * Never returns plaintext memory content.
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { engramId } = await params;
    const authed = await authenticateRequest(request);

    const identifier = authed?.userId ?? request.headers.get("x-forwarded-for") ?? "anonymous";
    const limit = checkRateLimit(`get:${identifier}`, 60);
    if (!limit.allowed) return rateLimited(limit.resetAt);

    const engram = await db.engram.findUnique({
      where: { id: engramId },
      include: {
        personaFiles: true,
        memoryBlob: { select: { updatedAt: true, manifestJson: true } },
        owner: { select: { username: true } },
      },
    });

    if (!engram) return notFound();

    const isOwner = authed?.userId === engram.ownerId;

    // Access control based on visibility
    if (engram.visibility === Visibility.PRIVATE && !isOwner) {
      return notFound(); // Don't reveal existence
    }

    const personaFiles = filterPersonaFiles(engram.personaFiles, isOwner);

    const response: Record<string, unknown> = {
      id: engram.id,
      sourceEngramId: engram.sourceEngramId,
      name: engram.name,
      description: engram.description,
      visibility: engram.visibility,
      tags: engram.tags,
      avatarUrl: engram.avatarUrl,
      ownerId: engram.ownerId,
      ownerUsername: engram.owner.username,
      createdAt: engram.createdAt.toISOString(),
      updatedAt: engram.updatedAt.toISOString(),
      personaFiles: personaFiles.map((f) => ({
        fileType: f.fileType,
        filename: f.filename,
        content: f.content,
      })),
    };

    // Owner-only memory summary — never expose to non-owners
    if (isOwner) {
      const manifest = engram.memoryBlob?.manifestJson as Record<string, unknown> | null;
      response.memory = {
        hasMemory: !!engram.memoryBlob,
        ...(manifest && {
          hasUserFile: manifest.hasUserFile,
          hasMemoryIndex: manifest.hasMemoryIndex,
          memoryEntryCount: manifest.memoryEntryCount,
          latestMemoryDate: manifest.latestMemoryDate,
        }),
        memoryUpdatedAt: engram.memoryBlob?.updatedAt.toISOString() ?? null,
      };
    }

    return ok(response);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * PATCH /api/v1/engrams/:engramId — Update Engram metadata
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { engramId } = await params;
    const authed = await authenticateRequest(request);
    if (!authed) return unauthorized();

    const engram = await db.engram.findUnique({ where: { id: engramId } });
    if (!engram) return notFound();
    if (engram.ownerId !== authed.userId) return forbidden();

    const body = await request.json();
    const data = UpdateEngramSchema.parse(body);

    const updated = await db.engram.update({
      where: { id: engramId },
      data,
    });

    return ok({
      id: updated.id,
      sourceEngramId: updated.sourceEngramId,
      name: updated.name,
      description: updated.description,
      visibility: updated.visibility,
      tags: updated.tags,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * DELETE /api/v1/engrams/:engramId — Delete Engram.
 * Cascades to persona files, memory blob, and R2 avatar.
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { engramId } = await params;
    const authed = await authenticateRequest(request);
    if (!authed) return unauthorized();

    const engram = await db.engram.findUnique({ where: { id: engramId } });
    if (!engram) return notFound();
    if (engram.ownerId !== authed.userId) return forbidden();

    // Delete avatar from R2 if exists
    if (engram.avatarUrl) {
      await deleteAvatar(engram.avatarUrl).catch(() => {});
    }

    await db.engram.delete({ where: { id: engramId } });

    return ok({ deleted: true });
  } catch (error) {
    return handleApiError(error);
  }
}
