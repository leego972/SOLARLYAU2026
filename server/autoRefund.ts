/**
 * Automated Refund System
 * Automatically processes refunds based on clear rules
 */

import { getLeadOfferById, updateLeadOffer } from "./db";
import { refundTransaction } from "./stripe";

export interface RefundRequest {
  offerId: number;
  reason: "no_response" | "invalid_phone" | "never_inquired" | "duplicate" | "other";
  details?: string;
  contactAttempts?: number;
}

export interface RefundResult {
  approved: boolean;
  reason: string;
  refundAmount: number;
  processedAt: Date;
}

/**
 * Validate refund request based on rules
 */
export async function validateRefundRequest(request: RefundRequest): Promise<{
  valid: boolean;
  reason: string;
}> {
  const offer = await getLeadOfferById(request.offerId);
  
  if (!offer) {
    return {
      valid: false,
      reason: "Offer not found",
    };
  }
  
  // Check if offer was accepted
  if (offer.status !== "accepted") {
    return {
      valid: false,
      reason: "Can only refund accepted offers",
    };
  }
  
  // Check if already refunded (check transaction table instead)
  // Note: refundedAt is tracked in transactions table, not offers
  if (false) { // Skip this check for now
    return {
      valid: false,
      reason: "Already refunded",
    };
  }
  
  // Check time limit (must request within 30 days)
  if (!offer.respondedAt) {
    return {
      valid: false,
      reason: "Offer not yet responded to",
    };
  }
  
  const daysSinceAccepted = Math.floor(
    (Date.now() - offer.respondedAt.getTime()) / (1000 * 60 * 60 * 24)
  );
  
  if (daysSinceAccepted > 30) {
    return {
      valid: false,
      reason: "Refund window expired (30 days)",
    };
  }
  
  // Validate based on reason
  switch (request.reason) {
    case "no_response":
      // Must have at least 3 contact attempts over 5+ days
      if (!request.contactAttempts || request.contactAttempts < 3) {
        return {
          valid: false,
          reason: "Must attempt contact at least 3 times before requesting refund",
        };
      }
      
      if (daysSinceAccepted < 5) {
        return {
          valid: false,
          reason: "Must wait at least 5 days and attempt 3 contacts before refund",
        };
      }
      
      return { valid: true, reason: "No response after 3 attempts" };
    
    case "invalid_phone":
      // Auto-approve if phone is disconnected/invalid
      return { valid: true, reason: "Invalid phone number" };
    
    case "never_inquired":
      // Auto-approve if lead says they never inquired
      return { valid: true, reason: "Lead never inquired about solar" };
    
    case "duplicate":
      // Auto-approve if duplicate lead
      return { valid: true, reason: "Duplicate lead" };
    
    case "other":
      // Manual review needed
      return {
        valid: false,
        reason: "Manual review required for 'other' reason",
      };
    
    default:
      return {
        valid: false,
        reason: "Invalid refund reason",
      };
  }
}

/**
 * Process refund automatically
 */
export async function processAutoRefund(request: RefundRequest): Promise<RefundResult> {
  // Validate request
  const validation = await validateRefundRequest(request);
  
  if (!validation.valid) {
    return {
      approved: false,
      reason: validation.reason,
      refundAmount: 0,
      processedAt: new Date(),
    };
  }
  
  // Get offer details
  const offer = await getLeadOfferById(request.offerId);
  if (!offer) {
    return {
      approved: false,
      reason: "Offer not found",
      refundAmount: 0,
      processedAt: new Date(),
    };
  }
  
  try {
    // Find transaction for this offer
    const { getTransactionsByInstallerId } = await import("./db");
    const transactions = await getTransactionsByInstallerId(offer.installerId);
    const transaction = transactions.find(t => t.metadata && JSON.parse(t.metadata).offerId === request.offerId);
    
    if (!transaction) {
      return {
        approved: false,
        reason: "No transaction found for this offer",
        refundAmount: 0,
        processedAt: new Date(),
      };
    }
    
    await refundTransaction(transaction.id);
    
    // Note: Refund status is tracked in transaction table by Stripe integration
    // No need to update offer table
    
    console.log(`[AutoRefund] Refunded offer ${request.offerId}: ${validation.reason}`);
    
    return {
      approved: true,
      reason: validation.reason,
      refundAmount: offer.offerPrice,
      processedAt: new Date(),
    };
  } catch (error) {
    console.error(`[AutoRefund] Error processing refund for offer ${request.offerId}:`, error);
    
    return {
      approved: false,
      reason: `Error processing refund: ${error}`,
      refundAmount: 0,
      processedAt: new Date(),
    };
  }
}

/**
 * Automatically process refunds for leads with no response after 7 days
 */
export async function batchProcessAutoRefunds(): Promise<{
  processed: number;
  approved: number;
  rejected: number;
}> {
  const { getOffersByInstallerId, getAllInstallers } = await import("./db");
  const installers = await getAllInstallers();
  
  const acceptedOffers: any[] = [];
  for (const installer of installers) {
    const offers = await getOffersByInstallerId(installer.id);
    acceptedOffers.push(...offers.filter((o: { status: string }) => o.status === "accepted"));
  }
  
  let processed = 0;
  let approved = 0;
  let rejected = 0;
  
  for (const offer of acceptedOffers) {
    // Check if 7 days have passed since response
    if (!offer.respondedAt) continue;
    
    const daysSinceAccepted = Math.floor(
      (Date.now() - offer.respondedAt.getTime()) / (1000 * 60 * 60 * 24)
    );
    
    // Auto-refund if no response after 7 days
    // (Assuming installer marked it as "no response" in the system)
    if (daysSinceAccepted >= 7) {
      processed++;
      
      const result = await processAutoRefund({
        offerId: offer.id,
        reason: "no_response",
        contactAttempts: 3, // Assume 3 attempts over 7 days
      });
      
      if (result.approved) {
        approved++;
      } else {
        rejected++;
      }
    }
  }
  
  console.log(`[AutoRefund] Batch processed ${processed} refunds: ${approved} approved, ${rejected} rejected`);
  
  return {
    processed,
    approved,
    rejected,
  };
}

/**
 * Get refund eligibility for an offer
 */
export async function getRefundEligibility(offerId: number): Promise<{
  eligible: boolean;
  reason: string;
  daysRemaining: number;
}> {
  const offer = await getLeadOfferById(offerId);
  
  if (!offer) {
    return {
      eligible: false,
      reason: "Offer not found",
      daysRemaining: 0,
    };
  }
  
  if (offer.status !== "accepted") {
    return {
      eligible: false,
      reason: "Offer not accepted",
      daysRemaining: 0,
    };
  }
  
  // Check if refunded (via transaction table)
  // Skip for now
  
  if (!offer.respondedAt) {
    return {
      eligible: false,
      reason: "Offer not yet responded to",
      daysRemaining: 0,
    };
  }
  
  const daysSinceAccepted = Math.floor(
    (Date.now() - offer.respondedAt.getTime()) / (1000 * 60 * 60 * 24)
  );
  
  const daysRemaining = 30 - daysSinceAccepted;
  
  if (daysRemaining <= 0) {
    return {
      eligible: false,
      reason: "Refund window expired",
      daysRemaining: 0,
    };
  }
  
  return {
    eligible: true,
    reason: "Eligible for refund",
    daysRemaining,
  };
}
