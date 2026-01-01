/**
 * Resend Email Service
 * 
 * Sends emails using Resend API
 * Free tier: 3,000 emails/month, 100 emails/day
 */

import { Resend } from 'resend';

const FROM_EMAIL = process.env.FROM_EMAIL || 'solarleads.sales@gmail.com';
const FROM_NAME = process.env.FROM_NAME || 'SolarlyAU';
const RESEND_API_KEY = process.env.RESEND_API_KEY || '';

// Initialize Resend client
let resend: Resend | null = null;

function getResend() {
  if (!resend && RESEND_API_KEY) {
    resend = new Resend(RESEND_API_KEY);
    console.log('[EmailService] Resend initialized');
  }
  return resend;
}

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Send email using Resend
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  const client = getResend();
  
  if (!client) {
    console.error('[EmailService] Resend not configured - missing RESEND_API_KEY');
    return false;
  }

  try {
    const { data, error } = await client.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    });

    if (error) {
      console.error(`[EmailService] Resend error for ${options.to}:`, error);
      return false;
    }

    console.log(`[EmailService] ✅ Email sent to ${options.to} (ID: ${data?.id})`);
    return true;
  } catch (error) {
    console.error(`[EmailService] Failed to send email to ${options.to}:`, error);
    return false;
  }
}

/**
 * Send email with retry logic
 */
export async function sendEmailWithRetry(
  options: EmailOptions,
  maxRetries: number = 3
): Promise<boolean> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const success = await sendEmail(options);
    if (success) return true;

    if (attempt < maxRetries) {
      console.log(`[EmailService] Retry ${attempt}/${maxRetries} for ${options.to}`);
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt)); // Exponential backoff
    }
  }

  return false;
}
