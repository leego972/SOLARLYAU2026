/**
 * Create First Google Ads Campaign
 * This script approves a budget and creates the first campaign
 */

import { createSolarCampaign } from './server/adCampaignManager.ts';

console.log('🚀 Creating Your First Google Ads Campaign');
console.log('==========================================\n');

const monthlyBudget = 1000; // $1,000 AUD per month

console.log(`📊 Monthly Budget: $${monthlyBudget} AUD`);
console.log(`📅 Daily Budget: $${(monthlyBudget / 30).toFixed(2)} AUD`);
console.log('');

try {
  console.log('🎯 Creating campaign...');
  const success = await createSolarCampaign(monthlyBudget);
  
  if (success) {
    console.log('');
    console.log('✅ CAMPAIGN CREATED SUCCESSFULLY!');
    console.log('');
    console.log('🎉 Your autonomous Google Ads system is now live!');
    console.log('');
    console.log('📈 What happens next:');
    console.log('  • AI-generated ads will start showing to Australian solar searchers');
    console.log('  • System optimizes bids every 6 hours');
    console.log('  • Underperforming keywords pause automatically');
    console.log('  • Weekly performance reports sent via email');
    console.log('  • Traffic flows to your /get-quote page');
    console.log('');
    console.log('⚠️  Campaign starts PAUSED for safety.');
    console.log('   Enable it in the Google Ads dashboard when ready.');
  } else {
    console.log('');
    console.log('❌ Campaign creation failed');
    console.log('Check the logs above for details.');
  }
} catch (error) {
  console.error('');
  console.error('❌ Error:', error.message);
  if (error.stack) {
    console.error(error.stack);
  }
}
