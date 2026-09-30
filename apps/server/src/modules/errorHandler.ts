import { logger } from '@/utils/logger';
import multer from 'multer';
import { DomainError } from '@/utils/error';
import { ResponseBuilder } from '@/utils/responseBuilder';
import {
  type ErrorRequestHandler,
  type NextFunction,
  type Request,
  type Response,
} from 'express';

export function errorHandler(): ErrorRequestHandler {
  return (err: Error, _req: Request, res: Response, _next: NextFunction) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return ResponseBuilder.failure(res, 400, 'File exceeds the 2 MB limit', 'FILE_TOO_LARGE');
      }
      return ResponseBuilder.failure(res, 400, 'File upload failed', 'FILE_UPLOAD_ERROR');
    }

    if (err instanceof DomainError) {
      return ResponseBuilder.failure(res, err.statusCode, err.message, err.code);
    }

    logger.error({ err }, 'Unhandled error');
    return ResponseBuilder.failure(res, 500, 'Internal server error');
  };
}
