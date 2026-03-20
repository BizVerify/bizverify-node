import { describe, it, expect } from 'vitest';
import { createMockClient } from '../helpers.js';
import { configResponse, jurisdictionsResponse } from '../fixtures/responses.js';

describe('ConfigResource', () => {
  it('gets config without auth', async () => {
    const { client, calls } = createMockClient([{ status: 200, body: configResponse }]);

    const result = await client.config.get();

    expect(result.jurisdictions.stats.totalJurisdictions).toBe(61);
    expect(result.pricing.creditCosts).toBeDefined();
    expect(calls[0]!.url).toContain('/v1/config');
    const headers = calls[0]!.init.headers as Record<string, string>;
    expect(headers['X-API-Key']).toBeUndefined();
  });

  it('gets jurisdictions without auth', async () => {
    const { client, calls } = createMockClient([{ status: 200, body: jurisdictionsResponse }]);

    const result = await client.config.jurisdictions();

    expect(result.jurisdictions).toHaveLength(2);
    expect(result.jurisdictions[0]!.code).toBe('us-fl');
    expect(calls[0]!.url).toContain('/v1/jurisdictions');
    const headers = calls[0]!.init.headers as Record<string, string>;
    expect(headers['X-API-Key']).toBeUndefined();
  });
});
