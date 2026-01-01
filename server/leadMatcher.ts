/**
 * Automated Lead Matching and Distribution Service
 * 
 * This service automatically matches new leads with suitable installers based on:
 * - Geographic proximity (postcode and radius)
 * - Installer capacity (max leads per month)
 * - Lead price preferences
 * - Service area coverage
 */

import * as db from './db';
import { Lead, Installer } from "../drizzle/schema";

interface MatchScore {
  installer: Installer;
  score: number;
  distance: number;
  reasons: string[];
}

/**
 * Calculate distance between two coordinates using Haversine formula
 * Returns distance in kilometers
 */
function calculateDistance(
  lat1: string | null,
  lon1: string | null,
  lat2: string | null,
  lon2: string | null
): number | null {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;

  const lat1Num = parseFloat(lat1);
  const lon1Num = parseFloat(lon1);
  const lat2Num = parseFloat(lat2);
  const lon2Num = parseFloat(lon2);

  const R = 6371; // Earth's radius in km
  const dLat = ((lat2Num - lat1Num) * Math.PI) / 180;
  const dLon = ((lon2Num - lon1Num) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1Num * Math.PI) / 180) *
      Math.cos((lat2Num * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Check if installer services the lead's postcode
 */
function servicesPostcode(installer: Installer, leadPostcode: string): boolean {
  try {
    const postcodes: string[] = JSON.parse(installer.servicePostcodes);
    return postcodes.includes(leadPostcode);
  } catch {
    return false;
  }
}

/**
 * Get installer's current month lead count
 */
async function getInstallerMonthlyLeadCount(installerId: number): Promise<number> {
  const offers = await db.getOffersByInstallerId(installerId);
  const thisMonth = new Date();
  thisMonth.setDate(1);
  thisMonth.setHours(0, 0, 0, 0);

  return offers.filter(
    (offer) => offer.status === "accepted" && offer.sentAt >= thisMonth
  ).length;
}

/**
 * Calculate match score for installer-lead pair
 * Higher score = better match
 */
async function calculateMatchScore(
  installer: Installer,
  lead: Lead
): Promise<MatchScore | null> {
  const reasons: string[] = [];
  let score = 0;

  // Check if installer is active and verified
  if (!installer.isActive || !installer.isVerified) {
    return null;
  }

  // Check state match
  if (installer.state !== lead.state) {
    return null;
  }

  // Check postcode service area
  const servicesArea = servicesPostcode(installer, lead.postcode);
  if (!servicesArea) {
    // Check distance if coordinates available
    const distance = calculateDistance(
      installer.latitude,
      installer.longitude,
      lead.latitude,
      lead.longitude
    );

    if (distance === null || distance > installer.serviceRadius) {
      return null;
    }

    reasons.push(`Within ${Math.round(distance)}km radius`);
    score += Math.max(0, 100 - distance); // Closer = higher score
  } else {
    reasons.push("Services postcode directly");
    score += 150; // Direct postcode service gets bonus
  }

  // Check monthly capacity
  const monthlyCount = await getInstallerMonthlyLeadCount(installer.id);
  if (monthlyCount >= installer.maxLeadsPerMonth) {
    return null; // At capacity
  }

  const capacityRemaining = installer.maxLeadsPerMonth - monthlyCount;
  reasons.push(`${capacityRemaining} leads remaining this month`);
  score += capacityRemaining * 2; // More capacity = higher score

  // Check price preference
  if (lead.basePrice > installer.maxLeadPrice) {
    return null; // Lead too expensive
  }

  const priceDiff = installer.maxLeadPrice - lead.basePrice;
  reasons.push(`Lead price $${lead.basePrice} (max $${installer.maxLeadPrice})`);
  score += priceDiff; // Cheaper leads get bonus

  // Lead quality bonus
  score += lead.qualityScore;
  reasons.push(`Lead quality score: ${lead.qualityScore}/100`);

  const distance =
    calculateDistance(
      installer.latitude,
      installer.longitude,
      lead.latitude,
      lead.longitude
    ) || 0;

  return {
    installer,
    score,
    distance,
    reasons,
  };
}

/**
 * Find best matching installers for a lead
 * Returns top N matches sorted by score
 */
export async function findMatchingInstallers(
  lead: Lead,
  maxMatches = 5
): Promise<MatchScore[]> {
  const installers = await db.getActiveInstallers();
  const matches: MatchScore[] = [];

  for (const installer of installers) {
    const match = await calculateMatchScore(installer, lead);
    if (match) {
      matches.push(match);
    }
  }

  // Sort by score (highest first)
  matches.sort((a, b) => b.score - a.score);

  return matches.slice(0, maxMatches);
}

/**
 * Create lead offers for matched installers
 */
export async function createOffersForLead(lead: Lead): Promise<number> {
  const matches = await findMatchingInstallers(lead);

  if (matches.length === 0) {
    console.log(`[LeadMatcher] No matching installers found for lead ${lead.id}`);
    return 0;
  }

  let offersCreated = 0;

  for (const match of matches) {
    // Check if offer already exists
    const existingOffers = await db.getOffersByLeadId(lead.id);
    const alreadyOffered = existingOffers.some(
      (offer) => offer.installerId === match.installer.id
    );

    if (alreadyOffered) {
      continue;
    }

    // Create offer with 48-hour expiration
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 48);

    await db.createLeadOffer({
      leadId: lead.id,
      installerId: match.installer.id,
      offerPrice: lead.basePrice,
      distance: Math.round(match.distance),
      expiresAt,
      status: "pending",
      emailSent: false,
      smsSent: false,
    });

    offersCreated++;
    console.log(
      `[LeadMatcher] Created offer for installer ${match.installer.companyName} (score: ${match.score})`
    );
  }

  // Update lead status
  if (offersCreated > 0) {
    await db.updateLead(lead.id, { status: "offered" });
  }

  return offersCreated;
}

/**
 * Process all new leads and create offers
 */
export async function processNewLeads(): Promise<{
  processed: number;
  offersCreated: number;
}> {
  const newLeads = await db.getNewLeads();

  let processed = 0;
  let totalOffers = 0;

  for (const lead of newLeads) {
    const offers = await createOffersForLead(lead);
    if (offers > 0) {
      processed++;
      totalOffers += offers;
    }
  }

  console.log(
    `[LeadMatcher] Processed ${processed} leads, created ${totalOffers} offers`
  );

  return {
    processed,
    offersCreated: totalOffers,
  };
}

/**
 * Handle expired offers
 * Re-offer to next best installers or mark lead as expired
 */
export async function handleExpiredOffers(): Promise<number> {
  const expiredOffers = await db.getExpiredOffers();
  let handled = 0;

  for (const offer of expiredOffers) {
    // Mark offer as expired
    await db.updateLeadOffer(offer.id, { status: "expired" });

    // Get lead
    const lead = await db.getLeadById(offer.leadId);
    if (!lead) continue;

    // Check if lead has any accepted offers
    const allOffers = await db.getOffersByLeadId(offer.leadId);
    const hasAccepted = allOffers.some((o) => o.status === "accepted");

    if (hasAccepted) {
      // Lead already sold
      continue;
    }

    // Check if lead itself has expired
    if (lead.expiresAt && new Date() > lead.expiresAt) {
      await db.updateLead(lead.id, { status: "expired" });
      continue;
    }

    // Try to create new offers for remaining installers
    const newOffers = await createOffersForLead(lead);
    if (newOffers === 0) {
      // No more installers available
      await db.updateLead(lead.id, { status: "expired" });
    }

    handled++;
  }

  console.log(`[LeadMatcher] Handled ${handled} expired offers`);
  return handled;
}

/**
 * Auto-accept offers for installers with auto-accept enabled
 */
export async function processAutoAcceptOffers(): Promise<number> {
  const pendingOffers = await db.getPendingOffers();
  let autoAccepted = 0;

  for (const offer of pendingOffers) {
    const installer = await db.getInstallerById(offer.installerId);
    if (!installer || !installer.autoAcceptLeads) continue;

    // Check if lead is still available
    const lead = await db.getLeadById(offer.leadId);
    if (!lead || lead.status !== "offered") continue;

    // Auto-accept the offer
    await db.updateLeadOffer(offer.id, {
      status: "accepted",
      respondedAt: new Date(),
    });

    await db.updateLead(offer.leadId, { status: "accepted" });

    autoAccepted++;
    console.log(
      `[LeadMatcher] Auto-accepted offer ${offer.id} for installer ${installer.companyName}`
    );
  }

  return autoAccepted;
}
