import { DomainError } from '@/utils/error';
import { ResponseBuilder } from '@/utils/responseBuilder';
import { parseOrThrow } from '@/utils/validation';
import { addShare, listShares, removeShare } from '@/services/shareService';
import { documentIdParamSchema, shareSchema, unshareParamSchema } from '@ajaia/schema';
import { requireAuth } from '@/middleware/auth';
import { Router, type Request, type Response } from 'express';

const sharesRouter: Router = Router();

sharesRouter.use(requireAuth);

function currentUserId(req: Request): string {
  if (!req.user) {
    throw DomainError.unauthorized('Please login', 'UNAUTHORIZED');
  }
  return req.user.id;
}

sharesRouter.get('/:id/shares', async (req: Request, res: Response) => {
  const { id } = parseOrThrow(documentIdParamSchema, req.params);
  const people = await listShares(currentUserId(req), id);
  ResponseBuilder.success(res, 200, people);
});

sharesRouter.post('/:id/shares', async (req: Request, res: Response) => {
  const { id } = parseOrThrow(documentIdParamSchema, req.params);
  const { userId } = parseOrThrow(shareSchema, req.body);
  const person = await addShare(currentUserId(req), id, userId);
  ResponseBuilder.success(res, 201, person);
});

sharesRouter.delete('/:id/shares/:userId', async (req: Request, res: Response) => {
  const { id, userId } = parseOrThrow(unshareParamSchema, req.params);
  await removeShare(currentUserId(req), id, userId);
  ResponseBuilder.success(res, 200, { ok: true });
});

export { sharesRouter };