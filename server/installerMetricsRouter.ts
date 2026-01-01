import { z } from "zod";
import { router, publicProcedure, protectedProcedure, adminProcedure } from "./_core/trpc";
import { getDb } from "./db";
import { installerMetrics, conversionEvents, installers } from "../drizzle/schema";
import { eq, desc, and, sql } from "drizzle-orm";

export const installerMetricsRouter = router({
  /**
   * Get public success metrics for social proof
   */
  getPublicMetrics: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];

    const metrics = await db
      .select({
        installerId: installerMetrics.installerId,
        companyName: installers.companyName,
        state: installers.state,
        totalLeadsPurchased: installerMetrics.totalLeadsPurchased,
        totalLeadsConverted: installerMetrics.totalLeadsConverted,
        conversionRate: installerMetrics.conversionRate,
        averageDealSize: installerMetrics.averageDealSize,
        roi: installerMetrics.roi,
        averageTimeToClose: installerMetrics.averageTimeToClose,
      })
      .from(installerMetrics)
      .leftJoin(installers, eq(installerMetrics.installerId, installers.id))
      .where(eq(installerMetrics.isPublic, true))
      .orderBy(desc(installerMetrics.conversionRate))
      .limit(10);

    return metrics;
  }),

  /**
   * Get aggregated platform metrics for homepage
   */
  getPlatformMetrics: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) {
      return {
        totalInstallers: 0,
        totalLeadsSold: 0,
        averageConversionRate: 0,
        averageROI: 0,
        totalRevenue: 0,
      };
    }

    const result = await db
      .select({
        totalInstallers: sql<number>`COUNT(DISTINCT ${installerMetrics.installerId})`,
        totalLeadsSold: sql<number>`SUM(${installerMetrics.totalLeadsPurchased})`,
        averageConversionRate: sql<number>`AVG(${installerMetrics.conversionRate})`,
        averageROI: sql<number>`AVG(${installerMetrics.roi})`,
        totalRevenue: sql<number>`SUM(${installerMetrics.totalRevenue})`,
      })
      .from(installerMetrics);

    return result[0] || {
      totalInstallers: 0,
      totalLeadsSold: 0,
      averageConversionRate: 0,
      averageROI: 0,
      totalRevenue: 0,
    };
  }),

  /**
   * Record a conversion event
   */
  recordConversion: protectedProcedure
    .input(
      z.object({
        leadId: z.number(),
        dealValue: z.number(), // in cents
        systemSize: z.number().optional(),
        includesBattery: z.boolean().default(false),
        customerRating: z.number().min(1).max(5).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

    // Get the installer ID from the lead purchase
    const { leads: leadsTable } = await import("../drizzle/schema");
    const leadResult = await db.select().from(leadsTable).where(eq(leadsTable.id, input.leadId)).limit(1);
    const lead = leadResult[0];

      if (!lead) throw new Error("Lead not found");

    // Get the installer from the transaction
    const { transactions: transactionsTable } = await import("../drizzle/schema");
    const transactionResult = await db.select().from(transactionsTable).where(eq(transactionsTable.leadId, input.leadId)).limit(1);
    const transaction = transactionResult[0];

      if (!transaction) throw new Error("Transaction not found");

      const installerId = transaction.installerId;

      // Calculate hours to close
      const purchaseDate = transaction.createdAt;
      const conversionDate = new Date();
      const hoursToClose = Math.round(
        (conversionDate.getTime() - purchaseDate.getTime()) / (1000 * 60 * 60)
      );

      // Insert conversion event
      await db.insert(conversionEvents).values({
        installerId,
        leadId: input.leadId,
        purchaseDate,
        conversionDate,
        hoursToClose,
        dealValue: input.dealValue,
        systemSize: input.systemSize,
        includesBattery: input.includesBattery,
        leadQualityScore: lead.qualityScore || 0,
        customerRating: input.customerRating,
      });

      // Update installer metrics
      await updateInstallerMetrics(installerId);

      return { success: true };
    }),

  /**
   * Get installer's own metrics
   */
  getMyMetrics: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return null;

    // Get installer ID from user
    const installerResult = await db.select().from(installers).where(eq(installers.email, ctx.user.email || "")).limit(1);
    const installer = installerResult[0];

    if (!installer) return null;

    const metricsResult = await db.select().from(installerMetrics).where(eq(installerMetrics.installerId, installer.id)).limit(1);
    return metricsResult[0] || null;
  }),

  /**
   * Toggle public visibility of metrics
   */
  togglePublicVisibility: protectedProcedure
    .input(z.object({ isPublic: z.boolean() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Get installer ID from user
      const installerResult = await db.select().from(installers).where(eq(installers.email, ctx.user.email || "")).limit(1);
      const installer = installerResult[0];

      if (!installer) throw new Error("Installer not found");

      await db
        .update(installerMetrics)
        .set({ isPublic: input.isPublic })
        .where(eq(installerMetrics.installerId, installer.id));

      return { success: true };
    }),

  /**
   * Admin: Get all metrics
   */
  getAllMetrics: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];

    const metrics = await db
      .select({
        installerId: installerMetrics.installerId,
        companyName: installers.companyName,
        email: installers.email,
        state: installers.state,
        totalLeadsPurchased: installerMetrics.totalLeadsPurchased,
        totalLeadsConverted: installerMetrics.totalLeadsConverted,
        conversionRate: installerMetrics.conversionRate,
        totalSpent: installerMetrics.totalSpent,
        totalRevenue: installerMetrics.totalRevenue,
        averageDealSize: installerMetrics.averageDealSize,
        roi: installerMetrics.roi,
        isPublic: installerMetrics.isPublic,
      })
      .from(installerMetrics)
      .leftJoin(installers, eq(installerMetrics.installerId, installers.id))
      .orderBy(desc(installerMetrics.totalRevenue));

    return metrics;
  }),
});

/**
 * Helper function to recalculate installer metrics
 */
async function updateInstallerMetrics(installerId: number) {
  const db = await getDb();
  if (!db) return;

  // Get all conversion events for this installer
  const events = await db
    .select()
    .from(conversionEvents)
    .where(eq(conversionEvents.installerId, installerId));

  // Get all transactions for this installer
  const { transactions: transactionsTable } = await import("../drizzle/schema");
  const transactions = await db.select().from(transactionsTable).where(eq(transactionsTable.installerId, installerId));

  const totalLeadsPurchased = transactions.length;
  const totalLeadsConverted = events.length;
  const conversionRate = totalLeadsPurchased > 0 
    ? Math.round((totalLeadsConverted / totalLeadsPurchased) * 10000) // percentage * 100
    : 0;

  const totalSpent = transactions.reduce((sum: number, t: any) => sum + (t.amount || 0), 0);
  const totalRevenue = events.reduce((sum, e) => sum + e.dealValue, 0);
  const averageDealSize = totalLeadsConverted > 0 
    ? Math.round(totalRevenue / totalLeadsConverted)
    : 0;
  const roi = totalSpent > 0 
    ? Math.round((totalRevenue / totalSpent) * 100) // ROI * 100
    : 0;

  const averageTimeToClose = events.length > 0
    ? Math.round(events.reduce((sum, e) => sum + (e.hoursToClose || 0), 0) / events.length)
    : 0;

  const fastestClose = events.length > 0
    ? Math.min(...events.map(e => e.hoursToClose || Infinity))
    : 0;

  const averageLeadQuality = events.length > 0
    ? Math.round(events.reduce((sum, e) => sum + e.leadQualityScore, 0) / events.length)
    : 0;

  const customerSatisfaction = events.filter(e => e.customerRating).length > 0
    ? Math.round(
        (events
          .filter(e => e.customerRating)
          .reduce((sum, e) => sum + (e.customerRating || 0), 0) /
          events.filter(e => e.customerRating).length) *
          20
      ) // Convert 1-5 to 0-100
    : 0;

  // Upsert metrics
  const existing = await db.select().from(installerMetrics).where(eq(installerMetrics.installerId, installerId)).limit(1);
  const existingMetric = existing[0];

  if (existingMetric) {
    await db
      .update(installerMetrics)
      .set({
        totalLeadsPurchased,
        totalLeadsConverted,
        conversionRate,
        totalSpent,
        totalRevenue,
        averageDealSize,
        roi,
        averageTimeToClose,
        fastestClose,
        averageLeadQuality,
        customerSatisfaction,
      })
      .where(eq(installerMetrics.installerId, installerId));
  } else {
    await db.insert(installerMetrics).values({
      installerId,
      totalLeadsPurchased,
      totalLeadsConverted,
      conversionRate,
      totalSpent,
      totalRevenue,
      averageDealSize,
      roi,
      averageTimeToClose,
      fastestClose,
      averageLeadQuality,
      customerSatisfaction,
    });
  }
}
