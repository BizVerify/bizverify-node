import { describe, it, expect } from 'vitest';
import { createMockClient } from '../helpers.js';
import { checkerResponse, errorResponse } from '../fixtures/responses.js';
import { ValidationError, RateLimitError } from '../../src/errors.js';

describe('CheckerResource', () => {
  it('checks a business name', async () => {
    const { client, calls } = createMockClient([{ status: 200, body: checkerResponse }]);

    const result = await client.checker.check({
      entity_name: 'Acme',
      jurisdiction: 'us-fl',
    });

    expect(result.results).toHaveLength(1);
    expect(result.results[0]!.entity_name).toBe('Acme Inc');
    expect(result.total).toBe(1);
    expect(calls[0]!.url).toContain('/v1/checker');

    // Should not send auth headers
    const headers = calls[0]!.init.headers as Record<string, string>;
    expect(headers['X-API-Key']).toBeUndefined();
    expect(headers['Authorization']).toBeUndefined();
  });

  it('throws ValidationError for unsupported jurisdiction', async () => {
    const { client } = createMockClient([
      { status: 400, body: errorResponse('VALIDATION_ERROR', 'Not available') },
    ]);

    await expect(
      client.checker.check({ entity_name: 'Test', jurisdiction: 'xx-yy' }),
    ).rejects.toThrow(ValidationError);
  });

  it('throws RateLimitError when rate limited', async () => {
    const { client } = createMockClient([
      { status: 429, body: errorResponse('RATE_LIMIT_EXCEEDED', 'Too many requests'), headers: { 'retry-after': '10' } },
    ]);

    await expect(
      client.checker.check({ entity_name: 'Test', jurisdiction: 'us-fl' }),
    ).rejects.toThrow(RateLimitError);
  });
});
