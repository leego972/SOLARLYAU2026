import { config } from 'dotenv';
config({ path: '.env.local' });

// Import the campaign creation function
import { createSolarCampaign } from './server/adCampaignManager.ts';

console.log('Testing campaign creation...');

try {
  const result = await createSolarCampaign(500);
  console.log('Result:', result);
} catch (error) {
  console.error('Error:', error.message);
  console.error('Stack:', error.stack);
}
