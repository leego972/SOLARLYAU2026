import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, decimal } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Solar installation companies that purchase leads
 */
export const installers = mysqlTable("installers", {
  id: int("id").autoincrement().primaryKey(),
  companyName: varchar("companyName", { length: 255 }).notNull(),
  contactName: varchar("contactName", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  phone: varchar("phone", { length: 50 }),
  
  // Service area
  state: varchar("state", { length: 10 }).notNull(), // NSW, VIC, QLD, etc.
  servicePostcodes: text("servicePostcodes").notNull(), // JSON array of postcodes they service
  serviceRadius: int("serviceRadius").default(50).notNull(), // km radius from base location
  
  // Location
  address: text("address"),
  suburb: varchar("suburb", { length: 100 }),
  postcode: varchar("postcode", { length: 10 }),
  latitude: varchar("latitude", { length: 20 }),
  longitude: varchar("longitude", { length: 20 }),
  
  // Business details
  abn: varchar("abn", { length: 20 }),
  website: varchar("website", { length: 500 }),
  
  // Lead preferences
  maxLeadsPerMonth: int("maxLeadsPerMonth").default(50).notNull(),
  maxLeadPrice: int("maxLeadPrice").default(70).notNull(), // in AUD
  autoAcceptLeads: boolean("autoAcceptLeads").default(false).notNull(),
  
  // Stripe details
  stripeCustomerId: varchar("stripeCustomerId", { length: 255 }),
  
  // Status
  isActive: boolean("isActive").default(true).notNull(),
  isVerified: boolean("isVerified").default(false).notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Installer = typeof installers.$inferSelect;
export type InsertInstaller = typeof installers.$inferInsert;

/**
 * Solar panel installation leads
 */
export const leads = mysqlTable("leads", {
  id: int("id").autoincrement().primaryKey(),
  
  // Lead source
  source: mysqlEnum("source", ["ai_generated", "web_form", "api", "manual"]).default("ai_generated").notNull(),
  sourceDetails: text("sourceDetails"), // JSON with additional source info
  
  // Customer information
  customerName: varchar("customerName", { length: 255 }).notNull(),
  customerEmail: varchar("customerEmail", { length: 320 }),
  customerPhone: varchar("customerPhone", { length: 50 }).notNull(),
  
  // Property details
  address: text("address").notNull(),
  suburb: varchar("suburb", { length: 100 }).notNull(),
  state: varchar("state", { length: 10 }).notNull(),
  postcode: varchar("postcode", { length: 10 }).notNull(),
  latitude: varchar("latitude", { length: 20 }),
  longitude: varchar("longitude", { length: 20 }),
  
  // Lead details
  propertyType: mysqlEnum("propertyType", ["residential", "commercial", "industrial"]).default("residential").notNull(),
  roofType: varchar("roofType", { length: 50 }),
  estimatedSystemSize: int("estimatedSystemSize"), // in kW
  currentElectricityBill: int("currentElectricityBill"), // monthly in AUD
  
  // Lead quality score (0-100)
  qualityScore: int("qualityScore").default(50).notNull(),
  
  // Lead status
  status: mysqlEnum("status", ["new", "offered", "accepted", "sold", "expired", "invalid"]).default("new").notNull(),
  
  // Pricing
  basePrice: int("basePrice").default(50).notNull(), // in AUD
  finalPrice: int("finalPrice"), // Final price after urgency/bundle discounts
  
  // Revenue Maximization Features
  isResold: boolean("isResold").default(false).notNull(),
  originalSaleDate: timestamp("originalSaleDate"),
  resaleCount: int("resaleCount").default(0).notNull(),
  leadType: mysqlEnum("leadType", ["standard", "commercial", "battery_storage"]).default("standard").notNull(),
  enrichmentLevel: mysqlEnum("enrichmentLevel", ["none", "basic", "premium"]).default("none").notNull(),
  enrichmentData: text("enrichmentData"), // JSON: phone verified, photos, roof analysis
  isAuctionLead: boolean("isAuctionLead").default(false).notNull(),
  auctionStartPrice: int("auctionStartPrice"),
  auctionEndTime: timestamp("auctionEndTime"),
  
  // Notes and metadata
  notes: text("notes"),
  metadata: text("metadata"), // JSON for additional data
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  expiresAt: timestamp("expiresAt"), // When lead expires if not sold
});

export type Lead = typeof leads.$inferSelect;
export type InsertLead = typeof leads.$inferInsert;

/**
 * Lead offers sent to installers
 */
export const leadOffers = mysqlTable("leadOffers", {
  id: int("id").autoincrement().primaryKey(),
  leadId: int("leadId").notNull(),
  installerId: int("installerId").notNull(),
  
  // Offer details
  offerPrice: int("offerPrice").notNull(), // in AUD
  distance: int("distance"), // km from installer to lead
  
  // Status
  status: mysqlEnum("status", ["pending", "accepted", "rejected", "expired"]).default("pending").notNull(),
  
  // Response tracking
  sentAt: timestamp("sentAt").defaultNow().notNull(),
  respondedAt: timestamp("respondedAt"),
  expiresAt: timestamp("expiresAt").notNull(), // Offer expiration (24-48 hours)
  
  // Notification tracking
  emailSent: boolean("emailSent").default(false).notNull(),
  smsSent: boolean("smsSent").default(false).notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type LeadOffer = typeof leadOffers.$inferSelect;
export type InsertLeadOffer = typeof leadOffers.$inferInsert;

/**
 * Transactions for lead sales
 */
export const transactions = mysqlTable("transactions", {
  id: int("id").autoincrement().primaryKey(),
  leadId: int("leadId").notNull(),
  installerId: int("installerId").notNull(),
  leadOfferId: int("leadOfferId").notNull(),
  
  // Payment details
  amount: int("amount").notNull(), // in AUD cents
  currency: varchar("currency", { length: 3 }).default("AUD").notNull(),
  
  // Stripe details
  stripePaymentIntentId: varchar("stripePaymentIntentId", { length: 255 }),
  stripeChargeId: varchar("stripeChargeId", { length: 255 }),
  stripeInvoiceId: varchar("stripeInvoiceId", { length: 255 }),
  
  // Status
  status: mysqlEnum("status", ["pending", "processing", "succeeded", "failed", "refunded"]).default("pending").notNull(),
  
  // Metadata
  metadata: text("metadata"), // JSON for additional payment data
  failureReason: text("failureReason"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  paidAt: timestamp("paidAt"),
});

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = typeof transactions.$inferInsert;

/**
 * AI agent activity log for tracking autonomous operations
 */
export const agentActivities = mysqlTable("agentActivities", {
  id: int("id").autoincrement().primaryKey(),
  
  // Activity details
  activityType: mysqlEnum("activityType", [
    "lead_generation",
    "lead_qualification", 
    "installer_outreach",
    "lead_matching",
    "system_optimization",
    "data_analysis"
  ]).notNull(),
  
  description: text("description").notNull(),
  
  // Results
  status: mysqlEnum("status", ["success", "partial", "failed"]).notNull(),
  leadsGenerated: int("leadsGenerated").default(0).notNull(),
  leadsQualified: int("leadsQualified").default(0).notNull(),
  offersCreated: int("offersCreated").default(0).notNull(),
  
  // Metadata
  metadata: text("metadata"), // JSON for detailed activity data
  errorDetails: text("errorDetails"),
  
  // Timing
  startedAt: timestamp("startedAt").notNull(),
  completedAt: timestamp("completedAt"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AgentActivity = typeof agentActivities.$inferSelect;
export type InsertAgentActivity = typeof agentActivities.$inferInsert;

/**
 * System configuration and settings
 */
export const systemConfig = mysqlTable("systemConfig", {
  id: int("id").autoincrement().primaryKey(),
  key: varchar("key", { length: 100 }).notNull().unique(),
  value: text("value").notNull(),
  description: text("description"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SystemConfig = typeof systemConfig.$inferSelect;
export type InsertSystemConfig = typeof systemConfig.$inferInsert;

/**
 * Bundle purchases for tracking multi-lead deals
 */
export const bundlePurchases = mysqlTable("bundlePurchases", {
  id: int("id").autoincrement().primaryKey(),
  installerId: int("installerId").notNull(),
  bundleType: mysqlEnum("bundleType", ["buy5get1", "weekly10", "monthly30"]).notNull(),
  totalLeads: int("totalLeads").notNull(),
  originalPrice: int("originalPrice").notNull(), // in AUD cents
  discountAmount: int("discountAmount").notNull(),
  finalPrice: int("finalPrice").notNull(),
  stripePaymentIntentId: varchar("stripePaymentIntentId", { length: 255 }),
  status: mysqlEnum("status", ["pending", "completed", "failed"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type BundlePurchase = typeof bundlePurchases.$inferSelect;
export type InsertBundlePurchase = typeof bundlePurchases.$inferInsert;

/**
 * Installer training and certifications
 */
export const installerCertifications = mysqlTable("installerCertifications", {
  id: int("id").autoincrement().primaryKey(),
  installerId: int("installerId").notNull(),
  certificationType: mysqlEnum("certificationType", ["basic", "advanced", "master"]).notNull(),
  purchaseDate: timestamp("purchaseDate").defaultNow().notNull(),
  expiryDate: timestamp("expiryDate"),
  isActive: boolean("isActive").default(true).notNull(),
  stripePaymentIntentId: varchar("stripePaymentIntentId", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type InstallerCertification = typeof installerCertifications.$inferSelect;
export type InsertInstallerCertification = typeof installerCertifications.$inferInsert;

/**
 * Monthly training subscriptions
 */
export const trainingSubscriptions = mysqlTable("trainingSubscriptions", {
  id: int("id").autoincrement().primaryKey(),
  installerId: int("installerId").notNull(),
  stripeSubscriptionId: varchar("stripeSubscriptionId", { length: 255 }).notNull(),
  status: mysqlEnum("status", ["active", "cancelled", "past_due"]).default("active").notNull(),
  monthlyFee: int("monthlyFee").default(9900).notNull(), // $99 in cents
  startDate: timestamp("startDate").defaultNow().notNull(),
  endDate: timestamp("endDate"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type TrainingSubscription = typeof trainingSubscriptions.$inferSelect;
export type InsertTrainingSubscription = typeof trainingSubscriptions.$inferInsert;

/**
 * White-label clients
 */
export const whiteLabelClients = mysqlTable("whiteLabelClients", {
  id: int("id").autoincrement().primaryKey(),
  companyName: varchar("companyName", { length: 255 }).notNull(),
  contactEmail: varchar("contactEmail", { length: 320 }).notNull(),
  industry: varchar("industry", { length: 100 }).notNull(), // HVAC, roofing, windows, etc.
  setupFee: int("setupFee").default(500000).notNull(), // $5000 in cents
  monthlyLicense: int("monthlyLicense").default(99900).notNull(), // $999 in cents
  revenueSharePercentage: int("revenueSharePercentage").default(10).notNull(),
  stripeCustomerId: varchar("stripeCustomerId", { length: 255 }),
  stripeSubscriptionId: varchar("stripeSubscriptionId", { length: 255 }),
  status: mysqlEnum("status", ["active", "suspended", "cancelled"]).default("active").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type WhiteLabelClient = typeof whiteLabelClients.$inferSelect;
export type InsertWhiteLabelClient = typeof whiteLabelClients.$inferInsert;

/**
 * Referral tracking
 */
export const referrals = mysqlTable("referrals", {
  id: int("id").autoincrement().primaryKey(),
  referrerId: int("referrerId").notNull(), // Installer who made the referral
  referredInstallerId: int("referredInstallerId").notNull(), // New installer
  commissionAmount: int("commissionAmount").default(5000).notNull(), // $50 in cents
  status: mysqlEnum("status", ["pending", "paid", "cancelled"]).default("pending").notNull(),
  paidAt: timestamp("paidAt"),
  stripePayoutId: varchar("stripePayoutId", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Referral = typeof referrals.$inferSelect;
export type InsertReferral = typeof referrals.$inferInsert;

/**
 * Auction bids for premium leads
 */
export const auctionBids = mysqlTable("auctionBids", {
  id: int("id").autoincrement().primaryKey(),
  leadId: int("leadId").notNull(),
  installerId: int("installerId").notNull(),
  bidAmount: int("bidAmount").notNull(), // in AUD cents
  isWinningBid: boolean("isWinningBid").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AuctionBid = typeof auctionBids.$inferSelect;
export type InsertAuctionBid = typeof auctionBids.$inferInsert;

/**
 * Performance-based pricing tracking
 */
export const leadClosures = mysqlTable("leadClosures", {
  id: int("id").autoincrement().primaryKey(),
  leadId: int("leadId").notNull(),
  installerId: int("installerId").notNull(),
  transactionId: int("transactionId").notNull(),
  closedDate: timestamp("closedDate").notNull(),
  contractValue: int("contractValue"), // Actual solar installation value
  performanceBonus: int("performanceBonus").default(4000).notNull(), // $40 bonus in cents
  bonusPaid: boolean("bonusPaid").default(false).notNull(),
  stripeBonusPaymentId: varchar("stripeBonusPaymentId", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type LeadClosure = typeof leadClosures.$inferSelect;
export type InsertLeadClosure = typeof leadClosures.$inferInsert;

/**
 * Email leads captured from marketing popups
 */
export const emailLeads = mysqlTable("emailLeads", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  source: varchar("source", { length: 100 }).default("popup").notNull(), // popup, landing_page, etc.
  guideDownloaded: boolean("guideDownloaded").default(false).notNull(),
  convertedToInstaller: boolean("convertedToInstaller").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type EmailLead = typeof emailLeads.$inferSelect;
export type InsertEmailLead = typeof emailLeads.$inferInsert;

/**
 * Video testimonials from successful installers
 */
export const videoTestimonials = mysqlTable("videoTestimonials", {
  id: int("id").autoincrement().primaryKey(),
  installerId: int("installerId").notNull(),
  installerName: varchar("installerName", { length: 255 }).notNull(),
  companyName: varchar("companyName", { length: 255 }).notNull(),
  
  // Video details
  videoUrl: varchar("videoUrl", { length: 500 }).notNull(), // S3 URL
  thumbnailUrl: varchar("thumbnailUrl", { length: 500 }), // Optional thumbnail
  duration: int("duration"), // Duration in seconds
  
  // Testimonial content
  title: varchar("title", { length: 255 }).notNull(),
  quote: text("quote").notNull(), // Short text version
  
  // Metrics mentioned in testimonial
  revenueBefore: int("revenueBefore"), // Annual revenue before using SolarlyAU
  revenueAfter: int("revenueAfter"), // Annual revenue after
  closeRateBefore: int("closeRateBefore"), // Close rate % before
  closeRateAfter: int("closeRateAfter"), // Close rate % after
  
  // Display settings
  featured: boolean("featured").default(false).notNull(),
  displayOrder: int("displayOrder").default(0).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type VideoTestimonial = typeof videoTestimonials.$inferSelect;
export type InsertVideoTestimonial = typeof videoTestimonials.$inferInsert;

/**
 * Monthly advertising budget approvals
 */
export const adBudgets = mysqlTable("adBudgets", {
  id: int("id").autoincrement().primaryKey(),
  month: timestamp("month").notNull(), // First day of the month
  amount: int("amount").notNull(), // Monthly budget in AUD
  status: mysqlEnum("status", ["pending", "approved", "rejected"]).default("pending").notNull(),
  approvedBy: int("approvedBy"), // User ID who approved
  approvedAt: timestamp("approvedAt"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AdBudget = typeof adBudgets.$inferSelect;
export type InsertAdBudget = typeof adBudgets.$inferInsert;

/**
 * Google Ads campaigns
 */
export const adCampaigns = mysqlTable("adCampaigns", {
  id: int("id").autoincrement().primaryKey(),
  googleCampaignId: varchar("googleCampaignId", { length: 255 }), // Google Ads campaign ID
  name: varchar("name", { length: 255 }).notNull(),
  status: mysqlEnum("status", ["active", "paused", "ended"]).default("active").notNull(),
  
  // Budget
  dailyBudget: int("dailyBudget").notNull(), // Daily budget in AUD
  monthlyBudget: int("monthlyBudget").notNull(), // Monthly budget in AUD
  targetCostPerLead: int("targetCostPerLead").default(20).notNull(), // Target cost per lead in AUD
  
  // Campaign configuration
  keywords: text("keywords").notNull(), // JSON array of keywords
  adCopy: text("adCopy").notNull(), // JSON object with headlines and descriptions
  locations: text("locations").notNull(), // JSON array of geo targets
  
  // Performance tracking
  totalSpent: int("totalSpent").default(0).notNull(), // Total spent in AUD cents
  totalClicks: int("totalClicks").default(0).notNull(),
  totalImpressions: int("totalImpressions").default(0).notNull(),
  totalConversions: int("totalConversions").default(0).notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AdCampaign = typeof adCampaigns.$inferSelect;
export type InsertAdCampaign = typeof adCampaigns.$inferInsert;

/**
 * Daily ad performance metrics
 */
export const adPerformance = mysqlTable("adPerformance", {
  id: int("id").autoincrement().primaryKey(),
  campaignId: int("campaignId").notNull(),
  date: timestamp("date").notNull(),
  
  // Metrics
  impressions: int("impressions").default(0).notNull(),
  clicks: int("clicks").default(0).notNull(),
  cost: int("cost").default(0).notNull(), // Cost in AUD cents
  conversions: int("conversions").default(0).notNull(),
  
  // Calculated metrics
  ctr: int("ctr").default(0).notNull(), // Click-through rate (percentage * 100)
  cpc: int("cpc").default(0).notNull(), // Cost per click in cents
  costPerConversion: int("costPerConversion").default(0).notNull(), // Cost per conversion in cents
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AdPerformance = typeof adPerformance.$inferSelect;
export type InsertAdPerformance = typeof adPerformance.$inferInsert;


/**
 * Phone verification records for lead quality assurance
 */
export const phoneVerifications = mysqlTable("phone_verifications", {
  id: varchar("id", { length: 64 }).primaryKey(),
  phoneNumber: varchar("phone_number", { length: 20 }).notNull(),
  code: varchar("code", { length: 10 }).notNull(),
  leadId: int("lead_id"),
  verified: boolean("verified").default(false).notNull(),
  verifiedAt: timestamp("verified_at"),
  attempts: int("attempts").default(0).notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type PhoneVerification = typeof phoneVerifications.$inferSelect;
export type InsertPhoneVerification = typeof phoneVerifications.$inferInsert;


/**
 * Installer ratings from homeowners after installation
 */
export const installerRatings = mysqlTable("installer_ratings", {
  id: int("id").autoincrement().primaryKey(),
  installerId: int("installerId").notNull(),
  leadId: int("leadId"), // Optional link to original lead
  
  // Reviewer info
  reviewerName: varchar("reviewerName", { length: 255 }).notNull(),
  reviewerEmail: varchar("reviewerEmail", { length: 320 }),
  reviewerLocation: varchar("reviewerLocation", { length: 100 }),
  
  // Ratings (1-5 scale)
  overallRating: int("overallRating").notNull(),
  communicationRating: int("communicationRating"),
  qualityRating: int("qualityRating"),
  valueRating: int("valueRating"),
  timelinessRating: int("timelinessRating"),
  
  // Review content
  title: varchar("title", { length: 255 }),
  comment: text("comment").notNull(),
  
  // Installation details
  systemSize: varchar("systemSize", { length: 50 }),
  installationDate: timestamp("installationDate"),
  
  // Moderation
  isVerified: boolean("isVerified").default(false).notNull(),
  isApproved: boolean("isApproved").default(false).notNull(),
  isPublished: boolean("isPublished").default(false).notNull(),
  
  // Installer response
  installerResponse: text("installerResponse"),
  installerResponseAt: timestamp("installerResponseAt"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type InstallerRating = typeof installerRatings.$inferSelect;
export type InsertInstallerRating = typeof installerRatings.$inferInsert;

/**
 * Blog posts for content management
 */
export const blogPosts = mysqlTable("blog_posts", {
  id: int("id").autoincrement().primaryKey(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  title: varchar("title", { length: 255 }).notNull(),
  excerpt: text("excerpt").notNull(),
  content: text("content").notNull(),
  
  // Author info
  authorName: varchar("authorName", { length: 255 }).notNull(),
  authorRole: varchar("authorRole", { length: 100 }),
  authorAvatar: varchar("authorAvatar", { length: 500 }),
  
  // Metadata
  category: varchar("category", { length: 100 }).notNull(),
  tags: text("tags"), // JSON array of tags
  featuredImage: varchar("featuredImage", { length: 500 }),
  readingTime: int("readingTime").default(5).notNull(), // minutes
  
  // SEO
  metaTitle: varchar("metaTitle", { length: 255 }),
  metaDescription: text("metaDescription"),
  
  // Status
  isPublished: boolean("isPublished").default(false).notNull(),
  publishedAt: timestamp("publishedAt"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type BlogPost = typeof blogPosts.$inferSelect;
export type InsertBlogPost = typeof blogPosts.$inferInsert;

/**
 * Managed testimonials for content management
 */
export const managedTestimonials = mysqlTable("managed_testimonials", {
  id: int("id").autoincrement().primaryKey(),
  
  // Person info
  name: varchar("name", { length: 255 }).notNull(),
  location: varchar("location", { length: 100 }).notNull(),
  role: varchar("role", { length: 100 }), // "Homeowner", "Business Owner", "Installer"
  avatar: varchar("avatar", { length: 500 }),
  
  // Testimonial content
  quote: text("quote").notNull(),
  rating: int("rating").default(5).notNull(),
  
  // Context
  type: mysqlEnum("type", ["homeowner", "installer"]).default("homeowner").notNull(),
  systemSize: varchar("systemSize", { length: 50 }),
  savings: varchar("savings", { length: 100 }),
  
  // Display
  isFeatured: boolean("isFeatured").default(false).notNull(),
  displayOrder: int("displayOrder").default(0).notNull(),
  isPublished: boolean("isPublished").default(true).notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ManagedTestimonial = typeof managedTestimonials.$inferSelect;
export type InsertManagedTestimonial = typeof managedTestimonials.$inferInsert;


/**
 * Lead tracking events for homeowner dashboard
 */
export const leadTrackingEvents = mysqlTable("lead_tracking_events", {
  id: int("id").autoincrement().primaryKey(),
  leadId: int("leadId").notNull(),
  
  // Event details
  eventType: mysqlEnum("eventType", [
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
  ]).notNull(),
  
  // Event metadata
  description: text("description"),
  installerId: int("installerId"),
  installerName: varchar("installerName", { length: 255 }),
  metadata: text("metadata"), // JSON for additional event data
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type LeadTrackingEvent = typeof leadTrackingEvents.$inferSelect;
export type InsertLeadTrackingEvent = typeof leadTrackingEvents.$inferInsert;

/**
 * Rating tokens for secure rating links
 */
export const ratingTokens = mysqlTable("rating_tokens", {
  id: int("id").autoincrement().primaryKey(),
  token: varchar("token", { length: 64 }).notNull().unique(),
  leadId: int("leadId").notNull(),
  installerId: int("installerId").notNull(),
  
  // Token status
  isUsed: boolean("isUsed").default(false).notNull(),
  usedAt: timestamp("usedAt"),
  expiresAt: timestamp("expiresAt").notNull(),
  
  // Email tracking
  emailOpenedAt: timestamp("emailOpenedAt"),
  emailClickedAt: timestamp("emailClickedAt"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type RatingToken = typeof ratingTokens.$inferSelect;
export type InsertRatingToken = typeof ratingTokens.$inferInsert;


/**
 * Installer success metrics for tracking performance and social proof
 */
export const installerMetrics = mysqlTable("installerMetrics", {
  id: int("id").autoincrement().primaryKey(),
  installerId: int("installerId").notNull(),
  
  // Lead metrics
  totalLeadsPurchased: int("totalLeadsPurchased").default(0).notNull(),
  totalLeadsConverted: int("totalLeadsConverted").default(0).notNull(),
  conversionRate: int("conversionRate").default(0).notNull(), // percentage * 100
  
  // Revenue metrics
  totalSpent: int("totalSpent").default(0).notNull(), // in cents
  totalRevenue: int("totalRevenue").default(0).notNull(), // in cents
  averageDealSize: int("averageDealSize").default(0).notNull(), // in cents
  roi: int("roi").default(0).notNull(), // ROI * 100 (e.g., 5900 = 59x ROI)
  
  // Time metrics
  averageTimeToClose: int("averageTimeToClose").default(0).notNull(), // in hours
  fastestClose: int("fastestClose").default(0).notNull(), // in hours
  
  // Quality metrics
  averageLeadQuality: int("averageLeadQuality").default(0).notNull(), // 0-100
  customerSatisfaction: int("customerSatisfaction").default(0).notNull(), // 0-100
  
  // Status
  isPublic: boolean("isPublic").default(false).notNull(), // Show in public dashboard
  lastUpdated: timestamp("lastUpdated").defaultNow().onUpdateNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type InstallerMetrics = typeof installerMetrics.$inferSelect;
export type InsertInstallerMetrics = typeof installerMetrics.$inferInsert;

/**
 * Individual conversion events for detailed tracking
 */
export const conversionEvents = mysqlTable("conversionEvents", {
  id: int("id").autoincrement().primaryKey(),
  installerId: int("installerId").notNull(),
  leadId: int("leadId").notNull(),
  
  // Event details
  purchaseDate: timestamp("purchaseDate").notNull(),
  conversionDate: timestamp("conversionDate"),
  hoursToClose: int("hoursToClose"), // Time from purchase to conversion
  
  // Deal details
  dealValue: int("dealValue").notNull(), // in cents
  systemSize: int("systemSize"), // in watts
  includesBattery: boolean("includesBattery").default(false).notNull(),
  
  // Quality
  leadQualityScore: int("leadQualityScore").notNull(), // 0-100
  customerRating: int("customerRating"), // 1-5 stars
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ConversionEvent = typeof conversionEvents.$inferSelect;
export type InsertConversionEvent = typeof conversionEvents.$inferInsert;
