/**
 * Google Ads tRPC Router
 * API endpoints for managing Google Ads campaigns
 */

import { z } from 'zod';
import { router, protectedProcedure, publicProcedure } from './_core/trpc';
import { TRPCError } from '@trpc/server';
import { getDb } from './db';
import { adCampaigns, adBudgets, adPerformance } from '../drizzle/schema';
import { eq, desc, and, gte } from 'drizzle-orm';
import { createSolarCampaign, getCurrentMonthBudget } from './adCampaignManager';
import { enableCampaign, pauseCampaign } from './googleAdsCampaigns';
import { isGoogleAdsConfigured } from './googleAds';
import { createConversionAction } from './createConversionAction';
import { fetchClientAccounts } from './googleAdsClientAccounts';
import { systemConfig } from '../drizzle/schema';

export const googleAdsRouter = router({
  /**
   * Check if Google Ads is configured
   */
  isConfigured: publicProcedure.query(async () => {
    return { configured: isGoogleAdsConfigured() };
  }),

  /**
   * Get all campaigns
   */
  getCampaigns: protectedProcedure.query(async () => {
    const db = await getDb();
    if (!db) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Database not available',
      });
    }

    const campaigns = await db
      .select()
      .from(adCampaigns)
      .orderBy(desc(adCampaigns.createdAt));

    return campaigns;
  }),

  /**
   * Get campaign by ID with performance metrics
   */
  getCampaign: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Database not available',
        });
      }

      const campaign = await db
        .select()
        .from(adCampaigns)
        .where(eq(adCampaigns.id, input.id))
        .limit(1);

      if (!campaign[0]) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Campaign not found',
        });
      }

      // Get performance metrics for last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const performance = await db
        .select()
        .from(adPerformance)
        .where(
          and(
            eq(adPerformance.campaignId, input.id),
            gte(adPerformance.date, thirtyDaysAgo)
          )
        )
        .orderBy(desc(adPerformance.date));

      return {
        campaign: campaign[0],
        performance,
      };
    }),

  /**
   * Create a new campaign
   */
  createCampaign: protectedProcedure
    .input(
      z.object({
        monthlyBudget: z.number().min(100).max(10000),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Only owner can create campaigns
      if (ctx.user.role !== 'admin') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only admin can create campaigns',
        });
      }

      if (!isGoogleAdsConfigured()) {
        throw new TRPCError({
          code: 'PRECONDITION_FAILED',
          message: 'Google Ads not configured',
        });
      }

      const success = await createSolarCampaign(input.monthlyBudget);

      if (!success) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create campaign',
        });
      }

      return { success: true };
    }),

  /**
   * Enable a paused campaign
   */
  enableCampaign: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      // Only owner can enable campaigns
      if (ctx.user.role !== 'admin') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only admin can enable campaigns',
        });
      }

      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Database not available',
        });
      }

      const campaign = await db
        .select()
        .from(adCampaigns)
        .where(eq(adCampaigns.id, input.id))
        .limit(1);

      if (!campaign[0]) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Campaign not found',
        });
      }

      if (!campaign[0].googleCampaignId) {
        throw new TRPCError({
          code: 'PRECONDITION_FAILED',
          message: 'Campaign not created in Google Ads yet',
        });
      }

      const success = await enableCampaign(campaign[0].googleCampaignId);

      if (!success) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to enable campaign in Google Ads',
        });
      }

      // Update database
      await db
        .update(adCampaigns)
        .set({ status: 'active' })
        .where(eq(adCampaigns.id, input.id));

      return { success: true };
    }),

  /**
   * Pause a campaign
   */
  pauseCampaign: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      // Only owner can pause campaigns
      if (ctx.user.role !== 'admin') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only admin can pause campaigns',
        });
      }

      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Database not available',
        });
      }

      const campaign = await db
        .select()
        .from(adCampaigns)
        .where(eq(adCampaigns.id, input.id))
        .limit(1);

      if (!campaign[0]) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Campaign not found',
        });
      }

      if (!campaign[0].googleCampaignId) {
        throw new TRPCError({
          code: 'PRECONDITION_FAILED',
          message: 'Campaign not created in Google Ads yet',
        });
      }

      const success = await pauseCampaign(campaign[0].googleCampaignId);

      if (!success) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to pause campaign in Google Ads',
        });
      }

      // Update database
      await db
        .update(adCampaigns)
        .set({ status: 'paused' })
        .where(eq(adCampaigns.id, input.id));

      return { success: true };
    }),

  /**
   * Get current month's budget
   */
  getCurrentBudget: protectedProcedure.query(async () => {
    const budget = await getCurrentMonthBudget();
    return { budget };
  }),

  /**
   * Approve monthly budget
   */
  approveBudget: protectedProcedure
    .input(
      z.object({
        amount: z.number().min(100).max(10000),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Only owner can approve budgets
      if (ctx.user.role !== 'admin') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only admin can approve budgets',
        });
      }

      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Database not available',
        });
      }

      const now = new Date();
      // Set to first day of current month
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

      await db.insert(adBudgets).values({
        month: monthStart,
        amount: input.amount,
        status: 'approved',
        approvedBy: ctx.user.id,
        approvedAt: new Date(),
      });

      return { success: true };
    }),

  /**
   * Get budget history
   */
  getBudgetHistory: protectedProcedure.query(async () => {
    const db = await getDb();
    if (!db) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Database not available',
      });
    }

    const budgets = await db
      .select()
      .from(adBudgets)
      .orderBy(desc(adBudgets.month))
      .limit(12);

    return budgets;
  }),

  /**
   * Create conversion action in Google Ads
   */
  createConversionAction: protectedProcedure.mutation(async ({ ctx }) => {
    // Only admin can create conversion actions
    if (ctx.user.role !== 'admin') {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'Only admin can create conversion actions',
      });
    }

    if (!isGoogleAdsConfigured()) {
      throw new TRPCError({
        code: 'PRECONDITION_FAILED',
        message: 'Google Ads not configured',
      });
    }

    const result = await createConversionAction();

    if (!result.success) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: result.error || 'Failed to create conversion action',
      });
    }

    return result;
  }),

  /**
   * Get performance summary
   */
  getPerformanceSummary: protectedProcedure.query(async () => {
    const db = await getDb();
    if (!db) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Database not available',
      });
    }

    // Get last 30 days of performance
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const performance = await db
      .select()
      .from(adPerformance)
      .where(gte(adPerformance.date, thirtyDaysAgo));

    // Calculate totals
    const totals = performance.reduce(
      (acc, row) => ({
        impressions: acc.impressions + row.impressions,
        clicks: acc.clicks + row.clicks,
        cost: acc.cost + row.cost,
        conversions: acc.conversions + row.conversions,
      }),
      { impressions: 0, clicks: 0, cost: 0, conversions: 0 }
    );

    const ctr = totals.impressions > 0 ? (totals.clicks / totals.impressions) * 100 : 0;
    const cpc = totals.clicks > 0 ? totals.cost / totals.clicks : 0;
    const costPerLead = totals.conversions > 0 ? totals.cost / totals.conversions : 0;
    const conversionRate = totals.clicks > 0 ? (totals.conversions / totals.clicks) * 100 : 0;

    return {
      ...totals,
      ctr,
      cpc,
      costPerLead,
      conversionRate,
      period: '30 days',
    };
  }),

  /**
   * Get client accounts under manager account
   */
  getClientAccounts: protectedProcedure.query(async ({ ctx }) => {
    // Only admin can view client accounts
    if (ctx.user.role !== 'admin') {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'Only admin can view client accounts',
      });
    }

    if (!isGoogleAdsConfigured()) {
      throw new TRPCError({
        code: 'PRECONDITION_FAILED',
        message: 'Google Ads not configured',
      });
    }

    const result = await fetchClientAccounts();

    if (!result.success) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: result.error || 'Failed to fetch client accounts',
      });
    }

    return { accounts: result.accounts || [] };
  }),

  /**
   * Get selected client account ID
   */
  getSelectedClientAccount: protectedProcedure.query(async () => {
    const db = await getDb();
    if (!db) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Database not available',
      });
    }

    const config = await db
      .select()
      .from(systemConfig)
      .where(eq(systemConfig.key, 'google_ads_client_account_id'))
      .limit(1);

    return { clientAccountId: config[0]?.value || null };
  }),

  /**
   * Set selected client account ID
   */
  setClientAccount: protectedProcedure
    .input(z.object({ clientAccountId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      // Only admin can set client account
      if (ctx.user.role !== 'admin') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only admin can set client account',
        });
      }

      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Database not available',
        });
      }

      // Check if config exists
      const existing = await db
        .select()
        .from(systemConfig)
        .where(eq(systemConfig.key, 'google_ads_client_account_id'))
        .limit(1);

      if (existing[0]) {
        // Update existing
        await db
          .update(systemConfig)
          .set({
            value: input.clientAccountId,
            updatedAt: new Date(),
          })
          .where(eq(systemConfig.key, 'google_ads_client_account_id'));
      } else {
        // Insert new
        await db.insert(systemConfig).values({
          key: 'google_ads_client_account_id',
          value: input.clientAccountId,
          description: 'Selected Google Ads client account ID for campaign creation',
        });
      }

      return { success: true };
    }),
});
