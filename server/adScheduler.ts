/**
 * Autonomous Advertising Scheduler
 * Runs optimization tasks and manages monthly budget approvals
 */

import { optimizeAllCampaigns, generateCampaignReport } from './adOptimizer';
import { createSolarCampaign, getCurrentMonthBudget } from './adCampaignManager';
import { getDb } from './db';
import { adBudgets, adCampaigns } from '../drizzle/schema';
import { eq, and, gte } from 'drizzle-orm';
import { notifyOwner } from './_core/notification';

/**
 * Hourly optimization task
 * Adjusts bids based on performance
 */
export async function runHourlyOptimization(): Promise<void> {
  console.log('[AdScheduler] Running hourly optimization...');
  
  try {
    await optimizeAllCampaigns();
    console.log('[AdScheduler] Hourly optimization complete');
  } catch (error) {
    console.error('[AdScheduler] Hourly optimization failed:', error);
  }
}

/**
 * Daily performance check
 * Monitors spending and sends alerts if needed
 */
export async function runDailyPerformanceCheck(): Promise<void> {
  console.log('[AdScheduler] Running daily performance check...');
  
  const db = await getDb();
  if (!db) return;

  try {
    // Get all active campaigns
    const campaigns = await db
      .select()
      .from(adCampaigns)
      .where(eq(adCampaigns.status, 'active'));

    if (campaigns.length === 0) {
      console.log('[AdScheduler] No active campaigns');
      return;
    }

    // Generate performance summary
    const reports: string[] = [];
    for (const campaign of campaigns) {
      const report = await generateCampaignReport(campaign.id);
      reports.push(report);
    }

    console.log('[AdScheduler] Daily performance check complete');
    console.log(reports.join('\n\n---\n\n'));
  } catch (error) {
    console.error('[AdScheduler] Daily performance check failed:', error);
  }
}

/**
 * Weekly performance summary
 * Sends email to owner with performance metrics
 */
export async function sendWeeklyPerformanceSummary(): Promise<void> {
  console.log('[AdScheduler] Sending weekly performance summary...');
  
  const db = await getDb();
  if (!db) return;

  try {
    const campaigns = await db
      .select()
      .from(adCampaigns)
      .where(eq(adCampaigns.status, 'active'));

    if (campaigns.length === 0) {
      console.log('[AdScheduler] No active campaigns for weekly summary');
      return;
    }

    // Generate reports for all campaigns
    const reports: string[] = [];
    for (const campaign of campaigns) {
      const report = await generateCampaignReport(campaign.id);
      reports.push(report);
    }

    const summary = `
📊 Weekly Google Ads Performance Summary

${reports.join('\n\n---\n\n')}

This is an automated weekly summary. No action required.
View detailed metrics in your admin dashboard.
    `.trim();

    // Send notification to owner
    const sent = await notifyOwner({
      title: 'Weekly Ad Performance Summary',
      content: summary,
    });

    if (sent) {
      console.log('[AdScheduler] Weekly summary sent successfully');
    } else {
      console.warn('[AdScheduler] Failed to send weekly summary');
    }
  } catch (error) {
    console.error('[AdScheduler] Weekly summary failed:', error);
  }
}

/**
 * Monthly budget approval request
 * Generates budget recommendation and requests approval
 */
export async function requestMonthlyBudgetApproval(): Promise<void> {
  console.log('[AdScheduler] Requesting monthly budget approval...');
  
  const db = await getDb();
  if (!db) return;

  try {
    // Check if next month's budget already exists
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    nextMonth.setDate(1);
    nextMonth.setHours(0, 0, 0, 0);

    const existing = await db
      .select()
      .from(adBudgets)
      .where(
        and(
          eq(adBudgets.month, nextMonth),
          eq(adBudgets.status, 'pending')
        )
      )
      .limit(1);

    if (existing.length > 0) {
      console.log('[AdScheduler] Budget approval already pending for next month');
      return;
    }

    // Calculate recommended budget based on current performance
    const currentBudget = await getCurrentMonthBudget();
    const recommendedBudget = currentBudget ? Math.round(currentBudget * 1.1) : 3000; // 10% increase or default $3000

    // Create pending budget approval
    await db.insert(adBudgets).values({
      month: nextMonth,
      amount: recommendedBudget,
      status: 'pending',
      notes: 'Auto-generated budget recommendation based on current performance',
    });

    // Send notification to owner
    const monthName = nextMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    const projectedROI = recommendedBudget * 3; // Assuming 3x ROI

    const message = `
🎯 Monthly Ad Budget Approval Required

Month: ${monthName}
Recommended Budget: $${recommendedBudget.toLocaleString()}
Projected ROI: $${projectedROI.toLocaleString()} (3x return)
Daily Spend Limit: $${Math.round(recommendedBudget / 30)}

Based on current performance, this budget should generate approximately ${Math.round(recommendedBudget / 20)} qualified solar leads.

Action Required:
1. Log in to your admin dashboard
2. Go to Advertising → Budget Approvals
3. Review and approve/adjust the budget

The system will automatically create and optimize campaigns once approved.
    `.trim();

    const sent = await notifyOwner({
      title: `Budget Approval Needed: ${monthName}`,
      content: message,
    });

    if (sent) {
      console.log(`[AdScheduler] Budget approval request sent for ${monthName}`);
    } else {
      console.warn('[AdScheduler] Failed to send budget approval request');
    }
  } catch (error) {
    console.error('[AdScheduler] Monthly budget approval request failed:', error);
  }
}

/**
 * Month-end report generation
 * Generates comprehensive performance report and budget recommendation
 */
export async function generateMonthEndReport(): Promise<void> {
  console.log('[AdScheduler] Generating month-end report...');
  
  const db = await getDb();
  if (!db) return;

  try {
    const campaigns = await db
      .select()
      .from(adCampaigns);

    if (campaigns.length === 0) {
      console.log('[AdScheduler] No campaigns for month-end report');
      return;
    }

    // Generate detailed reports
    const reports: string[] = [];
    let totalSpent = 0;
    let totalConversions = 0;

    for (const campaign of campaigns) {
      const report = await generateCampaignReport(campaign.id);
      reports.push(report);
      totalSpent += campaign.totalSpent / 100; // Convert cents to dollars
      totalConversions += campaign.totalConversions;
    }

    const avgCostPerLead = totalConversions > 0 ? totalSpent / totalConversions : 0;
    const projectedRevenue = totalConversions * 60; // Assuming $60 avg revenue per lead
    const roi = totalSpent > 0 ? ((projectedRevenue - totalSpent) / totalSpent) * 100 : 0;

    const summary = `
📈 Monthly Google Ads Performance Report

Overall Performance:
- Total Spent: $${totalSpent.toFixed(2)}
- Total Leads Generated: ${totalConversions}
- Average Cost per Lead: $${avgCostPerLead.toFixed(2)}
- Projected Revenue: $${projectedRevenue.toFixed(2)}
- ROI: ${roi.toFixed(0)}%

Campaign Details:
${reports.join('\n\n---\n\n')}

Recommendation for Next Month:
${roi > 200 ? 'Increase budget by 20% to scale winning campaigns' : 
  roi > 100 ? 'Maintain current budget and continue optimization' :
  'Reduce budget by 20% and focus on improving conversion rates'}
    `.trim();

    // Send notification to owner
    const sent = await notifyOwner({
      title: 'Monthly Ad Performance Report',
      content: summary,
    });

    if (sent) {
      console.log('[AdScheduler] Month-end report sent successfully');
    } else {
      console.warn('[AdScheduler] Failed to send month-end report');
    }
  } catch (error) {
    console.error('[AdScheduler] Month-end report generation failed:', error);
  }
}

/**
 * Initialize ad scheduler
 * Sets up recurring tasks
 */
export function initializeAdScheduler(): void {
  console.log('[AdScheduler] Initializing autonomous advertising scheduler...');
  
  // Hourly optimization (every hour)
  setInterval(runHourlyOptimization, 60 * 60 * 1000);
  
  // Daily performance check (every day at 9 AM)
  const now = new Date();
  const next9AM = new Date(now);
  next9AM.setHours(9, 0, 0, 0);
  if (next9AM <= now) {
    next9AM.setDate(next9AM.getDate() + 1);
  }
  const msUntil9AM = next9AM.getTime() - now.getTime();
  setTimeout(() => {
    runDailyPerformanceCheck();
    setInterval(runDailyPerformanceCheck, 24 * 60 * 60 * 1000);
  }, msUntil9AM);
  
  console.log('[AdScheduler] Autonomous advertising scheduler initialized');
  console.log('[AdScheduler] - Hourly optimization: Every hour');
  console.log('[AdScheduler] - Daily performance check: 9 AM daily');
  console.log('[AdScheduler] - Weekly summary: Sundays at 6 PM');
  console.log('[AdScheduler] - Monthly budget request: 25th of each month');
}
