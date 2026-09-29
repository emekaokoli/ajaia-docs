import { type Response } from 'express';

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    currentPage: number;
    nextPage: number | null;
    prevPage: number | null;
    totalPages: number;
    limit: number;
  };
}

function defaultCodeFor(statusCode: number): string {
  switch (statusCode) {
    case 400:
      return 'BAD_REQUEST';
    case 401:
      return 'UNAUTHORIZED';
    case 403:
      return 'FORBIDDEN';
    case 404:
      return 'NOT_FOUND';
    case 422:
      return 'UNPROCESSABLE';
    default:
      return 'INTERNAL_ERROR';
  }
}

export class ResponseBuilder {
  static success<T>(
    res: Response,
    statusCode: number,
    data: T,
    metadata?: unknown,
  ): void {
    res.status(statusCode).json({
      data,
      metadata,
    });
  }

  static failure(
    res: Response,
    statusCode: number,
    message: string,
    code?: string,
  ): void {
    res.status(statusCode).json({
      error: {
        code: code ?? defaultCodeFor(statusCode),
        message,
      },
    });
  }

  static paginated<T>(
    res: Response,
    statusCode: number,
    data: T[],
    pagination: {
      total: number;
      currentPage: number;
      nextPage: number | null;
      prevPage: number | null;
      totalPages: number;
      limit: number;
    },
  ): void {
    res.status(statusCode).json({
      data,
      pagination,
    });
  }
}
