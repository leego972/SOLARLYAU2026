/**
 * Parallel Dialer Technology
 * 
 * Enables simultaneous calling to multiple installers instead of sequential calling.
 * Significantly increases recruitment efficiency by calling 5-10 installers at once.
 * 
 * Note: Voice calling requires a dedicated voice provider (not included in ClickSend SMS).
 * This module provides simulation for testing and can be extended with voice providers.
 */

import { ENV } from "./_core/env";

export interface ParallelDialConfig {
  maxConcurrentCalls: number;
  callTimeout: number; // seconds
  retryAttempts: number;
  retryDelay: number; // seconds
}

export interface CallRecipient {
  name: string;
  phone: string;
  companyName?: string;
  metadata?: Record<string, any>;
}

export interface CallResult {
  recipient: CallRecipient;
  status: 'answered' | 'voicemail' | 'no-answer' | 'busy' | 'failed';
  duration?: number; // seconds
  recording?: string; // URL to call recording
  transcript?: string;
  error?: string;
}

const DEFAULT_CONFIG: ParallelDialConfig = {
  maxConcurrentCalls: 5,
  callTimeout: 60,
  retryAttempts: 2,
  retryDelay: 300, // 5 minutes
};

/**
 * Make parallel calls to multiple recipients
 */
export async function makeParallelCalls(
  recipients: CallRecipient[],
  script: string,
  config: Partial<ParallelDialConfig> = {}
): Promise<CallResult[]> {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  
  console.log(`[ParallelDialer] Starting parallel calls to ${recipients.length} recipients (max ${finalConfig.maxConcurrentCalls} concurrent)`);
  
  const results: CallResult[] = [];
  
  // Process recipients in batches based on max concurrent calls
  for (let i = 0; i < recipients.length; i += finalConfig.maxConcurrentCalls) {
    const batch = recipients.slice(i, i + finalConfig.maxConcurrentCalls);
    
    console.log(`[ParallelDialer] Processing batch ${Math.floor(i / finalConfig.maxConcurrentCalls) + 1} with ${batch.length} calls`);
    
    // Make all calls in the batch simultaneously
    const batchResults = await Promise.all(
      batch.map(recipient => makeCall(recipient, script, finalConfig))
    );
    
    results.push(...batchResults);
    
    // Small delay between batches to avoid overwhelming the system
    if (i + finalConfig.maxConcurrentCalls < recipients.length) {
      await delay(2000);
    }
  }
  
  // Log summary
  const answered = results.filter(r => r.status === 'answered').length;
  const voicemail = results.filter(r => r.status === 'voicemail').length;
  const noAnswer = results.filter(r => r.status === 'no-answer').length;
  const failed = results.filter(r => r.status === 'failed').length;
  
  console.log(`[ParallelDialer] Completed ${results.length} calls: ${answered} answered, ${voicemail} voicemail, ${noAnswer} no answer, ${failed} failed`);
  
  return results;
}

/**
 * Make a single call
 * Note: Voice calling is simulated. Extend with a voice provider for production use.
 */
async function makeCall(
  recipient: CallRecipient,
  script: string,
  config: ParallelDialConfig
): Promise<CallResult> {
  try {
    // Voice calling requires a dedicated provider
    // For now, simulate calls for testing purposes
    console.log(`[ParallelDialer] Voice provider not configured - simulating call to ${recipient.name}`);
    return simulateCall(recipient);
    
  } catch (error) {
    console.error(`[ParallelDialer] Error calling ${recipient.name}:`, error);
    return {
      recipient,
      status: 'failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Generate TwiML-style script for voice AI
 */
function generateCallScript(script: string, recipient: CallRecipient): string {
  // Personalize script with recipient info
  return script
    .replace('{name}', recipient.name)
    .replace('{company}', recipient.companyName || 'your company');
}

/**
 * Simulate a call (for testing without voice provider)
 */
async function simulateCall(recipient: CallRecipient): Promise<CallResult> {
  // Simulate call duration
  await delay(Math.random() * 3000 + 2000);
  
  // Random outcome with realistic distribution
  const rand = Math.random();
  let status: CallResult['status'];
  
  if (rand < 0.35) {
    status = 'answered';
  } else if (rand < 0.55) {
    status = 'voicemail';
  } else if (rand < 0.80) {
    status = 'no-answer';
  } else if (rand < 0.90) {
    status = 'busy';
  } else {
    status = 'failed';
  }
  
  return {
    recipient,
    status,
    duration: status === 'answered' ? Math.floor(Math.random() * 180 + 30) : undefined,
  };
}

/**
 * Utility: Delay
 */
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Get parallel dialer statistics
 */
export function getDialerStats(results: CallResult[]) {
  const total = results.length;
  const answered = results.filter(r => r.status === 'answered').length;
  const voicemail = results.filter(r => r.status === 'voicemail').length;
  const noAnswer = results.filter(r => r.status === 'no-answer').length;
  const busy = results.filter(r => r.status === 'busy').length;
  const failed = results.filter(r => r.status === 'failed').length;
  
  const answerRate = total > 0 ? (answered / total * 100).toFixed(1) : '0.0';
  const contactRate = total > 0 ? ((answered + voicemail) / total * 100).toFixed(1) : '0.0';
  
  const totalDuration = results.reduce((sum, r) => sum + (r.duration || 0), 0);
  const avgDuration = answered > 0 ? (totalDuration / answered).toFixed(1) : '0.0';
  
  return {
    total,
    answered,
    voicemail,
    noAnswer,
    busy,
    failed,
    answerRate: `${answerRate}%`,
    contactRate: `${contactRate}%`,
    avgDuration: `${avgDuration}s`,
    totalDuration: `${totalDuration}s`,
  };
}
