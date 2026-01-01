import { z } from "zod";
import { protectedProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import {
  createLeadClosure,
  getAllClosures,
  getInstallerClosures,
  getInstallerPerformance,
  getInstallerLeaderboard,
  markBonusPaid,
} from "./dbLeadClosures";
import { getLeadById, getTransactionById } from "./db";

export const leadClosureRouter = router({
  /**
   * Report a lead closure (installer reports successful sale)
   */
  reportClosure: protectedProcedure
    .input(
      z.object({
        leadId: z.number(),
        transactionId: z.number(),
        closedDate: z.date(),
        contractValue: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify the lead and transaction belong to this installer
      const lead = await getLeadById(input.leadId);
      if (!lead) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Lead not found",
        });
      }

      const transaction = await getTransactionById(input.transactionId);
      if (!transaction) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Transaction not found",
        });
      }

      // Check if user is admin or the installer who purchased the lead
      const isAdmin = ctx.user.role === "admin";
      const isOwner = transaction.installerId === ctx.user.id;

      if (!isAdmin && !isOwner) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You can only report closures for your own leads",
        });
      }

      // Create the closure record
      const closureId = await createLeadClosure({
        leadId: input.leadId,
        installerId: transaction.installerId,
        transactionId: input.transactionId,
        closedDate: input.closedDate,
        contractValue: input.contractValue,
        performanceBonus: 4000, // $40 bonus in cents
        bonusPaid: false,
      });

      return {
        success: true,
        closureId,
      };
    }),

  /**
   * Get all closures for current installer
   */
  getMyClosures: protectedProcedure.query(async ({ ctx }) => {
    const closures = await getInstallerClosures(ctx.user.id);
    return closures;
  }),

  /**
   * Get all closures (admin only)
   */
  getAllClosures: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role !== "admin") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Admin access required",
      });
    }

    const closures = await getAllClosures();
    return closures;
  }),

  /**
   * Get installer performance stats
   */
  getMyPerformance: protectedProcedure.query(async ({ ctx }) => {
    const performance = await getInstallerPerformance(ctx.user.id);
    return performance;
  }),

  /**
   * Get installer performance by ID (admin only)
   */
  getInstallerPerformance: protectedProcedure
    .input(z.object({ installerId: z.number() }))
    .query(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Admin access required",
        });
      }

      const performance = await getInstallerPerformance(input.installerId);
      return performance;
    }),

  /**
   * Get installer leaderboard
   */
  getLeaderboard: protectedProcedure
    .input(z.object({ limit: z.number().optional().default(10) }))
    .query(async ({ input }) => {
      const leaderboard = await getInstallerLeaderboard(input.limit);
      return leaderboard;
    }),

  /**
   * Mark bonus as paid (admin only)
   */
  markBonusPaid: protectedProcedure
    .input(
      z.object({
        closureId: z.number(),
        stripePaymentId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Admin access required",
        });
      }

      await markBonusPaid(input.closureId, input.stripePaymentId);

      return {
        success: true,
      };
    }),
});
