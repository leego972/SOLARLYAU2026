import { describe, expect, it, beforeAll } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import * as db from './db';

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAdminContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-admin",
    email: "admin@test.com",
    name: "Test Admin",
    loginMethod: "manus",
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

describe("Solar Lead AI System Tests", () => {
  let ctx: TrpcContext;
  let caller: ReturnType<typeof appRouter.createCaller>;

  beforeAll(() => {
    ctx = createAdminContext();
    caller = appRouter.createCaller(ctx);
  });

  describe("Analytics Dashboard", () => {
    it("should return dashboard analytics", async () => {
      const result = await caller.analytics.dashboard();

      expect(result).toBeDefined();
      expect(result).toHaveProperty("leads");
      expect(result).toHaveProperty("installers");
      expect(result).toHaveProperty("revenue");
    });

    it("should return revenue stats", async () => {
      const result = await caller.analytics.revenue();

      expect(result).toBeDefined();
      expect(result).toHaveProperty("totalRevenue");
      expect(result).toHaveProperty("monthlyRevenue");
      expect(result).toHaveProperty("transactionCount");
    });
  });

  describe("Lead Management", () => {
    it("should create a new lead", async () => {
      const leadData = {
        source: "manual" as const,
        customerName: "Test Customer",
        customerPhone: "0412 345 678",
        customerEmail: "test@example.com",
        address: "123 Test Street",
        suburb: "Brisbane",
        state: "QLD",
        postcode: "4000",
        propertyType: "residential" as const,
        qualityScore: 75,
        basePrice: 50,
      };

      const result = await caller.leads.create(leadData);

      expect(result).toBeDefined();
      expect(result.customerName).toBe(leadData.customerName);
      expect(result.status).toBe("new");
    });

    it("should retrieve all leads", async () => {
      const result = await caller.leads.getAll({ limit: 10 });

      expect(Array.isArray(result)).toBe(true);
    });

    it("should get new leads", async () => {
      const result = await caller.leads.getNew();

      expect(Array.isArray(result)).toBe(true);
      result.forEach((lead) => {
        expect(lead.status).toBe("new");
      });
    });

    it("should get lead stats", async () => {
      const result = await caller.leads.getStats();

      expect(result).toBeDefined();
      expect(result).toHaveProperty("total");
      expect(result).toHaveProperty("new");
      expect(result).toHaveProperty("sold");
      expect(result).toHaveProperty("averageQuality");
    });
  });

  describe("Installer Management", () => {
    it("should create a new installer", async () => {
      const installerData = {
        companyName: "Test Solar Co",
        contactName: "John Doe",
        email: `test-${Date.now()}@example.com`,
        phone: "0412 345 678",
        state: "QLD",
        servicePostcodes: JSON.stringify(["4000", "4001", "4002"]),
        serviceRadius: 50,
        suburb: "Brisbane",
        postcode: "4000",
        maxLeadsPerMonth: 20,
        maxLeadPrice: 60,
        autoAcceptLeads: false,
      };

      const result = await caller.installers.create(installerData);

      expect(result).toBeDefined();
      expect(result.companyName).toBe(installerData.companyName);
      expect(result.isActive).toBe(true);
    });

    it("should get all installers", async () => {
      const result = await caller.installers.getAll();

      expect(Array.isArray(result)).toBe(true);
    });

    it("should get active installers", async () => {
      const result = await caller.installers.getActive();

      expect(Array.isArray(result)).toBe(true);
      result.forEach((installer) => {
        expect(installer.isActive).toBe(true);
        expect(installer.isVerified).toBe(true);
      });
    });

    it("should get installer stats", async () => {
      const result = await caller.installers.getStats();

      expect(result).toBeDefined();
      expect(result).toHaveProperty("total");
      expect(result).toHaveProperty("active");
      expect(result).toHaveProperty("verified");
    });
  });

  describe("Lead Offer System", () => {
    it("should get pending offers", async () => {
      const result = await caller.offers.getPending();

      expect(Array.isArray(result)).toBe(true);
    });

    it("should get expired offers", async () => {
      const result = await caller.offers.getExpired();

      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe("Transaction Management", () => {
    it("should get all transactions", async () => {
      const result = await caller.transactions.getAll({ limit: 10 });

      expect(Array.isArray(result)).toBe(true);
    });

    it("should get successful transactions", async () => {
      const result = await caller.transactions.getSuccessful();

      expect(Array.isArray(result)).toBe(true);
      result.forEach((transaction) => {
        expect(transaction.status).toBe("succeeded");
      });
    });
  });

  describe("AI Agent Activity", () => {
    it("should log agent activity", async () => {
      const activityData = {
        activityType: "lead_generation" as const,
        description: "Test AI activity",
        status: "success" as const,
        leadsGenerated: 5,
        leadsQualified: 3,
        offersCreated: 2,
        startedAt: new Date(),
        completedAt: new Date(),
      };

      const result = await caller.agent.logActivity(activityData);

      expect(result).toBeDefined();
      expect(result.description).toBe(activityData.description);
    });

    it("should get recent activities", async () => {
      const result = await caller.agent.getRecentActivities({ limit: 10 });

      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe("System Configuration", () => {
    it("should set system config", async () => {
      const result = await caller.config.set({
        key: "test_config",
        value: "test_value",
        description: "Test configuration",
      });

      expect(result.success).toBe(true);
    });

    it("should get system config", async () => {
      await caller.config.set({
        key: "test_key",
        value: "test_value",
      });

      const result = await caller.config.get({ key: "test_key" });

      expect(result).toBeDefined();
      expect(result?.value).toBe("test_value");
    });

    it("should get all configs", async () => {
      const result = await caller.config.getAll();

      expect(Array.isArray(result)).toBe(true);
    });
  });
});
