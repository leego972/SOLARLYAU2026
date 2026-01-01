#!/usr/bin/env tsx

/**
 * Recruitment Email Campaign Launcher
 * 
 * This script sends initial recruitment emails to all target installers
 * with A/B testing across three email variants.
 */

import { sendInitialRecruitmentEmail } from './server/recruitmentFollowUpSequence';

// Target installer list from research
const targetInstallers = [
  {
    firstName: "John",
    companyName: "Solar Depot",
    email: "info@solardepot.com.au",
    location: "Sydney",
    state: "NSW"
  },
  {
    firstName: "Sarah",
    companyName: "Energy Matters",
    email: "contact@energymatters.com.au",
    location: "Brisbane",
    state: "QLD"
  },
  {
    firstName: "Michael",
    companyName: "Natural Solar",
    email: "info@naturalsolar.com.au",
    location: "Melbourne",
    state: "VIC"
  },
  {
    firstName: "David",
    companyName: "Infinite Energy",
    email: "sales@infiniteenergy.com.au",
    location: "Perth",
    state: "WA"
  },
  {
    firstName: "Lisa",
    companyName: "Solar Choice",
    email: "info@solarchoice.net.au",
    location: "Sydney",
    state: "NSW"
  },
  {
    firstName: "James",
    companyName: "Solargain",
    email: "info@solargain.com.au",
    location: "Perth",
    state: "WA"
  },
  {
    firstName: "Emma",
    companyName: "GI Energy",
    email: "contact@gienergy.com.au",
    location: "Adelaide",
    state: "SA"
  },
  {
    firstName: "Robert",
    companyName: "Solaray Energy",
    email: "info@solarayenergy.com.au",
    location: "Brisbane",
    state: "QLD"
  },
  {
    firstName: "Jennifer",
    companyName: "Solar Wholesalers",
    email: "sales@solarwholesalers.com.au",
    location: "Melbourne",
    state: "VIC"
  },
  {
    firstName: "Mark",
    companyName: "Sunboost Solar",
    email: "info@sunboost.com.au",
    location: "Gold Coast",
    state: "QLD"
  },
  {
    firstName: "Amanda",
    companyName: "Solar Warehouse",
    email: "contact@solarwarehouse.com.au",
    location: "Sydney",
    state: "NSW"
  },
  {
    firstName: "Chris",
    companyName: "Arise Solar",
    email: "info@arisesolar.com.au",
    location: "Brisbane",
    state: "QLD"
  },
  {
    firstName: "Nicole",
    companyName: "Solar Bright",
    email: "sales@solarbright.com.au",
    location: "Melbourne",
    state: "VIC"
  },
  {
    firstName: "Daniel",
    companyName: "Sunterra Solar",
    email: "info@sunterrasolar.com.au",
    location: "Perth",
    state: "WA"
  },
  {
    firstName: "Rachel",
    companyName: "Solar Run",
    email: "contact@solarrun.com.au",
    location: "Adelaide",
    state: "SA"
  },
  {
    firstName: "Paul",
    companyName: "Smart Solar Solutions",
    email: "info@smartsolarsolutions.com.au",
    location: "Sydney",
    state: "NSW"
  },
  {
    firstName: "Michelle",
    companyName: "Solar Power Direct",
    email: "sales@solarpowerdirect.com.au",
    location: "Melbourne",
    state: "VIC"
  },
  {
    firstName: "Andrew",
    companyName: "Solar Hub",
    email: "info@solarhub.com.au",
    location: "Brisbane",
    state: "QLD"
  }
];

async function main() {
  console.log("🚀 Starting Recruitment Email Campaign");
  console.log(`📧 Sending to ${targetInstallers.length} target installers\n`);

  const variants: Array<'A' | 'B' | 'C'> = ['A', 'B', 'C'];
  const results = {
    sent: 0,
    failed: 0,
    byVariant: { A: 0, B: 0, C: 0 }
  };

  for (let i = 0; i < targetInstallers.length; i++) {
    const contact = targetInstallers[i];
    const variant = variants[i % 3]; // Rotate through variants

    console.log(`[${i + 1}/${targetInstallers.length}] Sending to ${contact.companyName} (Variant ${variant})...`);

    try {
      const success = await sendInitialRecruitmentEmail(contact, variant);
      
      if (success) {
        results.sent++;
        results.byVariant[variant]++;
        console.log(`✅ Sent successfully to ${contact.email}`);
      } else {
        results.failed++;
        console.log(`❌ Failed to send to ${contact.email}`);
      }

      // Add delay to avoid rate limiting (2 seconds between emails)
      if (i < targetInstallers.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    } catch (error) {
      results.failed++;
      console.error(`❌ Error sending to ${contact.email}:`, error);
    }
  }

  console.log("\n📊 Campaign Results:");
  console.log(`✅ Successfully sent: ${results.sent}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`\nVariant Distribution:`);
  console.log(`  Variant A (Value-First): ${results.byVariant.A}`);
  console.log(`  Variant B (Problem-Solution): ${results.byVariant.B}`);
  console.log(`  Variant C (Social Proof): ${results.byVariant.C}`);
  console.log("\n✨ Campaign complete! Follow-up sequences scheduled automatically.");
}

main().catch(console.error);
