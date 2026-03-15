import { describe, it, expect } from 'vitest';
import { createMockClient } from '../helpers.js';
import {
  accountResponse,
  usageResponse,
  dataExportResponse,
  createKeyResponse,
  errorResponse,
} from '../fixtures/responses.js';
import { AuthenticationError } from '../../src/errors.js';

describe('AccountResource', () => {
  it('gets account info', async () => {
    const { client, calls } = createMockClient([{ status: 200, body: accountResponse }]);

    const result = await client.account.get();

    expect(result.email).toBe('test@example.com');
    expect(result.credit_balance).toBe(100);
    const headers = calls[0]!.init.headers as Record<string, string>;
    expect(headers['Authorization']).toBe('Bearer test-jwt-token');
  });

  it('throws AuthenticationError without token', async () => {
    const { client } = createMockClient([
      { status: 401, body: errorResponse('UNAUTHORIZED', 'No token') },
    ]);

    await expect(client.account.get()).rejects.toThrow(AuthenticationError);
  });

  it('gets usage stats', async () => {
    const { client, calls } = createMockClient([{ status: 200, body: usageResponse }]);

    const result = await client.account.usage({ days: 7 });

    expect(result.period_days).toBe(30);
    expect(calls[0]!.url).toContain('days=7');
  });

  it('gets data export', async () => {
    const { client } = createMockClient([{ status: 200, body: dataExportResponse }]);

    const result = await client.account.dataExport();

    expect(result.profile.email).toBe('test@example.com');
    expect(result.api_keys).toEqual([]);
  });

  it('updates email', async () => {
    const { client, calls } = createMockClient([
      { status: 200, body: { ...accountResponse, email: 'new@example.com' } },
    ]);

    const result = await client.account.updateEmail({ email: 'new@example.com' });

    expect(result.email).toBe('new@example.com');
    expect(calls[0]!.init.method).toBe('PATCH');
  });

  it('updates password', async () => {
    const { client, calls } = createMockClient([{ status: 204, body: null }]);

    await client.account.updatePassword({
      current_password: 'old',
      new_password: 'new12345',
    });

    expect(calls[0]!.init.method).toBe('PUT');
    expect(calls[0]!.url).toContain('/v1/account/password');
  });

  it('deletes account', async () => {
    const { client, calls } = createMockClient([{ status: 204, body: null }]);

    await client.account.delete({ password: 'mypassword' });

    expect(calls[0]!.init.method).toBe('DELETE');
    expect(calls[0]!.url).toContain('/v1/account');
  });

  it('creates API key', async () => {
    const { client } = createMockClient([{ status: 201, body: createKeyResponse }]);

    const result = await client.account.createKey({ label: 'My Key' });

    expect(result.key).toBe('bv_live_newkey');
    expect(result.label).toBe('My Key');
  });

  it('revokes API key', async () => {
    const { client, calls } = createMockClient([{ status: 204, body: null }]);

    await client.account.revokeKey('key_123');

    expect(calls[0]!.init.method).toBe('DELETE');
    expect(calls[0]!.url).toContain('/v1/account/keys/key_123');
  });
});
