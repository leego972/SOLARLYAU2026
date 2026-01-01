import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "./_core/trpc";
import { getDb } from "./db";
import { managedTestimonials } from "../drizzle/schema";
import { eq, desc, and } from "drizzle-orm";

export const testimonialsRouter = router({
  // Get all published testimonials
  getAll: publicProcedure
    .input(z.object({
      type: z.enum(["homeowner", "installer"]).optional(),
      featuredOnly: z.boolean().default(false),
      limit: z.number().default(20),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      const testimonials = await db
        .select()
        .from(managedTestimonials)
        .where(eq(managedTestimonials.isPublished, true))
        .orderBy(desc(managedTestimonials.displayOrder), desc(managedTestimonials.createdAt))
        .limit(input.limit);

      let filtered = testimonials;
      if (input.type) {
        filtered = filtered.filter(t => t.type === input.type);
      }
      if (input.featuredOnly) {
        filtered = filtered.filter(t => t.isFeatured);
      }

      return filtered;
    }),

  // Get featured testimonials for homepage
  getFeatured: publicProcedure
    .input(z.object({ limit: z.number().default(6) }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      return db
        .select()
        .from(managedTestimonials)
        .where(and(
          eq(managedTestimonials.isPublished, true),
          eq(managedTestimonials.isFeatured, true)
        ))
        .orderBy(desc(managedTestimonials.displayOrder))
        .limit(input.limit);
    }),

  // Admin: Get all testimonials
  adminGetAll: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role !== "admin") {
      throw new Error("Admin access required");
    }

    const db = await getDb();
    if (!db) return [];

    return db
      .select()
      .from(managedTestimonials)
      .orderBy(desc(managedTestimonials.displayOrder), desc(managedTestimonials.createdAt));
  }),

  // Admin: Create testimonial
  create: protectedProcedure
    .input(z.object({
      name: z.string().min(2),
      location: z.string().min(2),
      role: z.string().optional(),
      avatar: z.string().optional(),
      quote: z.string().min(20),
      rating: z.number().min(1).max(5).default(5),
      type: z.enum(["homeowner", "installer"]).default("homeowner"),
      systemSize: z.string().optional(),
      savings: z.string().optional(),
      isFeatured: z.boolean().default(false),
      displayOrder: z.number().default(0),
      isPublished: z.boolean().default(true),
    }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        throw new Error("Admin access required");
      }

      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db.insert(managedTestimonials).values(input);

      return { success: true };
    }),

  // Admin: Update testimonial
  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      name: z.string().min(2).optional(),
      location: z.string().min(2).optional(),
      role: z.string().optional(),
      avatar: z.string().optional(),
      quote: z.string().min(20).optional(),
      rating: z.number().min(1).max(5).optional(),
      type: z.enum(["homeowner", "installer"]).optional(),
      systemSize: z.string().optional(),
      savings: z.string().optional(),
      isFeatured: z.boolean().optional(),
      displayOrder: z.number().optional(),
      isPublished: z.boolean().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        throw new Error("Admin access required");
      }

      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const { id, ...updateData } = input;

      await db
        .update(managedTestimonials)
        .set(updateData)
        .where(eq(managedTestimonials.id, id));

      return { success: true };
    }),

  // Admin: Delete testimonial
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        throw new Error("Admin access required");
      }

      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db.delete(managedTestimonials).where(eq(managedTestimonials.id, input.id));

      return { success: true };
    }),
});
