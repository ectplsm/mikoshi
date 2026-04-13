import { NextRequest } from "next/server";
import { authenticateRequest } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { checkRateLimit } from "@/lib/rate-limit";
import {
  err,
  handleApiError,
  ok,
  rateLimited,
  unauthorized,
  forbidden,
  notFound,
} from "@/lib/api-response";
import {
  AVATAR_MAX_BYTES,
  isAllowedAvatarMimeType,
  isManagedAvatarUrl,
} from "@/lib/avatar";
import {
  AvatarValidationError,
  normalizeProfileAvatar,
} from "@/lib/avatar-image";
import {
  deleteManagedAvatarByUrl,
  isR2Configured,
  uploadEngramAvatar,
} from "@/lib/r2";

export const runtime = "nodejs";

type RouteParams = { params: Promise<{ engramId: string }> };

/**
 * PUT /api/v1/engrams/:engramId/avatar — Upload Engram avatar image.
 * Owner only. Replaces any existing avatar.
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { engramId } = await params;
    const authed = await authenticateRequest(request);
    if (!authed) return unauthorized();

    if (!isR2Configured()) {
      return err("Avatar storage is not configured.", 503);
    }

    const engram = await db.engram.findUnique({ where: { id: engramId } });
    if (!engram) return notFound();
    if (engram.ownerId !== authed.userId) return forbidden();

    const limit = checkRateLimit(`engram-avatar-upload:${authed.userId}`, 5, 60 * 60 * 1000);
    if (!limit.allowed) return rateLimited(limit.resetAt);

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return err("No image file was provided.", 400);
    }

    if (!isAllowedAvatarMimeType(file.type)) {
      return err("Only JPEG, PNG, and WebP are allowed.", 400);
    }

    if (file.size > AVATAR_MAX_BYTES) {
      return err(
        `File must be ${Math.floor(AVATAR_MAX_BYTES / (1024 * 1024))}MB or smaller.`,
        400
      );
    }

    const inputBytes = Buffer.from(await file.arrayBuffer());
    const normalized = await normalizeProfileAvatar(inputBytes, file.type);

    const uploadedUrl = await uploadEngramAvatar(
      engramId,
      normalized.bytes,
      normalized.mimeType
    );

    try {
      await db.engram.update({
        where: { id: engramId },
        data: { avatarUrl: uploadedUrl },
      });
    } catch (error) {
      // Rollback: delete the just-uploaded image if DB update fails
      await deleteManagedAvatarByUrl(uploadedUrl).catch(() => {});
      throw error;
    }

    // Clean up the old avatar after successful DB update
    if (isManagedAvatarUrl(engram.avatarUrl)) {
      await deleteManagedAvatarByUrl(engram.avatarUrl!).catch(() => {});
    }

    return ok({ avatarUrl: uploadedUrl });
  } catch (error) {
    if (error instanceof AvatarValidationError) {
      return err(error.message, 400);
    }

    return handleApiError(error);
  }
}

/**
 * DELETE /api/v1/engrams/:engramId/avatar — Remove Engram avatar.
 * Owner only.
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { engramId } = await params;
    const authed = await authenticateRequest(request);
    if (!authed) return unauthorized();

    const engram = await db.engram.findUnique({ where: { id: engramId } });
    if (!engram) return notFound();
    if (engram.ownerId !== authed.userId) return forbidden();

    const limit = checkRateLimit(`engram-avatar-delete:${authed.userId}`, 10, 60 * 60 * 1000);
    if (!limit.allowed) return rateLimited(limit.resetAt);

    await db.engram.update({
      where: { id: engramId },
      data: { avatarUrl: null },
    });

    if (isManagedAvatarUrl(engram.avatarUrl)) {
      await deleteManagedAvatarByUrl(engram.avatarUrl!).catch(() => {});
    }

    return ok({ avatarUrl: null });
  } catch (error) {
    return handleApiError(error);
  }
}
