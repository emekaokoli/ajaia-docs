export class DomainError extends Error {
  private constructor(
    public message: string,
    public readonly code: string,
    public readonly statusCode = 500,
  ) {
    super(message);
    this.name = 'DomainError';
  }

  static badRequest(message: string, code = 'VALIDATION_ERROR'): DomainError {
    return new DomainError(message, code, 400);
  }

  static unauthorized(message = 'Please login', code = 'UNAUTHORIZED'): DomainError {
    return new DomainError(message, code, 401);
  }

  static forbidden(
    message = "You don't have enough permissions to perform this action",
    code = 'FORBIDDEN',
  ): DomainError {
    return new DomainError(message, code, 403);
  }

  static notFound(
    message = 'The resource you requested does not exist',
    code = 'NOT_FOUND',
  ): DomainError {
    return new DomainError(message, code, 404);
  }

  static unprocessableEntity(
    message = 'We are unable to process this request',
    code = 'UNPROCESSABLE',
  ): DomainError {
    return new DomainError(message, code, 422);
  }

  static conflict(message: string, code = 'CONFLICT'): DomainError {
    return new DomainError(message, code, 409);
  }

  static internalError(message = 'Something went wrong!', code = 'INTERNAL_ERROR'): DomainError {
    return new DomainError(message, code, 500);
  }

  static badGateway(message = 'Bad Gateway', code = 'BAD_GATEWAY'): DomainError {
    return new DomainError(message, code, 502);
  }
}
