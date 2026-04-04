import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { hashPersonaFiles } from "@/lib/engram-sync";
import { checkRateLimit } from "@/lib/rate-limit";
import { UpdatePersonaSchema } from "@/lib/schemas/engram";
import {
  ok,
  err,
  unauthorized,
  forbidden,
  notFound,
  rateLimited,
  handleApiError,
} from "@/lib/api-response";
import { PersonaFileType } from "@/generated/prisma/enums";

type RouteParams = { params: Promise<{ engramId: string }> };

function personaConflict(currentPersona: { hash: string; updatedAt: string }) {
  return NextResponse.json(
    {
      error: "Persona drift conflict",
      code: "PERSONA_CONFLICT",
      currentPersona,
    },
    { status: 409 }
  );
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { engramId } = await params;
    const authed = await authenticateRequest(request);
    if (!authed) return unauthorized();

    const limit = checkRateLimit(`persona-update:${authed.userId}`, 20);
    if (!limit.allowed) return rateLimited(limit.resetAt);

    const contentType = request.headers.get("content-type") ?? "";
    if (!contentType.includes("application/json")) {
      return err("Content-Type must be application/json", 415);
    }

    const engram = await db.engram.findUnique({
      where: { id: engramId },
      select: {
        id: true,
        ownerId: true,
        personaFiles: {
          where: {
            fileType: {
              in: [PersonaFileType.SOUL, PersonaFileType.IDENTITY],
            },
          },
          select: {
            id: true,
            fileType: true,
            content: true,
            updatedAt: true,
          },
        },
      },
    });

    if (!engram) return notFound();
    if (engram.ownerId !== authed.userId) return forbidden();

    const body = await request.json();
    const input = UpdatePersonaSchema.parse(body);

    const soulFile = engram.personaFiles.find((file) => file.fileType === PersonaFileType.SOUL);
    const identityFile = engram.personaFiles.find((file) => file.fileType === PersonaFileType.IDENTITY);

    if (!soulFile || !identityFile) {
      return err("SOUL.md and IDENTITY.md are required to update persona", 400);
    }

    const currentHash = hashPersonaFiles(soulFile.content, identityFile.content);
    const currentUpdatedAt =
      soulFile.updatedAt > identityFile.updatedAt ? soulFile.updatedAt : identityFile.updatedAt;

    if (currentHash !== input.expectedRemotePersonaHash) {
      return personaConflict({
        hash: currentHash,
        updatedAt: currentUpdatedAt.toISOString(),
      });
    }

    const [, updatedIdentity] = await db.$transaction([
      db.engramPersonaFile.update({
        where: { id: soulFile.id },
        data: { content: input.soul },
      }),
      db.engramPersonaFile.update({
        where: { id: identityFile.id },
        data: { content: input.identity },
      }),
    ]);

    const newHash = hashPersonaFiles(input.soul, input.identity);

    return ok({
      engramId: engram.id,
      persona: {
        hash: newHash,
        updatedAt: updatedIdentity.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
