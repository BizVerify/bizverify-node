import { describe, it, expect } from 'vitest';
import { createMockClient } from '../helpers.js';
import { searchResponse, errorResponse } from '../fixtures/responses.js';
import { AuthorizationError } from '../../src/errors.js';

describe('SearchResource', () => {
  it('searches for entities', async () => {
    const { client, calls } = createMockClient([{ status: 200, body: searchResponse }]);

    const result = await client.search.find({ entity_name: 'Acme' });

    expect(result.results).toHaveLength(1);
    expect(result.results[0]!.entity_name).toBe('Acme Inc');
    expect(result.total).toBe(1);
    expect(calls[0]!.url).toContain('/v1/search');
  });

  it('searches with all params', async () => {
    const { client, calls } = createMockClient([{ status: 200, body: searchResponse }]);

    await client.search.find({
      entity_name: 'Acme',
      jurisdiction: 'us-fl',
      entity_type: 'corporation',
      limit: 20,
      offset: 10,
    });

    const body = JSON.parse(calls[0]!.init.body as string);
    expect(body.jurisdiction).toBe('us-fl');
    expect(body.entity_type).toBe('corporation');
    expect(body.limit).toBe(20);
    expect(body.offset).toBe(10);
  });

  it('throws AuthorizationError when email not verified', async () => {
    const { client } = createMockClient([
      { status: 403, body: errorResponse('EMAIL_NOT_VERIFIED', 'Verify email first') },
    ]);

    await expect(
      client.search.find({ entity_name: 'Acme' }),
    ).rejects.toThrow(AuthorizationError);
  });

  it('findAll auto-paginates', async () => {
    const page1 = {
      ...searchResponse,
      total: 3,
      results: [
        { entity_name: 'A', jurisdiction: 'us-fl', entity_type: 'llc', status: 'active', jurisdiction_id: null, confidence: 0.9 },
        { entity_name: 'B', jurisdiction: 'us-fl', entity_type: 'llc', status: 'active', jurisdiction_id: null, confidence: 0.8 },
      ],
      limit: 2,
      offset: 0,
    };
    const page2 = {
      ...searchResponse,
      total: 3,
      results: [
        { entity_name: 'C', jurisdiction: 'us-fl', entity_type: 'llc', status: 'active', jurisdiction_id: null, confidence: 0.7 },
      ],
      limit: 2,
      offset: 2,
    };

    const { client } = createMockClient([
      { status: 200, body: page1 },
      { status: 200, body: page2 },
    ]);

    const results = [];
    for await (const result of client.search.findAll({ entity_name: 'test' })) {
      results.push(result);
    }

    expect(results).toHaveLength(3);
    expect(results.map((r) => r.entity_name)).toEqual(['A', 'B', 'C']);
  });
});
