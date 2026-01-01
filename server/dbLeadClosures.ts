import { desc, eq, sql } from "drizzle-orm";
import { getDb } from "./db";
import { InsertLeadClosure, leadClosures, leads, transactions, installers } from "../drizzle/schema";

/**
 * Report a lead closure (successful sale)
 */
export async function createLeadClosure(closure: InsertLeadClosure) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const [result] = await db.insert(leadClosures).values(closure);
  return result.insertId;
}

/**
 * Get all lead closures for an installer
 */
export async function getInstallerClosures(installerId: number) {
  const db = await getDb();
  if (!db) return [];

  const results = await db
    .select({
      id: leadClosures.id,
      leadId: leadClosures.leadId,
      closedDate: leadClosures.closedDate,
      contractValue: leadClosures.contractValue,
      performanceBonus: leadClosures.performanceBonus,
      bonusPaid: leadClosures.bonusPaid,
      // Lead details
      customerName: leads.customerName,
      address: leads.address,
      suburb: leads.suburb,
      state: leads.state,
      // Transaction details
      leadPrice: transactions.amount,
    })
    .from(leadClosures)
    .leftJoin(leads, eq(leadClosures.leadId, leads.id))
    .leftJoin(transactions, eq(leadClosures.transactionId, transactions.id))
    .where(eq(leadClosures.installerId, installerId))
    .orderBy(desc(leadClosures.closedDate));

  return results;
}

/**
 * Get all lead closures (admin view)
 */
export async function getAllClosures() {
  const db = await getDb();
  if (!db) return [];

  const results = await db
    .select({
      id: leadClosures.id,
      leadId: leadClosures.leadId,
      installerId: leadClosures.installerId,
      closedDate: leadClosures.closedDate,
      contractValue: leadClosures.contractValue,
      performanceBonus: leadClosures.performanceBonus,
      bonusPaid: leadClosures.bonusPaid,
      // Lead details
      customerName: leads.customerName,
      address: leads.address,
      suburb: leads.suburb,
      state: leads.state,
      // Installer details
      companyName: installers.companyName,
      // Transaction details
      leadPrice: transactions.amount,
    })
    .from(leadClosures)
    .leftJoin(leads, eq(leadClosures.leadId, leads.id))
    .leftJoin(installers, eq(leadClosures.installerId, installers.id))
    .leftJoin(transactions, eq(leadClosures.transactionId, transactions.id))
    .orderBy(desc(leadClosures.closedDate));

  return results;
}

/**
 * Get installer performance statistics
 */
export async function getInstallerPerformance(installerId: number) {
  const db = await getDb();
  if (!db) return null;

  // Get total leads purchased
  const [leadsResult] = await db
    .select({
      totalLeads: sql<number>`COUNT(DISTINCT ${transactions.leadId})`,
      totalSpent: sql<number>`SUM(${transactions.amount})`,
    })
    .from(transactions)
    .where(eq(transactions.installerId, installerId));

  // Get total closures
  const [closuresResult] = await db
    .select({
      totalClosures: sql<number>`COUNT(*)`,
      totalRevenue: sql<number>`SUM(${leadClosures.contractValue})`,
      totalBonusEarned: sql<number>`SUM(${leadClosures.performanceBonus})`,
    })
    .from(leadClosures)
    .where(eq(leadClosures.installerId, installerId));

  const totalLeads = Number(leadsResult?.totalLeads || 0);
  const totalClosures = Number(closuresResult?.totalClosures || 0);
  const totalSpent = Number(leadsResult?.totalSpent || 0);
  const totalRevenue = Number(closuresResult?.totalRevenue || 0);
  const totalBonusEarned = Number(closuresResult?.totalBonusEarned || 0);

  const conversionRate = totalLeads > 0 ? (totalClosures / totalLeads) * 100 : 0;
  const roi = totalSpent > 0 ? ((totalRevenue - totalSpent) / totalSpent) * 100 : 0;

  return {
    totalLeads,
    totalClosures,
    totalSpent,
    totalRevenue,
    totalBonusEarned,
    conversionRate,
    roi,
  };
}

/**
 * Get top performing installers (leaderboard)
 */
export async function getInstallerLeaderboard(limit: number = 10) {
  const db = await getDb();
  if (!db) return [];

  const results = await db
    .select({
      installerId: leadClosures.installerId,
      companyName: installers.companyName,
      totalClosures: sql<number>`COUNT(*)`,
      totalRevenue: sql<number>`SUM(${leadClosures.contractValue})`,
      avgContractValue: sql<number>`AVG(${leadClosures.contractValue})`,
    })
    .from(leadClosures)
    .leftJoin(installers, eq(leadClosures.installerId, installers.id))
    .groupBy(leadClosures.installerId, installers.companyName)
    .orderBy(desc(sql<number>`COUNT(*)`))
    .limit(limit);

  return results.map((r) => ({
    ...r,
    totalClosures: Number(r.totalClosures),
    totalRevenue: Number(r.totalRevenue),
    avgContractValue: Number(r.avgContractValue),
  }));
}

/**
 * Mark performance bonus as paid
 */
export async function markBonusPaid(closureId: number, stripePaymentId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(leadClosures)
    .set({
      bonusPaid: true,
      stripeBonusPaymentId: stripePaymentId,
    })
    .where(eq(leadClosures.id, closureId));
}
