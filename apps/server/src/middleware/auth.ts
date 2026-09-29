import { DomainError } from '@/utils/error';
import { db } from '@ajaia/db';
import type { NextFunction, Request, Response } from 'express';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export const SESSION_COOKIE_NAME =
  process.env.SESSION_COOKIE_NAME ?? 'ajaia_session';

/** Soft load: attaches req.user when a valid signed session cookie is present. */
export async function loadUser(req: Request, _res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.signedCookies?.[SESSION_COOKIE_NAME] as string | undefined;
    if (typeof userId === 'string' && userId.length > 0) {
      const row = await db('users')
        .select('id', 'email', 'name')
        .where({ id: userId })
        .first();
      if (row) {
        req.user = { id: row.id, email: row.email, name: row.name };
      }
    }
    next();
  } catch (err) {
    next(err);
  }
}

/** Hard gate: 401 when no authenticated user. No DB hit when cookie is absent. */
export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  if (!req.user) {
    throw DomainError.unauthorized('Please login', 'UNAUTHORIZED');
  }
  next();
}