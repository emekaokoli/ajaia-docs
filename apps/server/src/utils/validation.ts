import { loginSchema } from '@ajaia/schema';
import { z } from 'zod';
import { DomainError } from './error';

/** Parse with a Zod schema or throw a spec-shaped 400. */
export function parseOrThrow<T>(schema: z.ZodType<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw DomainError.badRequest(
      z.prettifyError(result.error),
      'VALIDATION_ERROR',
    );
  }
  return result.data;
}

export { loginSchema };