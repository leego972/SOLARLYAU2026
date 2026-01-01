/**
 * Google Ads API Integration
 * Handles authentication and provides client for autonomous ad management
 */

import { GoogleAdsApi, Customer } from 'google-ads-api';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load credentials from .env.google-ads file
const envPath = path.join(__dirname, '..', '.env.google-ads');
const credentials: Record<string, string> = {};

console.log('[GoogleAds] Loading credentials from:', envPath);
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value && !key.trim().startsWith('#')) {
      credentials[key.trim()] = value.trim();
    }
  });
  console.log('[GoogleAds] Loaded credentials:', Object.keys(credentials));
} else {
  console.warn('[GoogleAds] Credentials file not found at:', envPath);
}

// Google Ads credentials
const GOOGLE_ADS_CONFIG = {
  client_id: credentials.GOOGLE_ADS_CLIENT_ID || process.env.GOOGLE_ADS_CLIENT_ID || '',
  client_secret: credentials.GOOGLE_ADS_CLIENT_SECRET || process.env.GOOGLE_ADS_CLIENT_SECRET || '',
  developer_token: credentials.GOOGLE_ADS_DEVELOPER_TOKEN || process.env.GOOGLE_ADS_DEVELOPER_TOKEN || '',
};

const GOOGLE_ADS_REFRESH_TOKEN = credentials.GOOGLE_ADS_REFRESH_TOKEN || process.env.GOOGLE_ADS_REFRESH_TOKEN || '';
const GOOGLE_ADS_CUSTOMER_ID = credentials.GOOGLE_ADS_CUSTOMER_ID || process.env.GOOGLE_ADS_CUSTOMER_ID || '';

let googleAdsClient: GoogleAdsApi | null = null;
let customer: Customer | null = null;

/**
 * Initialize Google Ads API client
 */
export function initializeGoogleAdsClient(): GoogleAdsApi | null {
  if (!GOOGLE_ADS_CONFIG.client_id || !GOOGLE_ADS_CONFIG.client_secret || !GOOGLE_ADS_CONFIG.developer_token) {
    console.warn('[GoogleAds] Missing credentials. Set GOOGLE_ADS_CLIENT_ID, GOOGLE_ADS_CLIENT_SECRET, and GOOGLE_ADS_DEVELOPER_TOKEN');
    return null;
  }

  if (!googleAdsClient) {
    try {
      googleAdsClient = new GoogleAdsApi({
        client_id: GOOGLE_ADS_CONFIG.client_id,
        client_secret: GOOGLE_ADS_CONFIG.client_secret,
        developer_token: GOOGLE_ADS_CONFIG.developer_token,
      });
      console.log('[GoogleAds] Client initialized successfully');
    } catch (error) {
      console.error('[GoogleAds] Failed to initialize client:', error);
      return null;
    }
  }

  return googleAdsClient;
}

/**
 * Get Google Ads client and config (for creating custom customer instances)
 */
export function getGoogleAdsClient() {
  const client = initializeGoogleAdsClient();
  return {
    client,
    config: {
      customer_id: GOOGLE_ADS_CUSTOMER_ID,
      refresh_token: GOOGLE_ADS_REFRESH_TOKEN,
      client_id: GOOGLE_ADS_CONFIG.client_id,
      client_secret: GOOGLE_ADS_CONFIG.client_secret,
      developer_token: GOOGLE_ADS_CONFIG.developer_token,
    },
  };
}

/**
 * Get Google Ads customer instance
 */
export function getGoogleAdsCustomer(): Customer | null {
  if (!GOOGLE_ADS_REFRESH_TOKEN || !GOOGLE_ADS_CUSTOMER_ID) {
    console.warn('[GoogleAds] Missing GOOGLE_ADS_REFRESH_TOKEN or GOOGLE_ADS_CUSTOMER_ID');
    return null;
  }

  const client = initializeGoogleAdsClient();
  if (!client) return null;

  if (!customer) {
    try {
      customer = client.Customer({
        customer_id: GOOGLE_ADS_CUSTOMER_ID,
        refresh_token: GOOGLE_ADS_REFRESH_TOKEN,
      });
      console.log(`[GoogleAds] Customer ${GOOGLE_ADS_CUSTOMER_ID} initialized`);
    } catch (error) {
      console.error('[GoogleAds] Failed to initialize customer:', error);
      return null;
    }
  }

  return customer;
}

/**
 * Check if Google Ads is configured and ready
 */
export function isGoogleAdsConfigured(): boolean {
  return !!(
    GOOGLE_ADS_CONFIG.client_id &&
    GOOGLE_ADS_CONFIG.client_secret &&
    GOOGLE_ADS_CONFIG.developer_token &&
    GOOGLE_ADS_REFRESH_TOKEN &&
    GOOGLE_ADS_CUSTOMER_ID
  );
}

/**
 * Get Google Ads customer instance for a specific client account
 * Used when working with manager accounts (MCC)
 */
export function getGoogleAdsCustomerForClient(clientAccountId: string): Customer | null {
  if (!GOOGLE_ADS_REFRESH_TOKEN) {
    console.warn('[GoogleAds] Missing GOOGLE_ADS_REFRESH_TOKEN');
    return null;
  }

  const client = initializeGoogleAdsClient();
  if (!client) return null;

  try {
    // For manager accounts, we need to specify login_customer_id (the manager account)
    // and customer_id (the client account we want to operate on)
    const clientCustomer = client.Customer({
      customer_id: clientAccountId.replace(/-/g, ''),
      refresh_token: GOOGLE_ADS_REFRESH_TOKEN,
      login_customer_id: GOOGLE_ADS_CUSTOMER_ID.replace(/-/g, ''), // Manager account ID
    });
    console.log(`[GoogleAds] Client customer ${clientAccountId} initialized with manager ${GOOGLE_ADS_CUSTOMER_ID}`);
    return clientCustomer;
  } catch (error) {
    console.error('[GoogleAds] Failed to initialize client customer:', error);
    return null;
  }
}

/**
 * Get configuration status for debugging
 */
export function getGoogleAdsConfigStatus() {
  return {
    hasClientId: !!GOOGLE_ADS_CONFIG.client_id,
    hasClientSecret: !!GOOGLE_ADS_CONFIG.client_secret,
    hasDeveloperToken: !!GOOGLE_ADS_CONFIG.developer_token,
    hasRefreshToken: !!GOOGLE_ADS_REFRESH_TOKEN,
    hasCustomerId: !!GOOGLE_ADS_CUSTOMER_ID,
    isConfigured: isGoogleAdsConfigured(),
  };
}
