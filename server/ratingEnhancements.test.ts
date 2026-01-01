import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock database
vi.mock("./db", () => ({
  getDb: vi.fn().mockResolvedValue({
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    limit: vi.fn().mockResolvedValue([]),
    insert: vi.fn().mockReturnThis(),
    values: vi.fn().mockResolvedValue({ insertId: 1 }),
    update: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    offset: vi.fn().mockResolvedValue([]),
  }),
}));

// Helper to create admin context
function createAdminContext(): TrpcContext {
  return {
    user: {
      id: 1,
      openId: "admin-user",
      email: "admin@example.com",
      name: "Admin User",
      loginMethod: "manus",
      role: "admin",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

// Helper to create installer context
function createInstallerContext(): TrpcContext {
  return {
    user: {
      id: 2,
      openId: "installer-user",
      email: "installer@example.com",
      name: "Installer User",
      loginMethod: "manus",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

// Helper to create public context
function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

describe("Rating Enhancements", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Installer Response to Ratings", () => {
    it("should have respondToRating endpoint in ratings router", async () => {
      const ctx = createInstallerContext();
      const caller = appRouter.createCaller(ctx);
      
      // The endpoint should exist
      expect(caller.ratings.respondToRating).toBeDefined();
    });

    it("should require authentication for responding to ratings", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);
      
      // Should throw UNAUTHORIZED for unauthenticated users
      await expect(
        caller.ratings.respondToRating({
          ratingId: 1,
          response: "Thank you for your feedback!",
        })
      ).rejects.toThrow();
    });
  });

  describe("Blog Router", () => {
    it("should have getAll endpoint for public blog posts", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);
      
      // The endpoint should exist
      expect(caller.blog.getAll).toBeDefined();
    });

    it("should have getBySlug endpoint for single post", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);
      
      // The endpoint should exist
      expect(caller.blog.getBySlug).toBeDefined();
    });

    it("should have seedPosts endpoint for admin", async () => {
      const ctx = createAdminContext();
      const caller = appRouter.createCaller(ctx);
      
      // The endpoint should exist
      expect(caller.blog.seedPosts).toBeDefined();
    });

    it("should require admin for seeding posts", async () => {
      const ctx = createInstallerContext();
      const caller = appRouter.createCaller(ctx);
      
      // Should throw for non-admin users
      await expect(caller.blog.seedPosts()).rejects.toThrow("Admin access required");
    });
  });

  describe("Lead Tracking Router", () => {
    it("should have lookup endpoint for homeowners", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);
      
      // The endpoint should exist
      expect(caller.leadTracking.lookup).toBeDefined();
    });

    it("should validate email format in lookup", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);
      
      // Should throw for invalid email
      await expect(
        caller.leadTracking.lookup({
          email: "invalid-email",
          phone: "0400000000",
        })
      ).rejects.toThrow();
    });
  });
});

describe("Blog Seed Data", () => {
  it("should export seedBlogPosts function", async () => {
    const { seedBlogPosts } = await import("./blogSeedData");
    expect(seedBlogPosts).toBeDefined();
    expect(typeof seedBlogPosts).toBe("function");
  });

  it("should export blogPostsSeedData array", async () => {
    const { blogPostsSeedData } = await import("./blogSeedData");
    expect(blogPostsSeedData).toBeDefined();
    expect(Array.isArray(blogPostsSeedData)).toBe(true);
    expect(blogPostsSeedData.length).toBeGreaterThanOrEqual(5);
  });

  it("should have valid blog post structure", async () => {
    const { blogPostsSeedData } = await import("./blogSeedData");
    
    for (const post of blogPostsSeedData) {
      expect(post.slug).toBeDefined();
      expect(post.title).toBeDefined();
      expect(post.excerpt).toBeDefined();
      expect(post.content).toBeDefined();
      expect(post.category).toBeDefined();
      expect(post.authorName).toBeDefined();
      expect(post.readingTime).toBeGreaterThan(0);
    }
  });
});

describe("Rating Email Scheduler", () => {
  it("should export processRatingRequests function", async () => {
    const { processRatingRequests } = await import("./ratingEmailScheduler");
    expect(processRatingRequests).toBeDefined();
    expect(typeof processRatingRequests).toBe("function");
  });

  it("should export generateRatingToken function", async () => {
    const { generateRatingToken } = await import("./ratingEmailScheduler");
    expect(generateRatingToken).toBeDefined();
    expect(typeof generateRatingToken).toBe("function");
  });

  it("should generate unique rating tokens", async () => {
    const { generateRatingToken } = await import("./ratingEmailScheduler");
    
    const token1 = generateRatingToken();
    const token2 = generateRatingToken();
    
    expect(token1).not.toBe(token2);
    expect(token1.length).toBeGreaterThan(20);
  });
});
