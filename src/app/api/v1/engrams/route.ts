import { NextRequest } from "next/server";
import { authenticateRequest } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { parseEngramZip } from "@/lib/engram-zip";
import { generateEngramId } from "@/lib/engram-id";
import { uploadAvatar } from "@/lib/r2";
import { CreateEngramSchema } from "@/lib/schemas/engram";
import { filterPersonaFiles } from "@/lib/engram-privacy";
import { PersonaFileType } from "@/generated/prisma/enums";
import { checkRateLimit } from "@/lib/rate-limit";
import {
  ok,
  created,
  unauthorized,
  rateLimited,
  handleApiError,
} from "@/lib/api-response";

/**
 * POST /api/v1/engrams — Upload an Engram via Zip file.
 * Only persona files are stored as plaintext.
 * Memory files in the zip are acknowledged but not stored (client must encrypt and upload separately).
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

    // Derive sourceEngramId from metadata or form field
    const sourceId =
      (formData.get("sourceEngramId") as string) ??
      (parsed.meta?.id as string) ??
      undefined;

    const rawMeta = {
      name:
        (formData.get("name") as string) ??
        (parsed.meta?.name as string) ??
        "Untitled Engram",
      sourceEngramId: sourceId,
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

    // Build persona file records (engram.json is generated from canonical metadata)
    const personaFileRecords = parsed.personaFiles.map((f) => ({
      fileType: f.fileType,
      filename: f.filename,
      content: f.content,
    }));

    // Add engram.json as a generated persona file from canonical metadata
    personaFileRecords.push({
      fileType: PersonaFileType.ENGRAM_JSON,
      filename: "engram.json",
      content: JSON.stringify(
        {
          name: meta.name,
          description: meta.description ?? null,
          tags: meta.tags,
        },
        null,
        2
      ),
    });

    const engram = await db.engram.create({
      data: {
        id: engramId,
        sourceEngramId: meta.sourceEngramId,
        name: meta.name,
        description: meta.description,
        visibility: meta.visibility,
        tags: meta.tags,
        avatarUrl,
        ownerId: authed.userId,
        personaFiles: {
          create: personaFileRecords,
        },
      },
      include: { personaFiles: true },
    });

    const skippedMemoryFiles = parsed.memoryFiles.length;

    return created({
      id: engram.id,
      sourceEngramId: engram.sourceEngramId,
      name: engram.name,
      visibility: engram.visibility,
      url: `/e/${engram.id}`,
      ...(skippedMemoryFiles > 0 && {
        notice: `${skippedMemoryFiles} memory file(s) were not stored. Upload encrypted memory separately.`,
      }),
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
      include: {
        personaFiles: true,
        memoryBlob: { select: { updatedAt: true, manifestJson: true } },
      },
      orderBy: { updatedAt: "desc" },
    });

    const result = engrams.map((e) => {
      const manifest = e.memoryBlob?.manifestJson as Record<string, unknown> | null;

      return {
        id: e.id,
        sourceEngramId: e.sourceEngramId,
        name: e.name,
        description: e.description,
        visibility: e.visibility,
        tags: e.tags,
        avatarUrl: e.avatarUrl,
        createdAt: e.createdAt.toISOString(),
        updatedAt: e.updatedAt.toISOString(),
        personaFiles: filterPersonaFiles(e.personaFiles, true).map((f) => ({
          fileType: f.fileType,
          filename: f.filename,
        })),
        memory: {
          hasMemory: !!e.memoryBlob,
          ...(manifest && {
            hasUserFile: manifest.hasUserFile as boolean,
            hasMemoryIndex: manifest.hasMemoryIndex as boolean,
            memoryEntryCount: manifest.memoryEntryCount as number,
            latestMemoryDate: manifest.latestMemoryDate as string | null,
          }),
          memoryUpdatedAt: e.memoryBlob?.updatedAt.toISOString() ?? null,
        },
      };
    });

    return ok(result);
  } catch (error) {
    return handleApiError(error);
  }
}
