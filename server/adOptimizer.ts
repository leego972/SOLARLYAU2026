/**
 * Autonomous Ad Optimization Engine
 * Automatically adjusts bids, pauses underperforming ads, and optimizes budget allocation
 */

import { getDb } from './db';
import { adCampaigns, adPerformance } from '../drizzle/schema';
import { eq, gte, and, sql } from 'drizzle-orm';
import { isDailyLimitReached } from './adCampaignManager';

// Optimization thresholds
const OPTIMIZATION_CONFIG = {
  // Pause keywords if they exceed these thresholds
  MAX_COST_PER_LEAD: 30, // $30 per lead
  MIN_CLICKS_BEFORE_PAUSE: 50, // Need at least 50 clicks before pausing
  
  // Bid adjustments
  BID_INCREASE_THRESHOLD: 15, // If cost per lead < $15, increase bid by 20%
  BID_DECREASE_THRESHOLD: 25, // If cost per lead > $25, decrease bid by 15%
  BID_INCREASE_PERCENT: 0.20, // 20% increase
  BID_DECREASE_PERCENT: 0.15, // 15% decrease
  
  // Performance windows
  LOOKBACK_DAYS: 7, // Analyze last 7 days of performance
};

/**
 * Calculate performance metrics for a campaign
 */
async function getCampaignPerformance(campaignId: number, days: number = 7) {
  const db = await getDb();
  if (!db) return null;

  const since = new Date();
  since.setDate(since.getDate() - days);

  const performance = await db
    .select({
      totalImpressions: sql<number>`SUM(${adPerformance.impressions})`,
      totalClicks: sql<number>`SUM(${adPerformance.clicks})`,
      totalCost: sql<number>`SUM(${adPerformance.cost})`,
      totalConversions: sql<number>`SUM(${adPerformance.conversions})`,
    })
    .from(adPerformance)
    .where(
      and(
        eq(adPerformance.campaignId, campaignId),
        gte(adPerformance.date, since)
      )
    );

  const metrics = performance[0];
  if (!metrics) return null;

  const clicks = Number(metrics.totalClicks) || 0;
  const conversions = Number(metrics.totalConversions) || 0;
  const cost = Number(metrics.totalCost) || 0;

  return {
    impressions: Number(metrics.totalImpressions) || 0,
    clicks,
    cost: cost / 100, // Convert cents to dollars
    conversions,
    ctr: clicks > 0 ? (clicks / Number(metrics.totalImpressions)) * 100 : 0,
    cpc: clicks > 0 ? cost / clicks / 100 : 0,
    costPerLead: conversions > 0 ? cost / conversions / 100 : 0,
    conversionRate: clicks > 0 ? (conversions / clicks) * 100 : 0,
  };
}

/**
 * Determine optimal bid adjustment based on performance
 */
function calculateBidAdjustment(costPerLead: number, clicks: number): {
  action: 'increase' | 'decrease' | 'pause' | 'maintain';
  adjustment: number;
  reason: string;
} {
  // Not enough data yet
  if (clicks < 10) {
    return {
      action: 'maintain',
      adjustment: 0,
      reason: 'Insufficient data (< 10 clicks)',
    };
  }

  // Pause if performing very poorly
  if (
    clicks >= OPTIMIZATION_CONFIG.MIN_CLICKS_BEFORE_PAUSE &&
    costPerLead > OPTIMIZATION_CONFIG.MAX_COST_PER_LEAD
  ) {
    return {
      action: 'pause',
      adjustment: 0,
      reason: `Cost per lead ($${costPerLead.toFixed(2)}) exceeds max ($${OPTIMIZATION_CONFIG.MAX_COST_PER_LEAD})`,
    };
  }

  // Increase bid if performing well
  if (costPerLead > 0 && costPerLead < OPTIMIZATION_CONFIG.BID_INCREASE_THRESHOLD) {
    return {
      action: 'increase',
      adjustment: OPTIMIZATION_CONFIG.BID_INCREASE_PERCENT,
      reason: `Excellent performance: $${costPerLead.toFixed(2)} per lead`,
    };
  }

  // Decrease bid if performing poorly
  if (costPerLead > OPTIMIZATION_CONFIG.BID_DECREASE_THRESHOLD) {
    return {
      action: 'decrease',
      adjustment: OPTIMIZATION_CONFIG.BID_DECREASE_PERCENT,
      reason: `High cost per lead: $${costPerLead.toFixed(2)}`,
    };
  }

  // Performance is acceptable, maintain current bid
  return {
    action: 'maintain',
    adjustment: 0,
    reason: `Cost per lead ($${costPerLead.toFixed(2)}) is within target range`,
  };
}

/**
 * Optimize a single campaign
 */
async function optimizeCampaign(campaignId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;

  console.log(`[AdOptimizer] Optimizing campaign ${campaignId}...`);

  // Get campaign performance
  const performance = await getCampaignPerformance(campaignId, OPTIMIZATION_CONFIG.LOOKBACK_DAYS);
  if (!performance) {
    console.log(`[AdOptimizer] No performance data for campaign ${campaignId}`);
    return;
  }

  console.log(`[AdOptimizer] Campaign ${campaignId} performance:`, {
    clicks: performance.clicks,
    conversions: performance.conversions,
    cost: `$${performance.cost.toFixed(2)}`,
    costPerLead: performance.costPerLead > 0 ? `$${performance.costPerLead.toFixed(2)}` : 'N/A',
    ctr: `${performance.ctr.toFixed(2)}%`,
    conversionRate: `${performance.conversionRate.toFixed(2)}%`,
  });

  // Determine bid adjustment
  const bidDecision = calculateBidAdjustment(performance.costPerLead, performance.clicks);
  console.log(`[AdOptimizer] Bid decision:`, bidDecision);

  // Apply optimization
  if (bidDecision.action === 'pause') {
    await db
      .update(adCampaigns)
      .set({ status: 'paused' })
      .where(eq(adCampaigns.id, campaignId));
    console.log(`[AdOptimizer] ⏸️  Paused campaign ${campaignId}: ${bidDecision.reason}`);
  } else if (bidDecision.action === 'increase') {
    // In real implementation, this would adjust bids in Google Ads API
    console.log(`[AdOptimizer] 📈 Increase bids by ${(bidDecision.adjustment * 100).toFixed(0)}%: ${bidDecision.reason}`);
  } else if (bidDecision.action === 'decrease') {
    console.log(`[AdOptimizer] 📉 Decrease bids by ${(bidDecision.adjustment * 100).toFixed(0)}%: ${bidDecision.reason}`);
  } else {
    console.log(`[AdOptimizer] ✅ Maintain current bids: ${bidDecision.reason}`);
  }
}

/**
 * Optimize all active campaigns
 */
export async function optimizeAllCampaigns(): Promise<void> {
  // Check if daily spending limit reached
  if (await isDailyLimitReached()) {
    console.log('[AdOptimizer] Daily spending limit reached. Pausing optimization.');
    return;
  }

  const db = await getDb();
  if (!db) {
    console.warn('[AdOptimizer] Database not available');
    return;
  }

  console.log('[AdOptimizer] Starting campaign optimization...');

  // Get all active campaigns
  const campaigns = await db
    .select()
    .from(adCampaigns)
    .where(eq(adCampaigns.status, 'active'));

  if (campaigns.length === 0) {
    console.log('[AdOptimizer] No active campaigns to optimize');
    return;
  }

  console.log(`[AdOptimizer] Found ${campaigns.length} active campaigns`);

  // Optimize each campaign
  for (const campaign of campaigns) {
    try {
      await optimizeCampaign(campaign.id);
    } catch (error) {
      console.error(`[AdOptimizer] Error optimizing campaign ${campaign.id}:`, error);
    }
  }

  console.log('[AdOptimizer] Campaign optimization complete');
}

/**
 * Generate performance report for a campaign
 */
export async function generateCampaignReport(campaignId: number): Promise<string> {
  const db = await getDb();
  if (!db) return 'Database not available';

  const campaign = await db
    .select()
    .from(adCampaigns)
    .where(eq(adCampaigns.id, campaignId))
    .limit(1);

  if (campaign.length === 0) {
    return `Campaign ${campaignId} not found`;
  }

  const performance = await getCampaignPerformance(campaignId, 30); // Last 30 days
  if (!performance) {
    return 'No performance data available';
  }

  const roi = performance.conversions > 0
    ? ((performance.conversions * 60 - performance.cost) / performance.cost) * 100 // Assuming $60 avg revenue per lead
    : 0;

  return `
Campaign: ${campaign[0].name}
Status: ${campaign[0].status}
Period: Last 30 days

Performance:
- Impressions: ${performance.impressions.toLocaleString()}
- Clicks: ${performance.clicks.toLocaleString()}
- CTR: ${performance.ctr.toFixed(2)}%
- Cost: $${performance.cost.toFixed(2)}
- Conversions: ${performance.conversions}
- Cost per Lead: ${performance.costPerLead > 0 ? `$${performance.costPerLead.toFixed(2)}` : 'N/A'}
- Conversion Rate: ${performance.conversionRate.toFixed(2)}%
- ROI: ${roi > 0 ? `${roi.toFixed(0)}%` : 'N/A'}

Budget:
- Daily Budget: $${campaign[0].dailyBudget}
- Monthly Budget: $${campaign[0].monthlyBudget}
- Target Cost per Lead: $${campaign[0].targetCostPerLead}
`.trim();
}
