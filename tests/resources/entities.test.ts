import { describe, it, expect } from 'vitest';
import { createMockClient } from '../helpers.js';
import {
  entityResponse,
  entityResponseFull,
  historyResponse,
  errorResponse,
} from '../fixtures/responses.js';
import { NotFoundError } from '../../src/errors.js';

describe('EntitiesResource', () => {
  it('gets an entity by ID', async () => {
    const { client, calls } = createMockClient([{ status: 200, body: entityResponse }]);

    const result = await client.entities.get('ent_123');

    expect(result.entity_name).toBe('Acme Inc');
    expect(result.jurisdiction).toBe('us-fl');
    expect(calls[0]!.url).toContain('/v1/entity/ent_123');
  });

  it('returns a fully populated entity from the unwrapped response shape', async () => {
    const { client } = createMockClient([{ status: 200, body: entityResponseFull }]);

    const result = await client.entities.get('550e8400-e29b-41d4-a716-446655440000');

    expect(result.id).toBeTruthy();
    expect(result.entity_name).toBe('ACME WIDGETS LLC');
    expect(result.entity_type).toBe('llc');
    expect(result.status).toBe('active');
    expect(result.good_standing).toBe(true);
    expect(result.formation_date).toBe('2021-03-15');

    expect(result.registered_agent?.name).toBeTruthy();
    expect(result.registered_agent?.address?.city).toBe('TALLAHASSEE');

    expect(result.officers).toHaveLength(1);
    expect(result.officers[0]!.title).toBe('Manager');

    expect(result.principal_address?.line1).toBeTruthy();

    expect(result.filing_history_summary).toHaveLength(1);

    expect(result.last_verified_at).toBe('2026-06-13T10:30:00.000Z');
    expect(result.snapshots).toBe(3);

    expect(result.created_at).toBeTruthy();
    expect(result.updated_at).toBeTruthy();
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
