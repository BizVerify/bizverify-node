import { describe, it, expect } from 'vitest';
import { createMockClient } from '../helpers.js';
import { registerResponse, loginResponse, messageResponse, errorResponse } from '../fixtures/responses.js';
import { ConflictError, ValidationError } from '../../src/errors.js';

describe('AuthResource', () => {
  it('registers a new user', async () => {
    const { client, calls } = createMockClient([{ status: 201, body: registerResponse }]);

    const result = await client.auth.register({
      email: 'test@example.com',
      password: 'password123',
      accept_terms: true,
    });

    expect(result.user.email).toBe('test@example.com');
    expect(result.api_key).toBe('bv_live_abc123def456');
    expect(calls[0]!.url).toContain('/v1/auth/register');
  });

  it('throws ConflictError on duplicate email', async () => {
    const { client } = createMockClient([
      { status: 409, body: errorResponse('EMAIL_ALREADY_EXISTS', 'Email taken') },
    ]);

    await expect(
      client.auth.register({ email: 'dup@example.com', password: 'password123', accept_terms: true }),
    ).rejects.toThrow(ConflictError);
  });

  it('logs in and auto-stores JWT', async () => {
    const { client, calls } = createMockClient([
      { status: 200, body: loginResponse },
      { status: 200, body: { id: '1', email: 'test@example.com' } },
    ]);

    const result = await client.auth.login({ email: 'test@example.com', password: 'password123' });
    expect(result.token).toBeDefined();

    // Subsequent JWT-authed request should use the stored token
    await client.account.get();
    const headers = calls[1]!.init.headers as Record<string, string>;
    expect(headers['Authorization']).toBe(`Bearer ${loginResponse.token}`);
  });

  it('verifies email', async () => {
    const { client } = createMockClient([{ status: 200, body: messageResponse }]);

    const result = await client.auth.verifyEmail({ email: 'test@example.com', code: '123456' });
    expect(result.message).toBe('Success');
  });

  it('throws ValidationError on invalid code', async () => {
    const { client } = createMockClient([
      { status: 400, body: errorResponse('INVALID_VERIFICATION_CODE', 'Bad code') },
    ]);

    await expect(
      client.auth.verifyEmail({ email: 'test@example.com', code: '000000' }),
    ).rejects.toThrow(ValidationError);
  });

  it('resends verification', async () => {
    const { client } = createMockClient([{ status: 200, body: messageResponse }]);
    const result = await client.auth.resendVerification({ email: 'test@example.com' });
    expect(result.message).toBeDefined();
  });

  it('requests password reset', async () => {
    const { client } = createMockClient([{ status: 200, body: messageResponse }]);
    const result = await client.auth.forgotPassword({ email: 'test@example.com' });
    expect(result.message).toBeDefined();
  });

  it('resets password', async () => {
    const { client } = createMockClient([{ status: 200, body: messageResponse }]);
    const result = await client.auth.resetPassword({
      email: 'test@example.com',
      code: '123456',
      new_password: 'newpass123',
    });
    expect(result.message).toBeDefined();
  });
});
