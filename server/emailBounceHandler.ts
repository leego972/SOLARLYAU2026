// Email sending will be handled by the recruitment system directly

/**
 * Email Bounce Handling System
 * 
 * Implements retry logic and bounce tracking for recruitment emails
 */

interface EmailAttempt {
  email: string;
  attemptCount: number;
  lastAttempt: Date;
  bounced: boolean;
  delivered: boolean;
}

// In-memory bounce tracking (in production, use database)
const emailAttempts = new Map<string, EmailAttempt>();

export interface SendEmailWithRetryOptions {
  to: string;
  subject: string;
  html: string;
  maxRetries?: number;
  retryDelayHours?: number;
  sendEmailFn: (options: { to: string; subject: string; html: string }) => Promise<any>;
}

/**
 * Send email with automatic retry logic for bounces
 */
export async function sendEmailWithRetry(options: SendEmailWithRetryOptions): Promise<{
  success: boolean;
  delivered: boolean;
  bounced: boolean;
  attemptCount: number;
  message: string;
}> {
  const {
    to,
    subject,
    html,
    maxRetries = 3,
    retryDelayHours = 24,
    sendEmailFn,
  } = options;

  // Check if email has bounced before
  const attempt = emailAttempts.get(to) || {
    email: to,
    attemptCount: 0,
    lastAttempt: new Date(0),
    bounced: false,
    delivered: false,
  };

  // Don't retry if permanently bounced
  if (attempt.bounced && attempt.attemptCount >= maxRetries) {
    return {
      success: false,
      delivered: false,
      bounced: true,
      attemptCount: attempt.attemptCount,
      message: `Email permanently bounced after ${maxRetries} attempts`,
    };
  }

  // Check if we should retry (wait for retry delay)
  const hoursSinceLastAttempt =
    (Date.now() - attempt.lastAttempt.getTime()) / (1000 * 60 * 60);
  if (attempt.attemptCount > 0 && hoursSinceLastAttempt < retryDelayHours) {
    return {
      success: false,
      delivered: false,
      bounced: false,
      attemptCount: attempt.attemptCount,
      message: `Waiting for retry delay (${Math.round(retryDelayHours - hoursSinceLastAttempt)}h remaining)`,
    };
  }

  // Attempt to send email
  try {
    const result = await sendEmailFn({
      to,
      subject,
      html,
    });

    // Update attempt tracking
    attempt.attemptCount++;
    attempt.lastAttempt = new Date();
    attempt.delivered = true;
    attempt.bounced = false;
    emailAttempts.set(to, attempt);

    return {
      success: true,
      delivered: true,
      bounced: false,
      attemptCount: attempt.attemptCount,
      message: "Email delivered successfully",
    };
  } catch (error: any) {
    // Check if it's a bounce error
    const isBounce =
      error.message?.includes("bounce") ||
      error.message?.includes("not found") ||
      error.message?.includes("invalid") ||
      error.message?.includes("does not exist");

    // Update attempt tracking
    attempt.attemptCount++;
    attempt.lastAttempt = new Date();
    attempt.bounced = isBounce;
    attempt.delivered = false;
    emailAttempts.set(to, attempt);

    return {
      success: false,
      delivered: false,
      bounced: isBounce,
      attemptCount: attempt.attemptCount,
      message: error.message || "Email delivery failed",
    };
  }
}

/**
 * Get bounce statistics for all emails
 */
export function getBounceStatistics() {
  const stats = {
    totalEmails: emailAttempts.size,
    delivered: 0,
    bounced: 0,
    pending: 0,
    bouncedEmails: [] as string[],
  };

  emailAttempts.forEach((attempt, email) => {
    if (attempt.delivered) {
      stats.delivered++;
    } else if (attempt.bounced) {
      stats.bounced++;
      stats.bouncedEmails.push(email);
    } else {
      stats.pending++;
    }
  });

  return stats;
}

/**
 * Reset bounce status for an email (useful for manual verification)
 */
export function resetBounceStatus(email: string) {
  emailAttempts.delete(email);
}

/**
 * Mark email as permanently bounced (to stop retries)
 */
export function markAsPermanentBounce(email: string) {
  const attempt = emailAttempts.get(email) || {
    email,
    attemptCount: 999,
    lastAttempt: new Date(),
    bounced: true,
    delivered: false,
  };
  
  attempt.bounced = true;
  attempt.attemptCount = 999; // High number to prevent retries
  emailAttempts.set(email, attempt);
}
