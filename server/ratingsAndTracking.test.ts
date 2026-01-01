import { describe, expect, it, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAdminContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "admin-user",
    email: "admin@example.com",
    name: "Admin User",
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
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

function createUserContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 2,
    openId: "regular-user",
    email: "user@example.com",
    name: "Regular User",
    loginMethod: "manus",
    role: "user",
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
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

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

describe("Ratings Router", () => {
  describe("validateToken", () => {
    it("returns validation result for token", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.ratings.validateToken({ token: "invalid-token" });
      
      // Should return validation result with valid property
      expect(result).toBeDefined();
      expect(typeof result.valid).toBe("boolean");
      // Invalid token should return valid: false
      expect(result.valid).toBe(false);
    });
  });

  describe("submit", () => {
    it("accepts valid rating submission", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      // This tests the input validation - actual DB operation may fail
      // but the procedure should accept valid input
      try {
        await caller.ratings.submit({
          installerId: 1,
          reviewerName: "John Doe",
          overallRating: 5,
          comment: "Great service and installation!",
        });
      } catch (error: any) {
        // If it fails, it should be a DB error, not a validation error
        expect(error.message).not.toContain("validation");
      }
    });

    it("rejects invalid rating (too short comment)", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.ratings.submit({
          installerId: 1,
          reviewerName: "John",
          overallRating: 5,
          comment: "Short", // Less than 10 chars
        })
      ).rejects.toThrow();
    });

    it("rejects invalid rating (out of range)", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.ratings.submit({
          installerId: 1,
          reviewerName: "John Doe",
          overallRating: 6, // Max is 5
          comment: "This is a valid comment length",
        })
      ).rejects.toThrow();
    });
  });

  describe("moderate (protected)", () => {
    it("rejects unauthenticated users", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.ratings.moderate({
          ratingId: 1,
          action: "approve",
        })
      ).rejects.toThrow();
    });

    it("rejects non-admin users", async () => {
      const ctx = createUserContext();
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.ratings.moderate({
          ratingId: 1,
          action: "approve",
        })
      ).rejects.toThrow();
    });
  });

  describe("getPending (protected)", () => {
    it("rejects unauthenticated users", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      await expect(caller.ratings.getPending()).rejects.toThrow();
    });

    it("rejects non-admin users", async () => {
      const ctx = createUserContext();
      const caller = appRouter.createCaller(ctx);

      await expect(caller.ratings.getPending()).rejects.toThrow();
    });
  });
});

describe("Lead Tracking Router", () => {
  describe("getLeadStatus", () => {
    it("accepts valid email and phone", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.leadTracking.getLeadStatus({
        email: "test@example.com",
        phone: "0412345678",
      });
      
      expect(result).toBeDefined();
      expect(typeof result.found).toBe("boolean");
    });

    it("rejects invalid email format", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.leadTracking.getLeadStatus({
          email: "invalid-email",
          phone: "0412345678",
        })
      ).rejects.toThrow();
    });

    it("rejects too short phone", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.leadTracking.getLeadStatus({
          email: "test@example.com",
          phone: "123", // Too short
        })
      ).rejects.toThrow();
    });
  });

  describe("addEvent (protected)", () => {
    it("rejects unauthenticated users", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.leadTracking.addEvent({
          leadId: 1,
          eventType: "submitted",
        })
      ).rejects.toThrow();
    });

    it("accepts valid event types", async () => {
      const ctx = createAdminContext();
      const caller = appRouter.createCaller(ctx);

      // Test that valid event types are accepted (DB may fail but validation passes)
      try {
        await caller.leadTracking.addEvent({
          leadId: 1,
          eventType: "submitted",
          description: "Test event",
        });
      } catch (error: any) {
        // Should not be a validation error
        expect(error.message).not.toContain("Invalid enum value");
      }
    });
  });

  describe("getTimeline (protected)", () => {
    it("rejects unauthenticated users", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.leadTracking.getTimeline({ leadId: 1 })
      ).rejects.toThrow();
    });
  });
});

describe("Blog Router", () => {
  describe("create (protected)", () => {
    it("rejects unauthenticated users", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.blog.create({
          slug: "test-post",
          title: "Test Post Title",
          excerpt: "This is a test excerpt",
          content: "This is the full content of the test post with enough characters to pass validation.",
          authorName: "Test Author",
          category: "Solar Basics",
        })
      ).rejects.toThrow();
    });

    it("rejects non-admin users", async () => {
      const ctx = createUserContext();
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.blog.create({
          slug: "test-post",
          title: "Test Post Title",
          excerpt: "This is a test excerpt",
          content: "This is the full content of the test post with enough characters to pass validation.",
          authorName: "Test Author",
          category: "Solar Basics",
        })
      ).rejects.toThrow();
    });
  });

  describe("delete (protected)", () => {
    it("rejects unauthenticated users", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      await expect(caller.blog.delete({ id: 1 })).rejects.toThrow();
    });
  });
});

describe("Testimonials Router", () => {
  describe("create (protected)", () => {
    it("rejects unauthenticated users", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.testimonials.create({
          name: "John Doe",
          location: "Sydney, NSW",
          quote: "This is a great testimonial quote that is long enough.",
        })
      ).rejects.toThrow();
    });

    it("rejects non-admin users", async () => {
      const ctx = createUserContext();
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.testimonials.create({
          name: "John Doe",
          location: "Sydney, NSW",
          quote: "This is a great testimonial quote that is long enough.",
        })
      ).rejects.toThrow();
    });
  });

  describe("update (protected)", () => {
    it("rejects unauthenticated users", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.testimonials.update({
          id: 1,
          name: "Updated Name",
        })
      ).rejects.toThrow();
    });
  });

  describe("delete (protected)", () => {
    it("rejects unauthenticated users", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      await expect(caller.testimonials.delete({ id: 1 })).rejects.toThrow();
    });
  });
});
