/**
 * Database Retry Utility
 * 
 * Handles transient database errors with exponential backoff retry logic.
 * Common errors that benefit from retries:
 * - ECONNRESET: Connection was reset
 * - ETIMEDOUT: Connection timed out
 * - ECONNREFUSED: Connection refused
 * - ER_LOCK_DEADLOCK: Deadlock detected
 */

interface RetryOptions {
  maxRetries?: number;
  initialDelayMs?: number;
  maxDelayMs?: number;
  backoffMultiplier?: number;
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
  maxRetries: 3,
  initialDelayMs: 100,
  maxDelayMs: 5000,
  backoffMultiplier: 2,
};

/**
 * Check if an error is retryable (transient network/connection issue)
 */
function isRetryableError(error: any): boolean {
  if (!error) return false;

  const errorCode = error.code || error.errno;
  const errorMessage = error.message || "";

  // Network errors
  const retryableCodes = [
    "ECONNRESET",
    "ETIMEDOUT",
    "ECONNREFUSED",
    "ENOTFOUND",
    "EPIPE",
    "EAI_AGAIN",
  ];

  // MySQL/MariaDB errors
  const retryableErrno = [
    1205, // ER_LOCK_WAIT_TIMEOUT
    1213, // ER_LOCK_DEADLOCK
    2006, // CR_SERVER_GONE_ERROR
    2013, // CR_SERVER_LOST
  ];

  return (
    retryableCodes.includes(errorCode) ||
    retryableErrno.includes(errorCode) ||
    errorMessage.includes("ECONNRESET") ||
    errorMessage.includes("Connection lost") ||
    errorMessage.includes("read ECONNRESET")
  );
}

/**
 * Sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Retry a database operation with exponential backoff
 * 
 * @param operation - Async function to retry
 * @param options - Retry configuration
 * @returns Result of the operation
 * @throws Last error if all retries fail
 * 
 * @example
 * const result = await retryDbOperation(async () => {
 *   return await db.select().from(leads).limit(10);
 * });
 */
export async function retryDbOperation<T>(
  operation: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  let lastError: any;
  let delay = opts.initialDelayMs;

  for (let attempt = 0; attempt <= opts.maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      // If this is the last attempt or error is not retryable, throw immediately
      if (attempt === opts.maxRetries || !isRetryableError(error)) {
        throw error;
      }

      // Log retry attempt
      console.warn(
        `[DbRetry] Attempt ${attempt + 1}/${opts.maxRetries + 1} failed, retrying in ${delay}ms...`,
        {
          error: error instanceof Error ? error.message : String(error),
          code: (error as any)?.code,
        }
      );

      // Wait before retrying
      await sleep(delay);

      // Increase delay for next retry (exponential backoff)
      delay = Math.min(delay * opts.backoffMultiplier, opts.maxDelayMs);
    }
  }

  // This should never be reached, but TypeScript requires it
  throw lastError;
}

/**
 * Wrap a database function with automatic retry logic
 * 
 * @example
 * const getLeadsWithRetry = withRetry(getLeads);
 * const leads = await getLeadsWithRetry();
 */
export function withRetry<TArgs extends any[], TResult>(
  fn: (...args: TArgs) => Promise<TResult>,
  options: RetryOptions = {}
): (...args: TArgs) => Promise<TResult> {
  return async (...args: TArgs): Promise<TResult> => {
    return retryDbOperation(() => fn(...args), options);
  };
}
