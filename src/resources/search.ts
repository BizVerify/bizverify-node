import type { HttpClient } from '../client.js';
import type { SearchParams, SearchResponse, SearchResult } from '../types.js';
import { paginateSearch } from '../pagination.js';

export class SearchResource {
  constructor(private readonly client: HttpClient) {}

  async find(params: SearchParams): Promise<SearchResponse> {
    return this.client.request<SearchResponse>({
      method: 'POST',
      path: '/v1/search',
      body: params,
      auth: 'apiKey',
    });
  }

  findAll(params: Omit<SearchParams, 'limit' | 'offset'>): AsyncIterable<SearchResult> {
    return paginateSearch(this.client, params);
  }
}
