import { describe, it, expect } from 'vitest';
import { HttpClient } from '../src/client.js';
import {
  AuthenticationError,
  ValidationError,
  NotFoundError,
  InsufficientCreditsError,
  RateLimitError,
  InternalError,
  BizVerifyError,
} from '../src/errors.js';

function mockFetch(status: number, body: unknown, headers?: Record<string, string>) {
  return async (): Promise<Response> => {
    const h = new Headers(headers);
    h.set('content-type', 'application/json');
    return new Response(
      status === 204 ? null : JSON.stringify(body),
      { status, headers: h },
    );
  };
}

describe('HttpClient', () => {
  it('sends GET request with API key auth', async () => {
    let capturedInit: RequestInit | undefined;
    const client = new HttpClient({
      apiKey: 'bv_test_key',
      baseUrl: 'https://api.test.com',
      fetch: async (_url, init) => {
        capturedInit = init;
        return new Response(JSON.stringify({ ok: true }), { status: 200 });
      },
      maxRetries: 0,
    });

    await client.request({ method: 'GET', path: '/v1/test', auth: 'apiKey' });
    const headers = capturedInit!.headers as Record<string, string>;
    expect(headers['X-API-Key']).toBe('bv_test_key');
  });

  it('sends POST with body and content-type', async () => {
    let capturedInit: RequestInit | undefined;
    const client = new HttpClient({
      apiKey: 'bv_test_key',
      baseUrl: 'https://api.test.com',
      fetch: async (_url, init) => {
        capturedInit = init;
        return new Response(JSON.stringify({ ok: true }), { status: 200 });
      },
      maxRetries: 0,
    });

    await client.request({
      method: 'POST',
      path: '/v1/test',
      body: { key: 'value' },
      auth: 'apiKey',
    });

    const headers = capturedInit!.headers as Record<string, string>;
    expect(headers['Content-Type']).toBe('application/json');
    expect(headers['X-API-Key']).toBe('bv_test_key');
    expect(capturedInit!.body).toBe('{"key":"value"}');
  });

  it('sends request without auth when auth is none', async () => {
    let capturedInit: RequestInit | undefined;
    const client = new HttpClient({
      apiKey: 'bv_test_key',
      baseUrl: 'https://api.test.com',
      fetch: async (_url, init) => {
        capturedInit = init;
        return new Response(JSON.stringify({ ok: true }), { status: 200 });
      },
      maxRetries: 0,
    });

    await client.request({ method: 'GET', path: '/v1/test', auth: 'none' });
    const headers = capturedInit!.headers as Record<string, string>;
    expect(headers['X-API-Key']).toBeUndefined();
  });

  it('handles 204 no-content responses', async () => {
    const client = new HttpClient({
      baseUrl: 'https://api.test.com',
      fetch: mockFetch(204, null),
      maxRetries: 0,
    });

    const result = await client.request({ method: 'DELETE', path: '/v1/test', auth: 'none' });
    expect(result).toBeUndefined();
  });

  it('appends query parameters', async () => {
    let capturedUrl = '';
    const client = new HttpClient({
      baseUrl: 'https://api.test.com',
      fetch: async (url) => {
        capturedUrl = url as string;
        return new Response(JSON.stringify({}), { status: 200 });
      },
      maxRetries: 0,
    });

    await client.request({
      method: 'GET',
      path: '/v1/test',
      query: { limit: 10, offset: 0, empty: undefined },
      auth: 'none',
    });

    expect(capturedUrl).toContain('limit=10');
    expect(capturedUrl).toContain('offset=0');
    expect(capturedUrl).not.toContain('empty');
  });

  it('parses 401 as AuthenticationError', async () => {
    const client = new HttpClient({
      baseUrl: 'https://api.test.com',
      fetch: mockFetch(401, { error: { code: 'UNAUTHORIZED', message: 'Bad key' } }),
      maxRetries: 0,
    });

    await expect(
      client.request({ method: 'GET', path: '/v1/test', auth: 'none' }),
    ).rejects.toThrow(AuthenticationError);
  });

  it('parses 400 as ValidationError', async () => {
    const client = new HttpClient({
      baseUrl: 'https://api.test.com',
      fetch: mockFetch(400, { error: { code: 'VALIDATION_ERROR', message: 'Invalid' } }),
      maxRetries: 0,
    });

    await expect(
      client.request({ method: 'GET', path: '/v1/test', auth: 'none' }),
    ).rejects.toThrow(ValidationError);
  });

  it('parses 404 as NotFoundError', async () => {
    const client = new HttpClient({
      baseUrl: 'https://api.test.com',
      fetch: mockFetch(404, { error: { code: 'NOT_FOUND', message: 'Missing' } }),
      maxRetries: 0,
    });

    await expect(
      client.request({ method: 'GET', path: '/v1/test', auth: 'none' }),
    ).rejects.toThrow(NotFoundError);
  });

  it('parses 402 as InsufficientCreditsError', async () => {
    const client = new HttpClient({
      baseUrl: 'https://api.test.com',
      fetch: mockFetch(402, { error: { code: 'INSUFFICIENT_CREDITS', message: 'No credits' } }),
      maxRetries: 0,
    });

    await expect(
      client.request({ method: 'GET', path: '/v1/test', auth: 'none' }),
    ).rejects.toThrow(InsufficientCreditsError);
  });

  it('parses 429 as RateLimitError with retryAfter', async () => {
    const client = new HttpClient({
      baseUrl: 'https://api.test.com',
      fetch: mockFetch(429, { error: { code: 'RATE_LIMIT_EXCEEDED', message: 'Slow down' } }, { 'retry-after': '30' }),
      maxRetries: 0,
    });

    try {
      await client.request({ method: 'GET', path: '/v1/test', auth: 'none' });
      expect.fail('Should throw');
    } catch (err) {
      expect(err).toBeInstanceOf(RateLimitError);
      expect((err as RateLimitError).retryAfter).toBe(30);
    }
  });

  it('retries on 5xx errors', async () => {
    let callCount = 0;
    const client = new HttpClient({
      baseUrl: 'https://api.test.com',
      fetch: async () => {
        callCount++;
        if (callCount < 3) {
          return new Response(
            JSON.stringify({ error: { code: 'INTERNAL_ERROR', message: 'fail' } }),
            { status: 500 },
          );
        }
        return new Response(JSON.stringify({ ok: true }), { status: 200 });
      },
      maxRetries: 2,
    });

    const result = await client.request<{ ok: boolean }>({ method: 'GET', path: '/v1/test', auth: 'none' });
    expect(result.ok).toBe(true);
    expect(callCount).toBe(3);
  });

  it('throws after max retries on 5xx', async () => {
    const client = new HttpClient({
      baseUrl: 'https://api.test.com',
      fetch: async () => new Response(
        JSON.stringify({ error: { code: 'INTERNAL_ERROR', message: 'down' } }),
        { status: 500 },
      ),
      maxRetries: 1,
    });

    await expect(
      client.request({ method: 'GET', path: '/v1/test', auth: 'none' }),
    ).rejects.toThrow(InternalError);
  });

  it('does not retry on 4xx errors', async () => {
    let callCount = 0;
    const client = new HttpClient({
      baseUrl: 'https://api.test.com',
      fetch: async () => {
        callCount++;
        return new Response(
          JSON.stringify({ error: { code: 'VALIDATION_ERROR', message: 'bad' } }),
          { status: 400 },
        );
      },
      maxRetries: 2,
    });

    await expect(
      client.request({ method: 'GET', path: '/v1/test', auth: 'none' }),
    ).rejects.toThrow(ValidationError);
    expect(callCount).toBe(1);
  });

  it('handles network errors', async () => {
    const client = new HttpClient({
      baseUrl: 'https://api.test.com',
      fetch: async () => { throw new Error('Network failed'); },
      maxRetries: 0,
    });

    await expect(
      client.request({ method: 'GET', path: '/v1/test', auth: 'none' }),
    ).rejects.toThrow('Network failed');
  });

  it('setApiKey updates auth header', async () => {
    let capturedHeaders: Record<string, string> = {};
    const client = new HttpClient({
      baseUrl: 'https://api.test.com',
      fetch: async (_url, init) => {
        capturedHeaders = (init?.headers as Record<string, string>) ?? {};
        return new Response(JSON.stringify({}), { status: 200 });
      },
      maxRetries: 0,
    });

    client.setApiKey('bv_new_key');
    await client.request({ method: 'GET', path: '/v1/test', auth: 'apiKey' });
    expect(capturedHeaders['X-API-Key']).toBe('bv_new_key');
  });

  it('preserves error details', async () => {
    const client = new HttpClient({
      baseUrl: 'https://api.test.com',
      fetch: mockFetch(400, {
        error: { code: 'VALIDATION_ERROR', message: 'Invalid field', details: { field: 'email' } },
      }),
      maxRetries: 0,
    });

    try {
      await client.request({ method: 'GET', path: '/v1/test', auth: 'none' });
      expect.fail('Should throw');
    } catch (err) {
      expect(err).toBeInstanceOf(BizVerifyError);
      expect((err as BizVerifyError).details).toEqual({ field: 'email' });
    }
  });

  it('captures response meta from credit and rate-limit headers', async () => {
    const client = new HttpClient({
      baseUrl: 'https://api.test.com',
      fetch: async () => {
        const headers = new Headers({
          'content-type': 'application/json',
          'x-credits-remaining': '85',
          'x-credits-charged': '15',
          'x-ratelimit-limit': '60',
          'x-ratelimit-remaining': '59',
          'x-ratelimit-reset': '1710000060',
        });
        return new Response(JSON.stringify({ ok: true }), { status: 200, headers });
      },
      maxRetries: 0,
    });

    expect(client.lastResponseMeta).toBeNull();

    await client.request({ method: 'GET', path: '/v1/test', auth: 'apiKey' });

    const meta = client.lastResponseMeta;
    expect(meta).not.toBeNull();
    expect(meta!.creditsRemaining).toBe(85);
    expect(meta!.creditsCharged).toBe(15);
    expect(meta!.rateLimitLimit).toBe(60);
    expect(meta!.rateLimitRemaining).toBe(59);
    expect(meta!.rateLimitReset).toBe(1710000060);
  });

  it('returns null for missing response meta headers', async () => {
    const client = new HttpClient({
      baseUrl: 'https://api.test.com',
      fetch: async () => new Response(JSON.stringify({ ok: true }), { status: 200 }),
      maxRetries: 0,
    });

    await client.request({ method: 'GET', path: '/v1/test', auth: 'none' });

    const meta = client.lastResponseMeta;
    expect(meta).not.toBeNull();
    expect(meta!.creditsRemaining).toBeNull();
    expect(meta!.creditsCharged).toBeNull();
    expect(meta!.rateLimitLimit).toBeNull();
  });
});
