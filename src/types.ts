// ── Options ──────────────────────────────────────────────────────────────────

export interface BizVerifyOptions {
  apiKey?: string;
  baseUrl?: string;
  maxRetries?: number;
  timeout?: number;
  fetch?: typeof globalThis.fetch;
}

// ── Domain Types ─────────────────────────────────────────────────────────────

export type VerificationLevel = 'pre_check' | 'full';

export type EntityType =
  | 'llc'
  | 'corporation'
  | 'lp'
  | 'llp'
  | 'sole_proprietorship'
  | 'nonprofit'
  | 'general_partnership'
  | 'other';

export type EntityStatus =
  | 'active'
  | 'inactive'
  | 'dissolved'
  | 'suspended'
  | 'revoked'
  | 'merged'
  | 'withdrawn'
  | 'unknown';

export type JobStatus = 'pending' | 'running' | 'completed' | 'failed';

export interface Address {
  line1: string;
  line2: string | null;
  city: string;
  state: string | null;
  postal_code: string | null;
  country: string;
}

export interface RegisteredAgent {
  name: string;
  address: Address | null;
}

export interface Officer {
  name: string;
  title: string;
  address: Address | null;
}

export interface FilingSummary {
  date: string;
  type: string;
  description: string | null;
}

// ── Auth ─────────────────────────────────────────────────────────────────────

export interface RequestAccessParams {
  email: string;
  accept_terms: boolean;
}

export interface RequestAccessResponse {
  message: string;
}

export interface VerifyAccessParams {
  email: string;
  code: string;
  label?: string;
}

export interface VerifyAccessResponse {
  api_key: string;
  key_id: string;
  label: string;
}

export interface MessageResponse {
  message: string;
}

// ── Response Metadata ───────────────────────────────────────────────────────

export interface ResponseMeta {
  creditsRemaining: number | null;
  creditsCharged: number | null;
  rateLimitLimit: number | null;
  rateLimitRemaining: number | null;
  rateLimitReset: number | null;
}

// ── Config ──────────────────────────────────────────────────────────────────

export interface ConfigResponse {
  jurisdictions: {
    stats: { totalJurisdictions: number; usStates: number; countries: number };
    supported: { us: string[]; international: string[]; comingSoon: string[] };
  };
  checker: { jurisdictions: Array<{ label: string; code: string }> };
  pricing: {
    creditCosts: Record<string, number>;
    freeTier: { credits: number; replenish: string; rateLimit: string };
    packages: unknown[];
  };
  features: Record<string, boolean>;
  rateLimits: { default: number };
  status: { api: string; lastUpdated: string };
  legal: { terms_url: string; privacy_url: string; version: string };
  docs: { openapi: string; interactive: string };
}

export interface JurisdictionInfo {
  code: string;
  name: string;
  features: Record<string, boolean>;
}

export interface JurisdictionsResponse {
  jurisdictions: JurisdictionInfo[];
}

// ── Verification ─────────────────────────────────────────────────────────────

export interface VerifyParams {
  entity_name: string;
  jurisdiction: string;
  entity_type?: EntityType;
  verification_level?: VerificationLevel;
  force_refresh?: boolean;
  webhook_url?: string;
}

export interface VerifyResponse {
  status: string;
  data?: unknown;
  job_id?: string;
  entity_id?: string;
  cached: boolean;
  credits_charged: number;
}

export interface JobStatusResponse {
  id: string;
  status: JobStatus;
  jurisdiction: string;
  query: string;
  verification_level: string;
  credits_charged: number;
  result?: unknown;
  error?: string;
  created_at: string;
  completed_at: string | null;
}

export interface VerifyAndWaitOptions {
  pollIntervalMs?: number;
  timeoutMs?: number;
  onStatusChange?: (status: JobStatusResponse) => void;
}

// ── Entities ─────────────────────────────────────────────────────────────────

export interface Entity {
  id: string;
  entity_name: string;
  jurisdiction: string;
  entity_type: EntityType;
  status: EntityStatus;
  jurisdiction_id: string | null;
  good_standing: boolean | null;
  formation_date: string | null;
  registered_agent: RegisteredAgent | null;
  officers: Officer[];
  principal_address: Address | null;
  filing_history_summary: FilingSummary[];
  created_at: string;
  updated_at: string;
}

export interface HistoryParams {
  limit?: number;
  offset?: number;
}

export interface PaginatedSnapshots {
  snapshots: unknown[];
  total: number;
  limit: number;
  offset: number;
}

// ── Search ───────────────────────────────────────────────────────────────────

export interface SearchParams {
  entity_name: string;
  jurisdiction?: string;
  entity_type?: EntityType;
  limit?: number;
  offset?: number;
}

export interface SearchResult {
  entity_name: string;
  jurisdiction: string;
  entity_type: EntityType;
  status: EntityStatus;
  jurisdiction_id: string | null;
  confidence: number;
}

export interface SearchResponse {
  results: SearchResult[];
  total: number;
  limit: number;
  offset: number;
  jurisdictions_searched: string[];
  jurisdictions_failed: string[];
  credits_charged: number;
}

// ── Account ──────────────────────────────────────────────────────────────────

export interface ApiKeyInfo {
  id: string;
  label: string;
  prefix: string;
  rate_limit: number;
  is_active: boolean;
  created_at: string;
}

export interface Account {
  id: string;
  email: string;
  email_verified: boolean;
  plan: 'free' | 'paid';
  credit_balance: number;
  api_keys: ApiKeyInfo[];
  created_at: string;
}

export interface UsageStats {
  period_days: number;
  daily: UsageEntry[];
  by_endpoint: EndpointSummary[];
  by_jurisdiction: JurisdictionSummary[];
}

export interface UsageEntry {
  date: string;
  endpoint: string;
  jurisdiction: string | null;
  request_count: number;
  credits_used: number;
}

export interface EndpointSummary {
  endpoint: string;
  total_requests: number;
  total_credits: number;
}

export interface JurisdictionSummary {
  jurisdiction: string;
  total_requests: number;
  total_credits: number;
}

export interface DataExport {
  profile: {
    id: string;
    email: string;
    email_verified: boolean;
    plan: string;
    credit_balance: number;
    terms_accepted_at: string | null;
    terms_version: string | null;
    created_at: string;
  };
  api_keys: Array<{
    id: string;
    label: string;
    prefix: string;
    rate_limit: number;
    is_active: boolean;
    created_at: string;
    revoked_at: string | null;
  }>;
  credit_transactions: Array<{
    id: string;
    amount: number;
    balance_after: number;
    type: string;
    description: string;
    reference_id: string | null;
    created_at: string;
  }>;
  verification_jobs: Array<{
    id: string;
    jurisdiction: string;
    query: string;
    status: string;
    credits_charged: number;
    created_at: string;
    completed_at: string | null;
  }>;
  usage_stats: UsageEntry[];
}

export interface UpdateEmailParams {
  email: string;
}

export interface CreateKeyParams {
  label: string;
}

export interface CreateKeyResponse {
  id: string;
  key: string;
  prefix: string;
  label: string;
  message: string;
}

// ── Billing ──────────────────────────────────────────────────────────────────

export interface BillingParams {
  limit?: number;
  offset?: number;
}

export interface BillingInfo {
  balance: number;
  packages: unknown;
  transactions: unknown;
}

export interface PurchaseParams {
  package_id: string;
}

export interface PurchaseResponse {
  session_id: string;
  url: string;
}

// ── Checker ──────────────────────────────────────────────────────────────────

export interface CheckerParams {
  entity_name: string;
  jurisdiction: string;
}

export interface CheckerResult {
  entity_name: string;
  entity_type: string;
  status: string;
  jurisdiction: string;
  confidence: number;
}

export interface CheckerResponse {
  results: CheckerResult[];
  query: string;
  jurisdiction: string;
  total: number;
}
