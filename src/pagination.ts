import type { HttpClient } from './client.js';
import type { SearchParams, SearchResponse, SearchResult } from './types.js';

const DEFAULT_PAGE_SIZE = 50;

export async function* paginateSearch(
  client: HttpClient,
  params: Omit<SearchParams, 'limit' | 'offset'>,
): AsyncGenerator<SearchResult, void, undefined> {
  let offset = 0;
  const limit = DEFAULT_PAGE_SIZE;

  while (true) {
    const response = await client.request<SearchResponse>({
      method: 'POST',
      path: '/v1/search',
      body: { ...params, limit, offset },
      auth: 'apiKey',
    });

    for (const result of response.results) {
      yield result;
    }

    if (response.results.length === 0 || offset + response.results.length >= response.total) {
      break;
    }

    offset += response.results.length;
  }
}
