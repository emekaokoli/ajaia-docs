import { DomainError } from '@/utils/error';
import { ResponseBuilder } from '@/utils/responseBuilder';
import { type ErrorRequestHandler, type Request, type Response } from 'express';

export function errorHandler(): ErrorRequestHandler {
  return (err: Error, _req: Request, res: Response) => {
    if (err instanceof DomainError) {
      return ResponseBuilder.failure(res, err.statusCode, err.message);
    }

    return ResponseBuilder.failure(res, 500, 'Internal server error');
  };
}
