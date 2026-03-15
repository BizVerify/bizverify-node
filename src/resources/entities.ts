import type { HttpClient } from '../client.js';
import type { Entity, HistoryParams, PaginatedSnapshots } from '../types.js';

export class EntitiesResource {
  constructor(private readonly client: HttpClient) {}

  async get(entityId: string): Promise<Entity> {
    return this.client.request<Entity>({
      method: 'GET',
      path: `/v1/entity/${entityId}`,
      auth: 'apiKey',
    });
  }

  async history(entityId: string, params?: HistoryParams): Promise<PaginatedSnapshots> {
    return this.client.request<PaginatedSnapshots>({
      method: 'GET',
      path: `/v1/entity/${entityId}/history`,
      query: {
        limit: params?.limit,
        offset: params?.offset,
      },
      auth: 'apiKey',
    });
  }
}
