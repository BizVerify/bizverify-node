import type { BizVerifyOptions } from './types.js';
import { BizVerifyError, parseErrorResponse } from './errors.js';

const DEFAULT_BASE_URL = 'https://api.bizverify.co';
const DEFAULT_TIMEOUT = 30_000;
const DEFAULT_MAX_RETRIES = 2;

interface RequestOptions {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: string;
  body?: unknown;
  query?: Record<string, string | number | undefined>;
  auth?: 'apiKey' | 'jwt' | 'none';
}

export class HttpClient {
  private readonly baseUrl: string;
  private readonly maxRetries: number;
  private readonly timeout: number;
  private readonly fetchFn: typeof globalThis.fetch;
  private apiKey?: string;
  private token?: string;

  constructor(options: BizVerifyOptions = {}) {
    this.baseUrl = (options.baseUrl ?? DEFAULT_BASE_URL).replace(/\/+$/, '');
    this.maxRetries = options.maxRetries ?? DEFAULT_MAX_RETRIES;
    this.timeout = options.timeout ?? DEFAULT_TIMEOUT;
    this.fetchFn = options.fetch ?? globalThis.fetch;
    this.apiKey = options.apiKey;
    this.token = options.token;
  }

  setToken(token: string): void {
    this.token = token;
  }

  setApiKey(apiKey: string): void {
    this.apiKey = apiKey;
  }

  async request<T>(options: RequestOptions): Promise<T> {
    const { method, path, body, query, auth = 'apiKey' } = options;

    const url = this.buildUrl(path, query);
    const headers = this.buildHeaders(auth, body !== undefined);

    const requestInit: RequestInit = { method, headers };
    if (body !== undefined) {
      requestInit.body = JSON.stringify(body);
    }

    let lastError: Error | undefined;

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      if (attempt > 0) {
        const delay = Math.min(1000 * 2 ** (attempt - 1), 4000);
        await sleep(delay);
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);
      requestInit.signal = controller.signal;

      try {
        const response = await this.fetchFn(url, requestInit);
        clearTimeout(timeoutId);

        if (response.status === 204) {
          return undefined as T;
        }

        const responseBody = await response.json() as Record<string, unknown>;

        if (!response.ok) {
          const error = parseErrorResponse(
            response.status,
            responseBody as { error: { code: string; message: string; details?: unknown } },
            response.headers,
          );

          // Only retry on 5xx
          if (response.status >= 500 && attempt < this.maxRetries) {
            lastError = error;
            continue;
          }

          throw error;
        }

        return responseBody as T;
      } catch (error) {
        clearTimeout(timeoutId);

        if (error instanceof BizVerifyError) {
          // Already a parsed API error — don't wrap it
          if (error.statusCode >= 500 && attempt < this.maxRetries) {
            lastError = error;
            continue;
          }
          throw error;
        }

        // Network / abort errors
        if (error instanceof DOMException && error.name === 'AbortError') {
          lastError = new BizVerifyError('Request timed out', 'TIMEOUT', 0);
        } else {
          lastError = error instanceof Error ? error : new Error(String(error));
        }

        if (attempt < this.maxRetries) {
          continue;
        }
      }
    }

    throw lastError ?? new BizVerifyError('Request failed', 'UNKNOWN', 0);
  }

  private buildUrl(path: string, query?: Record<string, string | number | undefined>): string {
    const url = new URL(`${this.baseUrl}${path}`);
    if (query) {
      for (const [key, value] of Object.entries(query)) {
        if (value !== undefined) {
          url.searchParams.set(key, String(value));
        }
      }
    }
    return url.toString();
  }

  private buildHeaders(auth: 'apiKey' | 'jwt' | 'none', hasBody: boolean): Record<string, string> {
    const headers: Record<string, string> = {
      'Accept': 'application/json',
    };

    if (hasBody) {
      headers['Content-Type'] = 'application/json';
    }

    if (auth === 'apiKey' && this.apiKey) {
      headers['X-API-Key'] = this.apiKey;
    } else if (auth === 'jwt' && this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
