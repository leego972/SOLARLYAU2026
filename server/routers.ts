import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { videoTestimonialRouter } from "./videoTestimonialRouter";
import { googleAdsRouter } from "./googleAdsRouter";
import { leadClosureRouter } from "./leadClosureRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from './db';
import { TRPCError } from "@trpc/server";

// ============ VALIDATION SCHEMAS ============

const createInstallerSchema = z.object({
  companyName: z.string().min(1).max(255),
  contactName: z.string().min(1).max(255),
  email: z.string().email().max(320),
  phone: z.string().max(50).optional(),
  state: z.string().min(2).max(10),
  servicePostcodes: z.string(), // JSON array as string
  serviceRadius: z.number().int().min(1).max(500).default(50),
  address: z.string().optional(),
  suburb: z.string().max(100).optional(),
  postcode: z.string().max(10).optional(),
  latitude: z.string().max(20).optional(),
  longitude: z.string().max(20).optional(),
  abn: z.string().max(20).optional(),
  website: z.string().max(500).optional(),
  maxLeadsPerMonth: z.number().int().min(1).max(1000).default(50),
  maxLeadPrice: z.number().int().min(1).max(500).default(70),
  autoAcceptLeads: z.boolean().default(false),
});

const createLeadSchema = z.object({
  source: z.enum(["ai_generated", "web_form", "api", "manual"]).default("ai_generated"),
  sourceDetails: z.string().optional(),
  customerName: z.string().min(1).max(255),
  customerEmail: z.string().email().max(320).optional(),
  customerPhone: z.string().min(1).max(50),
  address: z.string().min(1),
  suburb: z.string().min(1).max(100),
  state: z.string().min(2).max(10),
  postcode: z.string().min(4).max(10),
  latitude: z.string().max(20).optional(),
  longitude: z.string().max(20).optional(),
  propertyType: z.enum(["residential", "commercial", "industrial"]).default("residential"),
  roofType: z.string().max(50).optional(),
  estimatedSystemSize: z.number().int().optional(),
  currentElectricityBill: z.number().int().optional(),
  qualityScore: z.number().int().min(0).max(100).default(50),
  basePrice: z.number().int().min(1).max(500).default(50),
  notes: z.string().optional(),
  metadata: z.string().optional(),
});

const updateLeadSchema = z.object({
  id: z.number().int(),
  status: z.enum(["new", "offered", "accepted", "sold", "expired", "invalid"]).optional(),
  qualityScore: z.number().int().min(0).max(100).optional(),
  notes: z.string().optional(),
});

const createLeadOfferSchema = z.object({
  leadId: z.number().int(),
  installerId: z.number().int(),
  offerPrice: z.number().int().min(1),
  distance: z.number().int().optional(),
  expiresAt: z.date(),
});

const respondToOfferSchema = z.object({
  offerId: z.number().int(),
  accept: z.boolean(),
});

// ============ ADMIN PROCEDURE ============

const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
  }
  return next({ ctx });
});

// ============ ROUTERS ============

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // ============ INSTALLER ROUTES ============
  installers: router({
    create: adminProcedure.input(createInstallerSchema).mutation(async ({ input }) => {
      return await db.createInstaller(input);
    }),

    getAll: adminProcedure.query(async () => {
      return await db.getAllInstallers();
    }),

    getActive: publicProcedure.query(async () => {
      return await db.getActiveInstallers();
    }),

    getById: adminProcedure.input(z.object({ id: z.number().int() })).query(async ({ input }) => {
      const installer = await db.getInstallerById(input.id);
      if (!installer) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Installer not found" });
      }
      return installer;
    }),

    update: adminProcedure
      .input(
        z.object({
          id: z.number().int(),
          data: createInstallerSchema.partial(),
        })
      )
      .mutation(async ({ input }) => {
        await db.updateInstaller(input.id, input.data);
        return { success: true };
      }),

    getStats: adminProcedure.query(async () => {
      return await db.getInstallerStats();
    }),
  }),

  // ============ LEAD ROUTES ============
  leads: router({
    create: adminProcedure.input(createLeadSchema).mutation(async ({ input }) => {
      // Set expiration date (7 days from now)
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      return await db.createLead({
        ...input,
        expiresAt,
      });
    }),

    getAll: adminProcedure
      .input(z.object({ limit: z.number().int().min(1).max(500).default(100) }).optional())
      .query(async ({ input }) => {
        return await db.getAllLeads(input?.limit);
      }),

    getById: adminProcedure.input(z.object({ id: z.number().int() })).query(async ({ input }) => {
      const lead = await db.getLeadById(input.id);
      if (!lead) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Lead not found" });
      }
      return lead;
    }),

    getByStatus: adminProcedure
      .input(
        z.object({
          status: z.enum(["new", "offered", "accepted", "sold", "expired", "invalid"]),
        })
      )
      .query(async ({ input }) => {
        return await db.getLeadsByStatus(input.status);
      }),

    getNew: adminProcedure.query(async () => {
      return await db.getNewLeads();
    }),

    update: adminProcedure.input(updateLeadSchema).mutation(async ({ input }) => {
      const { id, ...data } = input;
      await db.updateLead(id, data);
      return { success: true };
    }),

    getStats: adminProcedure.query(async () => {
      return await db.getLeadStats();
    }),

    // Opt-in lead creation (legal compliance)
    createOptIn: publicProcedure
      .input(
        z.object({
          name: z.string(),
          phone: z.string(),
          email: z.string().email(),
          address: z.string(),
          suburb: z.string(),
          state: z.string(),
          postcode: z.string(),
          propertyType: z.enum(["residential", "commercial"]),
          estimatedBill: z.string().optional(),
          source: z.string(),
        })
      )
      .mutation(async ({ input }) => {
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        const lead = await db.createLead({
          customerName: input.name,
          customerPhone: input.phone,
          customerEmail: input.email,
          address: input.address,
          suburb: input.suburb,
          state: input.state,
          postcode: input.postcode,
          propertyType: input.propertyType as "residential" | "commercial" | "industrial",
          qualityScore: 95, // Opt-in leads are highest quality
          estimatedSystemSize: 6,
          basePrice: 55,
          source: "web_form",
          status: "new",
          metadata: JSON.stringify({ estimatedBill: input.estimatedBill, consent: true }),
          expiresAt,
        });

        return { success: true, leadId: lead.id };
      }),

    // Public quote request form (real homeowner leads)
    submitQuoteRequest: publicProcedure
      .input(
        z.object({
          customerName: z.string().min(1),
          customerEmail: z.string().email().optional(),
          customerPhone: z.string().min(1),
          address: z.string().min(1),
          suburb: z.string().min(1),
          state: z.string().min(2),
          postcode: z.string().min(4),
          propertyType: z.enum(["residential", "commercial", "industrial"]).default("residential"),
          roofType: z.string().optional(),
          estimatedSystemSize: z.number().int().optional(),
          currentElectricityBill: z.number().int().optional(),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        // Basic spam filtering
        const spamKeywords = ['test', 'spam', 'fake', 'asdf', 'qwerty'];
        const nameWords = input.customerName.toLowerCase().split(' ');
        const hasSpamKeyword = spamKeywords.some(keyword => 
          nameWords.some(word => word.includes(keyword))
        );
        
        if (hasSpamKeyword) {
          throw new TRPCError({ 
            code: 'BAD_REQUEST', 
            message: 'Invalid submission detected. Please provide real information.' 
          });
        }
        
        // Validate phone number format (Australian)
        const phoneRegex = /^(?:\+?61|0)[2-478](?:[ -]?[0-9]){8}$/;
        const cleanPhone = input.customerPhone.replace(/\s+/g, '');
        if (!phoneRegex.test(cleanPhone)) {
          throw new TRPCError({ 
            code: 'BAD_REQUEST', 
            message: 'Please provide a valid Australian phone number' 
          });
        }
        
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        // Calculate quality score based on information provided
        let qualityScore = 80; // Base score for real quote requests
        if (input.customerEmail) qualityScore += 5;
        if (input.estimatedSystemSize) qualityScore += 5;
        if (input.currentElectricityBill) qualityScore += 5;
        if (input.notes) qualityScore += 5;

        // Calculate base price based on property type
        let basePrice = 60; // Residential default
        if (input.propertyType === "commercial") basePrice = 240;
        if (input.propertyType === "industrial") basePrice = 300;

        const lead = await db.createLead({
          customerName: input.customerName,
          customerPhone: input.customerPhone,
          customerEmail: input.customerEmail,
          address: input.address,
          suburb: input.suburb,
          state: input.state,
          postcode: input.postcode,
          propertyType: input.propertyType,
          roofType: input.roofType,
          estimatedSystemSize: input.estimatedSystemSize,
          currentElectricityBill: input.currentElectricityBill,
          qualityScore,
          basePrice,
          source: "web_form",
          sourceDetails: "Public quote request form",
          status: "new",
          notes: input.notes,
          metadata: JSON.stringify({ 
            consent: true, 
            submittedAt: new Date().toISOString(),
            userAgent: "web"
          }),
          expiresAt,
        });

        console.log(`[QuoteRequest] New real lead created: ID ${lead.id} from ${input.suburb}, ${input.state}`);

        return { success: true, leadId: lead.id };
      }),
  }),

  // ============ LEAD OFFER ROUTES ============
  offers: router({
    create: adminProcedure.input(createLeadOfferSchema).mutation(async ({ input }) => {
      return await db.createLeadOffer(input);
    }),

    getByLeadId: adminProcedure
      .input(z.object({ leadId: z.number().int() }))
      .query(async ({ input }) => {
        return await db.getOffersByLeadId(input.leadId);
      }),

    getByInstallerId: adminProcedure
      .input(z.object({ installerId: z.number().int() }))
      .query(async ({ input }) => {
        return await db.getOffersByInstallerId(input.installerId);
      }),

    getPending: adminProcedure.query(async () => {
      return await db.getPendingOffers();
    }),

    respond: adminProcedure.input(respondToOfferSchema).mutation(async ({ input }) => {
      const offer = await db.getLeadOfferById(input.offerId);
      if (!offer) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Offer not found" });
      }

      if (offer.status !== "pending") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Offer is no longer pending" });
      }

      if (new Date() > offer.expiresAt) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Offer has expired" });
      }

      const newStatus = input.accept ? "accepted" : "rejected";
      await db.updateLeadOffer(input.offerId, {
        status: newStatus,
        respondedAt: new Date(),
      });

      // If accepted, update lead status
      if (input.accept) {
        await db.updateLead(offer.leadId, { status: "accepted" });
      }

      return { success: true, status: newStatus };
    }),

    getExpired: adminProcedure.query(async () => {
      return await db.getExpiredOffers();
    }),
  }),

  // ============ TRANSACTION ROUTES ============
  transactions: router({
    create: adminProcedure
      .input(
        z.object({
          leadId: z.number().int(),
          installerId: z.number().int(),
          leadOfferId: z.number().int(),
          amount: z.number().int().min(1),
        })
      )
      .mutation(async ({ input }) => {
        return await db.createTransaction({
          ...input,
          currency: "AUD",
          status: "pending",
        });
      }),

    getAll: adminProcedure
      .input(z.object({ limit: z.number().int().min(1).max(500).default(100) }).optional())
      .query(async ({ input }) => {
        return await db.getAllTransactions(input?.limit);
      }),

    getByInstallerId: adminProcedure
      .input(z.object({ installerId: z.number().int() }))
      .query(async ({ input }) => {
        return await db.getTransactionsByInstallerId(input.installerId);
      }),

    getSuccessful: adminProcedure.query(async () => {
      return await db.getSuccessfulTransactions();
    }),

    update: adminProcedure
      .input(
        z.object({
          id: z.number().int(),
          status: z.enum(["pending", "processing", "succeeded", "failed", "refunded"]).optional(),
          stripePaymentIntentId: z.string().optional(),
          stripeChargeId: z.string().optional(),
          stripeInvoiceId: z.string().optional(),
          paidAt: z.date().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateTransaction(id, data);
        return { success: true };
      }),
  }),

  // ============ AGENT ACTIVITY ROUTES ============
  agent: router({
    logActivity: adminProcedure
      .input(
        z.object({
          activityType: z.enum([
            "lead_generation",
            "lead_qualification",
            "installer_outreach",
            "lead_matching",
            "system_optimization",
            "data_analysis",
          ]),
          description: z.string(),
          status: z.enum(["success", "partial", "failed"]),
          leadsGenerated: z.number().int().default(0),
          leadsQualified: z.number().int().default(0),
          offersCreated: z.number().int().default(0),
          metadata: z.string().optional(),
          errorDetails: z.string().optional(),
          startedAt: z.date(),
          completedAt: z.date().optional(),
        })
      )
      .mutation(async ({ input }) => {
        return await db.createAgentActivity(input);
      }),

    getRecentActivities: adminProcedure
      .input(z.object({ limit: z.number().int().min(1).max(200).default(50) }).optional())
      .query(async ({ input }) => {
        return await db.getRecentAgentActivities(input?.limit);
      }),

    getByType: adminProcedure
      .input(
        z.object({
          activityType: z.enum([
            "lead_generation",
            "lead_qualification",
            "installer_outreach",
            "lead_matching",
            "system_optimization",
            "data_analysis",
          ]),
        })
      )
      .query(async ({ input }) => {
        return await db.getAgentActivitiesByType(input.activityType);
      }),
  }),

  // ============ ANALYTICS ROUTES ============
  analytics: router({
    dashboard: adminProcedure.query(async () => {
      const [leadStats, installerStats, revenueStats] = await Promise.all([
        db.getLeadStats(),
        db.getInstallerStats(),
        db.getRevenueStats(),
      ]);

      return {
        leads: leadStats,
        installers: installerStats,
        revenue: revenueStats,
      };
    }),

    revenue: adminProcedure.query(async () => {
      return await db.getRevenueStats();
    }),
  }),

  // ============ SYSTEM CONFIG ROUTES ============
  config: router({
    get: adminProcedure.input(z.object({ key: z.string() })).query(async ({ input }) => {
      return await db.getSystemConfig(input.key);
    }),

    set: adminProcedure
      .input(
        z.object({
          key: z.string(),
          value: z.string(),
          description: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        await db.setSystemConfig(input.key, input.value, input.description);
        return { success: true };
      }),

    getAll: adminProcedure.query(async () => {
      return await db.getAllSystemConfigs();
    }),
  }),

  // ============ PAYMENT ROUTES ============
  payments: router({
    createPaymentIntent: adminProcedure
      .input(
        z.object({
          leadId: z.number().int(),
          installerId: z.number().int(),
          offerId: z.number().int(),
        })
      )
      .mutation(async ({ input }) => {
        const { createLeadPaymentIntent } = await import("./stripe");
        return await createLeadPaymentIntent(
          input.leadId,
          input.installerId,
          input.offerId
        );
      }),

    createInvoice: adminProcedure
      .input(
        z.object({
          leadId: z.number().int(),
          installerId: z.number().int(),
          offerId: z.number().int(),
        })
      )
      .mutation(async ({ input }) => {
        const { createLeadInvoice } = await import("./stripe");
        return await createLeadInvoice(input.leadId, input.installerId, input.offerId);
      }),

    refund: adminProcedure
      .input(z.object({ transactionId: z.number().int() }))
      .mutation(async ({ input }) => {
        const { refundTransaction } = await import("./stripe");
        await refundTransaction(input.transactionId);
        return { success: true };
      }),
  }),

  // ============ PREMIUM PRICING & SUBSCRIPTIONS ============
  pricing: router({
    getTiers: publicProcedure.query(async () => {
      const { PRICING_TIERS } = await import("./pricingTiers");
      return Object.values(PRICING_TIERS);
    }),

    getSubscriptionPlans: publicProcedure.query(async () => {
      const { SUBSCRIPTION_PLANS } = await import("./pricingTiers");
      return Object.values(SUBSCRIPTION_PLANS);
    }),

    calculatePrice: publicProcedure
      .input(
        z.object({
          basePrice: z.number(),
          qualityScore: z.number(),
          propertyType: z.string(),
          postcode: z.string(),
          tier: z.string().optional(),
          subscriptionPlan: z.string().optional(),
          demandLevel: z.enum(["low", "medium", "high", "surge"]).optional(),
          quantity: z.number().optional(),
        })
      )
      .query(async ({ input }) => {
        const { calculateMaximumProfitPrice } = await import("./pricingTiers");
        return calculateMaximumProfitPrice(input);
      }),
  }),

  // ============ AI CUSTOMER SUPPORT CHATBOT ============
  // ============ MARKETING ROUTES ============
  videoTestimonials: videoTestimonialRouter,
  
  marketing: router({ captureEmail: publicProcedure
      .input(z.object({
        email: z.string().email(),
        name: z.string().min(1),
        source: z.string().default("popup"),
      }))
      .mutation(async ({ input }) => {
        return await db.captureEmailLead(input);
      }),

    getReferralStats: protectedProcedure.query(async ({ ctx }) => {
      return await db.getReferralStats(ctx.user.id);
    }),

    getReferralLink: protectedProcedure.query(async ({ ctx }) => {
      const installer = await db.getInstallerByUserId(ctx.user.id);
      if (!installer) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Installer not found" });
      }
      return {
        referralCode: `REF${installer.id}`,
        referralUrl: `https://solarlyau.com/installer/signup?ref=REF${installer.id}`,
      };
    }),
  }),

  support: router({
    chat: publicProcedure
      .input(
        z.object({
          question: z.string(),
          conversationHistory: z
            .array(
              z.object({
                role: z.enum(["user", "assistant", "system"]),
                content: z.string(),
              })
            )
            .optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { getChatbotResponse } = await import("./supportChatbot");
        return getChatbotResponse(input.question, input.conversationHistory);
      }),

    suggestedQuestions: publicProcedure.query(async () => {
      const { getSuggestedQuestions } = await import("./supportChatbot");
      return getSuggestedQuestions();
    }),
   }),

  // ============ GOOGLE ADS ROUTES ============
  googleAds: googleAdsRouter,

  // ============ LEAD CLOSURE ROUTES ============
  leadClosures: leadClosureRouter,
});
export type AppRouter = typeof appRouter;
