/**
 * Automated Task Scheduler
 * 
 * Runs periodic tasks for lead distribution and system maintenance
 */

import * as leadMatcher from "./leadMatcher";
import * as db from "./db";
import { runAutonomousLeadGeneration, optimizePricing } from "./aiAgent";
import { runRevenueMaximization } from "./revenueMaximizer";
import { optimizeAllCampaigns } from "./adOptimizer";
import { runDailyPerformanceCheck, sendWeeklyPerformanceSummary, generateMonthEndReport } from "./adScheduler";
import { isGoogleAdsConfigured } from "./googleAds";
import { processPendingWelcomeEmails } from "./welcomeSequence";

let isRunning = false;
let intervalId: NodeJS.Timeout | null = null;

/**
 * Process new leads every 15 minutes
 */
async function runLeadProcessing() {
  if (isRunning) {
    console.log("[Scheduler] Lead processing already running, skipping...");
    return;
  }

  isRunning = true;
  const startTime = new Date();

  try {
    console.log("[Scheduler] Starting lead processing cycle...");

    // 1. Process new leads and create offers
    const { processed, offersCreated } = await leadMatcher.processNewLeads();

    // 2. Handle expired offers
    const expiredHandled = await leadMatcher.handleExpiredOffers();

    // 3. Process auto-accept offers
    const autoAccepted = await leadMatcher.processAutoAcceptOffers();

    // 4. Generate new leads with AI (every 4 hours)
    const currentHour = new Date().getHours();
    let aiGenerated = 0;
    if (currentHour % 4 === 0) {
      // Run AI generation every 4 hours
      const aiResult = await runAutonomousLeadGeneration();
      aiGenerated = aiResult.saved;
    }

    // 5. Run revenue maximization strategies (every hour)
    if (currentHour % 1 === 0) {
      await runRevenueMaximization();
    }

    // 5.5. Process pending welcome emails (every hour)
    await processPendingWelcomeEmails();

    // 6. Optimize Google Ads campaigns (every 6 hours)
    if (isGoogleAdsConfigured() && currentHour % 6 === 0) {
      console.log('[Scheduler] Running Google Ads optimization...');
      await optimizeAllCampaigns();
    }

    // 7. Daily Google Ads performance check (at 9 AM)
    if (isGoogleAdsConfigured() && currentHour === 9) {
      console.log('[Scheduler] Running daily Google Ads performance check...');
      await runDailyPerformanceCheck();
    }

    // 8. Weekly Google Ads summary (Monday at 9 AM)
    const dayOfWeek = new Date().getDay();
    if (isGoogleAdsConfigured() && dayOfWeek === 1 && currentHour === 9) {
      console.log('[Scheduler] Sending weekly Google Ads performance summary...');
      await sendWeeklyPerformanceSummary();
    }

    // 9. Monthly Google Ads report (1st of month at 9 AM)
    const dayOfMonth = new Date().getDate();
    if (isGoogleAdsConfigured() && dayOfMonth === 1 && currentHour === 9) {
      console.log('[Scheduler] Generating monthly Google Ads report...');
      await generateMonthEndReport();
    }

    const completedAt = new Date();
    const duration = completedAt.getTime() - startTime.getTime();

    // Log activity (non-critical, don't fail if logging fails)
    try {
      await db.createAgentActivity({
        activityType: "lead_matching",
        description: `Automated lead processing cycle completed`,
        status: "success",
        leadsGenerated: 0,
        leadsQualified: processed,
        offersCreated,
        metadata: JSON.stringify({
          processed,
          offersCreated,
          expiredHandled,
          autoAccepted,
          aiGenerated,
          duration,
        }),
        startedAt: startTime,
        completedAt,
      });
    } catch (logError) {
      console.warn("[Scheduler] Failed to log activity (non-critical):", logError);
    }

    console.log(
      `[Scheduler] Lead processing completed: ${processed} leads, ${offersCreated} offers, ${expiredHandled} expired, ${autoAccepted} auto-accepted, ${aiGenerated} AI generated (${duration}ms)`
    );
  } catch (error) {
    console.error("[Scheduler] Lead processing failed:", error);

    try {
      await db.createAgentActivity({
        activityType: "lead_matching",
        description: `Automated lead processing failed`,
        status: "failed",
        leadsGenerated: 0,
        leadsQualified: 0,
        offersCreated: 0,
        errorDetails: error instanceof Error ? error.message : String(error),
        startedAt: startTime,
        completedAt: new Date(),
      });
    } catch (logError) {
      console.warn("[Scheduler] Failed to log error activity (non-critical):", logError);
    }
  } finally {
    isRunning = false;
  }
}

/**
 * Start the automated scheduler
 */
export function startScheduler() {
  if (intervalId) {
    console.log("[Scheduler] Already running");
    return;
  }

  console.log("[Scheduler] Starting automated lead distribution...");

  // Run immediately on start
  runLeadProcessing();

  // Then run every 15 minutes
  intervalId = setInterval(runLeadProcessing, 15 * 60 * 1000);

  console.log("[Scheduler] Scheduler started (15-minute intervals)");
}

/**
 * Stop the automated scheduler
 */
export function stopScheduler() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
    console.log("[Scheduler] Scheduler stopped");
  }
}

/**
 * Get scheduler status
 */
export function getSchedulerStatus() {
  return {
    running: intervalId !== null,
    processing: isRunning,
  };
}
