import { ResponseBuilder } from '@/utils/responseBuilder';
import { parseOrThrow } from '@/utils/validation';
import { SESSION_COOKIE_NAME } from '@/middleware/auth';
import { db } from '@ajaia/db';
import { loginSchema } from '@ajaia/schema';
import { Router, type Request, type Response } from 'express';

const authRouter: Router = Router();

const isProduction = process.env.NODE_ENV === 'production';

function sessionCookieOptions() {
  return {
    httpOnly: true,
    signed: true,
    sameSite: 'lax' as const,
    secure: isProduction,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/',
  };
}

authRouter.post('/login', async (req: Request, res: Response) => {
  const { email } = parseOrThrow(loginSchema, req.body);
  const normalized = email.trim().toLowerCase();
  const row = await db('users')
    .select('id', 'email', 'name')
    .where({ email: normalized })
    .first();
  if (!row) {
    ResponseBuilder.failure(res, 401, 'Unknown user', 'INVALID_CREDENTIALS');
    return;
  }
  res.cookie(SESSION_COOKIE_NAME, row.id, sessionCookieOptions());
  ResponseBuilder.success(res, 200, { id: row.id, email: row.email, name: row.name });
});

authRouter.post('/logout', (_req: Request, res: Response) => {
  res.clearCookie(SESSION_COOKIE_NAME, { path: '/' });
  ResponseBuilder.success(res, 200, { ok: true });
});

authRouter.get('/me', (req: Request, res: Response) => {
  if (!req.user) {
    ResponseBuilder.failure(res, 401, 'Please login', 'UNAUTHORIZED');
    return;
  }
  ResponseBuilder.success(res, 200, req.user);
});

export { authRouter };