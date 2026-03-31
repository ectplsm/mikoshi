import { NextRequest } from "next/server";
import { authenticateRequest } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { filterPersonaFiles } from "@/lib/engram-privacy";
import { generateEngramId } from "@/lib/engram-id";
import { checkRateLimit } from "@/lib/rate-limit";
import {
  created,
  unauthorized,
  notFound,
  rateLimited,
  handleApiError,
  err,
} from "@/lib/api-response";
import { Visibility } from "@/generated/prisma/enums";

type RouteParams = { params: Promise<{ engramId: string }> };

/**
 * POST /api/v1/engrams/:engramId/clone — Clone a Public/Unlisted Engram.
 * Only persona files (SOUL.md, IDENTITY.md) are cloned. Memory is never cloned.
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { engramId } = await params;
    const authed = await authenticateRequest(request);
    if (!authed) return unauthorized();

    const limit = checkRateLimit(`clone:${authed.userId}`, 10);
    if (!limit.allowed) return rateLimited(limit.resetAt);

    const source = await db.engram.findUnique({
      where: { id: engramId },
      include: { personaFiles: true },
    });

    if (!source) return notFound();

    // Can only clone Public or Unlisted engrams (or your own)
    const isOwner = source.ownerId === authed.userId;
    if (source.visibility === Visibility.PRIVATE && !isOwner) {
      return notFound();
    }

    // Only clone publicly visible persona files (unless it's your own)
    const filesToClone = filterPersonaFiles(source.personaFiles, isOwner);

    if (filesToClone.length === 0) {
      return err("No persona files available to clone", 400);
    }

    const newId = generateEngramId();
    const newSourceId = `${source.sourceEngramId}-clone`;

    const cloned = await db.engram.create({
      data: {
        id: newId,
        sourceEngramId: newSourceId,
        name: `${source.name} (clone)`,
        description: source.description,
        visibility: "PRIVATE",
        tags: source.tags,
        ownerId: authed.userId,
        personaFiles: {
          create: filesToClone.map((f) => ({
            fileType: f.fileType,
            filename: f.filename,
            content: f.content,
          })),
        },
      },
    });

    return created({
      id: cloned.id,
      sourceEngramId: cloned.sourceEngramId,
      name: cloned.name,
      url: `/e/${cloned.id}`,
      clonedFrom: source.id,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
