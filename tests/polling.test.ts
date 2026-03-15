import { describe, it, expect } from 'vitest';
import { HttpClient } from '../src/client.js';
import { pollUntilComplete } from '../src/polling.js';
import { JobFailedError, TimeoutError } from '../src/errors.js';
import { jobStatusCompleted, jobStatusFailed, jobStatusPending } from './fixtures/responses.js';

function createPollingClient(responses: Array<{ status: number; body: unknown }>) {
  let callIndex = 0;
  return new HttpClient({
    baseUrl: 'https://api.test.com',
    apiKey: 'bv_test',
    fetch: async () => {
      const mock = responses[callIndex++];
      if (!mock) throw new Error(`No mock for call ${callIndex - 1}`);
      return new Response(JSON.stringify(mock.body), { status: mock.status });
    },
    maxRetries: 0,
  });
}

describe('pollUntilComplete', () => {
  it('returns immediately when verify response is completed with job_id', async () => {
    const client = createPollingClient([
      { status: 200, body: jobStatusCompleted },
    ]);

    const result = await pollUntilComplete(client, {
      status: 'completed',
      job_id: 'job_456',
      cached: true,
      credits_charged: 1,
    });

    expect(result.status).toBe('completed');
  });

  it('polls until job completes', async () => {
    const client = createPollingClient([
      { status: 200, body: jobStatusPending },
      { status: 200, body: { ...jobStatusPending, status: 'running' } },
      { status: 200, body: jobStatusCompleted },
    ]);

    const result = await pollUntilComplete(
      client,
      { status: 'pending', job_id: 'job_456', cached: false, credits_charged: 15 },
      { pollIntervalMs: 10 },
    );

    expect(result.status).toBe('completed');
  });

  it('throws JobFailedError when job fails', async () => {
    const client = createPollingClient([
      { status: 200, body: jobStatusFailed },
    ]);

    await expect(
      pollUntilComplete(
        client,
        { status: 'pending', job_id: 'job_456', cached: false, credits_charged: 15 },
        { pollIntervalMs: 10 },
      ),
    ).rejects.toThrow(JobFailedError);
  });

  it('throws TimeoutError when polling exceeds timeout', async () => {
    const client = createPollingClient(
      Array.from({ length: 100 }, () => ({ status: 200, body: jobStatusPending })),
    );

    await expect(
      pollUntilComplete(
        client,
        { status: 'pending', job_id: 'job_456', cached: false, credits_charged: 15 },
        { pollIntervalMs: 10, timeoutMs: 50 },
      ),
    ).rejects.toThrow(TimeoutError);
  });

  it('calls onStatusChange when status changes', async () => {
    const client = createPollingClient([
      { status: 200, body: jobStatusPending },
      { status: 200, body: { ...jobStatusPending, status: 'running' } },
      { status: 200, body: jobStatusCompleted },
    ]);

    const statuses: string[] = [];
    await pollUntilComplete(
      client,
      { status: 'pending', job_id: 'job_456', cached: false, credits_charged: 15 },
      {
        pollIntervalMs: 10,
        onStatusChange: (s) => statuses.push(s.status),
      },
    );

    expect(statuses).toEqual(['pending', 'running', 'completed']);
  });

  it('throws when no job_id in verify response', async () => {
    const client = createPollingClient([]);

    await expect(
      pollUntilComplete(client, {
        status: 'pending',
        cached: false,
        credits_charged: 0,
      }),
    ).rejects.toThrow('No job_id');
  });
});
