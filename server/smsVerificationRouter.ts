/**
 * SMS Verification Router
 * Handles phone verification for lead quality assurance
 */

import { z } from "zod";
import { publicProcedure, router } from "./_core/trpc";
import { sendVerificationSMS, verifyCode, isPhoneVerified, resendVerificationSMS } from "./smsVerification";

export const smsVerificationRouter = router({
  /**
   * Send a verification code to a phone number
   */
  sendCode: publicProcedure
    .input(z.object({
      phoneNumber: z.string().min(8).max(20),
      leadId: z.number().int().optional(),
    }))
    .mutation(async ({ input }) => {
      const result = await sendVerificationSMS(input.phoneNumber, input.leadId);
      return result;
    }),

  /**
   * Verify a code submitted by the user
   */
  verifyCode: publicProcedure
    .input(z.object({
      verificationId: z.string(),
      code: z.string().length(6),
    }))
    .mutation(async ({ input }) => {
      const result = await verifyCode(input.verificationId, input.code);
      return result;
    }),

  /**
   * Check if a phone number is already verified
   */
  checkVerified: publicProcedure
    .input(z.object({
      phoneNumber: z.string().min(8).max(20),
    }))
    .query(async ({ input }) => {
      const verified = await isPhoneVerified(input.phoneNumber);
      return { verified };
    }),

  /**
   * Resend verification code (with rate limiting)
   */
  resendCode: publicProcedure
    .input(z.object({
      phoneNumber: z.string().min(8).max(20),
      leadId: z.number().int().optional(),
    }))
    .mutation(async ({ input }) => {
      const result = await resendVerificationSMS(input.phoneNumber, input.leadId);
      return result;
    }),
});
