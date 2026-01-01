import { router, publicProcedure } from "./_core/trpc";
import { z } from "zod";
import { recordEmailOpen, recordEmailClick, getWarmLeads, getEmailStats } from "./emailTracking";

export const trackingRouter = router({
  // Get warm leads (opened but didn't convert)
  warmLeads: publicProcedure.query(async () => {
    return await getWarmLeads();
  }),

  // Get email tracking stats
  emailStats: publicProcedure.query(async () => {
    return await getEmailStats();
  }),

  // Record email open (called by tracking pixel)
  recordOpen: publicProcedure
    .input(z.object({
      token: z.string(),
      ipAddress: z.string().optional(),
      userAgent: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const success = await recordEmailOpen({
        trackingToken: input.token,
        ipAddress: input.ipAddress,
        userAgent: input.userAgent,
      });
      return { success };
    }),

  // Record email click
  recordClick: publicProcedure
    .input(z.object({
      token: z.string(),
    }))
    .mutation(async ({ input }) => {
      const success = await recordEmailClick(input.token);
      return { success };
    }),

  // Get recent purchases for social proof
  recentPurchases: publicProcedure.query(async () => {
    const { getDb } = await import('./db');
    const db = await getDb();
    if (!db) return [];

    try {
      const [rows] = await db.execute(
        `SELECT id, installer_name as installerName, location, lead_count as leadCount, created_at as createdAt
         FROM purchase_activity
         ORDER BY created_at DESC
         LIMIT 20`
      );
      return rows as unknown as any[];
    } catch (error) {
      console.error('[Tracking] Failed to get recent purchases:', error);
      return [];
    }
  }),
});
