export const requestAccessResponse = {
  message: 'Verification code sent to test@example.com',
};

export const verifyAccessResponse = {
  api_key: 'bv_live_abc123def456',
  key_id: 'key_001',
  label: 'key-1710000000',
};

export const messageResponse = {
  message: 'Success',
};

export const verifyResponseSync = {
  status: 'completed',
  data: { exists: true, status: 'active', good_standing: true, entity_name: 'Acme Inc', jurisdiction: 'us-fl' },
  entity_id: 'ent_123',
  cached: true,
  credits_charged: 1,
  verification_level: 'deep' as const,
  full_verification_available: true,
};

export const verifyResponseAsync = {
  status: 'pending',
  job_id: 'job_456',
  cached: false,
  credits_charged: 15,
  verification_level: 'deep' as const,
  full_verification_available: true,
};

export const jobStatusPending = {
  id: 'job_456',
  status: 'pending' as const,
  jurisdiction: 'us-fl',
  query: 'Acme Inc',
  verification_level: 'deep',
  credits_charged: 15,
  created_at: '2026-01-01T00:00:00.000Z',
  completed_at: null,
};

export const jobStatusCompleted = {
  id: 'job_456',
  status: 'completed' as const,
  jurisdiction: 'us-fl',
  query: 'Acme Inc',
  verification_level: 'deep',
  credits_charged: 15,
  result: { exists: true },
  created_at: '2026-01-01T00:00:00.000Z',
  completed_at: '2026-01-01T00:01:00.000Z',
};

export const jobStatusFailed = {
  id: 'job_456',
  status: 'failed' as const,
  jurisdiction: 'us-fl',
  query: 'Acme Inc',
  verification_level: 'deep',
  credits_charged: 15,
  error: 'Data source timeout',
  created_at: '2026-01-01T00:00:00.000Z',
  completed_at: '2026-01-01T00:01:00.000Z',
};

export const entityResponse = {
  id: 'ent_123',
  entity_name: 'Acme Inc',
  jurisdiction: 'us-fl',
  entity_type: 'corporation' as const,
  status: 'active' as const,
  jurisdiction_id: 'FL12345',
  good_standing: true,
  formation_date: '2020-01-15',
  registered_agent: { name: 'Agent Corp', address: null },
  officers: [],
  principal_address: null,
  filing_history_summary: [],
  created_at: '2026-01-01T00:00:00.000Z',
  updated_at: '2026-01-01T00:00:00.000Z',
};

export const entityResponseFull = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  jurisdiction: 'us-fl',
  jurisdiction_id: 'L21000098765',
  entity_name: 'ACME WIDGETS LLC',
  entity_type: 'llc' as const,
  status: 'active' as const,
  good_standing: true,
  formation_date: '2021-03-15',
  registered_agent: {
    name: 'JANE AGENT',
    address: {
      line1: '100 AGENT WAY',
      line2: null,
      city: 'TALLAHASSEE',
      state: 'FL',
      postal_code: '32301',
      country: 'US',
    },
  },
  officers: [{ name: 'JOHN DOE', title: 'Manager', address: null }],
  principal_address: {
    line1: '200 COMMERCE BLVD',
    line2: 'SUITE 400',
    city: 'MIAMI',
    state: 'FL',
    postal_code: '33131',
    country: 'US',
  },
  filing_history_summary: [{ date: '2024-01-10', type: 'ANNUAL REPORT', description: null }],
  last_verified_at: '2026-06-13T10:30:00.000Z',
  snapshots: 3,
  created_at: '2024-01-05T08:00:00.000Z',
  updated_at: '2026-06-13T10:30:00.000Z',
};

export const historyResponse = {
  snapshots: [{ id: 'snap_1', data: {} }],
  total: 1,
  limit: 50,
  offset: 0,
};

export const searchResponse = {
  results: [
    {
      entity_name: 'Acme Inc',
      jurisdiction: 'us-fl',
      entity_type: 'corporation' as const,
      status: 'active' as const,
      jurisdiction_id: 'FL12345',
      confidence: 0.95,
    },
  ],
  total: 1,
  limit: 50,
  offset: 0,
  jurisdictions_searched: ['us-fl'],
  jurisdictions_failed: [],
  credits_charged: 2,
};

export const accountResponse = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  email: 'test@example.com',
  email_verified: true,
  plan: 'free' as const,
  credit_balance: 100,
  api_keys: [],
  created_at: '2026-01-01T00:00:00.000Z',
};

export const usageResponse = {
  period_days: 30,
  daily: [],
  by_endpoint: [],
  by_jurisdiction: [],
};

export const dataExportResponse = {
  profile: {
    id: '550e8400-e29b-41d4-a716-446655440000',
    email: 'test@example.com',
    email_verified: true,
    plan: 'free',
    credit_balance: 100,
    terms_accepted_at: null,
    terms_version: null,
    created_at: '2026-01-01T00:00:00.000Z',
  },
  api_keys: [],
  credit_transactions: [],
  verification_jobs: [],
  usage_stats: [],
};

export const createKeyResponse = {
  id: 'key_123',
  key: 'bv_live_newkey',
  prefix: 'bv_live_new',
  label: 'My Key',
  message: 'Store this API key securely. It will not be shown again.',
};

export const billingResponse = {
  balance: 100,
  packages: [],
  transactions: [],
};

export const purchaseResponse = {
  session_id: 'cs_test_123',
  url: 'https://checkout.stripe.com/session/cs_test_123',
};

export const checkerResponse = {
  results: [
    {
      entity_name: 'Acme Inc',
      entity_type: 'corporation',
      status: 'active',
      jurisdiction: 'us-fl',
      confidence: 0.9,
    },
  ],
  query: 'Acme',
  jurisdiction: 'us-fl',
  total: 1,
};

export const configResponse = {
  jurisdictions: {
    stats: { totalJurisdictions: 61, usStates: 50, countries: 11 },
    supported: { us: ['us-fl', 'us-de'], international: ['ee', 'gb'], comingSoon: [] },
  },
  checker: { jurisdictions: [{ label: 'Florida', code: 'us-fl' }] },
  pricing: {
    creditCosts: { verify: 15, search: 2 },
    freeTier: { credits: 50, replenish: 'never', rateLimit: '10/min' },
    packages: [],
  },
  features: { verification: true, search: true },
  rateLimits: { default: 60 },
  status: { api: 'operational', lastUpdated: '2026-03-20T00:00:00Z' },
  legal: { terms_url: 'https://bizverify.co/terms', privacy_url: 'https://bizverify.co/privacy', version: '1.0' },
  docs: { openapi: '/v1/openapi.json', interactive: '/docs' },
};

export const jurisdictionsResponse = {
  jurisdictions: [
    { code: 'us-fl', name: 'Florida', features: { search: true, verify: true } },
    { code: 'us-de', name: 'Delaware', features: { search: true, verify: true } },
  ],
};

export const errorResponse = (code: string, message: string) => ({
  error: { code, message },
});
