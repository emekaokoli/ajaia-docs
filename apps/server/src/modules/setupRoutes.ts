import { ResponseUtils } from '@/utils/response';
import { Response, type Application } from 'express';
import { router as AppRoutes } from '../routes';

export const setUpRoutes = (app: Application, beforeCatchAll?: (app: Application) => void) => {
  app.get('/healthcheck', (_, res: Response) => {
    res.sendStatus(200);
  });

  app.use('/api/v1/', AppRoutes);

  beforeCatchAll?.(app);

  app.use('/*splat', (_, res) => {
    ResponseUtils.notFound(
      res,

      'It seems you are lost 😉, Route does not exit',
    );
  });
};
