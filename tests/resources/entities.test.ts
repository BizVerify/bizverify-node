import { describe, it, expect } from 'vitest';
import { createMockClient } from '../helpers.js';
import { entityResponse, historyResponse, errorResponse } from '../fixtures/responses.js';
import { NotFoundError } from '../../src/errors.js';

describe('EntitiesResource', () => {
  it('gets an entity by ID', async () => {
    const { client, calls } = createMockClient([{ status: 200, body: entityResponse }]);

    const result = await client.entities.get('ent_123');

    expect(result.entity_name).toBe('Acme Inc');
    expect(result.jurisdiction).toBe('us-fl');
    expect(calls[0]!.url).toContain('/v1/entity/ent_123');
  });

  it('throws NotFoundError for missing entity', async () => {
    const { client } = createMockClient([
      { status: 404, body: errorResponse('ENTITY_NOT_FOUND', 'Not found') },
    ]);

    await expect(client.entities.get('missing')).rejects.toThrow(NotFoundError);
  });

  it('gets entity history with pagination', async () => {
    const { client, calls } = createMockClient([{ status: 200, body: historyResponse }]);

    const result = await client.entities.history('ent_123', { limit: 10, offset: 5 });

    expect(result.total).toBe(1);
    expect(result.snapshots).toHaveLength(1);
    expect(calls[0]!.url).toContain('limit=10');
    expect(calls[0]!.url).toContain('offset=5');
  });

  it('gets entity history with defaults', async () => {
    const { client, calls } = createMockClient([{ status: 200, body: historyResponse }]);

    await client.entities.history('ent_123');

    expect(calls[0]!.url).toContain('/v1/entity/ent_123/history');
    expect(calls[0]!.url).not.toContain('limit=');
  });
});
