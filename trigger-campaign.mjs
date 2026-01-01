import { sendLaunchCampaign } from './server/launchCampaign.ts';

console.log('🚀 Starting launch campaign...\n');

const stats = await sendLaunchCampaign();

console.log('\n✅ Campaign complete!');
console.log(`📧 Sent: ${stats.sent}`);
console.log(`❌ Failed: ${stats.failed}`);
console.log(`👥 Total installers: ${stats.totalInstallers}`);
