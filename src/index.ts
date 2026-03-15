import type { BizVerifyOptions } from './types.js';
import { HttpClient } from './client.js';
import { AuthResource } from './resources/auth.js';
import { VerificationResource } from './resources/verification.js';
import { EntitiesResource } from './resources/entities.js';
import { SearchResource } from './resources/search.js';
import { AccountResource } from './resources/account.js';
import { BillingResource } from './resources/billing.js';
import { CheckerResource } from './resources/checker.js';

export class BizVerify {
  readonly auth: AuthResource;
  readonly verification: VerificationResource;
  readonly entities: EntitiesResource;
  readonly search: SearchResource;
  readonly account: AccountResource;
  readonly billing: BillingResource;
  readonly checker: CheckerResource;

  constructor(options: BizVerifyOptions = {}) {
    const client = new HttpClient(options);

    this.auth = new AuthResource(client);
    this.verification = new VerificationResource(client);
    this.entities = new EntitiesResource(client);
    this.search = new SearchResource(client);
    this.account = new AccountResource(client);
    this.billing = new BillingResource(client);
    this.checker = new CheckerResource(client);
  }
}

// Re-export everything
export { HttpClient } from './client.js';

export {
  BizVerifyError,
  AuthenticationError,
  AuthorizationError,
  ValidationError,
  NotFoundError,
  InsufficientCreditsError,
  RateLimitError,
  ConflictError,
  InternalError,
  TimeoutError,
  JobFailedError,
} from './errors.js';

export type {
  BizVerifyOptions,
  VerificationLevel,
  EntityType,
  EntityStatus,
  JobStatus,
  Address,
  RegisteredAgent,
  Officer,
  FilingSummary,
  User,
  RegisterParams,
  RegisterResponse,
  LoginParams,
  LoginResponse,
  VerifyEmailParams,
  ResendVerificationParams,
  ForgotPasswordParams,
  ResetPasswordParams,
  MessageResponse,
  VerifyParams,
  VerifyResponse,
  JobStatusResponse,
  VerifyAndWaitOptions,
  Entity,
  HistoryParams,
  PaginatedSnapshots,
  SearchParams,
  SearchResult,
  SearchResponse,
  Account,
  ApiKeyInfo,
  UsageStats,
  UsageEntry,
  EndpointSummary,
  JurisdictionSummary,
  DataExport,
  UpdateEmailParams,
  UpdatePasswordParams,
  DeleteAccountParams,
  CreateKeyParams,
  CreateKeyResponse,
  BillingParams,
  BillingInfo,
  PurchaseParams,
  PurchaseResponse,
  CheckerParams,
  CheckerResult,
  CheckerResponse,
} from './types.js';
