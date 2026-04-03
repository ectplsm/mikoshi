import { NextRequest } from "next/server";
import { authenticateRequest } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { MemoryUploadSchema } from "@/lib/schemas/engram";
import { checkRateLimit } from "@/lib/rate-limit";
import {
  ok,
  err,
  unauthorized,
  forbidden,
  notFound,
  rateLimited,
  handleApiError,
} from "@/lib/api-response";

type RouteParams = { params: Promise<{ engramId: string }> };

/**
 * Resolve the Engram and verify ownership.
 * Returns the engram record or a NextResponse error.
 */
async function resolveOwnedEngram(engramId: string, userId: string) {
  const engram = await db.engram.findUnique({ where: { id: engramId } });
  if (!engram) return { error: "not_found" as const };
  if (engram.ownerId !== userId) return { error: "forbidden" as const };
  return { engram };
}

/**
 * PUT /api/v1/engrams/:engramId/memory — Upload or replace encrypted memory blob.
 *
 * Owner-only. Accepts a JSON body with base64-encoded binary fields
 * and structured metadata. The server treats ciphertext as opaque and
 * never attempts to decrypt it.
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { engramId } = await params;
    const authed = await authenticateRequest(request);
    if (!authed) return unauthorized();

    const limit = checkRateLimit(`memory-upload:${authed.userId}`, 10);
    if (!limit.allowed) return rateLimited(limit.resetAt);

    const contentType = request.headers.get("content-type") ?? "";
    if (!contentType.includes("application/json")) {
      return err("Content-Type must be application/json", 415);
    }

    const resolved = await resolveOwnedEngram(engramId, authed.userId);
    if ("error" in resolved) {
      return resolved.error === "not_found" ? notFound() : forbidden();
    }

    const body = await request.json();
    const input = MemoryUploadSchema.parse(body);

    // Decode base64 fields to binary
    const ciphertext = Buffer.from(input.ciphertext, "base64");
    const cipherNonce = Buffer.from(input.cipherNonce, "base64");
    const wrappedBundleKey = Buffer.from(input.wrappedBundleKey, "base64");
    const kdfSalt = Buffer.from(input.kdfSalt, "base64");

    // Upsert: create or replace the memory blob for this Engram
    await db.engramMemoryBlob.upsert({
      where: { engramId },
      create: {
        engramId,
        version: 1,
        ciphertext,
        cipherAlgorithm: input.cipherAlgorithm,
        cipherNonce,
        wrappedBundleKey,
        wrapAlgorithm: input.wrapAlgorithm,
        kdfAlgorithm: input.kdfAlgorithm,
        kdfSalt,
        kdfParamsJson: input.kdfParams,
        manifestJson: input.manifest,
        memoryContentHash: input.memoryContentHash,
        bundleHash: input.bundleHash,
      },
      update: {
        version: { increment: 1 },
        ciphertext,
        cipherAlgorithm: input.cipherAlgorithm,
        cipherNonce,
        wrappedBundleKey,
        wrapAlgorithm: input.wrapAlgorithm,
        kdfAlgorithm: input.kdfAlgorithm,
        kdfSalt,
        kdfParamsJson: input.kdfParams,
        manifestJson: input.manifest,
        memoryContentHash: input.memoryContentHash,
        bundleHash: input.bundleHash,
      },
    });

    return ok({
      engramId,
      version: (
        await db.engramMemoryBlob.findUnique({
          where: { engramId },
          select: { version: true },
        })
      )?.version,
      memoryContentHash: input.memoryContentHash,
      bundleHash: input.bundleHash,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * GET /api/v1/engrams/:engramId/memory — Download encrypted memory blob.
 *
 * Owner-only. Returns the encrypted payload with base64-encoded binary
 * fields and all metadata needed for client-side decryption.
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { engramId } = await params;
    const authed = await authenticateRequest(request);
    if (!authed) return unauthorized();

    const limit = checkRateLimit(`memory-download:${authed.userId}`, 30);
    if (!limit.allowed) return rateLimited(limit.resetAt);

    const resolved = await resolveOwnedEngram(engramId, authed.userId);
    if ("error" in resolved) {
      return resolved.error === "not_found" ? notFound() : forbidden();
    }

    const blob = await db.engramMemoryBlob.findUnique({
      where: { engramId },
    });

    if (!blob) {
      return ok({
        engramId,
        hasMemory: false,
      });
    }

    return ok({
      engramId,
      hasMemory: true,
      version: blob.version,
      ciphertext: Buffer.from(blob.ciphertext).toString("base64"),
      cipherAlgorithm: blob.cipherAlgorithm,
      cipherNonce: Buffer.from(blob.cipherNonce).toString("base64"),
      wrappedBundleKey: Buffer.from(blob.wrappedBundleKey).toString("base64"),
      wrapAlgorithm: blob.wrapAlgorithm,
      kdfAlgorithm: blob.kdfAlgorithm,
      kdfSalt: Buffer.from(blob.kdfSalt).toString("base64"),
      kdfParams: blob.kdfParamsJson,
      manifest: blob.manifestJson,
      memoryContentHash: blob.memoryContentHash,
      bundleHash: blob.bundleHash,
      createdAt: blob.createdAt.toISOString(),
      updatedAt: blob.updatedAt.toISOString(),
    });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * DELETE /api/v1/engrams/:engramId/memory — Remove encrypted memory blob.
 *
 * Owner-only. Deletes the encrypted memory bundle without affecting
 * persona files or Engram metadata.
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { engramId } = await params;
    const authed = await authenticateRequest(request);
    if (!authed) return unauthorized();

    const resolved = await resolveOwnedEngram(engramId, authed.userId);
    if ("error" in resolved) {
      return resolved.error === "not_found" ? notFound() : forbidden();
    }

    const blob = await db.engramMemoryBlob.findUnique({
      where: { engramId },
      select: { id: true },
    });

    if (!blob) return notFound();

    await db.engramMemoryBlob.delete({ where: { engramId } });

    return ok({ deleted: true });
  } catch (error) {
    return handleApiError(error);
  }
}
