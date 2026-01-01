/**
 * Google Ads Client Account Management
 * Handles fetching and managing client accounts under a manager account (MCC)
 */

import { getGoogleAdsCustomer, getGoogleAdsClient } from './googleAds';

export interface ClientAccount {
  id: string;
  name: string;
  currency: string;
  timezone: string;
  testAccount: boolean;
  status: string;
}

/**
 * Fetch all client accounts under the manager account
 */
export async function fetchClientAccounts(): Promise<{
  success: boolean;
  accounts?: ClientAccount[];
  error?: string;
}> {
  try {
    const customer = getGoogleAdsCustomer();
    if (!customer) {
      return { success: false, error: 'Google Ads customer not initialized' };
    }

    console.log('[GoogleAdsClientAccounts] Fetching client accounts...');

    // Query to get all client accounts under the manager
    const query = `
      SELECT
        customer_client.id,
        customer_client.descriptive_name,
        customer_client.currency_code,
        customer_client.time_zone,
        customer_client.test_account,
        customer_client.status,
        customer_client.manager
      FROM customer_client
      WHERE customer_client.manager = FALSE
      ORDER BY customer_client.descriptive_name
    `;

    const results = await customer.query(query);

    const accounts: ClientAccount[] = results.map((result: any) => ({
      id: result.customer_client.id.toString(),
      name: result.customer_client.descriptive_name || `Account ${result.customer_client.id}`,
      currency: result.customer_client.currency_code || 'AUD',
      timezone: result.customer_client.time_zone || 'Australia/Sydney',
      testAccount: result.customer_client.test_account || false,
      status: result.customer_client.status || 'UNKNOWN',
    }));

    console.log(`[GoogleAdsClientAccounts] Found ${accounts.length} client accounts`);

    return {
      success: true,
      accounts,
    };
  } catch (error: any) {
    console.error('[GoogleAdsClientAccounts] Error fetching client accounts:', error.message);
    if (error.errors) {
      console.error('[GoogleAdsClientAccounts] API errors:', JSON.stringify(error.errors, null, 2));
    }
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Get a specific client account customer instance for campaign operations
 */
export function getClientAccountCustomer(clientAccountId: string) {
  try {
    const { client, config } = getGoogleAdsClient();
    
    if (!client) {
      throw new Error('Google Ads client not initialized');
    }

    // Create customer instance for the specific client account
    const clientCustomer = client.Customer({
      customer_id: clientAccountId,
      refresh_token: config.refresh_token,
      login_customer_id: config.customer_id, // Manager account ID for authentication
    });

    return clientCustomer;
  } catch (error: any) {
    console.error('[GoogleAdsClientAccounts] Error creating client customer:', error.message);
    return null;
  }
}
