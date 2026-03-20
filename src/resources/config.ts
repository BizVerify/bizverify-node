import type { HttpClient } from '../client.js';
import type { ConfigResponse, JurisdictionsResponse } from '../types.js';

export class ConfigResource {
  constructor(private readonly client: HttpClient) {}

  async get(): Promise<ConfigResponse> {
    return this.client.request<ConfigResponse>({
      method: 'GET',
      path: '/v1/config',
      auth: 'none',
    });
  }

  async jurisdictions(): Promise<JurisdictionsResponse> {
    return this.client.request<JurisdictionsResponse>({
      method: 'GET',
      path: '/v1/jurisdictions',
      auth: 'none',
    });
  }
}
