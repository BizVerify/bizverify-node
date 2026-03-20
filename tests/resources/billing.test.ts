import { describe, it, expect } from 'vitest';
import { createMockClient } from '../helpers.js';
import { billingResponse, purchaseResponse, errorResponse } from '../fixtures/responses.js';
import { AuthenticationError } from '../../src/errors.js';

describe('BillingResource', () => {
  it('gets billing info', async () => {
    const { client, calls } = createMockClient([{ status: 200, body: billingResponse }]);

    const result = await client.billing.get();

    expect(result.balance).toBe(100);
    expect(calls[0]!.url).toContain('/v1/billing');
    const headers = calls[0]!.init.headers as Record<string, string>;
    expect(headers['X-API-Key']).toBe('bv_test_key');
  });

  it('gets billing with pagination', async () => {
    const { client, calls } = createMockClient([{ status: 200, body: billingResponse }]);

    await client.billing.get({ limit: 10, offset: 20 });

    expect(calls[0]!.url).toContain('limit=10');
    expect(calls[0]!.url).toContain('offset=20');
  });

  it('creates purchase checkout session', async () => {
    const { client, calls } = createMockClient([{ status: 200, body: purchaseResponse }]);

    const result = await client.billing.purchase({ package_id: 'starter' });

    expect(result.session_id).toBe('cs_test_123');
    expect(result.url).toContain('stripe.com');
    expect(calls[0]!.init.method).toBe('POST');
  });

  it('throws AuthenticationError without API key', async () => {
    const { client } = createMockClient([
      { status: 401, body: errorResponse('UNAUTHORIZED', 'No API key') },
    ]);

    await expect(client.billing.get()).rejects.toThrow(AuthenticationError);
  });
});
