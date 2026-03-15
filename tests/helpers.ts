import { BizVerify } from '../src/index.js';

type MockResponse = {
  status: number;
  body: unknown;
  headers?: Record<string, string>;
};

type MockFetchCall = {
  url: string;
  init: RequestInit;
};

export function createMockClient(responses: MockResponse[]) {
  const calls: MockFetchCall[] = [];
  let callIndex = 0;

  const mockFetch = async (input: string | URL | Request, init?: RequestInit): Promise<Response> => {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
    calls.push({ url, init: init ?? {} });

    const mock = responses[callIndex++];
    if (!mock) {
      throw new Error(`No mock response for call ${callIndex - 1}: ${url}`);
    }

    const responseHeaders = new Headers(mock.headers);
    responseHeaders.set('content-type', 'application/json');

    return new Response(
      mock.status === 204 ? null : JSON.stringify(mock.body),
      {
        status: mock.status,
        headers: responseHeaders,
      },
    );
  };

  const client = new BizVerify({
    apiKey: 'bv_test_key',
    token: 'test-jwt-token',
    baseUrl: 'https://api.test.com',
    fetch: mockFetch as typeof globalThis.fetch,
    maxRetries: 0,
  });

  return { client, calls };
}
