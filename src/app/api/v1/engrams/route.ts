import { NextRequest } from "next/server";
import { authenticateRequest } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { generateEngramId } from "@/lib/engram-id";
import { CreateEngramSchema } from "@/lib/schemas/engram";
import { filterPersonaFiles } from "@/lib/engram-privacy";
import { PersonaFileType } from "@/generated/prisma/enums";
import { checkRateLimit } from "@/lib/rate-limit";
import {
  ok,
  err,
  created,
  unauthorized,
  rateLimited,
  handleApiError,
} from "@/lib/api-response";

/**
 * POST /api/v1/engrams — Create a new Engram from metadata and persona text.
 *
 * Accepts a JSON body with Engram metadata, SOUL.md content (required),
 * and IDENTITY.md content (optional). Memory files are never accepted here;
 * encrypted memory must be uploaded separately via PUT /engrams/:id/memory.
 */
export async function POST(request: NextRequest) {
  try {
    const authed = await authenticateRequest(request);
    if (!authed) return unauthorized();

    const limit = checkRateLimit(`create:${authed.userId}`, 10);
    if (!limit.allowed) return rateLimited(limit.resetAt);

    const contentType = request.headers.get("content-type") ?? "";
    if (!contentType.includes("application/json")) {
      return err("Content-Type must be application/json", 415);
    }

    const body = await request.json();
    const input = CreateEngramSchema.parse(body);
    const engramId = generateEngramId();

    // Build persona file records
    const personaFileRecords: {
      fileType: PersonaFileType;
      filename: string;
      content: string;
    }[] = [
      {
        fileType: PersonaFileType.SOUL,
        filename: "SOUL.md",
        content: input.soul,
      },
      {
        fileType: PersonaFileType.IDENTITY,
        filename: "IDENTITY.md",
        content: input.identity,
      },
      // engram.json is generated from canonical metadata
      {
        fileType: PersonaFileType.ENGRAM_JSON,
        filename: "engram.json",
        content: JSON.stringify(
          {
            name: input.name,
            description: input.description ?? null,
            tags: input.tags,
          },
          null,
          2
        ),
      },
    ];

    const engram = await db.engram.create({
      data: {
        id: engramId,
        sourceEngramId: input.sourceEngramId,
        name: input.name,
        description: input.description,
        visibility: input.visibility,
        tags: input.tags,
        ownerId: authed.userId,
        personaFiles: {
          create: personaFileRecords,
        },
      },
      include: { personaFiles: true },
    });

    return created({
      id: engram.id,
      sourceEngramId: engram.sourceEngramId,
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
