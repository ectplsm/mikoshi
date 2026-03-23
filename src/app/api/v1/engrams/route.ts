import { NextRequest } from "next/server";
import { authenticateRequest } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { parseEngramZip } from "@/lib/engram-zip";
import { generateEngramId } from "@/lib/engram-id";
import { uploadAvatar } from "@/lib/r2";
import { CreateEngramSchema } from "@/lib/schemas/engram";
import { filterEngramFiles } from "@/lib/engram-privacy";
import { checkRateLimit } from "@/lib/rate-limit";
import {
  ok,
  created,
  unauthorized,
  rateLimited,
  handleApiError,
} from "@/lib/api-response";

/**
 * POST /api/v1/engrams — Upload an Engram via Zip file
 */
export async function POST(request: NextRequest) {
  try {
    const authed = await authenticateRequest(request);
    if (!authed) return unauthorized();

    const limit = checkRateLimit(`upload:${authed.userId}`, 10);
    if (!limit.allowed) return rateLimited(limit.resetAt);

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return ok({ error: "No file provided" }, 400);
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const parsed = await parseEngramZip(buffer);

    // Extract metadata from form fields or engram.json in zip
    const rawMeta = {
      name:
        (formData.get("name") as string) ??
        (parsed.meta?.name as string) ??
        "Untitled Engram",
      description:
        (formData.get("description") as string) ??
        (parsed.meta?.description as string) ??
        undefined,
      visibility:
        (formData.get("visibility") as string) ??
        "PRIVATE",
      tags: formData.get("tags")
        ? JSON.parse(formData.get("tags") as string)
        : (parsed.meta?.tags as string[]) ?? [],
    };

    const meta = CreateEngramSchema.parse(rawMeta);
    const engramId = generateEngramId();

    // Upload avatar to R2 if present
    let avatarUrl: string | null = null;
    if (parsed.avatar) {
      avatarUrl = await uploadAvatar(
        engramId,
        parsed.avatar.data,
        parsed.avatar.mimeType
      );
    }

    const engram = await db.engram.create({
      data: {
        id: engramId,
        name: meta.name,
        description: meta.description,
        visibility: meta.visibility,
        tags: meta.tags,
        avatarUrl,
        ownerId: authed.userId,
        files: {
          create: parsed.files.map((f) => ({
            fileType: f.fileType,
            filename: f.filename,
            content: f.content,
          })),
        },
      },
      include: { files: true },
    });

    return created({
      id: engram.id,
      name: engram.name,
      visibility: engram.visibility,
      url: `/e/${engram.id}`,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * GET /api/v1/engrams — List authenticated user's Engrams
 */
export async function GET(request: NextRequest) {
  try {
    const authed = await authenticateRequest(request);
    if (!authed) return unauthorized();

    const limit = checkRateLimit(`list:${authed.userId}`, 60);
    if (!limit.allowed) return rateLimited(limit.resetAt);

    const engrams = await db.engram.findMany({
      where: { ownerId: authed.userId },
      include: { files: true },
      orderBy: { updatedAt: "desc" },
    });

    const result = engrams.map((e) => ({
      id: e.id,
      name: e.name,
      description: e.description,
      visibility: e.visibility,
      tags: e.tags,
      avatarUrl: e.avatarUrl,
      createdAt: e.createdAt.toISOString(),
      updatedAt: e.updatedAt.toISOString(),
      files: filterEngramFiles(e.files, true).map((f) => ({
        fileType: f.fileType,
        filename: f.filename,
      })),
    }));

    return ok(result);
  } catch (error) {
    return handleApiError(error);
  }
}
