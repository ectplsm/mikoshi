import { z } from "zod";

export const VisibilitySchema = z.enum(["PRIVATE", "UNLISTED", "PUBLIC"]);

export const FileTypeSchema = z.enum([
  "SOUL",
  "IDENTITY",
  "AGENTS",
  "USER",
  "MEMORY",
  "HEARTBEAT",
  "MEMORY_ENTRY",
]);

export const CreateEngramSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  visibility: VisibilitySchema.default("PRIVATE"),
  tags: z.array(z.string().max(30)).max(10).default([]),
});

export const UpdateEngramSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  visibility: VisibilitySchema.optional(),
  tags: z.array(z.string().max(30)).max(10).optional(),
});

export const EngramFileResponse = z.object({
  fileType: FileTypeSchema,
  filename: z.string(),
  content: z.string(),
});

export const EngramResponse = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  visibility: VisibilitySchema,
  tags: z.array(z.string()),
  avatarUrl: z.string().nullable(),
  ownerId: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  files: z.array(EngramFileResponse).optional(),
});

export type CreateEngramInput = z.infer<typeof CreateEngramSchema>;
export type UpdateEngramInput = z.infer<typeof UpdateEngramSchema>;
export type EngramResponseType = z.infer<typeof EngramResponse>;
