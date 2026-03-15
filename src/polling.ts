import type { HttpClient } from './client.js';
import type { JobStatusResponse, VerifyAndWaitOptions, VerifyResponse } from './types.js';
import { JobFailedError, TimeoutError } from './errors.js';

const DEFAULT_POLL_INTERVAL = 2000;
const MAX_POLL_INTERVAL = 10_000;
const DEFAULT_TIMEOUT = 60_000;

export async function pollUntilComplete(
  client: HttpClient,
  verifyResponse: VerifyResponse,
  options: VerifyAndWaitOptions = {},
): Promise<JobStatusResponse> {
  // If already completed synchronously, fetch the job status for full data
  if (verifyResponse.status === 'completed' && verifyResponse.job_id) {
    return client.request<JobStatusResponse>({
      method: 'GET',
      path: `/v1/verify/status/${verifyResponse.job_id}`,
      auth: 'apiKey',
    });
  }

  const jobId = verifyResponse.job_id;
  if (!jobId) {
    throw new Error('No job_id in verify response — cannot poll');
  }

  const {
    pollIntervalMs = DEFAULT_POLL_INTERVAL,
    timeoutMs = DEFAULT_TIMEOUT,
    onStatusChange,
  } = options;

  const deadline = Date.now() + timeoutMs;
  let interval = pollIntervalMs;
  let lastStatus: string | undefined;

  while (Date.now() < deadline) {
    const status = await client.request<JobStatusResponse>({
      method: 'GET',
      path: `/v1/verify/status/${jobId}`,
      auth: 'apiKey',
    });

    if (onStatusChange && status.status !== lastStatus) {
      lastStatus = status.status;
      onStatusChange(status);
    }

    if (status.status === 'completed') {
      return status;
    }

    if (status.status === 'failed') {
      throw new JobFailedError(
        status.error ?? 'Verification job failed',
        jobId,
        status,
      );
    }

    // Exponential backoff, capped
    await sleep(interval);
    interval = Math.min(interval * 1.5, MAX_POLL_INTERVAL);
  }

  throw new TimeoutError(`Polling timed out after ${timeoutMs}ms for job ${jobId}`);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
