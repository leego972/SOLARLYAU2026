#!/usr/bin/env node
import { searchLinkedInInstallers } from './server/linkedinRecruitment.js';
import { enrichEmailWithHunter } from './server/emailEnrichment.js';
import { sendWelcomeEmail } from './server/welcomeSequence.js';
import { getDb } from './server/db.js';

const HUNTER_API_KEY = '5f89838ee00535d40a44b53b28fe128397d81779';
const TARGET_COUNT = 50;

console.log('==========================================');
console.log('🚀 AUTONOMOUS INSTALLER RECRUITMENT');
console.log('==========================================\n');

// Step 1: Check current count
const db = await getDb();
const currentResult = await db.execute('SELECT COUNT(*) as total FROM installers WHERE isVerified = 1');
const currentCount = currentResult[0][0].total;

console.log(`Current verified installers: ${currentCount}`);
console.log(`Target: ${TARGET_COUNT}+ installers`);
console.log(`Need to recruit: ${Math.max(0, TARGET_COUNT - currentCount)} more\n`);

if (currentCount >= TARGET_COUNT) {
  console.log('✅ Target already reached!');
  process.exit(0);
}

// Step 2: Search LinkedIn for installers
const states = ['QLD', 'NSW', 'VIC', 'WA', 'SA'];
const searchTerms = [
  'solar installer',
  'solar panel installer',
  'solar energy installer',
  'renewable energy installer',
  'photovoltaic installer'
];

let totalFound = 0;
let totalAdded = 0;
let totalEmailed = 0;

console.log('🔍 Searching LinkedIn for installers...\n');

for (const state of states) {
  console.log(`\n📍 Searching in ${state}...`);
  
  for (const term of searchTerms) {
    const query = `${term} ${state} Australia`;
    console.log(`  Searching: "${query}"`);
    
    try {
      const results = await searchLinkedInInstallers(query, 10);
      totalFound += results.length;
      
      console.log(`  Found: ${results.length} potential installers`);
      
      // Process each result
      for (const installer of results) {
        try {
          // Check if already exists
          const existing = await db.execute(
            'SELECT id FROM installers WHERE companyName = ? OR website = ?',
            [installer.companyName, installer.website]
          );
          
          if (existing[0].length > 0) {
            console.log(`    ⏭️  Skipped: ${installer.companyName} (already exists)`);
            continue;
          }
          
          // Enrich email
          let email = installer.email;
          if (!email && installer.website && installer.contactName) {
            const enriched = await enrichEmailWithHunter({
              firstName: installer.contactName.split(' ')[0],
              lastName: installer.contactName.split(' ').slice(1).join(' '),
              domain: installer.website.replace(/^https?:\/\//, '').replace(/\/$/, ''),
              apiKey: HUNTER_API_KEY
            });
            
            if (enriched.email) {
              email = enriched.email;
              console.log(`    📧 Found email: ${email}`);
            }
          }
          
          // Add to database
          await db.execute(
            `INSERT INTO installers (
              companyName, contactName, email, phone, website,
              state, isVerified, isActive, createdAt, updatedAt
            ) VALUES (?, ?, ?, ?, ?, ?, 1, 1, NOW(), NOW())`,
            [
              installer.companyName,
              installer.contactName,
              email,
              installer.phone,
              installer.website,
              state
            ]
          );
          
          totalAdded++;
          console.log(`    ✅ Added: ${installer.companyName}`);
          
          // Send welcome email
          if (email) {
            try {
              await sendWelcomeEmail({
                to: email,
                companyName: installer.companyName,
                contactName: installer.contactName
              });
              totalEmailed++;
              console.log(`    📨 Welcome email sent`);
            } catch (err) {
              console.log(`    ⚠️  Email failed: ${err.message}`);
            }
          }
          
          // Check if we've reached target
          const newCount = currentCount + totalAdded;
          if (newCount >= TARGET_COUNT) {
            console.log(`\n🎯 Target reached! (${newCount} installers)`);
            break;
          }
          
        } catch (err) {
          console.log(`    ❌ Error processing ${installer.companyName}: ${err.message}`);
        }
      }
      
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 2000));
      
    } catch (err) {
      console.log(`  ❌ Search failed: ${err.message}`);
    }
    
    // Check if target reached
    if (currentCount + totalAdded >= TARGET_COUNT) break;
  }
  
  if (currentCount + totalAdded >= TARGET_COUNT) break;
}

console.log('\n========== RECRUITMENT COMPLETE ==========');
console.log(`\n📊 Results:`);
console.log(`  🔍 Profiles found: ${totalFound}`);
console.log(`  ✅ New installers added: ${totalAdded}`);
console.log(`  📨 Welcome emails sent: ${totalEmailed}`);

console.log(`\n🎯 Network Growth:`);
console.log(`  Before: ${currentCount} installers`);
console.log(`  After: ${currentCount + totalAdded} installers`);
if (totalAdded > 0) {
  console.log(`  Growth: +${Math.round((totalAdded / currentCount) * 100)}%`);
}

console.log('\n==========================================');
console.log('✅ RECRUITMENT CAMPAIGN COMPLETE!');
console.log('==========================================\n');
