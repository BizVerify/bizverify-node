import type { HttpClient } from '../client.js';
import type {
  VerifyParams,
  VerifyResponse,
  JobStatusResponse,
  VerifyAndWaitOptions,
} from '../types.js';
import { pollUntilComplete } from '../polling.js';

export class VerificationResource {
  constructor(private readonly client: HttpClient) {}

  async verify(params: VerifyParams): Promise<VerifyResponse> {
    return this.client.request<VerifyResponse>({
      method: 'POST',
      path: '/v1/verify',
      body: params,
      auth: 'apiKey',
    });
  }

  async verifyAndWait(
    params: VerifyParams,
    options?: VerifyAndWaitOptions,
  ): Promise<JobStatusResponse> {
    const response = await this.verify(params);
    return pollUntilComplete(this.client, response, options);
  }

  async getStatus(jobId: string): Promise<JobStatusResponse> {
    return this.client.request<JobStatusResponse>({
      method: 'GET',
      path: `/v1/verify/status/${jobId}`,
      auth: 'apiKey',
    });
  }
}
