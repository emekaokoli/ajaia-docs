import { Router } from 'express';
import { authRouter } from './auth';
import { documentsRouter } from './documents';
import { sharesRouter } from './shares';

const router: Router = Router();

router.use('/auth', authRouter);
router.use('/documents', documentsRouter);
router.use('/documents', sharesRouter);

export { router };
