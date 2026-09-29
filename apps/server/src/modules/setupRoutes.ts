import { ResponseBuilder } from '@/utils/responseBuilder';
import { type Application, type Response } from 'express';
import { router as AppRoutes } from '../routes';

export const setUpRoutes = (
  app: Application,
  beforeCatchAll?: (app: Application) => void,
) => {
  app.get('/healthcheck', (_, res: Response) => {
    res.sendStatus(200);
  });

  app.use('/api/v1/', AppRoutes);

  beforeCatchAll?.(app);

  app.use('/*splat', (_, res) => {
    ResponseBuilder.failure(res, 404, 'Route not found');
  });
};
