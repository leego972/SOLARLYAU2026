/**
 * Google Ads Conversion Tracking Service
 * 
 * Implements Enhanced Conversions for Leads to track lead submissions
 * and optimize Google Ads campaigns based on actual conversions.
 */

import { getGoogleAdsCustomerForClient } from './googleAds';
import { getDb } from './db';
import { systemConfig } from '../drizzle/schema';
import { eq } from 'drizzle-orm';
import { enums } from 'google-ads-api';
import crypto from 'crypto';

/**
 * Get the configured client account ID from the database
 */
async function getClientAccountId(): Promise<string | null> {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db
    .select()
    .from(systemConfig)
    .where(eq(systemConfig.key, 'google_ads_client_account_id'))
    .limit(1);
  
  return result[0]?.value || null;
}

/**
 * Hash user data for Enhanced Conversions (SHA-256, lowercase, trimmed)
 */
function hashUserData(value: string): string {
  const normalized = value.toLowerCase().trim();
  return crypto.createHash('sha256').update(normalized).digest('hex');
}

/**
 * Format phone number to E.164 format for Google Ads
 */
function formatPhoneE164(phone: string): string {
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');
  
  // Handle Australian numbers
  if (digits.startsWith('0') && digits.length === 10) {
    return `+61${digits.substring(1)}`;
  }
  if (digits.startsWith('61') && digits.length === 11) {
    return `+${digits}`;
  }
  if (digits.startsWith('+')) {
    return phone;
  }
  
  // Default: assume Australian
  return `+61${digits}`;
}

/**
 * Create a conversion action for lead submissions
 */
export async function createLeadConversionAction(): Promise<string | null> {
  try {
    const clientAccountId = await getClientAccountId();
    if (!clientAccountId) {
      console.error('[GoogleAdsConversions] No client account configured');
      return null;
    }

    const customer = getGoogleAdsCustomerForClient(clientAccountId);
    if (!customer) {
      console.error('[GoogleAdsConversions] Failed to get customer');
      return null;
    }

    console.log('[GoogleAdsConversions] Creating lead conversion action...');

    const conversionActionOperation = {
      entity: 'conversion_action' as const,
      operation: 'create' as const,
      resource: {
        name: 'Solar Lead Submission',
        category: enums.ConversionActionCategory.SUBMIT_LEAD_FORM,
        type: enums.ConversionActionType.UPLOAD_CLICKS,
        status: enums.ConversionActionStatus.ENABLED,
        value_settings: {
          default_value: 60, // Average lead value in AUD
          always_use_default_value: false,
        },
        counting_type: enums.ConversionActionCountingType.ONE_PER_CLICK,
      },
    };

    const result = await customer.mutateResources([conversionActionOperation as any]);
    
    // Handle different response structures
    const response = result as any;
    const resourceName = response?.mutate_operation_responses?.[0]?.conversion_action_result?.resource_name;

    if (resourceName) {
      console.log(`[GoogleAdsConversions] Conversion action created: ${resourceName}`);
      return resourceName;
    }

    console.error('[GoogleAdsConversions] Failed to create conversion action - no resource name in response');
    return null;
  } catch (error: any) {
    console.error('[GoogleAdsConversions] Error creating conversion action:', error.message);
    if (error.errors) {
      console.error('[GoogleAdsConversions] API errors:', JSON.stringify(error.errors, null, 2));
    }
    return null;
  }
}

/**
 * Get existing lead conversion action or create one
 */
export async function getOrCreateLeadConversionAction(): Promise<string | null> {
  try {
    const clientAccountId = await getClientAccountId();
    if (!clientAccountId) {
      console.error('[GoogleAdsConversions] No client account configured');
      return null;
    }

    const customer = getGoogleAdsCustomerForClient(clientAccountId);
    if (!customer) {
      console.error('[GoogleAdsConversions] Failed to get customer');
      return null;
    }

    // Search for existing conversion action
    const query = `
      SELECT 
        conversion_action.resource_name,
        conversion_action.name,
        conversion_action.status
      FROM conversion_action
      WHERE conversion_action.name = 'Solar Lead Submission'
        AND conversion_action.status = 'ENABLED'
      LIMIT 1
    `;

    const results = await customer.query(query);
    
    if (results && results.length > 0) {
      const resourceName = (results[0] as any).conversion_action?.resource_name;
      console.log(`[GoogleAdsConversions] Found existing conversion action: ${resourceName}`);
      return resourceName || null;
    }

    // Create new conversion action
    return await createLeadConversionAction();
  } catch (error: any) {
    console.error('[GoogleAdsConversions] Error getting/creating conversion action:', error.message);
    return null;
  }
}

/**
 * Upload a lead conversion to Google Ads using Enhanced Conversions for Leads
 */
export async function uploadLeadConversion(params: {
  email?: string;
  phone?: string;
  conversionDateTime: Date;
  conversionValue?: number;
  currencyCode?: string;
  orderId?: string;
}): Promise<boolean> {
  try {
    const clientAccountId = await getClientAccountId();
    if (!clientAccountId) {
      console.error('[GoogleAdsConversions] No client account configured');
      return false;
    }

    const customer = getGoogleAdsCustomerForClient(clientAccountId);
    if (!customer) {
      console.error('[GoogleAdsConversions] Failed to get customer');
      return false;
    }

    // Get or create conversion action
    const conversionActionResourceName = await getOrCreateLeadConversionAction();
    if (!conversionActionResourceName) {
      console.error('[GoogleAdsConversions] No conversion action available');
      return false;
    }

    // Build user identifiers for Enhanced Conversions
    const userIdentifiers: any[] = [];

    if (params.email) {
      userIdentifiers.push({
        hashed_email: hashUserData(params.email),
      });
    }

    if (params.phone) {
      userIdentifiers.push({
        hashed_phone_number: hashUserData(formatPhoneE164(params.phone)),
      });
    }

    if (userIdentifiers.length === 0) {
      console.error('[GoogleAdsConversions] No user identifiers provided (email or phone required)');
      return false;
    }

    // Format conversion date time (must be in format: yyyy-mm-dd hh:mm:ss+|-hh:mm)
    const conversionTime = params.conversionDateTime.toISOString()
      .replace('T', ' ')
      .replace('Z', '+00:00')
      .substring(0, 25);

    // Build the click conversion
    const clickConversion = {
      conversion_action: conversionActionResourceName,
      conversion_date_time: conversionTime,
      conversion_value: params.conversionValue || 60,
      currency_code: params.currencyCode || 'AUD',
      order_id: params.orderId,
      user_identifiers: userIdentifiers,
    };

    console.log('[GoogleAdsConversions] Uploading conversion:', {
      conversionAction: conversionActionResourceName,
      conversionTime,
      value: clickConversion.conversion_value,
      orderId: params.orderId,
      identifierCount: userIdentifiers.length,
    });

    // Upload the conversion using conversionUploads
    const response = await (customer.conversionUploads as any).uploadClickConversions({
      customer_id: clientAccountId,
      conversions: [clickConversion],
      partial_failure: true,
      validate_only: false,
    });

    // Check for partial failures
    if ((response as any).partial_failure_error) {
      console.error('[GoogleAdsConversions] Partial failure:', 
        JSON.stringify((response as any).partial_failure_error, null, 2));
      return false;
    }

    console.log('[GoogleAdsConversions] Conversion uploaded successfully');
    return true;
  } catch (error: any) {
    console.error('[GoogleAdsConversions] Error uploading conversion:', error.message);
    if (error.errors) {
      console.error('[GoogleAdsConversions] API errors:', JSON.stringify(error.errors, null, 2));
    }
    return false;
  }
}

/**
 * Track a lead submission as a conversion
 * Call this when a new lead is successfully created
 */
export async function trackLeadConversion(lead: {
  id: number;
  customerEmail?: string | null;
  customerPhone: string;
  price?: number;
}): Promise<boolean> {
  try {
    console.log(`[GoogleAdsConversions] Tracking conversion for lead ${lead.id}`);

    const result = await uploadLeadConversion({
      email: lead.customerEmail || undefined,
      phone: lead.customerPhone,
      conversionDateTime: new Date(),
      conversionValue: lead.price || 60,
      currencyCode: 'AUD',
      orderId: `LEAD-${lead.id}`,
    });

    if (result) {
      console.log(`[GoogleAdsConversions] Successfully tracked conversion for lead ${lead.id}`);
    } else {
      console.warn(`[GoogleAdsConversions] Failed to track conversion for lead ${lead.id}`);
    }

    return result;
  } catch (error: any) {
    console.error(`[GoogleAdsConversions] Error tracking lead ${lead.id}:`, error.message);
    return false;
  }
}
