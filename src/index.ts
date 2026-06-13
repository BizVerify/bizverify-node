import type { BizVerifyOptions, ResponseMeta } from './types.js';
import { HttpClient } from './client.js';
import { AuthResource } from './resources/auth.js';
import { VerificationResource } from './resources/verification.js';
import { EntitiesResource } from './resources/entities.js';
import { SearchResource } from './resources/search.js';
import { AccountResource } from './resources/account.js';
import { BillingResource } from './resources/billing.js';
import { CheckerResource } from './resources/checker.js';
import { ConfigResource } from './resources/config.js';

export class BizVerify {
  readonly auth: AuthResource;
  readonly verification: VerificationResource;
  readonly entities: EntitiesResource;
  readonly search: SearchResource;
  readonly account: AccountResource;
  readonly billing: BillingResource;
  readonly checker: CheckerResource;
  readonly config: ConfigResource;
  private readonly client: HttpClient;

  constructor(options: BizVerifyOptions = {}) {
    this.client = new HttpClient(options);

    this.auth = new AuthResource(this.client);
    this.verification = new VerificationResource(this.client);
    this.entities = new EntitiesResource(this.client);
    this.search = new SearchResource(this.client);
    this.account = new AccountResource(this.client);
    this.billing = new BillingResource(this.client);
    this.checker = new CheckerResource(this.client);
    this.config = new ConfigResource(this.client);
  }

  get lastResponseMeta(): ResponseMeta | null {
    return this.client.lastResponseMeta;
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
  ResponseMeta,
  VerificationLevel,
  EntityType,
  EntityStatus,
  JobStatus,
  Address,
  RegisteredAgent,
  Officer,
  FilingSummary,
  RequestAccessParams,
  RequestAccessResponse,
  VerifyAccessParams,
  VerifyAccessResponse,
  MessageResponse,
  VerifyParams,
  VerifyResponse,
  VerificationReason,
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
  CreateKeyParams,
  CreateKeyResponse,
  BillingParams,
  BillingInfo,
  PurchaseParams,
  PurchaseResponse,
  CheckerParams,
  CheckerResult,
  CheckerResponse,
  ConfigResponse,
  JurisdictionInfo,
  JurisdictionsResponse,
} from './types.js';
