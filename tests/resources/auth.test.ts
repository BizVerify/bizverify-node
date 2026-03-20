import { describe, it, expect } from 'vitest';
import { createMockClient } from '../helpers.js';
import { requestAccessResponse, verifyAccessResponse, errorResponse } from '../fixtures/responses.js';
import { ValidationError } from '../../src/errors.js';

describe('AuthResource', () => {
  it('requests access with email', async () => {
    const { client, calls } = createMockClient([{ status: 200, body: requestAccessResponse }]);

    const result = await client.auth.requestAccess({
      email: 'test@example.com',
      accept_terms: true,
    });

    expect(result.message).toContain('test@example.com');
    expect(calls[0]!.url).toContain('/v1/auth/request-access');
    // No auth header on public endpoint
    const headers = calls[0]!.init.headers as Record<string, string>;
    expect(headers['X-API-Key']).toBeUndefined();
    expect(headers['Authorization']).toBeUndefined();
  });

  it('throws ValidationError on invalid request', async () => {
    const { client } = createMockClient([
      { status: 400, body: errorResponse('VALIDATION_ERROR', 'accept_terms is required') },
    ]);

    await expect(
      client.auth.requestAccess({ email: 'test@example.com', accept_terms: false }),
    ).rejects.toThrow(ValidationError);
  });

  it('verifies access and returns API key', async () => {
    const { client, calls } = createMockClient([{ status: 200, body: verifyAccessResponse }]);

    const result = await client.auth.verifyAccess({
      email: 'test@example.com',
      code: '123456',
    });

    expect(result.api_key).toBe('bv_live_abc123def456');
    expect(result.key_id).toBe('key_001');
    expect(result.label).toBeDefined();
    expect(calls[0]!.url).toContain('/v1/auth/verify-access');
  });

  it('verifies access with custom label', async () => {
    const { client, calls } = createMockClient([{ status: 200, body: verifyAccessResponse }]);

    await client.auth.verifyAccess({
      email: 'test@example.com',
      code: '123456',
      label: 'my-agent',
    });

    const body = JSON.parse(calls[0]!.init.body as string) as Record<string, unknown>;
    expect(body.label).toBe('my-agent');
  });

  it('auto-configures client with API key after verifyAccess', async () => {
    const { client, calls } = createMockClient([
      { status: 200, body: verifyAccessResponse },
      { status: 200, body: { id: '1', email: 'test@example.com' } },
    ]);

    await client.auth.verifyAccess({ email: 'test@example.com', code: '123456' });

    // Subsequent API-key-authed request should use the new key
    await client.account.get();
    const headers = calls[1]!.init.headers as Record<string, string>;
    expect(headers['X-API-Key']).toBe('bv_live_abc123def456');
  });

  it('throws ValidationError on invalid code', async () => {
    const { client } = createMockClient([
      { status: 400, body: errorResponse('INVALID_VERIFICATION_CODE', 'Bad code') },
    ]);

    await expect(
      client.auth.verifyAccess({ email: 'test@example.com', code: '000000' }),
    ).rejects.toThrow(ValidationError);
  });
});
