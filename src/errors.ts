export class BizVerifyError extends Error {
  readonly code: string;
  readonly statusCode: number;
  readonly details?: unknown;

  constructor(message: string, code: string, statusCode: number, details?: unknown) {
    super(message);
    this.name = 'BizVerifyError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
  }
}

export class AuthenticationError extends BizVerifyError {
  constructor(message: string, code: string, details?: unknown) {
    super(message, code, 401, details);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends BizVerifyError {
  constructor(message: string, code: string, details?: unknown) {
    super(message, code, 403, details);
    this.name = 'AuthorizationError';
  }
}

export class ValidationError extends BizVerifyError {
  constructor(message: string, code: string, details?: unknown) {
    super(message, code, 400, details);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends BizVerifyError {
  constructor(message: string, code: string, details?: unknown) {
    super(message, code, 404, details);
    this.name = 'NotFoundError';
  }
}

export class InsufficientCreditsError extends BizVerifyError {
  constructor(message: string, code: string, details?: unknown) {
    super(message, code, 402, details);
    this.name = 'InsufficientCreditsError';
  }
}

export class RateLimitError extends BizVerifyError {
  readonly retryAfter?: number;

  constructor(message: string, code: string, retryAfter?: number, details?: unknown) {
    super(message, code, 429, details);
    this.name = 'RateLimitError';
    this.retryAfter = retryAfter;
  }
}

export class ConflictError extends BizVerifyError {
  constructor(message: string, code: string, details?: unknown) {
    super(message, code, 409, details);
    this.name = 'ConflictError';
  }
}

export class InternalError extends BizVerifyError {
  constructor(message: string, code: string, statusCode: number = 500, details?: unknown) {
    super(message, code, statusCode, details);
    this.name = 'InternalError';
  }
}

export class TimeoutError extends BizVerifyError {
  constructor(message: string) {
    super(message, 'TIMEOUT', 0);
    this.name = 'TimeoutError';
  }
}

export class JobFailedError extends BizVerifyError {
  readonly jobId: string;

  constructor(message: string, jobId: string, details?: unknown) {
    super(message, 'JOB_FAILED', 0, details);
    this.name = 'JobFailedError';
    this.jobId = jobId;
  }
}

interface ErrorResponseBody {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export function parseErrorResponse(statusCode: number, body: ErrorResponseBody, headers: Headers): BizVerifyError {
  const { code, message, details } = body.error;

  switch (statusCode) {
    case 400:
      return new ValidationError(message, code, details);
    case 401:
      return new AuthenticationError(message, code, details);
    case 402:
      return new InsufficientCreditsError(message, code, details);
    case 403:
      return new AuthorizationError(message, code, details);
    case 404:
      return new NotFoundError(message, code, details);
    case 409:
      return new ConflictError(message, code, details);
    case 422:
      return new ValidationError(message, code, details);
    case 429: {
      const retryAfter = headers.get('retry-after');
      return new RateLimitError(message, code, retryAfter ? Number(retryAfter) : undefined, details);
    }
    default:
      if (statusCode >= 500) {
        return new InternalError(message, code, statusCode, details);
      }
      return new BizVerifyError(message, code, statusCode, details);
  }
}
