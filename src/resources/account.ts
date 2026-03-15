import type { HttpClient } from '../client.js';
import type {
  Account,
  UsageStats,
  DataExport,
  UpdateEmailParams,
  UpdatePasswordParams,
  DeleteAccountParams,
  CreateKeyParams,
  CreateKeyResponse,
} from '../types.js';

export class AccountResource {
  constructor(private readonly client: HttpClient) {}

  async get(): Promise<Account> {
    return this.client.request<Account>({
      method: 'GET',
      path: '/v1/account',
      auth: 'jwt',
    });
  }

  async usage(params?: { days?: number }): Promise<UsageStats> {
    return this.client.request<UsageStats>({
      method: 'GET',
      path: '/v1/account/usage',
      query: { days: params?.days },
      auth: 'jwt',
    });
  }

  async dataExport(): Promise<DataExport> {
    return this.client.request<DataExport>({
      method: 'GET',
      path: '/v1/account/data-export',
      auth: 'jwt',
    });
  }

  async updateEmail(params: UpdateEmailParams): Promise<Account> {
    return this.client.request<Account>({
      method: 'PATCH',
      path: '/v1/account',
      body: params,
      auth: 'jwt',
    });
  }

  async updatePassword(params: UpdatePasswordParams): Promise<void> {
    await this.client.request<undefined>({
      method: 'PUT',
      path: '/v1/account/password',
      body: params,
      auth: 'jwt',
    });
  }

  async delete(params: DeleteAccountParams): Promise<void> {
    await this.client.request<undefined>({
      method: 'DELETE',
      path: '/v1/account',
      body: params,
      auth: 'jwt',
    });
  }

  async createKey(params: CreateKeyParams): Promise<CreateKeyResponse> {
    return this.client.request<CreateKeyResponse>({
      method: 'POST',
      path: '/v1/account/keys',
      body: params,
      auth: 'jwt',
    });
  }

  async revokeKey(keyId: string): Promise<void> {
    await this.client.request<undefined>({
      method: 'DELETE',
      path: `/v1/account/keys/${keyId}`,
      auth: 'jwt',
    });
  }
}
