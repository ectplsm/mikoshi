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

export const UpdatePersonaSchema = z.object({
  soul: z.string().min(1, "SOUL.md content is required"),
  identity: z.string().min(1, "IDENTITY.md content is required"),
  expectedRemotePersonaHash: z.string().regex(
    /^sha256:[0-9a-f]{64}$/,
    "Must be sha256:<64 hex chars>"
  ),
});

export const UpdatePersonaResponse = z.object({
  engramId: z.string(),
  persona: z.object({
    hash: z.string().regex(
      /^sha256:[0-9a-f]{64}$/,
      "Must be sha256:<64 hex chars>"
    ),
    updatedAt: z.string().datetime(),
  }),
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

export const PersonaSyncToken = z.object({
  hash: z.string().regex(
    /^sha256:[0-9a-f]{64}$/,
    "Must be sha256:<64 hex chars>"
  ),
  updatedAt: z.string().datetime(),
});

export const PersonaSyncStatus = z.object({
  exists: z.boolean(),
  token: PersonaSyncToken.nullable(),
  files: z.object({
    hasSoul: z.boolean(),
    hasIdentity: z.boolean(),
  }),
});

export const MemorySyncToken = z.object({
  memoryContentHash: z.string().regex(
    /^sha256:[0-9a-f]{64}$/,
    "Must be sha256:<64 hex chars>"
  ),
  bundleHash: z.string().regex(
    /^sha256:[0-9a-f]{64}$/,
    "Must be sha256:<64 hex chars>"
  ),
  version: z.number().int().positive(),
  updatedAt: z.string().datetime(),
});

export const MemorySyncSummary = z.object({
  hasUserFile: z.boolean(),
  hasMemoryIndex: z.boolean(),
  memoryEntryCount: z.number().int().min(0),
  latestMemoryDate: z.string().nullable(),
});

export const MemorySyncStatus = z.object({
  exists: z.boolean(),
  token: MemorySyncToken.nullable(),
  summary: MemorySyncSummary.nullable(),
});

export const EngramSyncStatusResponse = z.object({
  engramId: z.string(),
  persona: PersonaSyncStatus,
  memory: MemorySyncStatus,
});

export const SyncComparisonState = z.enum([
  "match",
  "different",
  "local_unavailable",
  "remote_unavailable",
]);

export const OverallDriftClass = z.enum([
  "clean",
  "persona",
  "memory",
  "mixed",
  "incomplete",
]);

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
  expectedRemoteMemoryContentHash: z
    .string()
    .regex(/^sha256:[0-9a-f]{64}$/, "Must be sha256:<64 hex chars>")
    .nullable(),
  memoryContentHash: z.string().regex(
    /^sha256:[0-9a-f]{64}$/,
    "Must be sha256:<64 hex chars>"
  ),
  bundleHash: z.string().regex(
    /^sha256:[0-9a-f]{64}$/,
    "Must be sha256:<64 hex chars>"
  ),
});

export const MemoryUploadResponse = z.object({
  engramId: z.string(),
  version: z.number().int().positive(),
  memoryContentHash: z.string().regex(
    /^sha256:[0-9a-f]{64}$/,
    "Must be sha256:<64 hex chars>"
  ),
  bundleHash: z.string().regex(
    /^sha256:[0-9a-f]{64}$/,
    "Must be sha256:<64 hex chars>"
  ),
  updatedAt: z.string().datetime(),
});

export const DeleteMemorySchema = z.object({
  expectedRemoteMemoryContentHash: z.string().regex(
    /^sha256:[0-9a-f]{64}$/,
    "Must be sha256:<64 hex chars>"
  ),
});

export const DeleteMemoryResponse = z.object({
  deleted: z.literal(true),
});

export type MemoryUploadInput = z.infer<typeof MemoryUploadSchema>;
export type MemoryUploadResponseType = z.infer<typeof MemoryUploadResponse>;
export type DeleteMemoryInput = z.infer<typeof DeleteMemorySchema>;
export type DeleteMemoryResponseType = z.infer<typeof DeleteMemoryResponse>;
export type MemoryManifest = z.infer<typeof MemoryManifestSchema>;

export type CreateEngramInput = z.infer<typeof CreateEngramSchema>;
export type UpdateEngramInput = z.infer<typeof UpdateEngramSchema>;
export type UpdatePersonaInput = z.infer<typeof UpdatePersonaSchema>;
export type UpdatePersonaResponseType = z.infer<typeof UpdatePersonaResponse>;
export type EngramResponseType = z.infer<typeof EngramResponse>;
export type EngramSyncStatusResponseType = z.infer<typeof EngramSyncStatusResponse>;
export type SyncComparisonStateType = z.infer<typeof SyncComparisonState>;
export type OverallDriftClassType = z.infer<typeof OverallDriftClass>;
