/**
 * Gmail SMTP Email Service
 * 
 * Sends emails using Gmail's SMTP server with nodemailer
 * Free alternative to SendGrid with 500 emails/day limit
 */

import nodemailer from 'nodemailer';

const FROM_EMAIL = process.env.FROM_EMAIL || 'solarleads.sales@gmail.com';
const FROM_NAME = process.env.FROM_NAME || 'SolarlyAU';
const GMAIL_USER = process.env.GMAIL_USER || 'leego972@gmail.com'; // Authentication account
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD || '';

// Create reusable transporter
let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (!transporter && GMAIL_APP_PASSWORD) {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: GMAIL_USER, // Authenticate with this account
        pass: GMAIL_APP_PASSWORD,
      },
    });
    console.log('[EmailService] Gmail SMTP initialized');
  }
  return transporter;
}

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Send email using Gmail SMTP
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  const transport = getTransporter();
  
  if (!transport) {
    console.error('[EmailService] Gmail SMTP not configured - missing GMAIL_APP_PASSWORD');
    return false;
  }

  try {
    await transport.sendMail({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text || options.html.replace(/<[^>]*>/g, ''), // Strip HTML for text version
    });

    console.log(`[EmailService] ✅ Email sent to ${options.to}`);
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
