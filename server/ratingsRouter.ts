import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "./_core/trpc";
import { getDb } from "./db";
import { installerRatings, installers, ratingTokens, leadTrackingEvents } from "../drizzle/schema";
import { eq, desc, and, avg, count, sql } from "drizzle-orm";
import crypto from "crypto";

// Generate secure rating token
function generateRatingToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export const ratingsRouter = router({
  // Create a rating token (sent to homeowner after installation)
  createRatingToken: protectedProcedure
    .input(z.object({
      leadId: z.number().int(),
      installerId: z.number().int(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const token = generateRatingToken();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30); // 30 days to leave review

      await db.insert(ratingTokens).values({
        token,
        leadId: input.leadId,
        installerId: input.installerId,
        expiresAt,
      });

      // Log tracking event
      await db.insert(leadTrackingEvents).values({
        leadId: input.leadId,
        eventType: "review_requested",
        description: "Rating request sent to homeowner",
        installerId: input.installerId,
      });

      return { token, expiresAt };
    }),

  // Validate rating token
  validateToken: publicProcedure
    .input(z.object({ token: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return { valid: false, error: "Database unavailable" };

      const [tokenRecord] = await db
        .select()
        .from(ratingTokens)
        .where(eq(ratingTokens.token, input.token))
        .limit(1);

      if (!tokenRecord) {
        return { valid: false, error: "Invalid token" };
      }

      if (tokenRecord.isUsed) {
        return { valid: false, error: "This rating link has already been used" };
      }

      if (new Date() > tokenRecord.expiresAt) {
        return { valid: false, error: "This rating link has expired" };
      }

      // Get installer info
      const [installer] = await db
        .select({ companyName: installers.companyName })
        .from(installers)
        .where(eq(installers.id, tokenRecord.installerId))
        .limit(1);

      return {
        valid: true,
        installerId: tokenRecord.installerId,
        leadId: tokenRecord.leadId,
        installerName: installer?.companyName || "Unknown Installer",
      };
    }),

  // Submit rating via token
  submitWithToken: publicProcedure
    .input(z.object({
      token: z.string(),
      reviewerName: z.string().min(2),
      reviewerEmail: z.string().email().optional(),
      reviewerLocation: z.string().optional(),
      overallRating: z.number().min(1).max(5),
      communicationRating: z.number().min(1).max(5).optional(),
      qualityRating: z.number().min(1).max(5).optional(),
      valueRating: z.number().min(1).max(5).optional(),
      timelinessRating: z.number().min(1).max(5).optional(),
      title: z.string().optional(),
      comment: z.string().min(10),
      systemSize: z.string().optional(),
      installationDate: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Validate token
      const [tokenRecord] = await db
        .select()
        .from(ratingTokens)
        .where(eq(ratingTokens.token, input.token))
        .limit(1);

      if (!tokenRecord) {
        throw new Error("Invalid rating token");
      }

      if (tokenRecord.isUsed) {
        throw new Error("Rating already submitted");
      }

      if (new Date() > tokenRecord.expiresAt) {
        throw new Error("Rating link expired");
      }

      // Create rating (auto-verified since from valid token)
      await db.insert(installerRatings).values({
        installerId: tokenRecord.installerId,
        leadId: tokenRecord.leadId,
        reviewerName: input.reviewerName,
        reviewerEmail: input.reviewerEmail,
        reviewerLocation: input.reviewerLocation,
        overallRating: input.overallRating,
        communicationRating: input.communicationRating,
        qualityRating: input.qualityRating,
        valueRating: input.valueRating,
        timelinessRating: input.timelinessRating,
        title: input.title,
        comment: input.comment,
        systemSize: input.systemSize,
        installationDate: input.installationDate ? new Date(input.installationDate) : undefined,
        isVerified: true,
        isApproved: false,
        isPublished: false,
      });

      // Mark token as used
      await db
        .update(ratingTokens)
        .set({ isUsed: true, usedAt: new Date() })
        .where(eq(ratingTokens.id, tokenRecord.id));

      return { success: true, message: "Review submitted successfully! It will be published after moderation." };
    }),

  // Submit a new rating (without token)
  submit: publicProcedure
    .input(z.object({
      installerId: z.number(),
      leadId: z.number().optional(),
      reviewerName: z.string().min(2),
      reviewerEmail: z.string().email().optional(),
      reviewerLocation: z.string().optional(),
      overallRating: z.number().min(1).max(5),
      communicationRating: z.number().min(1).max(5).optional(),
      qualityRating: z.number().min(1).max(5).optional(),
      valueRating: z.number().min(1).max(5).optional(),
      timelinessRating: z.number().min(1).max(5).optional(),
      title: z.string().optional(),
      comment: z.string().min(10),
      systemSize: z.string().optional(),
      installationDate: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const result = await db.insert(installerRatings).values({
        installerId: input.installerId,
        leadId: input.leadId,
        reviewerName: input.reviewerName,
        reviewerEmail: input.reviewerEmail,
        reviewerLocation: input.reviewerLocation,
        overallRating: input.overallRating,
        communicationRating: input.communicationRating,
        qualityRating: input.qualityRating,
        valueRating: input.valueRating,
        timelinessRating: input.timelinessRating,
        title: input.title,
        comment: input.comment,
        systemSize: input.systemSize,
        installationDate: input.installationDate ? new Date(input.installationDate) : undefined,
        isVerified: false,
        isApproved: false,
        isPublished: false,
      });

      return { success: true, message: "Review submitted for moderation" };
    }),

  // Get published ratings for an installer
  getByInstaller: publicProcedure
    .input(z.object({
      installerId: z.number(),
      limit: z.number().default(10),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      const ratings = await db
        .select()
        .from(installerRatings)
        .where(and(
          eq(installerRatings.installerId, input.installerId),
          eq(installerRatings.isPublished, true)
        ))
        .orderBy(desc(installerRatings.createdAt))
        .limit(input.limit);

      return ratings;
    }),

  // Get installer rating summary
  getInstallerSummary: publicProcedure
    .input(z.object({ installerId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;

      const result = await db
        .select({
          averageRating: avg(installerRatings.overallRating),
          totalReviews: count(installerRatings.id),
          avgCommunication: avg(installerRatings.communicationRating),
          avgQuality: avg(installerRatings.qualityRating),
          avgValue: avg(installerRatings.valueRating),
          avgTimeliness: avg(installerRatings.timelinessRating),
        })
        .from(installerRatings)
        .where(and(
          eq(installerRatings.installerId, input.installerId),
          eq(installerRatings.isPublished, true)
        ));

      return result[0] || null;
    }),

  // Admin: Get all pending ratings for moderation
  getPending: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role !== "admin") {
      throw new Error("Admin access required");
    }

    const db = await getDb();
    if (!db) return [];

    const pending = await db
      .select({
        rating: installerRatings,
        installer: installers,
      })
      .from(installerRatings)
      .leftJoin(installers, eq(installerRatings.installerId, installers.id))
      .where(eq(installerRatings.isApproved, false))
      .orderBy(desc(installerRatings.createdAt));

    return pending;
  }),

  // Admin: Approve or reject a rating
  moderate: protectedProcedure
    .input(z.object({
      ratingId: z.number(),
      action: z.enum(["approve", "reject"]),
    }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        throw new Error("Admin access required");
      }

      const db = await getDb();
      if (!db) throw new Error("Database not available");

      if (input.action === "approve") {
        await db
          .update(installerRatings)
          .set({ isApproved: true, isPublished: true })
          .where(eq(installerRatings.id, input.ratingId));
      } else {
        await db
          .delete(installerRatings)
          .where(eq(installerRatings.id, input.ratingId));
      }

      return { success: true };
    }),

  // Installer: Respond to a rating
  respondToRating: protectedProcedure
    .input(z.object({
      ratingId: z.number(),
      response: z.string().min(10).max(1000),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Get the rating to verify installer ownership
      const [rating] = await db
        .select()
        .from(installerRatings)
        .where(eq(installerRatings.id, input.ratingId))
        .limit(1);

      if (!rating) {
        throw new Error("Rating not found");
      }

      // Verify the user is the installer (check via installer email)
      const [installer] = await db
        .select()
        .from(installers)
        .where(eq(installers.id, rating.installerId))
        .limit(1);

      if (!installer) {
        throw new Error("Installer not found");
      }

      // Check if user is admin or the installer
      if (ctx.user.role !== "admin" && ctx.user.email !== installer.email) {
        throw new Error("You can only respond to reviews for your company");
      }

      // Check if already responded
      if (rating.installerResponse) {
        throw new Error("You have already responded to this review");
      }

      // Add response
      await db
        .update(installerRatings)
        .set({
          installerResponse: input.response,
          installerResponseAt: new Date(),
        })
        .where(eq(installerRatings.id, input.ratingId));

      return { success: true, message: "Response added successfully" };
    }),

  // Get ratings for installer's own company (for installer dashboard)
  getMyRatings: protectedProcedure
    .input(z.object({
      limit: z.number().default(20),
      offset: z.number().default(0),
    }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return [];

      // Find installer by user email
      const [installer] = await db
        .select()
        .from(installers)
        .where(eq(installers.email, ctx.user.email || ""))
        .limit(1);

      if (!installer) {
        return [];
      }

      const ratings = await db
        .select()
        .from(installerRatings)
        .where(eq(installerRatings.installerId, installer.id))
        .orderBy(desc(installerRatings.createdAt))
        .limit(input.limit)
        .offset(input.offset);

      return ratings;
    }),

  // Track email open (via tracking pixel)
  trackEmailOpen: publicProcedure
    .input(z.object({ token: z.string() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) return { success: false };

      // Update token record with open timestamp
      await db
        .update(ratingTokens)
        .set({ emailOpenedAt: new Date() })
        .where(eq(ratingTokens.token, input.token));

      return { success: true };
    }),

  // Track email link click
  trackEmailClick: publicProcedure
    .input(z.object({ token: z.string() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) return { success: false };

      // Update token record with click timestamp
      await db
        .update(ratingTokens)
        .set({ emailClickedAt: new Date() })
        .where(eq(ratingTokens.token, input.token));

      return { success: true };
    }),

  // Get rating email statistics (admin)
  getEmailStats: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role !== "admin") {
      throw new Error("Admin access required");
    }

    const db = await getDb();
    if (!db) return null;

    const stats = await db
      .select({
        totalSent: count(ratingTokens.id),
        totalOpened: sql<number>`SUM(CASE WHEN ${ratingTokens.emailOpenedAt} IS NOT NULL THEN 1 ELSE 0 END)`,
        totalClicked: sql<number>`SUM(CASE WHEN ${ratingTokens.emailClickedAt} IS NOT NULL THEN 1 ELSE 0 END)`,
        totalUsed: sql<number>`SUM(CASE WHEN ${ratingTokens.isUsed} = true THEN 1 ELSE 0 END)`,
      })
      .from(ratingTokens);

    return stats[0] || null;
  }),

  // Notify installer of new rating (internal use)
  notifyInstallerOfRating: protectedProcedure
    .input(z.object({ ratingId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        throw new Error("Admin access required");
      }

      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Get rating and installer details
      const [rating] = await db
        .select({
          rating: installerRatings,
          installer: installers,
        })
        .from(installerRatings)
        .leftJoin(installers, eq(installerRatings.installerId, installers.id))
        .where(eq(installerRatings.id, input.ratingId))
        .limit(1);

      if (!rating || !rating.installer) {
        throw new Error("Rating or installer not found");
      }

      // Here you would send an email notification to the installer
      // For now, just log it
      console.log(`[Ratings] Would notify ${rating.installer.email} of new ${rating.rating.overallRating}-star review`);

      return { success: true };
    }),

  // Get all published ratings (for testimonials page)
  getAll: publicProcedure
    .input(z.object({
      limit: z.number().default(20),
      offset: z.number().default(0),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      const ratings = await db
        .select({
          rating: installerRatings,
          installer: installers,
        })
        .from(installerRatings)
        .leftJoin(installers, eq(installerRatings.installerId, installers.id))
        .where(eq(installerRatings.isPublished, true))
        .orderBy(desc(installerRatings.createdAt))
        .limit(input.limit)
        .offset(input.offset);

      return ratings;
    }),
});
