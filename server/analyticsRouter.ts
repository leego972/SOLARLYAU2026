/**
 * Analytics Router
 * Provides ROI and performance analytics for installers
 */

import { router, protectedProcedure } from './_core/trpc';
import { TRPCError } from '@trpc/server';
import { getInstallerAnalytics, getInstallerLeaderboard } from './installerAnalytics';
import { getDb } from './db';
import { sql } from 'drizzle-orm';

export const analyticsRouter = router({
  /**
   * Get analytics for the current installer
   */
  myAnalytics: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Database not available',
      });
    }

    // Get installer ID from user
    const installer = await db.execute(sql`
      SELECT id FROM installers WHERE email = ${ctx.user.email} LIMIT 1
    `);

    const installerData = (installer[0] as unknown as any[])[0];
    if (!installerData) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Installer profile not found',
      });
    }

    const analytics = await getInstallerAnalytics(installerData.id);
    return analytics;
  }),

  /**
   * Get leaderboard (top performing installers)
   * Admin only
   */
  leaderboard: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role !== 'admin') {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'Only admin can view leaderboard',
      });
    }

    const leaderboard = await getInstallerLeaderboard(10);
    return leaderboard;
  }),
});
