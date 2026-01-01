import { eq, and, gte, lte, desc, asc, sql, inArray } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  users,
  installers,
  InsertInstaller,
  Installer,
  leads,
  InsertLead,
  Lead,
  leadOffers,
  InsertLeadOffer,
  LeadOffer,
  transactions,
  InsertTransaction,
  Transaction,
  agentActivities,
  InsertAgentActivity,
  AgentActivity,
  systemConfig,
  InsertSystemConfig,
  SystemConfig,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ============ USER FUNCTIONS ============

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db
    .select()
    .from(users)
    .where(eq(users.openId, openId))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ============ INSTALLER FUNCTIONS ============

export async function createInstaller(data: InsertInstaller): Promise<Installer> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(installers).values(data);
  const insertedId = Number(result[0].insertId);

  const inserted = await db
    .select()
    .from(installers)
    .where(eq(installers.id, insertedId))
    .limit(1);

  if (!inserted[0]) throw new Error("Failed to retrieve inserted installer");
  return inserted[0];
}

export async function getInstallerById(id: number): Promise<Installer | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(installers).where(eq(installers.id, id)).limit(1);
  return result[0];
}

export async function getInstallerByEmail(email: string): Promise<Installer | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(installers).where(eq(installers.email, email)).limit(1);
  return result[0];
}

export async function getAllInstallers(): Promise<Installer[]> {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(installers).orderBy(desc(installers.createdAt));
}

export async function getActiveInstallers(): Promise<Installer[]> {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(installers)
    .where(and(eq(installers.isActive, true), eq(installers.isVerified, true)))
    .orderBy(desc(installers.createdAt));
}

export async function updateInstaller(id: number, data: Partial<InsertInstaller>): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(installers).set(data).where(eq(installers.id, id));
}

export async function getInstallersByState(state: string): Promise<Installer[]> {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(installers)
    .where(and(eq(installers.state, state), eq(installers.isActive, true)))
    .orderBy(desc(installers.createdAt));
}

// ============ LEAD FUNCTIONS ============

export async function createLead(data: InsertLead): Promise<Lead> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(leads).values(data);
  const insertedId = Number(result[0].insertId);

  const inserted = await db.select().from(leads).where(eq(leads.id, insertedId)).limit(1);

  if (!inserted[0]) throw new Error("Failed to retrieve inserted lead");
  return inserted[0];
}

export async function getLeadById(id: number): Promise<Lead | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(leads).where(eq(leads.id, id)).limit(1);
  return result[0];
}

export async function getAllLeads(limit = 100): Promise<Lead[]> {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(leads).orderBy(desc(leads.createdAt)).limit(limit);
}

export async function getLeadsByStatus(status: Lead["status"]): Promise<Lead[]> {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(leads).where(eq(leads.status, status)).orderBy(desc(leads.createdAt));
}

export async function updateLead(id: number, data: Partial<InsertLead>): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(leads).set(data).where(eq(leads.id, id));
}

export async function getLeadsByPostcode(postcode: string): Promise<Lead[]> {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(leads).where(eq(leads.postcode, postcode)).orderBy(desc(leads.createdAt));
}

export async function getNewLeads(): Promise<Lead[]> {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(leads)
    .where(eq(leads.status, "new"))
    .orderBy(desc(leads.qualityScore), desc(leads.createdAt));
}

// ============ LEAD OFFER FUNCTIONS ============

export async function createLeadOffer(data: InsertLeadOffer): Promise<LeadOffer> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(leadOffers).values(data);
  const insertedId = Number(result[0].insertId);

  const inserted = await db.select().from(leadOffers).where(eq(leadOffers.id, insertedId)).limit(1);

  if (!inserted[0]) throw new Error("Failed to retrieve inserted lead offer");
  return inserted[0];
}

export async function getLeadOfferById(id: number): Promise<LeadOffer | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(leadOffers).where(eq(leadOffers.id, id)).limit(1);
  return result[0];
}

export async function getOffersByLeadId(leadId: number): Promise<LeadOffer[]> {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(leadOffers)
    .where(eq(leadOffers.leadId, leadId))
    .orderBy(desc(leadOffers.sentAt));
}

export async function getOffersByInstallerId(installerId: number): Promise<LeadOffer[]> {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(leadOffers)
    .where(eq(leadOffers.installerId, installerId))
    .orderBy(desc(leadOffers.sentAt));
}

export async function getPendingOffers(): Promise<LeadOffer[]> {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(leadOffers)
    .where(and(eq(leadOffers.status, "pending"), gte(leadOffers.expiresAt, new Date())))
    .orderBy(asc(leadOffers.expiresAt));
}

export async function updateLeadOffer(id: number, data: Partial<InsertLeadOffer>): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(leadOffers).set(data).where(eq(leadOffers.id, id));
}

export async function getExpiredOffers(): Promise<LeadOffer[]> {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(leadOffers)
    .where(and(eq(leadOffers.status, "pending"), lte(leadOffers.expiresAt, new Date())))
    .orderBy(desc(leadOffers.expiresAt));
}

// ============ TRANSACTION FUNCTIONS ============

export async function createTransaction(data: InsertTransaction): Promise<Transaction> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(transactions).values(data);
  const insertedId = Number(result[0].insertId);

  const inserted = await db.select().from(transactions).where(eq(transactions.id, insertedId)).limit(1);

  if (!inserted[0]) throw new Error("Failed to retrieve inserted transaction");
  return inserted[0];
}

export async function getTransactionById(id: number): Promise<Transaction | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(transactions).where(eq(transactions.id, id)).limit(1);
  return result[0];
}

export async function getTransactionsByInstallerId(installerId: number): Promise<Transaction[]> {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(transactions)
    .where(eq(transactions.installerId, installerId))
    .orderBy(desc(transactions.createdAt));
}

export async function getAllTransactions(limit = 100): Promise<Transaction[]> {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(transactions).orderBy(desc(transactions.createdAt)).limit(limit);
}

export async function updateTransaction(id: number, data: Partial<InsertTransaction>): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(transactions).set(data).where(eq(transactions.id, id));
}

export async function getSuccessfulTransactions(): Promise<Transaction[]> {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(transactions)
    .where(eq(transactions.status, "succeeded"))
    .orderBy(desc(transactions.paidAt));
}

export async function getTotalRevenue(): Promise<number> {
  const db = await getDb();
  if (!db) return 0;

  const result = await db
    .select({ total: sql<number>`SUM(${transactions.amount})` })
    .from(transactions)
    .where(eq(transactions.status, "succeeded"));

  return result[0]?.total || 0;
}

// ============ AGENT ACTIVITY FUNCTIONS ============

export async function createAgentActivity(data: InsertAgentActivity): Promise<AgentActivity> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(agentActivities).values(data);
  const insertedId = Number(result[0].insertId);

  const inserted = await db
    .select()
    .from(agentActivities)
    .where(eq(agentActivities.id, insertedId))
    .limit(1);

  if (!inserted[0]) throw new Error("Failed to retrieve inserted agent activity");
  return inserted[0];
}

export async function getRecentAgentActivities(limit = 50): Promise<AgentActivity[]> {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(agentActivities).orderBy(desc(agentActivities.startedAt)).limit(limit);
}

export async function getAgentActivitiesByType(
  activityType: AgentActivity["activityType"]
): Promise<AgentActivity[]> {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(agentActivities)
    .where(eq(agentActivities.activityType, activityType))
    .orderBy(desc(agentActivities.startedAt));
}

// ============ SYSTEM CONFIG FUNCTIONS ============

export async function getSystemConfig(key: string): Promise<SystemConfig | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(systemConfig).where(eq(systemConfig.key, key)).limit(1);
  return result[0];
}

export async function setSystemConfig(key: string, value: string, description?: string): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .insert(systemConfig)
    .values({ key, value, description })
    .onDuplicateKeyUpdate({
      set: { value, description, updatedAt: new Date() },
    });
}

export async function getAllSystemConfigs(): Promise<SystemConfig[]> {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(systemConfig).orderBy(asc(systemConfig.key));
}

// ============ ANALYTICS FUNCTIONS ============

export async function getLeadStats() {
  const db = await getDb();
  if (!db) return null;

  const [totalLeads] = await db.select({ count: sql<number>`COUNT(*)` }).from(leads);

  const [newLeads] = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(leads)
    .where(eq(leads.status, "new"));

  const [soldLeads] = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(leads)
    .where(eq(leads.status, "sold"));

  const [avgQuality] = await db.select({ avg: sql<number>`AVG(${leads.qualityScore})` }).from(leads);

  return {
    total: totalLeads?.count || 0,
    new: newLeads?.count || 0,
    sold: soldLeads?.count || 0,
    averageQuality: Math.round(avgQuality?.avg || 0),
  };
}

export async function getInstallerStats() {
  const db = await getDb();
  if (!db) return null;

  const [total] = await db.select({ count: sql<number>`COUNT(*)` }).from(installers);

  const [active] = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(installers)
    .where(eq(installers.isActive, true));

  const [verified] = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(installers)
    .where(eq(installers.isVerified, true));

  return {
    total: total?.count || 0,
    active: active?.count || 0,
    verified: verified?.count || 0,
  };
}

export async function getRevenueStats() {
  const db = await getDb();
  if (!db) return null;

  const totalRevenue = await getTotalRevenue();

  const [thisMonth] = await db
    .select({ total: sql<number>`SUM(${transactions.amount})` })
    .from(transactions)
    .where(
      and(
        eq(transactions.status, "succeeded"),
        gte(transactions.paidAt, sql`DATE_SUB(NOW(), INTERVAL 30 DAY)`)
      )
    );

  const [transactionCount] = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(transactions)
    .where(eq(transactions.status, "succeeded"));

  return {
    totalRevenue: totalRevenue / 100, // Convert from cents to dollars
    monthlyRevenue: (thisMonth?.total || 0) / 100,
    transactionCount: transactionCount?.count || 0,
  };
}

// ============ EMAIL LEAD CAPTURE ============

export async function captureEmailLead(data: { email: string; name: string; source?: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const { emailLeads } = await import("../drizzle/schema");

  await db.insert(emailLeads).values({
    email: data.email,
    name: data.name,
    source: data.source || "popup",
    guideDownloaded: true,
  });

  // Generate and send PDF guide
  try {
    const { generateSolarLeadGuide } = await import("./pdfGuideGenerator");
    const pdfUrl = await generateSolarLeadGuide();
    
    // Send email with PDF link
    await sendGuideEmail(data.email, data.name, pdfUrl);
    
    return { success: true, message: "Guide sent to your email!", pdfUrl };
  } catch (error) {
    console.error("[EmailCapture] Error sending guide:", error);
    // Still return success to user, log error for admin
    return { success: true, message: "Guide will be sent shortly!" };
  }
}

// ============ REFERRAL TRACKING ============

export async function getReferralStats(userId: number) {
  const db = await getDb();
  if (!db) return null;

  const installer = await getInstallerByUserId(userId);
  if (!installer) return null;

  const { referrals } = await import("../drizzle/schema");

  const allReferrals = await db
    .select()
    .from(referrals)
    .where(eq(referrals.referrerId, installer.id));

  const pendingCount = allReferrals.filter((r) => r.status === "pending").length;
  const paidCount = allReferrals.filter((r) => r.status === "paid").length;
  const totalEarned = allReferrals
    .filter((r) => r.status === "paid")
    .reduce((sum, r) => sum + r.commissionAmount, 0);

  return {
    totalReferrals: allReferrals.length,
    pendingReferrals: pendingCount,
    paidReferrals: paidCount,
    totalEarned: totalEarned / 100, // Convert cents to dollars
    referrals: allReferrals,
  };
}

export async function getInstallerByUserId(userId: number) {
  const db = await getDb();
  if (!db) return null;

  const user = await getUserById(userId);
  if (!user) return null;

  const result = await db.select().from(installers).where(eq(installers.email, user.email!)).limit(1);

  return result.length > 0 ? result[0] : null;
}

export async function getUserById(userId: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select().from(users).where(eq(users.id, userId)).limit(1);

  return result.length > 0 ? result[0] : null;
}

/**
 * Send email with Solar Lead Generation Guide
 */
async function sendGuideEmail(email: string, name: string, pdfUrl: string): Promise<void> {
  const { sendGuideEmail: sendEmail } = await import("./emailService");
  const result = await sendEmail(email, name, pdfUrl);
  
  if (!result.success) {
    console.error(`[EmailCapture] Failed to send guide: ${result.error}`);
    // Don't throw - we still want to record the lead even if email fails
  }
}
