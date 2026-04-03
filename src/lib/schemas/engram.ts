import { z } from "zod";

export const VisibilitySchema = z.enum(["PRIVATE", "UNLISTED", "PUBLIC"]);

export const PersonaFileTypeSchema = z.enum([
  "SOUL",
  "IDENTITY",
  "ENGRAM_JSON",
]);

export const CreateEngramSchema = z.object({
  name: z.string().min(1).max(100),
  sourceEngramId: z.string().min(1).max(100).regex(
    /^[a-z0-9]+(-[a-z0-9]+)*$/,
    "Must be lowercase alphanumeric with hyphens (e.g. 'rebel', 'my-engram')"
  ),
  description: z.string().max(500).optional(),
  visibility: VisibilitySchema.default("PRIVATE"),
  tags: z.array(z.string().max(30)).max(10).default([]),
  soul: z.string().min(1, "SOUL.md content is required"),
  identity: z.string().min(1, "IDENTITY.md content is required"),
});

export const UpdateEngramSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  visibility: VisibilitySchema.optional(),
  tags: z.array(z.string().max(30)).max(10).optional(),
});

export const PersonaFileResponse = z.object({
  fileType: PersonaFileTypeSchema,
  filename: z.string(),
  content: z.string(),
});

export const MemorySummary = z.object({
  hasMemory: z.boolean(),
  hasUserFile: z.boolean().optional(),
  hasMemoryIndex: z.boolean().optional(),
  memoryEntryCount: z.number().optional(),
  latestMemoryDate: z.string().nullable().optional(),
  memoryUpdatedAt: z.string().nullable().optional(),
});

export const EngramResponse = z.object({
  id: z.string(),
  sourceEngramId: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  visibility: VisibilitySchema,
  tags: z.array(z.string()),
  avatarUrl: z.string().nullable(),
  ownerId: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  personaFiles: z.array(PersonaFileResponse).optional(),
  memory: MemorySummary.optional(),
});

// ─── Encrypted memory blob schemas ───

// 20 MB in base64 characters (~15 MB raw binary)
const MAX_BASE64_LENGTH = 20 * 1024 * 1024;

const base64 = z.string().min(1, "Must be non-empty base64").max(
  MAX_BASE64_LENGTH,
  `Must not exceed ${MAX_BASE64_LENGTH} characters (~15 MB)`
);

export const ScryptParamsSchema = z.object({
  N: z.number().int().positive(),
  r: z.number().int().positive(),
  p: z.number().int().positive(),
  dkLen: z.number().int().positive(),
});

export const MemoryManifestSchema = z.object({
  payloadKind: z.literal("memory"),
  bundleVersion: z.number().int().positive(),
  hasUserFile: z.boolean(),
  hasMemoryIndex: z.boolean(),
  memoryEntryCount: z.number().int().min(0),
  latestMemoryDate: z.string().nullable(),
});

export const MemoryUploadSchema = z.object({
  ciphertext: base64,
  cipherAlgorithm: z.string().min(1),
  cipherNonce: base64,
  wrappedBundleKey: base64,
  wrapAlgorithm: z.string().min(1),
  kdfAlgorithm: z.string().min(1),
  kdfSalt: base64,
  kdfParams: ScryptParamsSchema,
  manifest: MemoryManifestSchema,
  bundleHash: z.string().regex(
    /^sha256:[0-9a-f]{64}$/,
    "Must be sha256:<64 hex chars>"
  ),
});

export type MemoryUploadInput = z.infer<typeof MemoryUploadSchema>;
export type MemoryManifest = z.infer<typeof MemoryManifestSchema>;

export type CreateEngramInput = z.infer<typeof CreateEngramSchema>;
export type UpdateEngramInput = z.infer<typeof UpdateEngramSchema>;
export type EngramResponseType = z.infer<typeof EngramResponse>;
