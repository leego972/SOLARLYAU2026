import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "./_core/trpc";
import { getDb } from "./db";
import { leads, leadTrackingEvents, leadOffers, installers } from "../drizzle/schema";
import { eq, desc, and } from "drizzle-orm";

export const leadTrackingRouter = router({
  // Get lead status by email and phone (for homeowner lookup)
  getLeadStatus: publicProcedure
    .input(z.object({
      email: z.string().email(),
      phone: z.string().min(8),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;

      // Find lead by email and phone
      const [lead] = await db
        .select()
        .from(leads)
        .where(and(
          eq(leads.customerEmail, input.email),
          eq(leads.customerPhone, input.phone)
        ))
        .orderBy(desc(leads.createdAt))
        .limit(1);

      if (!lead) {
        return { found: false, message: "No quote request found with these details" };
      }

      // Get tracking events
      const events = await db
        .select()
        .from(leadTrackingEvents)
        .where(eq(leadTrackingEvents.leadId, lead.id))
        .orderBy(desc(leadTrackingEvents.createdAt));

      // Get offers/matches
      const offers = await db
        .select({
          offer: leadOffers,
          installer: installers,
        })
        .from(leadOffers)
        .leftJoin(installers, eq(leadOffers.installerId, installers.id))
        .where(eq(leadOffers.leadId, lead.id))
        .orderBy(desc(leadOffers.createdAt));

      return {
        found: true,
        lead: {
          id: lead.id,
          status: lead.status,
          suburb: lead.suburb,
          state: lead.state,
          propertyType: lead.propertyType,
          estimatedSystemSize: lead.estimatedSystemSize,
          createdAt: lead.createdAt,
        },
        events: events.map(e => ({
          type: e.eventType,
          description: e.description,
          installerName: e.installerName,
          createdAt: e.createdAt,
        })),
        matchedInstallers: offers.map(o => ({
          companyName: o.installer?.companyName || "Unknown",
          status: o.offer.status,
          sentAt: o.offer.sentAt,
          respondedAt: o.offer.respondedAt,
        })),
      };
    }),

  // Get lead by ID (for authenticated users)
  getLeadById: publicProcedure
    .input(z.object({ leadId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;

      const [lead] = await db
        .select()
        .from(leads)
        .where(eq(leads.id, input.leadId))
        .limit(1);

      if (!lead) return null;

      // Get tracking events
      const events = await db
        .select()
        .from(leadTrackingEvents)
        .where(eq(leadTrackingEvents.leadId, lead.id))
        .orderBy(desc(leadTrackingEvents.createdAt));

      return {
        lead: {
          id: lead.id,
          status: lead.status,
          suburb: lead.suburb,
          state: lead.state,
          propertyType: lead.propertyType,
          estimatedSystemSize: lead.estimatedSystemSize,
          createdAt: lead.createdAt,
        },
        events,
      };
    }),

  // Add tracking event (internal use)
  addEvent: protectedProcedure
    .input(z.object({
      leadId: z.number(),
      eventType: z.enum([
        "submitted",
        "verified",
        "matched",
        "installer_notified",
        "installer_viewed",
        "installer_responded",
        "quote_received",
        "installation_scheduled",
        "installation_completed",
        "review_requested"
      ]),
      description: z.string().optional(),
      installerId: z.number().optional(),
      installerName: z.string().optional(),
      metadata: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db.insert(leadTrackingEvents).values({
        leadId: input.leadId,
        eventType: input.eventType,
        description: input.description,
        installerId: input.installerId,
        installerName: input.installerName,
        metadata: input.metadata,
      });

      return { success: true };
    }),

  // Get timeline for a lead (admin)
  getTimeline: protectedProcedure
    .input(z.object({ leadId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      const events = await db
        .select()
        .from(leadTrackingEvents)
        .where(eq(leadTrackingEvents.leadId, input.leadId))
        .orderBy(desc(leadTrackingEvents.createdAt));

      return events;
    }),
});

// Helper function to add tracking events from other parts of the system
export async function addLeadTrackingEvent(
  leadId: number,
  eventType: typeof leadTrackingEvents.$inferInsert["eventType"],
  description?: string,
  installerId?: number,
  installerName?: string
) {
  const db = await getDb();
  if (!db) return;

  try {
    await db.insert(leadTrackingEvents).values({
      leadId,
      eventType,
      description,
      installerId,
      installerName,
    });
  } catch (error) {
    console.error("[LeadTracking] Failed to add event:", error);
  }
}
