/**
 * WhatsApp Business API Integration
 * 
 * Enables automated WhatsApp messaging for installer recruitment and lead notifications.
 * Uses Twilio's WhatsApp Business API for reliable message delivery.
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
}

/**
 * Send a WhatsApp message
 */
export async function sendWhatsAppMessage(
  message: WhatsAppMessage
): Promise<WhatsAppMessageResult> {
  try {
    // Check if Twilio WhatsApp is configured
    if (!ENV.twilioAccountSid || !ENV.twilioAuthToken) {
      console.log(`[WhatsApp] Twilio not configured - simulating message to ${message.to}`);
      return simulateMessage(message);
    }
    
    // Send actual message using Twilio WhatsApp API
    const twilio = require('twilio');
    const client = twilio(ENV.twilioAccountSid, ENV.twilioAuthToken);
    
    const twilioMessage = await client.messages.create({
      from: `whatsapp:${ENV.twilioPhoneNumber}`,
      to: `whatsapp:${message.to}`,
      body: message.message,
      ...(message.mediaUrl && { mediaUrl: [message.mediaUrl] }),
      statusCallback: `${ENV.baseUrl}/api/whatsapp/status-callback`,
    });
    
    console.log(`[WhatsApp] Message sent to ${message.to}: ${twilioMessage.sid}`);
    
    return {
      success: true,
      messageSid: twilioMessage.sid,
      status: 'sent',
    };
    
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
 * (Required for initial outreach to new contacts)
 */
export async function sendWhatsAppTemplate(
  to: string,
  templateName: string,
  parameters: Record<string, string>
): Promise<WhatsAppMessageResult> {
  try {
    if (!ENV.twilioAccountSid || !ENV.twilioAuthToken) {
      console.log(`[WhatsApp] Twilio not configured - simulating template message to ${to}`);
      return simulateMessage({ to, message: `Template: ${templateName}` });
    }
    
    const twilio = require('twilio');
    const client = twilio(ENV.twilioAccountSid, ENV.twilioAuthToken);
    
    // Format template parameters
    const contentSid = `HX${templateName}`; // Twilio content SID format
    const contentVariables = JSON.stringify(parameters);
    
    const message = await client.messages.create({
      from: `whatsapp:${ENV.twilioPhoneNumber}`,
      to: `whatsapp:${to}`,
      contentSid,
      contentVariables,
      statusCallback: `${ENV.baseUrl}/api/whatsapp/status-callback`,
    });
    
    console.log(`[WhatsApp] Template message sent to ${to}: ${message.sid}`);
    
    return {
      success: true,
      messageSid: message.sid,
      status: 'sent',
    };
    
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
 * Simulate message sending (for testing without Twilio)
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
