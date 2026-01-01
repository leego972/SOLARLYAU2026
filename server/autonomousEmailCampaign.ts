/**
 * Autonomous Email Campaign System
 * Orchestrates email enrichment + automated outreach
 */

import { getDb } from './db';
import { installers } from '../drizzle/schema';
import { eq } from 'drizzle-orm';
import { batchEnrichInstallers } from './emailEnrichment';
import { sendLaunchEmail } from './launchCampaign';

interface CampaignConfig {
  hunterApiKey: string;
  enableEmailSending: boolean;
  dryRun: boolean;
}

interface CampaignResult {
  success: boolean;
  totalInstallers: number;
  enrichmentResults: {
    enriched: number;
    existing: number;
    failed: number;
  };
  emailResults: {
    sent: number;
    failed: number;
    skipped: number;
  };
  details: Array<{
    installerId: number;
    companyName: string;
    originalEmail: string | null;
    enrichedEmail: string | null;
    emailScore: number;
    emailVerified: boolean;
    emailSent: boolean;
    emailError: string | null;
  }>;
  error?: string;
}

/**
 * Run autonomous email campaign
 * 1. Fetch all verified installers
 * 2. Enrich emails using Hunter.io
 * 3. Update database with new emails
 * 4. Send launch emails automatically
 */
export async function runAutonomousEmailCampaign(
  config: CampaignConfig
): Promise<CampaignResult> {
  const result: CampaignResult = {
    success: false,
    totalInstallers: 0,
    enrichmentResults: {
      enriched: 0,
      existing: 0,
      failed: 0,
    },
    emailResults: {
      sent: 0,
      failed: 0,
      skipped: 0,
    },
    details: [],
  };

  try {
    console.log('\n========================================');
    console.log('🚀 AUTONOMOUS EMAIL CAMPAIGN STARTING');
    console.log('========================================\n');

    const db = await getDb();
    if (!db) {
      throw new Error('Database not available');
    }

    // Step 1: Fetch all verified installers
    console.log('[Step 1] Fetching verified installers...');
    const allInstallers = await db
      .select()
      .from(installers)
      .where(eq(installers.isVerified, true));

    result.totalInstallers = allInstallers.length;
    console.log(`Found ${allInstallers.length} verified installers\n`);

    if (allInstallers.length === 0) {
      console.log('No verified installers found. Campaign complete.');
      result.success = true;
      return result;
    }

    // Step 2: Enrich emails using Hunter.io
    console.log('[Step 2] Enriching emails with Hunter.io...');
    console.log(`Dry run: ${config.dryRun ? 'YES' : 'NO'}\n`);

    const enrichmentResult = await batchEnrichInstallers(
      allInstallers.map(inst => ({
        id: inst.id,
        companyName: inst.companyName,
        contactName: inst.contactName || inst.companyName,
        email: inst.email,
        website: inst.website,
      })),
      config.hunterApiKey,
      (current, total, installer, enrichResult) => {
        console.log(`Progress: ${current}/${total} - ${installer.companyName}`);
        if (enrichResult.enrichedEmail) {
          console.log(`  ✅ Email found: ${enrichResult.enrichedEmail} (score: ${enrichResult.score})`);
        } else {
          console.log(`  ❌ No email found: ${enrichResult.error || 'Unknown error'}`);
        }
      }
    );

    result.enrichmentResults = {
      enriched: enrichmentResult.enriched,
      existing: enrichmentResult.existing,
      failed: enrichmentResult.failed,
    };

    console.log(`\n[Enrichment Summary]`);
    console.log(`  Enriched: ${enrichmentResult.enriched}`);
    console.log(`  Existing: ${enrichmentResult.existing}`);
    console.log(`  Failed: ${enrichmentResult.failed}\n`);

    // Step 3: Update database with enriched emails (if not dry run)
    if (!config.dryRun) {
      console.log('[Step 3] Updating database with enriched emails...');
      
      for (const enriched of enrichmentResult.results) {
        if (enriched.email && enriched.method === 'hunter') {
          try {
            await db
              .update(installers)
              .set({ email: enriched.email })
              .where(eq(installers.id, enriched.installerId));
            
            console.log(`  Updated installer ${enriched.installerId}: ${enriched.email}`);
          } catch (error: any) {
            console.error(`  Failed to update installer ${enriched.installerId}:`, error.message);
          }
        }
      }
      console.log('Database update complete\n');
    } else {
      console.log('[Step 3] Skipping database update (dry run)\n');
    }

    // Step 4: Send launch emails (if enabled and not dry run)
    if (config.enableEmailSending && !config.dryRun) {
      console.log('[Step 4] Sending launch emails...\n');

      for (const enriched of enrichmentResult.results) {
        const installer = allInstallers.find(i => i.id === enriched.installerId);
        if (!installer) continue;

        const emailToUse = enriched.email || installer.email;
        
        const detail: CampaignResult['details'][0] = {
          installerId: installer.id,
          companyName: installer.companyName,
          originalEmail: installer.email,
          enrichedEmail: enriched.email,
          emailScore: enriched.score,
          emailVerified: enriched.verified,
          emailSent: false,
          emailError: null,
        };

        // Skip if no valid email
        if (!emailToUse || emailToUse.includes('example.com')) {
          console.log(`  ⏭️  Skipping ${installer.companyName}: No valid email`);
          result.emailResults.skipped++;
          detail.emailError = 'No valid email';
          result.details.push(detail);
          continue;
        }

        // Send email
        try {
          console.log(`  📧 Sending to ${installer.companyName} (${emailToUse})...`);
          
          const emailResult = await sendLaunchEmail({
            to: emailToUse,
            companyName: installer.companyName,
            contactName: installer.contactName || installer.companyName,
          });

          if (emailResult.success) {
            console.log(`  ✅ Email sent successfully`);
            result.emailResults.sent++;
            detail.emailSent = true;
          } else {
            console.log(`  ❌ Email failed: ${emailResult.error}`);
            result.emailResults.failed++;
            detail.emailError = emailResult.error || 'Unknown error';
          }
        } catch (error: any) {
          console.error(`  ❌ Email error: ${error.message}`);
          result.emailResults.failed++;
          detail.emailError = error.message;
        }

        result.details.push(detail);

        // Rate limiting: wait 2 seconds between emails
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      console.log(`\n[Email Summary]`);
      console.log(`  Sent: ${result.emailResults.sent}`);
      console.log(`  Failed: ${result.emailResults.failed}`);
      console.log(`  Skipped: ${result.emailResults.skipped}\n`);
    } else {
      console.log('[Step 4] Skipping email sending (disabled or dry run)\n');
      
      // Still populate details for dry run
      for (const enriched of enrichmentResult.results) {
        const installer = allInstallers.find(i => i.id === enriched.installerId);
        if (!installer) continue;

        result.details.push({
          installerId: installer.id,
          companyName: installer.companyName,
          originalEmail: installer.email,
          enrichedEmail: enriched.email,
          emailScore: enriched.score,
          emailVerified: enriched.verified,
          emailSent: false,
          emailError: config.dryRun ? 'Dry run - not sent' : 'Email sending disabled',
        });
      }
    }

    result.success = true;

    console.log('========================================');
    console.log('✅ AUTONOMOUS EMAIL CAMPAIGN COMPLETE');
    console.log('========================================\n');

    return result;
  } catch (error: any) {
    console.error('\n❌ Campaign failed:', error.message);
    result.error = error.message;
    return result;
  }
}

/**
 * Schedule autonomous email campaign to run daily
 */
export async function scheduleAutonomousCampaign(config: CampaignConfig) {
  console.log('[Scheduler] Autonomous email campaign scheduled');
  console.log(`  Dry run: ${config.dryRun}`);
  console.log(`  Email sending: ${config.enableEmailSending}`);

  // Run immediately on startup
  console.log('\n[Scheduler] Running initial campaign...');
  await runAutonomousEmailCampaign(config);

  // Schedule daily runs at 9 AM
  const runDaily = async () => {
    const now = new Date();
    const hour = now.getHours();

    // Run at 9 AM
    if (hour === 9) {
      console.log('\n[Scheduler] Running scheduled daily campaign...');
      await runAutonomousEmailCampaign(config);
    }
  };

  // Check every hour
  setInterval(runDaily, 60 * 60 * 1000);
}
