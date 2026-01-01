import { runAutonomousEmailCampaign } from './server/autonomousEmailCampaign.js';

const HUNTER_API_KEY = process.env.HUNTER_API_KEY || '5f89838ee00535d40a44b53b28fe128397d81779';

console.log('==========================================');
console.log('🚀 AUTONOMOUS EMAIL CAMPAIGN');
console.log('==========================================\n');

// Step 1: Dry run
console.log('📊 STEP 1: DRY RUN (Preview)\n');

const dryRun = await runAutonomousEmailCampaign({
  hunterApiKey: HUNTER_API_KEY,
  enableEmailSending: false,
  dryRun: true,
});

console.log('\n========== DRY RUN RESULTS ==========');
console.log(`Total installers: ${dryRun.totalInstallers}`);
console.log(`\nEmail Enrichment:`);
console.log(`  ✅ New emails found: ${dryRun.enrichmentResults.enriched}`);
console.log(`  📧 Existing emails: ${dryRun.enrichmentResults.existing}`);
console.log(`  ❌ Failed: ${dryRun.enrichmentResults.failed}`);

if (dryRun.details.length > 0) {
  console.log(`\n📋 Preview (first 5):`);
  dryRun.details.slice(0, 5).forEach((d, i) => {
    console.log(`\n${i + 1}. ${d.companyName}:`);
    console.log(`   Original: ${d.originalEmail || 'None'}`);
    console.log(`   Found: ${d.enrichedEmail || 'Not found'}`);
    if (d.enrichedEmail) {
      console.log(`   Score: ${d.emailScore}/100`);
      console.log(`   Verified: ${d.emailVerified ? 'Yes' : 'No'}`);
    }
  });
}

if (!dryRun.success) {
  console.log('\n❌ Dry run failed:', dryRun.error);
  process.exit(1);
}

// Step 2: Real campaign
console.log('\n==========================================');
console.log('🚀 STEP 2: LAUNCHING REAL CAMPAIGN');
console.log('==========================================\n');

const realCampaign = await runAutonomousEmailCampaign({
  hunterApiKey: HUNTER_API_KEY,
  enableEmailSending: true,
  dryRun: false,
});

console.log('\n========== CAMPAIGN COMPLETE ==========');
console.log(`\n📊 Enrichment Results:`);
console.log(`  ✅ New emails found: ${realCampaign.enrichmentResults.enriched}`);
console.log(`  📧 Existing emails: ${realCampaign.enrichmentResults.existing}`);
console.log(`  ❌ Failed: ${realCampaign.enrichmentResults.failed}`);

console.log(`\n📧 Email Results:`);
console.log(`  ✅ Sent: ${realCampaign.emailResults.sent}`);
console.log(`  ❌ Failed: ${realCampaign.emailResults.failed}`);
console.log(`  ⏭️  Skipped: ${realCampaign.emailResults.skipped}`);

console.log(`\n💰 Revenue Potential:`);
const avgLeadPrice = 150;
const estimatedRevenue = realCampaign.emailResults.sent * avgLeadPrice;
console.log(`  ${realCampaign.emailResults.sent} installers × $${avgLeadPrice}/lead = $${estimatedRevenue.toLocaleString()}`);

console.log('\n==========================================');
console.log('✅ CAMPAIGN COMPLETE!');
console.log('==========================================\n');

process.exit(realCampaign.success ? 0 : 1);
