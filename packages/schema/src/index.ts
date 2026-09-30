import { z } from 'zod';

/**
 * Canonical seeded users. Mirrored by packages/db seeds.
 * Fixed UUIDs keep sessions and tests stable across environments.
 */
export const SEED_USERS = [
  { id: '11111111-1111-4111-8111-111111111111', email: 'alice@ajaia.test', name: 'Alice' },
  { id: '22222222-2222-4222-8222-222222222222', email: 'bob@ajaia.test', name: 'Bob' },
] as const;

export type SeedUser = (typeof SEED_USERS)[number];

/** File import constraints shared by client hints and server validation. */
export const MAX_IMPORT_BYTES = 2 * 1024 * 1024;
export const ALLOWED_IMPORT_EXTENSIONS = ['.txt', '.md'] as const;
export const ALLOWED_IMPORT_MIME_TYPES = [
  'text/plain',
  'text/markdown',
  'text/x-markdown',
  'text/md',
] as const;

/** Title rules: 1-150 chars after trim, non-empty. */
export const titleSchema = z.string().trim().min(1).max(150);

/** Tiptap JSON document: { type: 'doc', content?: [...] }. Extra keys allowed. */
export const tiptapDocSchema = z.looseObject({
  type: z.literal('doc'),
  content: z.array(z.unknown()).optional(),
});

export const loginSchema = z.object({
  email: z.string().trim().email().max(255),
});

export const createDocumentSchema = z.object({
  title: titleSchema.optional(),
  content: tiptapDocSchema.optional(),
});

export const updateDocumentSchema = z
  .object({
    title: titleSchema.optional(),
    content: tiptapDocSchema.optional(),
  })
  .refine((v) => v.title !== undefined || v.content !== undefined, {
    message: 'Nothing to update: provide title and/or content',
  });

export const shareSchema = z.object({
  userId: z.string().trim().min(1).max(36),
});

export const documentIdParamSchema = z.object({
  id: z.string().trim().min(1).max(36),
});

export const unshareParamSchema = z.object({
  id: z.string().trim().min(1).max(36),
  userId: z.string().trim().min(1).max(36),
});

export const documentSchema = z.object({
  id: z.string(),
  ownerId: z.string(),
  title: z.string(),
  content: z.unknown(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type CreateDocumentInput = z.infer<typeof createDocumentSchema>;
export type UpdateDocumentInput = z.infer<typeof updateDocumentSchema>;
export type ShareInput = z.infer<typeof shareSchema>;
export type DocumentDto = z.infer<typeof documentSchema>;