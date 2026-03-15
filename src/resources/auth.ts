import type { HttpClient } from '../client.js';
import type {
  RegisterParams,
  RegisterResponse,
  LoginParams,
  LoginResponse,
  VerifyEmailParams,
  ResendVerificationParams,
  ForgotPasswordParams,
  ResetPasswordParams,
  MessageResponse,
} from '../types.js';

export class AuthResource {
  constructor(private readonly client: HttpClient) {}

  async register(params: RegisterParams): Promise<RegisterResponse> {
    return this.client.request<RegisterResponse>({
      method: 'POST',
      path: '/v1/auth/register',
      body: params,
      auth: 'none',
    });
  }

  async login(params: LoginParams): Promise<LoginResponse> {
    const response = await this.client.request<LoginResponse>({
      method: 'POST',
      path: '/v1/auth/login',
      body: params,
      auth: 'none',
    });

    // Auto-store JWT on the client for subsequent requests
    this.client.setToken(response.token);

    return response;
  }

  async verifyEmail(params: VerifyEmailParams): Promise<MessageResponse> {
    return this.client.request<MessageResponse>({
      method: 'POST',
      path: '/v1/auth/verify-email',
      body: params,
      auth: 'none',
    });
  }

  async resendVerification(params: ResendVerificationParams): Promise<MessageResponse> {
    return this.client.request<MessageResponse>({
      method: 'POST',
      path: '/v1/auth/resend-verification',
      body: params,
      auth: 'none',
    });
  }

  async forgotPassword(params: ForgotPasswordParams): Promise<MessageResponse> {
    return this.client.request<MessageResponse>({
      method: 'POST',
      path: '/v1/auth/forgot-password',
      body: params,
      auth: 'none',
    });
  }

  async resetPassword(params: ResetPasswordParams): Promise<MessageResponse> {
    return this.client.request<MessageResponse>({
      method: 'POST',
      path: '/v1/auth/reset-password',
      body: params,
      auth: 'none',
    });
  }
}
