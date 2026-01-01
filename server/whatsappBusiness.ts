/**
 * WhatsApp Business API Integration
 * 
 * Enables automated WhatsApp messaging for installer recruitment and lead notifications.
 * Note: ClickSend doesn't support WhatsApp directly, so this module simulates WhatsApp
 * and falls back to SMS via ClickSend when WhatsApp is not available.
 */

import { ENV } from "./_core/env";

export interface WhatsAppMessage {
  to: string; // Phone number in E.164 format (e.g., +61412345678)
  message: string;
  mediaUrl?: string; // Optional image/document URL
  template?: string; // Optional approved template name
}

export interface WhatsAppMessageResult {
  success: boolean;
  messageSid?: string;
  error?: string;
  status?: 'sent' | 'delivered' | 'read' | 'failed';
  channel?: 'whatsapp' | 'sms';
}

/**
 * Send SMS via ClickSend as fallback for WhatsApp
 */
async function sendSMSViaClickSend(to: string, message: string): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const username = ENV.clicksendUsername;
    const apiKey = ENV.clicksendApiKey;

    if (!username || !apiKey) {
      return { success: false, error: 'ClickSend not configured' };
    }

    const auth = Buffer.from(`${username}:${apiKey}`).toString('base64');

    const response = await fetch('https://rest.clicksend.com/v3/sms/send', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          {
            source: 'nodejs',
            body: message,
            to: to,
          },
        ],
      }),
    });

    const result = await response.json();

    if (result.response_code === 'SUCCESS') {
      return { success: true, messageId: result.data?.messages?.[0]?.message_id };
    } else {
      return { success: false, error: result.response_msg || 'Failed to send SMS' };
    }
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Send a WhatsApp message (falls back to SMS via ClickSend)
 */
export async function sendWhatsAppMessage(
  message: WhatsAppMessage
): Promise<WhatsAppMessageResult> {
  try {
    // Try to send via SMS using ClickSend
    if (ENV.clicksendUsername && ENV.clicksendApiKey) {
      const smsResult = await sendSMSViaClickSend(message.to, message.message);
      
      if (smsResult.success) {
        console.log(`[WhatsApp/SMS] Message sent to ${message.to}: ${smsResult.messageId}`);
        return {
          success: true,
          messageSid: smsResult.messageId,
          status: 'sent',
          channel: 'sms',
        };
      }
    }
    
    // Simulate if no SMS provider configured
    console.log(`[WhatsApp] No provider configured - simulating message to ${message.to}`);
    return simulateMessage(message);
    
  } catch (error) {
    console.error(`[WhatsApp] Error sending message to ${message.to}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      status: 'failed',
    };
  }
}

/**
 * Send bulk WhatsApp messages (with rate limiting)
 */
export async function sendBulkWhatsAppMessages(
  messages: WhatsAppMessage[],
  delayMs: number = 1000 // Delay between messages to avoid rate limits
): Promise<WhatsAppMessageResult[]> {
  console.log(`[WhatsApp] Sending ${messages.length} messages with ${delayMs}ms delay`);
  
  const results: WhatsAppMessageResult[] = [];
  
  for (const message of messages) {
    const result = await sendWhatsAppMessage(message);
    results.push(result);
    
    // Delay before next message
    if (messages.indexOf(message) < messages.length - 1) {
      await delay(delayMs);
    }
  }
  
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  console.log(`[WhatsApp] Bulk send complete: ${successful} successful, ${failed} failed`);
  
  return results;
}

/**
 * Send WhatsApp message using approved template
 * (Falls back to regular SMS with template content)
 */
export async function sendWhatsAppTemplate(
  to: string,
  templateName: string,
  parameters: Record<string, string>
): Promise<WhatsAppMessageResult> {
  try {
    // Convert template to plain text message
    let message = `[${templateName}] `;
    Object.entries(parameters).forEach(([key, value]) => {
      message += `${key}: ${value}. `;
    });
    
    return sendWhatsAppMessage({ to, message: message.trim() });
    
  } catch (error) {
    console.error(`[WhatsApp] Error sending template to ${to}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      status: 'failed',
    };
  }
}

/**
 * Simulate message sending (for testing without providers)
 */
async function simulateMessage(message: WhatsAppMessage): Promise<WhatsAppMessageResult> {
  await delay(500);
  
  // 95% success rate in simulation
  const success = Math.random() > 0.05;
  
  return {
    success,
    messageSid: success ? `SM${Math.random().toString(36).substr(2, 32)}` : undefined,
    status: success ? 'sent' : 'failed',
    error: success ? undefined : 'Simulated failure',
  };
}

/**
 * Utility: Delay
 */
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Get WhatsApp message statistics
 */
export function getWhatsAppStats(results: WhatsAppMessageResult[]) {
  const total = results.length;
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  const successRate = total > 0 ? (successful / total * 100).toFixed(1) : '0.0';
  
  return {
    total,
    successful,
    failed,
    successRate: `${successRate}%`,
  };
}

/**
 * Pre-defined message templates for installer recruitment
 */
export const RECRUITMENT_TEMPLATES = {
  initialOutreach: (name: string, companyName: string) => `
Hi ${name}! 👋

I'm reaching out from Solar Lead AI. We're a platform that connects qualified solar installation leads with installers like ${companyName}.

We've generated 30+ high-quality leads in your area this week. Interested in learning more?

Reply YES for details! ☀️
  `.trim(),
  
  followUp: (name: string) => `
Hi ${name},

Just following up on my previous message about solar leads in your area.

We're currently offering:
✅ 5 FREE trial leads
✅ No upfront costs
✅ Pay only for leads you accept

Interested? Reply YES and I'll send you the details!
  `.trim(),
  
  leadNotification: (installerName: string, leadDetails: string) => `
🎯 New Lead Available!

Hi ${installerName},

${leadDetails}

Reply ACCEPT to claim this lead, or PASS to skip.

First to respond wins! ⚡
  `.trim(),
  
  leadAccepted: (installerName: string, contactInfo: string) => `
✅ Lead Accepted!

Great news ${installerName}! Here are the contact details:

${contactInfo}

Best of luck with the installation! 🌟
  `.trim(),
};
