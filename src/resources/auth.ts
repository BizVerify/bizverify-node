import type { HttpClient } from '../client.js';
import type {
  RequestAccessParams,
  RequestAccessResponse,
  VerifyAccessParams,
  VerifyAccessResponse,
} from '../types.js';

export class AuthResource {
  constructor(private readonly client: HttpClient) {}

  async requestAccess(params: RequestAccessParams): Promise<RequestAccessResponse> {
    return this.client.request<RequestAccessResponse>({
      method: 'POST',
      path: '/v1/auth/request-access',
      body: params,
      auth: 'none',
    });
  }

  async verifyAccess(params: VerifyAccessParams): Promise<VerifyAccessResponse> {
    const response = await this.client.request<VerifyAccessResponse>({
      method: 'POST',
      path: '/v1/auth/verify-access',
      body: params,
      auth: 'none',
    });

    // Auto-configure client with the new API key
    this.client.setApiKey(response.api_key);

    return response;
  }
}
