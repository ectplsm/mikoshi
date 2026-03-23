import { NextRequest } from "next/server";
import { authenticateRequest } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { filterEngramFiles } from "@/lib/engram-privacy";
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
 * GET /api/v1/engrams/:engramId — Fetch Engram data
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
      include: { files: true, owner: { select: { username: true } } },
    });

    if (!engram) return notFound();

    const isOwner = authed?.userId === engram.ownerId;

    // Access control based on visibility
    if (engram.visibility === Visibility.PRIVATE && !isOwner) {
      return notFound(); // Don't reveal existence
    }

    const files = filterEngramFiles(engram.files, isOwner);

    return ok({
      id: engram.id,
      name: engram.name,
      description: engram.description,
      visibility: engram.visibility,
      tags: engram.tags,
      avatarUrl: engram.avatarUrl,
      ownerId: engram.ownerId,
      ownerUsername: engram.owner.username,
      createdAt: engram.createdAt.toISOString(),
      updatedAt: engram.updatedAt.toISOString(),
      files: files.map((f) => ({
        fileType: f.fileType,
        filename: f.filename,
        content: f.content,
      })),
    });
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
 * DELETE /api/v1/engrams/:engramId — Delete Engram
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
