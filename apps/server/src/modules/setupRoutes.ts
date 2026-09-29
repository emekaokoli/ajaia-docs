import { ResponseBuilder } from '@/utils/responseBuilder';
import { type Application, type Request, type Response } from 'express';
import { router as AppRoutes } from '../routes';

export const setUpRoutes = (app: Application, beforeCatchAll?: (app: Application) => void) => {
  app.get('/healthcheck', (_req: Request, res: Response) => {
    res.sendStatus(200);
  });

  app.use('/api/v1/', AppRoutes);

  beforeCatchAll?.(app);

  app.use('/*splat', (_req: Request, res: Response) => {
    ResponseBuilder.failure(res, 404, 'Route does not exist', 'NOT_FOUND');
  });
};
