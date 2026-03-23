import { z } from "zod";

export const CreateApiKeySchema = z.object({
  name: z.string().min(1).max(50),
  expiresAt: z.string().datetime().optional(),
});

export const ApiKeyResponse = z.object({
  id: z.string(),
  name: z.string(),
  prefix: z.string(),
  lastUsedAt: z.string().nullable(),
  createdAt: z.string(),
});

export type CreateApiKeyInput = z.infer<typeof CreateApiKeySchema>;
