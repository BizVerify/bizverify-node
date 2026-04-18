import { describe, it, expect } from 'vitest';
import { createMockClient } from '../helpers.js';
import { verifyResponseSync, verifyResponseAsync, jobStatusCompleted, errorResponse } from '../fixtures/responses.js';
import { ValidationError, InsufficientCreditsError } from '../../src/errors.js';

describe('VerificationResource', () => {
  it('verifies an entity (sync response)', async () => {
    const { client, calls } = createMockClient([{ status: 200, body: verifyResponseSync }]);

    const result = await client.verification.verify({
      entity_name: 'Acme Inc',
      jurisdiction: 'us-fl',
    });

    expect(result.status).toBe('completed');
    expect(result.cached).toBe(true);
    expect(result.credits_charged).toBe(1);
    expect(calls[0]!.url).toContain('/v1/verify');
  });

  it('verifies an entity (async response)', async () => {
    const { client } = createMockClient([{ status: 202, body: verifyResponseAsync }]);

    const result = await client.verification.verify({
      entity_name: 'Acme Inc',
      jurisdiction: 'us-fl',
      verification_level: 'deep',
    });

    expect(result.status).toBe('pending');
    expect(result.job_id).toBe('job_456');
  });

  it('throws ValidationError on bad jurisdiction', async () => {
    const { client } = createMockClient([
      { status: 400, body: errorResponse('JURISDICTION_NOT_SUPPORTED', 'Not supported') },
    ]);

    await expect(
      client.verification.verify({ entity_name: 'Test', jurisdiction: 'xx-yy' }),
    ).rejects.toThrow(ValidationError);
  });

  it('throws InsufficientCreditsError', async () => {
    const { client } = createMockClient([
      { status: 402, body: errorResponse('INSUFFICIENT_CREDITS', 'No credits') },
    ]);

    await expect(
      client.verification.verify({ entity_name: 'Test', jurisdiction: 'us-fl' }),
    ).rejects.toThrow(InsufficientCreditsError);
  });

  it('gets job status', async () => {
    const { client, calls } = createMockClient([{ status: 200, body: jobStatusCompleted }]);

    const result = await client.verification.getStatus('job_456');

    expect(result.status).toBe('completed');
    expect(calls[0]!.url).toContain('/v1/verify/status/job_456');
  });

  it('verifyAndWait polls until complete', async () => {
    const { client } = createMockClient([
      { status: 202, body: verifyResponseAsync },
      { status: 200, body: { ...jobStatusCompleted, status: 'pending' } },
      { status: 200, body: jobStatusCompleted },
    ]);

    const result = await client.verification.verifyAndWait(
      { entity_name: 'Acme Inc', jurisdiction: 'us-fl', verification_level: 'deep' },
      { pollIntervalMs: 10 },
    );

    expect(result.status).toBe('completed');
  });

  it('sends all optional params', async () => {
    const { client, calls } = createMockClient([{ status: 200, body: verifyResponseSync }]);

    await client.verification.verify({
      entity_name: 'Acme Inc',
      jurisdiction: 'us-fl',
      entity_type: 'corporation',
      verification_level: 'deep',
      force_refresh: true,
      webhook_url: 'https://example.com/hook',
    });

    const body = JSON.parse(calls[0]!.init.body as string);
    expect(body.entity_type).toBe('corporation');
    expect(body.force_refresh).toBe(true);
    expect(body.webhook_url).toBe('https://example.com/hook');
  });
});
