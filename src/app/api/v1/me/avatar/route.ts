import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { checkRateLimit } from "@/lib/rate-limit";
import {
  err,
  handleApiError,
  ok,
  rateLimited,
  unauthorized,
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
  uploadUserAvatar,
} from "@/lib/r2";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return unauthorized();
    if (!isR2Configured()) {
      return err("Avatar storage is not configured.", 503);
    }

    const limit = checkRateLimit(`avatar-upload:${session.user.id}`, 5, 60 * 60 * 1000);
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
      return err(`File must be ${Math.floor(AVATAR_MAX_BYTES / (1024 * 1024))}MB or smaller.`, 400);
    }

    const inputBytes = Buffer.from(await file.arrayBuffer());
    const normalized = await normalizeProfileAvatar(inputBytes, file.type);

    const current = await db.user.findUnique({
      where: { id: session.user.id },
      select: { image: true },
    });

    const uploadedUrl = await uploadUserAvatar(
      session.user.id,
      normalized.bytes,
      normalized.mimeType
    );

    try {
      await db.user.update({
        where: { id: session.user.id },
        data: { image: uploadedUrl },
      });
    } catch (error) {
      await deleteManagedAvatarByUrl(uploadedUrl).catch(() => {});
      throw error;
    }

    if (isManagedAvatarUrl(current?.image)) {
      await deleteManagedAvatarByUrl(current!.image!).catch(() => {});
    }

    return ok({ imageUrl: uploadedUrl });
  } catch (error) {
    if (error instanceof AvatarValidationError) {
      return err(error.message, 400);
    }

    return handleApiError(error);
  }
}

export async function DELETE() {
  try {
    const session = await auth();
    if (!session?.user?.id) return unauthorized();

    const limit = checkRateLimit(`avatar-delete:${session.user.id}`, 10, 60 * 60 * 1000);
    if (!limit.allowed) return rateLimited(limit.resetAt);

    const current = await db.user.findUnique({
      where: { id: session.user.id },
      select: { image: true },
    });

    await db.user.update({
      where: { id: session.user.id },
      data: { image: null },
    });

    if (isManagedAvatarUrl(current?.image)) {
      await deleteManagedAvatarByUrl(current!.image!).catch(() => {});
    }

    return ok({ imageUrl: null });
  } catch (error) {
    return handleApiError(error);
  }
}
