import { ResponseBuilder } from '@/utils/responseBuilder';
import { Router, type Request, type Response } from 'express';

const documentsRouter: Router = Router();

documentsRouter.get('/', (_req: Request, res: Response) => {
  ResponseBuilder.failure(res, 501, 'Not implemented', 'NOT_IMPLEMENTED');
});

documentsRouter.post('/', (_req: Request, res: Response) => {
  ResponseBuilder.failure(res, 501, 'Not implemented', 'NOT_IMPLEMENTED');
});

documentsRouter.post('/import', (_req: Request, res: Response) => {
  ResponseBuilder.failure(res, 501, 'Not implemented', 'NOT_IMPLEMENTED');
});

documentsRouter.get('/:id', (_req: Request, res: Response) => {
  ResponseBuilder.failure(res, 501, 'Not implemented', 'NOT_IMPLEMENTED');
});

documentsRouter.patch('/:id', (_req: Request, res: Response) => {
  ResponseBuilder.failure(res, 501, 'Not implemented', 'NOT_IMPLEMENTED');
});

documentsRouter.delete('/:id', (_req: Request, res: Response) => {
  ResponseBuilder.failure(res, 501, 'Not implemented', 'NOT_IMPLEMENTED');
});

export { documentsRouter };
