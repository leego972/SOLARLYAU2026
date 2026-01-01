import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "./_core/trpc";
import { getDb } from "./db";
import { blogPosts } from "../drizzle/schema";
import { eq, desc, and, like, or } from "drizzle-orm";

export const blogRouter = router({
  // Get all published posts
  getAll: publicProcedure
    .input(z.object({
      category: z.string().optional(),
      limit: z.number().default(10),
      offset: z.number().default(0),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      let query = db
        .select()
        .from(blogPosts)
        .where(eq(blogPosts.isPublished, true))
        .orderBy(desc(blogPosts.publishedAt))
        .limit(input.limit)
        .offset(input.offset);

      const posts = await query;
      
      // Filter by category if provided
      if (input.category) {
        return posts.filter(p => p.category === input.category);
      }
      
      return posts;
    }),

  // Get single post by slug
  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;

      const posts = await db
        .select()
        .from(blogPosts)
        .where(and(
          eq(blogPosts.slug, input.slug),
          eq(blogPosts.isPublished, true)
        ))
        .limit(1);

      return posts[0] || null;
    }),

  // Get related posts
  getRelated: publicProcedure
    .input(z.object({
      slug: z.string(),
      category: z.string(),
      limit: z.number().default(3),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      const posts = await db
        .select()
        .from(blogPosts)
        .where(and(
          eq(blogPosts.isPublished, true),
          eq(blogPosts.category, input.category)
        ))
        .orderBy(desc(blogPosts.publishedAt))
        .limit(input.limit + 1);

      // Filter out the current post
      return posts.filter(p => p.slug !== input.slug).slice(0, input.limit);
    }),

  // Admin: Get all posts (including drafts)
  adminGetAll: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role !== "admin") {
      throw new Error("Admin access required");
    }

    const db = await getDb();
    if (!db) return [];

    return db
      .select()
      .from(blogPosts)
      .orderBy(desc(blogPosts.updatedAt));
  }),

  // Admin: Create new post
  create: protectedProcedure
    .input(z.object({
      slug: z.string().min(3),
      title: z.string().min(5),
      excerpt: z.string().min(10),
      content: z.string().min(50),
      authorName: z.string(),
      authorRole: z.string().optional(),
      authorAvatar: z.string().optional(),
      category: z.string(),
      tags: z.array(z.string()).optional(),
      featuredImage: z.string().optional(),
      readingTime: z.number().optional(),
      metaTitle: z.string().optional(),
      metaDescription: z.string().optional(),
      isPublished: z.boolean().default(false),
    }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        throw new Error("Admin access required");
      }

      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db.insert(blogPosts).values({
        slug: input.slug,
        title: input.title,
        excerpt: input.excerpt,
        content: input.content,
        authorName: input.authorName,
        authorRole: input.authorRole,
        authorAvatar: input.authorAvatar,
        category: input.category,
        tags: input.tags ? JSON.stringify(input.tags) : null,
        featuredImage: input.featuredImage,
        readingTime: input.readingTime || 5,
        metaTitle: input.metaTitle,
        metaDescription: input.metaDescription,
        isPublished: input.isPublished,
        publishedAt: input.isPublished ? new Date() : null,
      });

      return { success: true };
    }),

  // Admin: Update post
  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      slug: z.string().min(3).optional(),
      title: z.string().min(5).optional(),
      excerpt: z.string().min(10).optional(),
      content: z.string().min(50).optional(),
      authorName: z.string().optional(),
      authorRole: z.string().optional(),
      authorAvatar: z.string().optional(),
      category: z.string().optional(),
      tags: z.array(z.string()).optional(),
      featuredImage: z.string().optional(),
      readingTime: z.number().optional(),
      metaTitle: z.string().optional(),
      metaDescription: z.string().optional(),
      isPublished: z.boolean().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        throw new Error("Admin access required");
      }

      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const { id, tags, ...updateData } = input;
      
      const updates: Record<string, any> = { ...updateData };
      if (tags) {
        updates.tags = JSON.stringify(tags);
      }
      if (input.isPublished) {
        updates.publishedAt = new Date();
      }

      await db
        .update(blogPosts)
        .set(updates)
        .where(eq(blogPosts.id, id));

      return { success: true };
    }),

  // Admin: Delete post
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        throw new Error("Admin access required");
      }

      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db.delete(blogPosts).where(eq(blogPosts.id, input.id));

      return { success: true };
    }),

  // Admin: Seed sample blog posts
  seedPosts: protectedProcedure.mutation(async ({ ctx }) => {
    if (ctx.user.role !== "admin") {
      throw new Error("Admin access required");
    }

    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const { seedBlogPosts } = await import("./blogSeedData");
    const result = await seedBlogPosts(db);

    return {
      success: true,
      created: result.created,
      errors: result.errors,
      message: `Created ${result.created} blog posts`,
    };
  }),
});
