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
    issues?: string[],
  ): void {
    res.status(statusCode).json({
      message,
      issues,
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
