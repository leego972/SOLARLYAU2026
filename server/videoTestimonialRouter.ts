import { z } from "zod";
import { eq } from "drizzle-orm";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { getDb } from './db';
import { videoTestimonials } from "../drizzle/schema";
import { storagePut } from "./storage";

/**
 * Video Testimonial Management Router
 * Handles video upload, management, and display
 */

export const videoTestimonialRouter = router({
  /**
   * Get all active video testimonials (public)
   */
  list: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];

    const testimonials = await db
      .select()
      .from(videoTestimonials)
      .where(eq(videoTestimonials.isActive, true));

    return testimonials;
  }),

  /**
   * Get featured testimonials for homepage
   */
  featured: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];

    const testimonials = await db
      .select()
      .from(videoTestimonials)
      .where(eq(videoTestimonials.featured, true))
      .limit(3);

    return testimonials;
  }),

  /**
   * Upload video testimonial (admin only)
   */
  upload: protectedProcedure
    .input(
      z.object({
        installerId: z.number(),
        installerName: z.string(),
        companyName: z.string(),
        title: z.string(),
        quote: z.string(),
        videoFile: z.string(), // Base64 encoded video
        thumbnailFile: z.string().optional(), // Base64 encoded thumbnail
        duration: z.number().optional(),
        revenueBefore: z.number().optional(),
        revenueAfter: z.number().optional(),
        closeRateBefore: z.number().optional(),
        closeRateAfter: z.number().optional(),
        featured: z.boolean().default(false),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Only admin can upload testimonials
      if (ctx.user.role !== "admin") {
        throw new Error("Unauthorized: Admin access required");
      }

      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Upload video to S3
      const videoBuffer = Buffer.from(input.videoFile, "base64");
      const videoKey = `testimonials/video-${Date.now()}.mp4`;
      const { url: videoUrl } = await storagePut(videoKey, videoBuffer, "video/mp4");

      // Upload thumbnail if provided
      let thumbnailUrl: string | undefined;
      if (input.thumbnailFile) {
        const thumbnailBuffer = Buffer.from(input.thumbnailFile, "base64");
        const thumbnailKey = `testimonials/thumb-${Date.now()}.jpg`;
        const result = await storagePut(thumbnailKey, thumbnailBuffer, "image/jpeg");
        thumbnailUrl = result.url;
      }

      // Insert testimonial record
      const [testimonial] = await db.insert(videoTestimonials).values({
        installerId: input.installerId,
        installerName: input.installerName,
        companyName: input.companyName,
        title: input.title,
        quote: input.quote,
        videoUrl,
        thumbnailUrl,
        duration: input.duration,
        revenueBefore: input.revenueBefore,
        revenueAfter: input.revenueAfter,
        closeRateBefore: input.closeRateBefore,
        closeRateAfter: input.closeRateAfter,
        featured: input.featured,
        displayOrder: 0,
        isActive: true,
      });

      console.log(`[VideoTestimonials] Uploaded testimonial from ${input.installerName}`);

      return { success: true, testimonialId: testimonial.insertId };
    }),

  /**
   * Update testimonial settings (admin only)
   */
  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        featured: z.boolean().optional(),
        displayOrder: z.number().optional(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new Error("Unauthorized: Admin access required");
      }

      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const updates: any = {};
      if (input.featured !== undefined) updates.featured = input.featured;
      if (input.displayOrder !== undefined) updates.displayOrder = input.displayOrder;
      if (input.isActive !== undefined) updates.isActive = input.isActive;

      await db
        .update(videoTestimonials)
        .set(updates)
        .where(eq(videoTestimonials.id, input.id));

      return { success: true };
    }),

  /**
   * Delete testimonial (admin only)
   */
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new Error("Unauthorized: Admin access required");
      }

      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Soft delete by setting isActive to false
      await db
        .update(videoTestimonials)
        .set({ isActive: false })
        .where(eq(videoTestimonials.id, input.id));

      return { success: true };
    }),
});
