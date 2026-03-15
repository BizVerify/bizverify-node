# @bizverify/sdk

Official TypeScript/Node.js SDK for the [BizVerify](https://bizverify.co) business verification API.

## Installation

```bash
npm install @bizverify/sdk
```

Requires Node.js 18+ (uses built-in `fetch`). Zero runtime dependencies.

## Quick Start

```typescript
import { BizVerify } from '@bizverify/sdk';

const biz = new BizVerify({ apiKey: 'bv_live_...' });

// Quick pre-check
const result = await biz.verification.verify({
  entity_name: 'Acme Corporation',
  jurisdiction: 'us-fl',
});

// Full verification with polling
const full = await biz.verification.verifyAndWait({
  entity_name: 'Acme Corporation',
  jurisdiction: 'us-fl',
  verification_level: 'full',
});
```

## Authentication

```typescript
// API key only (verification, search, entities)
const biz = new BizVerify({ apiKey: 'bv_live_...' });

// JWT only (account, billing)
const biz = new BizVerify({ token: 'eyJ...' });

// Both
const biz = new BizVerify({ apiKey: 'bv_live_...', token: 'eyJ...' });

// Login flow — JWT auto-stored on client
const { token, user } = await biz.auth.login({ email, password });
// biz.account.get() now works without manually setting token
```

## Resources

### Auth

```typescript
await biz.auth.register({ email, password, accept_terms: true });
await biz.auth.login({ email, password });
await biz.auth.verifyEmail({ email, code });
await biz.auth.resendVerification({ email });
await biz.auth.forgotPassword({ email });
await biz.auth.resetPassword({ email, code, new_password });
```

### Verification

```typescript
// Start verification
const job = await biz.verification.verify({
  entity_name: 'Acme Inc',
  jurisdiction: 'us-fl',
  verification_level: 'full',
  webhook_url: 'https://example.com/hook', // optional
});

// Poll until complete
const result = await biz.verification.verifyAndWait(
  { entity_name: 'Acme Inc', jurisdiction: 'us-fl', verification_level: 'full' },
  { timeoutMs: 120_000, onStatusChange: (s) => console.log(s.status) },
);

// Check job status manually
const status = await biz.verification.getStatus(jobId);
```

### Search

```typescript
// Single page
const page = await biz.search.find({ entity_name: 'Acme', jurisdiction: 'us-fl' });

// Auto-paginate all results
for await (const entity of biz.search.findAll({ entity_name: 'Acme' })) {
  console.log(entity.entity_name);
}
```

### Entities

```typescript
const entity = await biz.entities.get(entityId);
const history = await biz.entities.history(entityId, { limit: 10 });
```

### Account

```typescript
const account = await biz.account.get();
const usage = await biz.account.usage({ days: 7 });
const data = await biz.account.dataExport();
await biz.account.updateEmail({ email: 'new@example.com' });
await biz.account.updatePassword({ current_password, new_password });
await biz.account.delete({ password });
const key = await biz.account.createKey({ label: 'Production' });
await biz.account.revokeKey(keyId);
```

### Billing

```typescript
const billing = await biz.billing.get();
const { url } = await biz.billing.purchase({ package_id: 'starter' });
```

### Checker (Free, no auth)

```typescript
const biz = new BizVerify();
const result = await biz.checker.check({ entity_name: 'Acme', jurisdiction: 'us-fl' });
```

## Error Handling

All API errors are thrown as typed exceptions:

```typescript
import { BizVerify, InsufficientCreditsError, RateLimitError } from '@bizverify/sdk';

try {
  await biz.verification.verify({ entity_name: 'Test', jurisdiction: 'us-fl' });
} catch (err) {
  if (err instanceof InsufficientCreditsError) {
    console.log('Buy more credits');
  } else if (err instanceof RateLimitError) {
    console.log(`Retry after ${err.retryAfter}s`);
  }
}
```

| Exception | Status | When |
|-----------|--------|------|
| `ValidationError` | 400, 422 | Invalid request parameters |
| `AuthenticationError` | 401 | Bad/missing API key or JWT |
| `InsufficientCreditsError` | 402 | Not enough credits |
| `AuthorizationError` | 403 | Forbidden (email not verified, account disabled) |
| `NotFoundError` | 404 | Entity/job not found |
| `ConflictError` | 409 | Duplicate email, already refunded |
| `RateLimitError` | 429 | Too many requests |
| `InternalError` | 5xx | Server error (auto-retried) |
| `TimeoutError` | — | Polling timeout |
| `JobFailedError` | — | Verification job failed |

## Configuration

```typescript
const biz = new BizVerify({
  apiKey: 'bv_live_...',
  token: 'eyJ...',
  baseUrl: 'https://api.bizverify.co', // default
  maxRetries: 2,                        // retries on 5xx (default: 2)
  timeout: 30_000,                      // per-request timeout ms (default: 30s)
  fetch: customFetch,                   // custom fetch implementation
});
```

## License

MIT
