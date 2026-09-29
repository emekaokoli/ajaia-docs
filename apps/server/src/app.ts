import { errorHandler } from '@/modules/errorHandler';
import { setUpRoutes } from '@/modules/setupRoutes';
import cors from 'cors';
import 'dotenv/config';
import express, { Application, json, urlencoded } from 'express';
import { rateLimit } from 'express-rate-limit';
import helmet from 'helmet';
import pino from 'pino-http';

export const createApp = (): Application => {
  const app = express();

  const limiter = rateLimit({
    max: 100,
    windowMs: 60 * 1000,
    standardHeaders: true,
    legacyHeaders: false,
    message:
      'You have exceeded the required number of requests! Please try again later.',
  });

  app.use(json());
  app.use(cors());
  app.use(helmet());
  app.use(limiter);
  app.use(urlencoded({ extended: true }));
  app.use(pino());
  setUpRoutes(app);
  app.use(errorHandler());
  return app;
};
