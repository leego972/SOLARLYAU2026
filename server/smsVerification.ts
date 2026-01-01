/**
 * SMS Phone Verification Service
 * Verifies homeowner phone numbers before leads are sold to installers
 * Uses ClickSend API for SMS delivery
 */

import { ENV } from './_core/env';
import { getDb } from './db';
import { sql } from 'drizzle-orm';

interface VerificationResult {
  success: boolean;
  verificationId?: string;
  error?: string;
}

interface VerifyCodeResult {
  success: boolean;
  verified: boolean;
  error?: string;
}

/**
 * Generate a 6-digit verification code
 */
function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Format phone number to E.164 format for Australia
 */
function formatPhoneNumber(phoneNumber: string): string {
  let formattedPhone = phoneNumber.replace(/\s+/g, '').replace(/[^\d+]/g, '');
  if (formattedPhone.startsWith('0')) {
    formattedPhone = '+61' + formattedPhone.substring(1);
  } else if (!formattedPhone.startsWith('+')) {
    formattedPhone = '+61' + formattedPhone;
  }
  return formattedPhone;
}

/**
 * Send SMS via ClickSend API
 */
async function sendSMSViaClickSend(to: string, message: string): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const username = ENV.clicksendUsername;
    const apiKey = ENV.clicksendApiKey;

    if (!username || !apiKey) {
      console.error('[ClickSend] Credentials not configured');
      return { success: false, error: 'SMS service not configured' };
    }

    // Create Basic Auth header
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
      const messageId = result.data?.messages?.[0]?.message_id;
      console.log(`[ClickSend] SMS sent successfully to ${to}: ${messageId}`);
      return { success: true, messageId };
    } else {
      console.error('[ClickSend] API error:', result.response_msg);
      return { success: false, error: result.response_msg || 'Failed to send SMS' };
    }
  } catch (error: any) {
    console.error('[ClickSend] Error sending SMS:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Send SMS verification code to a phone number
 */
export async function sendVerificationSMS(phoneNumber: string, leadId?: number): Promise<VerificationResult> {
  try {
    if (!ENV.clicksendUsername || !ENV.clicksendApiKey) {
      console.error('[SMS] ClickSend credentials not configured');
      return { success: false, error: 'SMS service not configured' };
    }

    // Format phone number for Australia
    const formattedPhone = formatPhoneNumber(phoneNumber);

    // Generate verification code
    const code = generateVerificationCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

    // Store verification in database
    const db = await getDb();
    if (!db) {
      return { success: false, error: 'Database not available' };
    }

    // Insert verification record
    const verificationId = `ver_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    
    await db.execute(sql`
      INSERT INTO phone_verifications (id, phone_number, code, lead_id, expires_at, created_at)
      VALUES (${verificationId}, ${formattedPhone}, ${code}, ${leadId || null}, ${expiresAt}, NOW())
    `);

    // Send SMS via ClickSend
    const smsResult = await sendSMSViaClickSend(
      formattedPhone,
      `Your SolarlyAU verification code is: ${code}. This code expires in 10 minutes. Reply STOP to opt out.`
    );

    if (!smsResult.success) {
      // Clean up the verification record if SMS failed
      await db.execute(sql`DELETE FROM phone_verifications WHERE id = ${verificationId}`);
      return { success: false, error: smsResult.error };
    }

    console.log(`[SMS] Verification sent to ${formattedPhone}: ${smsResult.messageId}`);

    return {
      success: true,
      verificationId,
    };
  } catch (error: any) {
    console.error('[SMS] Error sending verification:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Verify a code submitted by the user
 */
export async function verifyCode(verificationId: string, code: string): Promise<VerifyCodeResult> {
  try {
    const db = await getDb();
    if (!db) {
      return { success: false, verified: false, error: 'Database not available' };
    }

    // Find the verification record
    const result = await db.execute(sql`
      SELECT * FROM phone_verifications 
      WHERE id = ${verificationId} 
      AND verified = FALSE 
      AND expires_at > NOW()
      LIMIT 1
    `);

    const rows = (result as any)[0] as any[];
    if (!rows || rows.length === 0) {
      return { success: true, verified: false, error: 'Verification not found or expired' };
    }

    const verification = rows[0];

    // Check if code matches
    if (verification.code !== code) {
      // Increment attempts
      await db.execute(sql`
        UPDATE phone_verifications 
        SET attempts = attempts + 1 
        WHERE id = ${verificationId}
      `);

      // Check if too many attempts
      if (verification.attempts >= 2) {
        return { success: true, verified: false, error: 'Too many failed attempts' };
      }

      return { success: true, verified: false, error: 'Invalid code' };
    }

    // Mark as verified
    await db.execute(sql`
      UPDATE phone_verifications 
      SET verified = TRUE, verified_at = NOW() 
      WHERE id = ${verificationId}
    `);

    // If linked to a lead, update the lead's phone_verified status
    if (verification.lead_id) {
      await db.execute(sql`
        UPDATE leads 
        SET phone_verified = TRUE, phone_verified_at = NOW() 
        WHERE id = ${verification.lead_id}
      `);
    }

    console.log(`[SMS] Phone verified: ${verification.phone_number}`);

    return { success: true, verified: true };
  } catch (error: any) {
    console.error('[SMS] Error verifying code:', error.message);
    return { success: false, verified: false, error: error.message };
  }
}

/**
 * Check if a phone number is already verified
 */
export async function isPhoneVerified(phoneNumber: string): Promise<boolean> {
  try {
    const db = await getDb();
    if (!db) return false;

    const formattedPhone = formatPhoneNumber(phoneNumber);

    const result = await db.execute(sql`
      SELECT COUNT(*) as count FROM phone_verifications 
      WHERE phone_number = ${formattedPhone} 
      AND verified = TRUE
    `);

    const rows = (result as any)[0] as any[];
    return rows && rows[0] && rows[0].count > 0;
  } catch (error) {
    console.error('[SMS] Error checking phone verification:', error);
    return false;
  }
}

/**
 * Resend verification code (with rate limiting)
 */
export async function resendVerificationSMS(phoneNumber: string, leadId?: number): Promise<VerificationResult> {
  try {
    const db = await getDb();
    if (!db) {
      return { success: false, error: 'Database not available' };
    }

    const formattedPhone = formatPhoneNumber(phoneNumber);

    // Check rate limit (max 3 SMS per hour per phone)
    const result = await db.execute(sql`
      SELECT COUNT(*) as count FROM phone_verifications 
      WHERE phone_number = ${formattedPhone} 
      AND created_at > DATE_SUB(NOW(), INTERVAL 1 HOUR)
    `);

    const rows = (result as any)[0] as any[];
    if (rows && rows[0] && rows[0].count >= 3) {
      return { success: false, error: 'Too many verification attempts. Please try again later.' };
    }

    // Send new verification
    return await sendVerificationSMS(phoneNumber, leadId);
  } catch (error: any) {
    console.error('[SMS] Error resending verification:', error.message);
    return { success: false, error: error.message };
  }
}


/**
 * Send a generic SMS message (for notifications, alerts, etc.)
 * @param phoneNumber - Phone number to send to
 * @param message - Message content
 * @returns Result with success status and optional message ID
 */
export async function sendSMS(phoneNumber: string, message: string): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const formattedPhone = formatPhoneNumber(phoneNumber);
  return await sendSMSViaClickSend(formattedPhone, message);
}
