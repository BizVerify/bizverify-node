import { describe, it, expect } from 'vitest';
import {
  BizVerifyError,
  AuthenticationError,
  AuthorizationError,
  ValidationError,
  NotFoundError,
  InsufficientCreditsError,
  RateLimitError,
  ConflictError,
  InternalError,
  TimeoutError,
  JobFailedError,
  parseErrorResponse,
} from '../src/errors.js';

describe('Error classes', () => {
  it('BizVerifyError has correct properties', () => {
    const err = new BizVerifyError('test', 'TEST_CODE', 418);
    expect(err.message).toBe('test');
    expect(err.code).toBe('TEST_CODE');
    expect(err.statusCode).toBe(418);
    expect(err.name).toBe('BizVerifyError');
    expect(err).toBeInstanceOf(Error);
  });

  it('AuthenticationError is 401', () => {
    const err = new AuthenticationError('bad key', 'INVALID_API_KEY');
    expect(err.statusCode).toBe(401);
    expect(err).toBeInstanceOf(BizVerifyError);
  });

  it('AuthorizationError is 403', () => {
    const err = new AuthorizationError('forbidden', 'FORBIDDEN');
    expect(err.statusCode).toBe(403);
  });

  it('ValidationError is 400', () => {
    const err = new ValidationError('invalid', 'VALIDATION_ERROR');
    expect(err.statusCode).toBe(400);
  });

  it('NotFoundError is 404', () => {
    const err = new NotFoundError('missing', 'NOT_FOUND');
    expect(err.statusCode).toBe(404);
  });

  it('InsufficientCreditsError is 402', () => {
    const err = new InsufficientCreditsError('broke', 'INSUFFICIENT_CREDITS');
    expect(err.statusCode).toBe(402);
  });

  it('RateLimitError has retryAfter', () => {
    const err = new RateLimitError('slow', 'RATE_LIMIT_EXCEEDED', 60);
    expect(err.statusCode).toBe(429);
    expect(err.retryAfter).toBe(60);
  });

  it('ConflictError is 409', () => {
    const err = new ConflictError('conflict', 'EMAIL_ALREADY_EXISTS');
    expect(err.statusCode).toBe(409);
  });

  it('InternalError defaults to 500', () => {
    const err = new InternalError('broken', 'INTERNAL_ERROR');
    expect(err.statusCode).toBe(500);
  });

  it('TimeoutError has code TIMEOUT', () => {
    const err = new TimeoutError('timed out');
    expect(err.code).toBe('TIMEOUT');
  });

  it('JobFailedError has jobId', () => {
    const err = new JobFailedError('failed', 'job_123');
    expect(err.jobId).toBe('job_123');
    expect(err.code).toBe('JOB_FAILED');
  });
});

describe('parseErrorResponse', () => {
  const headers = new Headers();

  it('maps 400 to ValidationError', () => {
    const err = parseErrorResponse(400, { error: { code: 'VALIDATION_ERROR', message: 'bad' } }, headers);
    expect(err).toBeInstanceOf(ValidationError);
  });

  it('maps 401 to AuthenticationError', () => {
    const err = parseErrorResponse(401, { error: { code: 'UNAUTHORIZED', message: 'no' } }, headers);
    expect(err).toBeInstanceOf(AuthenticationError);
  });

  it('maps 402 to InsufficientCreditsError', () => {
    const err = parseErrorResponse(402, { error: { code: 'INSUFFICIENT_CREDITS', message: 'broke' } }, headers);
    expect(err).toBeInstanceOf(InsufficientCreditsError);
  });

  it('maps 403 to AuthorizationError', () => {
    const err = parseErrorResponse(403, { error: { code: 'FORBIDDEN', message: 'nope' } }, headers);
    expect(err).toBeInstanceOf(AuthorizationError);
  });

  it('maps 404 to NotFoundError', () => {
    const err = parseErrorResponse(404, { error: { code: 'NOT_FOUND', message: 'gone' } }, headers);
    expect(err).toBeInstanceOf(NotFoundError);
  });

  it('maps 409 to ConflictError', () => {
    const err = parseErrorResponse(409, { error: { code: 'EMAIL_ALREADY_EXISTS', message: 'dup' } }, headers);
    expect(err).toBeInstanceOf(ConflictError);
  });

  it('maps 422 to ValidationError', () => {
    const err = parseErrorResponse(422, { error: { code: 'TERMS_NOT_ACCEPTED', message: 'terms' } }, headers);
    expect(err).toBeInstanceOf(ValidationError);
  });

  it('maps 429 to RateLimitError with retry-after header', () => {
    const h = new Headers({ 'retry-after': '45' });
    const err = parseErrorResponse(429, { error: { code: 'RATE_LIMIT_EXCEEDED', message: 'slow' } }, h);
    expect(err).toBeInstanceOf(RateLimitError);
    expect((err as RateLimitError).retryAfter).toBe(45);
  });

  it('maps 500+ to InternalError', () => {
    const err = parseErrorResponse(502, { error: { code: 'INTERNAL_ERROR', message: 'down' } }, headers);
    expect(err).toBeInstanceOf(InternalError);
    expect(err.statusCode).toBe(502);
  });

  it('maps unknown status to BizVerifyError', () => {
    const err = parseErrorResponse(418, { error: { code: 'TEAPOT', message: 'brew' } }, headers);
    expect(err).toBeInstanceOf(BizVerifyError);
    expect(err.statusCode).toBe(418);
  });
});
