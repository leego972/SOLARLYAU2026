#!/bin/bash

# 🚀 One-Command Autonomous Email Campaign Launcher
# This script runs the complete email enrichment + sending workflow

set -e

echo "=========================================="
echo "🚀 AUTONOMOUS EMAIL CAMPAIGN LAUNCHER"
echo "=========================================="
echo ""

# Check if API key is provided
if [ -z "$HUNTER_API_KEY" ]; then
  echo "❌ Error: HUNTER_API_KEY environment variable not set"
  echo ""
  echo "📝 To get your Hunter.io API key:"
  echo "   1. Go to https://hunter.io/"
  echo "   2. Sign up for free account (50 searches/month)"
  echo "   3. Navigate to Dashboard → API"
  echo "   4. Copy your API key"
  echo ""
  echo "💡 Then run:"
  echo "   export HUNTER_API_KEY='your-api-key-here'"
  echo "   ./launch-campaign.sh"
  echo ""
  exit 1
fi

# Ask for confirmation
echo "⚠️  This will:"
echo "   1. Find real email addresses for all installers using Hunter.io"
echo "   2. Update the database with found emails"
echo "   3. Send launch emails via Gmail to all installers"
echo ""
read -p "Continue? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "❌ Campaign cancelled"
  exit 0
fi

echo ""
echo "=========================================="
echo "📊 STEP 1: DRY RUN (Preview)"
echo "=========================================="
echo ""

# Create dry-run script
cat > /tmp/dry-run-campaign.mjs << 'EOF'
import { runAutonomousEmailCampaign } from './server/autonomousEmailCampaign.js';

const result = await runAutonomousEmailCampaign({
  hunterApiKey: process.env.HUNTER_API_KEY,
  enableEmailSending: false,
  dryRun: true,
});

console.log('\n========== DRY RUN RESULTS ==========');
console.log(`Total installers: ${result.totalInstallers}`);
console.log(`\nEmail Enrichment:`);
console.log(`  ✅ New emails found: ${result.enrichmentResults.enriched}`);
console.log(`  📧 Existing emails: ${result.enrichmentResults.existing}`);
console.log(`  ❌ Failed: ${result.enrichmentResults.failed}`);

if (result.details.length > 0) {
  console.log(`\n📋 Preview (first 5):`);
  result.details.slice(0, 5).forEach((d, i) => {
    console.log(`\n${i + 1}. ${d.companyName}:`);
    console.log(`   Original: ${d.originalEmail || 'None'}`);
    console.log(`   Found: ${d.enrichedEmail || 'Not found'}`);
    if (d.enrichedEmail) {
      console.log(`   Score: ${d.emailScore}/100`);
      console.log(`   Verified: ${d.emailVerified ? 'Yes' : 'No'}`);
    }
  });
}

process.exit(result.success ? 0 : 1);
EOF

# Run dry run
cd /home/ubuntu/solar-lead-ai
node /tmp/dry-run-campaign.mjs

if [ $? -ne 0 ]; then
  echo ""
  echo "❌ Dry run failed. Check errors above."
  exit 1
fi

echo ""
echo "=========================================="
echo "🚀 STEP 2: REAL CAMPAIGN"
echo "=========================================="
echo ""
read -p "Dry run successful! Launch real campaign? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "❌ Real campaign cancelled"
  exit 0
fi

# Create real campaign script
cat > /tmp/real-campaign.mjs << 'EOF'
import { runAutonomousEmailCampaign } from './server/autonomousEmailCampaign.js';

console.log('🚀 Launching real campaign...\n');

const result = await runAutonomousEmailCampaign({
  hunterApiKey: process.env.HUNTER_API_KEY,
  enableEmailSending: true,
  dryRun: false,
});

console.log('\n========== CAMPAIGN COMPLETE ==========');
console.log(`\n📊 Enrichment Results:`);
console.log(`  ✅ New emails found: ${result.enrichmentResults.enriched}`);
console.log(`  📧 Existing emails: ${result.enrichmentResults.existing}`);
console.log(`  ❌ Failed: ${result.enrichmentResults.failed}`);

console.log(`\n📧 Email Results:`);
console.log(`  ✅ Sent: ${result.emailResults.sent}`);
console.log(`  ❌ Failed: ${result.emailResults.failed}`);
console.log(`  ⏭️  Skipped: ${result.emailResults.skipped}`);

console.log(`\n💰 Revenue Potential:`);
const avgLeadPrice = 150;
const estimatedRevenue = result.emailResults.sent * avgLeadPrice;
console.log(`  ${result.emailResults.sent} installers × $${avgLeadPrice}/lead = $${estimatedRevenue.toLocaleString()}`);

console.log('\n========================================');
console.log('✅ CAMPAIGN COMPLETE!');
console.log('========================================');
console.log('\n📈 Next Steps:');
console.log('  1. Check Gmail sent folder for delivery confirmation');
console.log('  2. Monitor admin dashboard for installer logins');
console.log('  3. Track first lead purchase');
console.log('');

process.exit(result.success ? 0 : 1);
EOF

# Run real campaign
node /tmp/real-campaign.mjs

if [ $? -eq 0 ]; then
  echo ""
  echo "🎉 Campaign launched successfully!"
  echo ""
  echo "📊 Check results in:"
  echo "   - Gmail: solarleads.sales@gmail.com (sent folder)"
  echo "   - Admin Dashboard: https://solar-lead-vwkzbmwb.manus.space/admin"
  echo "   - Database: installers table (updated emails)"
  echo ""
else
  echo ""
  echo "❌ Campaign failed. Check errors above."
  exit 1
fi

# Cleanup
rm -f /tmp/dry-run-campaign.mjs /tmp/real-campaign.mjs
