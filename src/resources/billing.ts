import type { HttpClient } from '../client.js';
import type { BillingParams, BillingInfo, PurchaseParams, PurchaseResponse } from '../types.js';

export class BillingResource {
  constructor(private readonly client: HttpClient) {}

  async get(params?: BillingParams): Promise<BillingInfo> {
    return this.client.request<BillingInfo>({
      method: 'GET',
      path: '/v1/billing',
      query: {
        limit: params?.limit,
        offset: params?.offset,
      },
      auth: 'jwt',
    });
  }

  async purchase(params: PurchaseParams): Promise<PurchaseResponse> {
    return this.client.request<PurchaseResponse>({
      method: 'POST',
      path: '/v1/billing/purchase',
      body: params,
      auth: 'jwt',
    });
  }
}
