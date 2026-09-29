import { ResponseBuilder } from '@/utils/responseBuilder';
import { Router, type Request, type Response } from 'express';

const sharesRouter: Router = Router();

sharesRouter.get('/:id/shares', (_req: Request, res: Response) => {
  ResponseBuilder.failure(res, 501, 'Not implemented', 'NOT_IMPLEMENTED');
});

sharesRouter.post('/:id/shares', (_req: Request, res: Response) => {
  ResponseBuilder.failure(res, 501, 'Not implemented', 'NOT_IMPLEMENTED');
});

sharesRouter.delete('/:id/shares/:userId', (_req: Request, res: Response) => {
  ResponseBuilder.failure(res, 501, 'Not implemented', 'NOT_IMPLEMENTED');
});

export { sharesRouter };
