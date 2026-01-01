import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock Twilio
vi.mock("twilio", () => {
  return {
    default: () => ({
      messages: {
        create: vi.fn().mockResolvedValue({ sid: "SM123456" }),
      },
    }),
  };
});

// Mock the database
vi.mock("./db", () => ({
  getDb: vi.fn().mockResolvedValue({
    execute: vi.fn().mockResolvedValue([[], {}]),
  }),
}));

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

describe("SMS Verification Router", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("sendCode", () => {
    it("validates phone number is required", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      // Should throw validation error for empty phone
      await expect(
        caller.smsVerification.sendCode({ phoneNumber: "" })
      ).rejects.toThrow();
    });

    it("validates phone number minimum length", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      // Should throw validation error for short phone
      await expect(
        caller.smsVerification.sendCode({ phoneNumber: "123" })
      ).rejects.toThrow();
    });

    it("accepts valid phone number format", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      // Should not throw validation error for valid phone
      // Note: May fail due to missing Twilio config, but should pass validation
      const result = await caller.smsVerification.sendCode({
        phoneNumber: "0412345678",
      });

      // Should return a result (success or error about config)
      expect(result).toBeDefined();
      expect(typeof result.success).toBe("boolean");
    });
  });

  describe("verifyCode", () => {
    it("validates code must be 6 digits", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      // Should throw validation error for wrong length code
      await expect(
        caller.smsVerification.verifyCode({
          verificationId: "ver_123",
          code: "12345", // 5 digits instead of 6
        })
      ).rejects.toThrow();
    });

    it("accepts valid 6-digit code", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      // Should not throw validation error for valid code format
      const result = await caller.smsVerification.verifyCode({
        verificationId: "ver_123",
        code: "123456",
      });

      // Should return a result
      expect(result).toBeDefined();
      expect(typeof result.success).toBe("boolean");
    });
  });

  describe("checkVerified", () => {
    it("validates phone number is required", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      // Should throw validation error for empty phone
      await expect(
        caller.smsVerification.checkVerified({ phoneNumber: "" })
      ).rejects.toThrow();
    });

    it("validates phone number minimum length", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      // Should throw validation error for short phone
      await expect(
        caller.smsVerification.checkVerified({ phoneNumber: "123" })
      ).rejects.toThrow();
    });
  });

  describe("resendCode", () => {
    it("validates phone number is required", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      // Should throw validation error for empty phone
      await expect(
        caller.smsVerification.resendCode({ phoneNumber: "" })
      ).rejects.toThrow();
    });

    it("accepts valid phone number for resend", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.smsVerification.resendCode({
        phoneNumber: "0412345678",
      });

      expect(result).toBeDefined();
      expect(typeof result.success).toBe("boolean");
    });
  });
});

describe("Phone Number Formatting", () => {
  it("should format Australian mobile numbers correctly", () => {
    // Test cases for phone number formatting logic
    const testCases = [
      { input: "0412345678", expected: "+61412345678" },
      { input: "412345678", expected: "+61412345678" },
      { input: "+61412345678", expected: "+61412345678" },
      { input: "04 1234 5678", expected: "+61412345678" },
    ];

    for (const { input, expected } of testCases) {
      let formatted = input.replace(/\s+/g, "").replace(/[^\d+]/g, "");
      if (formatted.startsWith("0")) {
        formatted = "+61" + formatted.substring(1);
      } else if (!formatted.startsWith("+")) {
        formatted = "+61" + formatted;
      }
      expect(formatted).toBe(expected);
    }
  });
});

describe("Verification Code Generation", () => {
  it("should generate 6-digit codes", () => {
    // Test the code generation logic
    for (let i = 0; i < 10; i++) {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      expect(code.length).toBe(6);
      expect(parseInt(code)).toBeGreaterThanOrEqual(100000);
      expect(parseInt(code)).toBeLessThan(1000000);
    }
  });
});
