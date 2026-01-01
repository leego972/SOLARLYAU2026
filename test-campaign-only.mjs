import { config } from 'dotenv';
config({ path: '.env.local' });

import { getGoogleAdsCustomerForClient } from './server/googleAds.ts';
import { resources, enums } from 'google-ads-api';

console.log('Testing campaign creation directly...');

const customer = getGoogleAdsCustomerForClient('1711137868');
if (!customer) {
  console.error('Failed to get customer');
  process.exit(1);
}

console.log('Customer initialized');

// Use an existing budget
const budgetResourceName = 'customers/1711137868/campaignBudgets/15220431582';
const campaignName = `Test Campaign ${Date.now()}`;

const campaignOperation = {
  entity: 'campaign',
  operation: 'create',
  resource: {
    name: campaignName,
    advertising_channel_type: enums.AdvertisingChannelType.SEARCH,
    status: enums.CampaignStatus.PAUSED,
    campaign_budget: budgetResourceName,
    network_settings: {
      target_google_search: true,
      target_search_network: true,
      target_content_network: false,
      target_partner_search_network: false,
    },
    bidding_strategy_type: enums.BiddingStrategyType.TARGET_CPA,
    target_cpa: {
      target_cpa_micros: 40000000,
    },
  },
};

try {
  console.log('Creating campaign:', campaignName);
  console.log('Budget:', budgetResourceName);
  const result = await customer.mutateResources([campaignOperation]);
  console.log('Result:', JSON.stringify(result, null, 2));
} catch (error) {
  console.error('Error:', error.message);
  console.error('Error details:', JSON.stringify(error, null, 2));
  if (error.errors) {
    console.error('API errors:', JSON.stringify(error.errors, null, 2));
  }
}
