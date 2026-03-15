import { BizVerify, JobFailedError, TimeoutError } from '@bizverify/sdk';

const biz = new BizVerify({ apiKey: 'bv_live_...' });

try {
  // Full verification — starts async job and polls until complete
  const result = await biz.verification.verifyAndWait(
    {
      entity_name: 'Acme Corporation',
      jurisdiction: 'us-fl',
      verification_level: 'full',
    },
    {
      timeoutMs: 120_000,
      onStatusChange: (status) => {
        console.log(`Job ${status.id}: ${status.status}`);
      },
    },
  );

  console.log('Verification complete:', result);
} catch (err) {
  if (err instanceof TimeoutError) {
    console.error('Verification timed out');
  } else if (err instanceof JobFailedError) {
    console.error(`Job ${err.jobId} failed:`, err.message);
  } else {
    throw err;
  }
}
