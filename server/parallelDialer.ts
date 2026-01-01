/**
 * Parallel Dialer Technology
 * 
 * Enables simultaneous calling to multiple installers instead of sequential calling.
 * Significantly increases recruitment efficiency by calling 5-10 installers at once.
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
 * Make a single call using Twilio
 */
async function makeCall(
  recipient: CallRecipient,
  script: string,
  config: ParallelDialConfig
): Promise<CallResult> {
  try {
    // Check if Twilio is configured
    if (!ENV.twilioAccountSid || !ENV.twilioAuthToken || !ENV.twilioPhoneNumber) {
      console.log(`[ParallelDialer] Twilio not configured - simulating call to ${recipient.name}`);
      return simulateCall(recipient);
    }
    
    // Make actual call using Twilio
    const twilio = require('twilio');
    const client = twilio(ENV.twilioAccountSid, ENV.twilioAuthToken);
    
    const call = await client.calls.create({
      to: recipient.phone,
      from: ENV.twilioPhoneNumber,
      twiml: generateTwiML(script, recipient),
      timeout: config.callTimeout,
      record: true,
      recordingStatusCallback: `${ENV.baseUrl}/api/twilio/recording-callback`,
      statusCallback: `${ENV.baseUrl}/api/twilio/call-status`,
      statusCallbackEvent: ['completed'],
    });
    
    console.log(`[ParallelDialer] Call initiated to ${recipient.name} (${recipient.phone}): ${call.sid}`);
    
    // Wait for call to complete (with timeout)
    const result = await waitForCallCompletion(call.sid, config.callTimeout);
    
    return {
      recipient,
      status: result.status,
      duration: result.duration,
      recording: result.recordingUrl,
    };
    
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
 * Generate TwiML for voice AI script
 */
function generateTwiML(script: string, recipient: CallRecipient): string {
  // Personalize script with recipient info
  const personalizedScript = script
    .replace('{name}', recipient.name)
    .replace('{company}', recipient.companyName || 'your company');
  
  return `
    <?xml version="1.0" encoding="UTF-8"?>
    <Response>
      <Say voice="alice">${personalizedScript}</Say>
      <Gather input="speech dtmf" timeout="5" numDigits="1" action="/api/twilio/gather-response">
        <Say voice="alice">Press 1 if you're interested, or 2 to be removed from our list.</Say>
      </Gather>
      <Say voice="alice">Thank you for your time. Have a great day!</Say>
    </Response>
  `.trim();
}

/**
 * Wait for call to complete
 */
async function waitForCallCompletion(
  callSid: string,
  timeout: number
): Promise<{ status: CallResult['status']; duration?: number; recordingUrl?: string }> {
  const twilio = require('twilio');
  const client = twilio(ENV.twilioAccountSid, ENV.twilioAuthToken);
  
  const startTime = Date.now();
  const maxWait = timeout * 1000 + 10000; // Add 10 seconds buffer
  
  while (Date.now() - startTime < maxWait) {
    const call = await client.calls(callSid).fetch();
    
    if (call.status === 'completed' || call.status === 'failed' || call.status === 'busy' || call.status === 'no-answer') {
      // Determine status
      let status: CallResult['status'] = 'failed';
      if (call.status === 'completed') {
        // Check if it was answered or went to voicemail
        status = call.answeredBy === 'machine_start' ? 'voicemail' : 'answered';
      } else if (call.status === 'no-answer') {
        status = 'no-answer';
      } else if (call.status === 'busy') {
        status = 'busy';
      }
      
      // Get recording if available
      let recordingUrl: string | undefined;
      try {
        const recordings = await client.recordings.list({ callSid, limit: 1 });
        if (recordings.length > 0) {
          recordingUrl = `https://api.twilio.com${recordings[0].uri.replace('.json', '.mp3')}`;
        }
      } catch (error) {
        console.error(`[ParallelDialer] Error fetching recording:`, error);
      }
      
      return {
        status,
        duration: call.duration ? parseInt(call.duration) : undefined,
        recordingUrl,
      };
    }
    
    // Wait before checking again
    await delay(2000);
  }
  
  // Timeout
  return { status: 'no-answer' };
}

/**
 * Simulate a call (for testing without Twilio)
 */
async function simulateCall(recipient: CallRecipient): Promise<CallResult> {
  // Simulate call duration
  await delay(Math.random() * 3000 + 2000);
  
  // Random outcome
  const outcomes: CallResult['status'][] = ['answered', 'voicemail', 'no-answer', 'busy'];
  const status = outcomes[Math.floor(Math.random() * outcomes.length)];
  
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
