import { runRecruitmentCycle } from './server/installerRecruitment.js';

console.log('==========================================');
console.log('🚀 AUTONOMOUS INSTALLER RECRUITMENT');
console.log('==========================================\n');

console.log('Target: 50+ verified installers');
console.log('Current: 8 installers');
console.log('Goal: Recruit 42 more installers\n');

console.log('Launching recruitment across all Australian states...\n');

const result = await runRecruitmentCycle(42);

console.log('\n========== RECRUITMENT COMPLETE ==========');
console.log(`\n📊 Results:`);
console.log(`  ✅ New installers found: ${result.newInstallers}`);
console.log(`  📧 Emails enriched: ${result.emailsEnriched}`);
console.log(`  💾 Added to database: ${result.addedToDatabase}`);
console.log(`  📨 Welcome emails sent: ${result.welcomeEmailsSent}`);

console.log(`\n🎯 Network Growth:`);
console.log(`  Before: 8 installers`);
console.log(`  After: ${8 + result.addedToDatabase} installers`);
console.log(`  Growth: +${Math.round((result.addedToDatabase / 8) * 100)}%`);

console.log('\n==========================================');
console.log('✅ RECRUITMENT CAMPAIGN COMPLETE!');
console.log('==========================================\n');
