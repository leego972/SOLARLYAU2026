/**
 * Installer Analytics Service
 * Tracks ROI, conversion rates, and performance metrics for installers
 */

import { getDb } from './db';
import { sql } from 'drizzle-orm';

export interface InstallerAnalytics {
  // Purchase stats
  totalLeadsPurchased: number;
  totalSpent: number;
  averageLeadPrice: number;
  
  // Conversion stats
  leadsConverted: number;
  conversionRate: number;
  totalRevenue: number;
  
  // ROI metrics
  roi: number;
  profitMargin: number;
  averageRevenuePerLead: number;
  
  // Recent activity
  lastPurchaseDate: Date | null;
  purchasesThisMonth: number;
  spentThisMonth: number;
}

/**
 * Get analytics for a specific installer
 */
export async function getInstallerAnalytics(installerId: number): Promise<InstallerAnalytics> {
  const db = await getDb();
  if (!db) {
    throw new Error('Database not available');
  }

  // Get purchase stats
  const purchaseStats = await db.execute(sql`
    SELECT 
      COUNT(*) as totalLeads,
      SUM(price) as totalSpent,
      AVG(price) as avgPrice,
      MAX(purchasedAt) as lastPurchase
    FROM leadOffers
    WHERE installerId = ${installerId}
    AND status = 'accepted'
  `);

  const stats = (purchaseStats[0] as unknown as any[])[0];
  const totalLeadsPurchased = Number(stats?.totalLeads || 0);
  const totalSpent = Number(stats?.totalSpent || 0);
  const averageLeadPrice = Number(stats?.avgPrice || 0);
  const lastPurchaseDate = stats?.lastPurchase ? new Date(stats.lastPurchase) : null;

  // Get this month's purchases
  const monthStats = await db.execute(sql`
    SELECT 
      COUNT(*) as count,
      SUM(price) as spent
    FROM leadOffers
    WHERE installerId = ${installerId}
    AND status = 'accepted'
    AND MONTH(purchasedAt) = MONTH(NOW())
    AND YEAR(purchasedAt) = YEAR(NOW())
  `);

  const monthData = (monthStats[0] as unknown as any[])[0];
  const purchasesThisMonth = Number(monthData?.count || 0);
  const spentThisMonth = Number(monthData?.spent || 0);

  // Get conversion stats (from lead closures)
  const conversionStats = await db.execute(sql`
    SELECT 
      COUNT(*) as converted,
      SUM(contractValue) as revenue
    FROM leadClosures lc
    JOIN leadOffers lo ON lc.leadId = lo.leadId
    WHERE lo.installerId = ${installerId}
    AND lo.status = 'accepted'
    AND lc.status = 'won'
  `);

  const convData = (conversionStats[0] as unknown as any[])[0];
  const leadsConverted = Number(convData?.converted || 0);
  const totalRevenue = Number(convData?.revenue || 0);

  // Calculate metrics
  const conversionRate = totalLeadsPurchased > 0 
    ? (leadsConverted / totalLeadsPurchased) * 100 
    : 0;

  const roi = totalSpent > 0 
    ? ((totalRevenue - totalSpent) / totalSpent) * 100 
    : 0;

  const profitMargin = totalRevenue > 0 
    ? ((totalRevenue - totalSpent) / totalRevenue) * 100 
    : 0;

  const averageRevenuePerLead = leadsConverted > 0 
    ? totalRevenue / leadsConverted 
    : 0;

  return {
    totalLeadsPurchased,
    totalSpent,
    averageLeadPrice,
    leadsConverted,
    conversionRate,
    totalRevenue,
    roi,
    profitMargin,
    averageRevenuePerLead,
    lastPurchaseDate,
    purchasesThisMonth,
    spentThisMonth,
  };
}

/**
 * Get leaderboard of top performing installers
 */
export async function getInstallerLeaderboard(limit: number = 10): Promise<any[]> {
  const db = await getDb();
  if (!db) {
    return [];
  }

  const leaderboard = await db.execute(sql`
    SELECT 
      i.id,
      i.companyName,
      i.state,
      COUNT(DISTINCT lo.id) as totalPurchases,
      SUM(lo.price) as totalSpent,
      COUNT(DISTINCT lc.id) as conversions,
      SUM(lc.contractValue) as revenue,
      CASE 
        WHEN SUM(lo.price) > 0 
        THEN ROUND(((SUM(lc.contractValue) - SUM(lo.price)) / SUM(lo.price)) * 100, 2)
        ELSE 0 
      END as roi
    FROM installers i
    LEFT JOIN leadOffers lo ON i.id = lo.installerId AND lo.status = 'accepted'
    LEFT JOIN leadClosures lc ON lo.leadId = lc.leadId AND lc.status = 'won'
    WHERE i.isVerified = 1
    GROUP BY i.id, i.companyName, i.state
    HAVING totalPurchases > 0
    ORDER BY roi DESC, revenue DESC
    LIMIT ${limit}
  `);

  return leaderboard[0] as unknown as any[];
}
