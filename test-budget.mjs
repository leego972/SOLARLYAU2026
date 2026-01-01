import { config } from 'dotenv';
config({ path: '.env.local' });

import { getGoogleAdsCustomerForClient } from './server/googleAds.ts';
import { resources, enums } from 'google-ads-api';

console.log('Testing budget creation...');

const customer = getGoogleAdsCustomerForClient('1711137868');
if (!customer) {
  console.error('Failed to get customer');
  process.exit(1);
}

console.log('Customer initialized');

// Test with a properly rounded budget (16670000 = $16.67 rounded to nearest cent)
const dailyBudgetMicros = 16670000;

const budgetOperation = {
  entity: 'campaign_budget',
  operation: 'create',
  resource: {
    name: `Test Budget ${Date.now()}`,
    amount_micros: dailyBudgetMicros,
    delivery_method: enums.BudgetDeliveryMethod.STANDARD,
  },
};

try {
  console.log('Creating budget with amount:', dailyBudgetMicros);
  const result = await customer.mutateResources([budgetOperation]);
  console.log('Result type:', typeof result);
  console.log('Result:', JSON.stringify(result, null, 2));
} catch (error) {
  console.error('Error:', error.message);
  console.error('Error details:', JSON.stringify(error, null, 2));
}
