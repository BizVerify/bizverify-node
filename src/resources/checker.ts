import type { HttpClient } from '../client.js';
import type { CheckerParams, CheckerResponse } from '../types.js';

export class CheckerResource {
  constructor(private readonly client: HttpClient) {}

  async check(params: CheckerParams): Promise<CheckerResponse> {
    return this.client.request<CheckerResponse>({
      method: 'POST',
      path: '/v1/checker',
      body: params,
      auth: 'none',
    });
  }
}
