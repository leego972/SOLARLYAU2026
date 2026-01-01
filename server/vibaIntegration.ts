/**
 * Viba Business Manager Integration API
 * Provides comprehensive business metrics and data access for Viba app
 */

import { publicProcedure, router } from './_core/trpc';
import { getDb } from './db';
import { sql } from 'drizzle-orm';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';

/**
 * Viba Integration Router
 * All endpoints require API key authentication
 */
export const vibaRouter = router({
  /**
   * Get comprehensive business overview
   * Returns key metrics for dashboard display
   */
  getBusinessOverview: publicProcedure
    .input(z.object({
      apiKey: z.string(),
      timeRange: z.enum(['today', 'week', 'month', 'year', 'all']).optional().default('all'),
    }))
    .query(async ({ input }) => {
      // Validate API key
      if (input.apiKey !== process.env.VIBA_API_KEY) {
        throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Invalid API key' });
      }

      const db = await getDb();
      if (!db) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database unavailable' });
      }

      // Calculate date filter based on time range
      let dateFilter = '';
      const now = new Date();
      if (input.timeRange === 'today') {
        dateFilter = `AND DATE(createdAt) = CURDATE()`;
      } else if (input.timeRange === 'week') {
        dateFilter = `AND createdAt >= DATE_SUB(NOW(), INTERVAL 7 DAY)`;
      } else if (input.timeRange === 'month') {
        dateFilter = `AND createdAt >= DATE_SUB(NOW(), INTERVAL 30 DAY)`;
      } else if (input.timeRange === 'year') {
        dateFilter = `AND createdAt >= DATE_SUB(NOW(), INTERVAL 365 DAY)`;
      }

      // Get lead stats
      const leadStats = await db.execute(sql.raw(`
        SELECT 
          COUNT(*) as totalLeads,
          SUM(CASE WHEN isActive = 1 THEN 1 ELSE 0 END) as activeLeads,
          SUM(CASE WHEN isPurchased = 1 THEN 1 ELSE 0 END) as soldLeads,
          ROUND(AVG(qualityScore), 1) as avgQuality,
          SUM(CASE WHEN createdAt >= DATE_SUB(NOW(), INTERVAL 24 HOUR) THEN 1 ELSE 0 END) as leadsLast24h
        FROM leads
        WHERE 1=1 ${dateFilter}
      `));

      // Get installer stats
      const installerStats = await db.execute(sql.raw(`
        SELECT 
          COUNT(*) as totalInstallers,
          SUM(CASE WHEN isVerified = 1 THEN 1 ELSE 0 END) as verifiedInstallers,
          SUM(CASE WHEN isActive = 1 THEN 1 ELSE 0 END) as activeInstallers,
          SUM(CASE WHEN createdAt >= DATE_SUB(NOW(), INTERVAL 24 HOUR) THEN 1 ELSE 0 END) as newInstallersLast24h
        FROM installers
        WHERE 1=1 ${dateFilter}
      `));

      // Get revenue stats
      const revenueStats = await db.execute(sql.raw(`
        SELECT 
          COUNT(*) as totalTransactions,
          COALESCE(SUM(amount), 0) as totalRevenue,
          COALESCE(AVG(amount), 0) as avgTransactionValue,
          COALESCE(SUM(CASE WHEN createdAt >= DATE_SUB(NOW(), INTERVAL 24 HOUR) THEN amount ELSE 0 END), 0) as revenueLast24h
        FROM transactions
        WHERE status = 'completed' ${dateFilter}
      `));

      // Get state distribution
      const stateDistribution = await db.execute(sql.raw(`
        SELECT 
          state,
          COUNT(*) as count
        FROM leads
        WHERE isActive = 1 ${dateFilter}
        GROUP BY state
        ORDER BY count DESC
      `));

      return {
        businessName: 'SolarlyAU',
        timeRange: input.timeRange,
        timestamp: now.toISOString(),
        leads: {
          total: Number((leadStats[0] as any)[0].totalLeads),
          active: Number((leadStats[0] as any)[0].activeLeads),
          sold: Number((leadStats[0] as any)[0].soldLeads),
          avgQuality: Number((leadStats[0] as any)[0].avgQuality),
          last24h: Number((leadStats[0] as any)[0].leadsLast24h),
        },
        installers: {
          total: Number((installerStats[0] as any)[0].totalInstallers),
          verified: Number((installerStats[0] as any)[0].verifiedInstallers),
          active: Number((installerStats[0] as any)[0].activeInstallers),
          newLast24h: Number((installerStats[0] as any)[0].newInstallersLast24h),
        },
        revenue: {
          totalTransactions: Number((revenueStats[0] as any)[0].totalTransactions),
          totalRevenue: Number((revenueStats[0] as any)[0].totalRevenue),
          avgTransactionValue: Number((revenueStats[0] as any)[0].avgTransactionValue),
          last24h: Number((revenueStats[0] as any)[0].revenueLast24h),
        },
        stateDistribution: (stateDistribution[0] as any).map((row: any) => ({
          state: row.state,
          count: Number(row.count),
        })),
      };
    }),

  /**
   * Get detailed lead list with filters
   */
  getLeads: publicProcedure
    .input(z.object({
      apiKey: z.string(),
      limit: z.number().min(1).max(1000).optional().default(100),
      offset: z.number().min(0).optional().default(0),
      state: z.string().optional(),
      isPurchased: z.boolean().optional(),
      minQuality: z.number().min(0).max(100).optional(),
    }))
    .query(async ({ input }) => {
      if (input.apiKey !== process.env.VIBA_API_KEY) {
        throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Invalid API key' });
      }

      const db = await getDb();
      if (!db) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database unavailable' });
      }

      let filters = 'WHERE isActive = 1';
      if (input.state) filters += ` AND state = '${input.state}'`;
      if (input.isPurchased !== undefined) filters += ` AND isPurchased = ${input.isPurchased ? 1 : 0}`;
      if (input.minQuality) filters += ` AND qualityScore >= ${input.minQuality}`;

      const leads = await db.execute(sql.raw(`
        SELECT 
          id, customerName as name, customerEmail as email, customerPhone as phone, 
          address, suburb, state, postcode,
          propertyType, roofType, estimatedSystemSize, monthlyBill,
          qualityScore, isPurchased, createdAt
        FROM leads
        ${filters}
        ORDER BY createdAt DESC
        LIMIT ${input.limit} OFFSET ${input.offset}
      `));

      const total = await db.execute(sql.raw(`
        SELECT COUNT(*) as count FROM leads ${filters}
      `));

      return {
        leads: leads[0],
        total: Number((total[0] as any)[0].count),
        limit: input.limit,
        offset: input.offset,
      };
    }),

  /**
   * Get transaction history
   */
  getTransactions: publicProcedure
    .input(z.object({
      apiKey: z.string(),
      limit: z.number().min(1).max(1000).optional().default(100),
      offset: z.number().min(0).optional().default(0),
      status: z.enum(['pending', 'completed', 'failed', 'refunded']).optional(),
    }))
    .query(async ({ input }) => {
      if (input.apiKey !== process.env.VIBA_API_KEY) {
        throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Invalid API key' });
      }

      const db = await getDb();
      if (!db) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database unavailable' });
      }

      let filters = 'WHERE 1=1';
      if (input.status) filters += ` AND t.status = '${input.status}'`;

      const transactions = await db.execute(sql.raw(`
        SELECT 
          t.id, t.installerId, t.leadId, t.amount, t.status, 
          t.stripePaymentIntentId, t.createdAt,
          i.companyName as installerName,
          l.customerName as leadName, l.suburb, l.state
        FROM transactions t
        LEFT JOIN installers i ON t.installerId = i.id
        LEFT JOIN leads l ON t.leadId = l.id
        ${filters}
        ORDER BY t.createdAt DESC
        LIMIT ${input.limit} OFFSET ${input.offset}
      `));

      const totalFilters = filters.replace('WHERE 1=1', 'WHERE 1=1');
      const total = await db.execute(sql.raw(`
        SELECT COUNT(*) as count FROM transactions t ${totalFilters}
      `));

      return {
        transactions: transactions[0],
        total: Number((total[0] as any)[0].count),
        limit: input.limit,
        offset: input.offset,
      };
    }),

  /**
   * Get revenue analytics with time series data
   */
  getRevenueAnalytics: publicProcedure
    .input(z.object({
      apiKey: z.string(),
      groupBy: z.enum(['day', 'week', 'month']).optional().default('day'),
      days: z.number().min(1).max(365).optional().default(30),
    }))
    .query(async ({ input }) => {
      if (input.apiKey !== process.env.VIBA_API_KEY) {
        throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Invalid API key' });
      }

      const db = await getDb();
      if (!db) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database unavailable' });
      }

      let dateFormat = '%Y-%m-%d';
      if (input.groupBy === 'week') dateFormat = '%Y-%U';
      if (input.groupBy === 'month') dateFormat = '%Y-%m';

      const timeSeries = await db.execute(sql.raw(`
        SELECT 
          DATE_FORMAT(createdAt, '${dateFormat}') as period,
          COUNT(*) as transactionCount,
          COALESCE(SUM(amount), 0) as revenue
        FROM transactions
        WHERE status = 'completed'
          AND createdAt >= DATE_SUB(NOW(), INTERVAL ${input.days} DAY)
        GROUP BY period
        ORDER BY period ASC
      `));

      return {
        groupBy: input.groupBy,
        days: input.days,
        timeSeries: timeSeries[0],
      };
    }),

  /**
   * Get system health status
   */
  getSystemHealth: publicProcedure
    .input(z.object({
      apiKey: z.string(),
    }))
    .query(async ({ input }) => {
      if (input.apiKey !== process.env.VIBA_API_KEY) {
        throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Invalid API key' });
      }

      const db = await getDb();
      if (!db) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database unavailable' });
      }

      // Check autonomous systems status
      const autonomousStatus = await db.execute(sql.raw(`
        SELECT 
          (SELECT COUNT(*) FROM leads WHERE createdAt >= DATE_SUB(NOW(), INTERVAL 4 HOUR)) as recentLeads,
          (SELECT COUNT(*) FROM installers WHERE createdAt >= DATE_SUB(NOW(), INTERVAL 24 HOUR)) as recentInstallers
      `));

      return {
        status: 'operational' as const,
        timestamp: new Date().toISOString(),
        database: 'connected' as const,
        autonomousSystems: {
          leadGeneration: Number((autonomousStatus[0] as any)[0].recentLeads) > 0 ? 'active' as const : 'idle' as const,
          installerRecruitment: Number((autonomousStatus[0] as any)[0].recentInstallers) > 0 ? 'active' as const : 'idle' as const,
        },
        uptime: process.uptime(),
      };
    }),
});
