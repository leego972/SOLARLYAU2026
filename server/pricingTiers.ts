/**
 * Premium Pricing Tiers & Subscription Model
 * Maximum Profit Optimization System
 */

export interface PricingTier {
  id: string;
  name: string;
  description: string;
  priceMultiplier: number;
  features: string[];
  minimumQualityScore: number;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  monthlyFee: number;
  leadsIncluded: number;
  discountPercentage: number;
  features: string[];
}

/**
 * MAXIMUM PROFIT PRICING TIERS
 */
export const PRICING_TIERS: Record<string, PricingTier> = {
  standard: {
    id: "standard",
    name: "Standard",
    description: "Quality verified leads, 24-hour response time",
    priceMultiplier: 1.0,
    features: [
      "Quality verified leads",
      "24-hour offer window",
      "Basic lead information",
      "Email notifications",
    ],
    minimumQualityScore: 70,
  },
  
  premium: {
    id: "premium",
    name: "Premium",
    description: "Exclusive territory, instant notifications, priority matching",
    priceMultiplier: 1.5,
    features: [
      "Exclusive territory (no competition)",
      "Instant push notifications",
      "Priority matching",
      "Extended lead details",
      "Lead replacement guarantee",
      "Dedicated support",
    ],
    minimumQualityScore: 80,
  },
  
  platinum: {
    id: "platinum",
    name: "Platinum",
    description: "White-glove service, pre-qualified leads, guaranteed ROI",
    priceMultiplier: 2.0,
    features: [
      "All Premium features",
      "Pre-qualified (phone verified)",
      "Guaranteed 10%+ close rate or refund",
      "White-glove concierge service",
      "Custom territory design",
      "Performance analytics",
      "Priority customer support",
    ],
    minimumQualityScore: 90,
  },
};

/**
 * SUBSCRIPTION PLANS (Recurring Revenue)
 */
export const SUBSCRIPTION_PLANS: Record<string, SubscriptionPlan> = {
  starter: {
    id: "starter",
    name: "Starter Plan",
    monthlyFee: 499,
    leadsIncluded: 10,
    discountPercentage: 15,
    features: [
      "10 leads per month included",
      "15% discount on additional leads",
      "Standard tier access",
      "Email support",
    ],
  },
  
  growth: {
    id: "growth",
    name: "Growth Plan",
    monthlyFee: 1499,
    leadsIncluded: 30,
    discountPercentage: 25,
    features: [
      "30 leads per month included",
      "25% discount on additional leads",
      "Premium tier access",
      "Priority support",
      "Monthly performance report",
    ],
  },
  
  professional: {
    id: "professional",
    name: "Professional Plan",
    monthlyFee: 3999,
    leadsIncluded: 100,
    discountPercentage: 35,
    features: [
      "100 leads per month included",
      "35% discount on additional leads",
      "Platinum tier access",
      "Exclusive territory guarantee",
      "Dedicated account manager",
      "Custom integrations",
      "Weekly strategy calls",
    ],
  },
};

/**
 * Calculate final price based on tier and subscription
 */
export function calculateLeadPrice(
  basePrice: number,
  tier: string = "standard",
  subscriptionPlan?: string
): number {
  // Apply tier multiplier
  const tierData = PRICING_TIERS[tier] || PRICING_TIERS.standard;
  let finalPrice = basePrice * tierData.priceMultiplier;
  
  // Apply subscription discount if applicable
  if (subscriptionPlan) {
    const plan = SUBSCRIPTION_PLANS[subscriptionPlan];
    if (plan) {
      const discount = plan.discountPercentage / 100;
      finalPrice = finalPrice * (1 - discount);
    }
  }
  
  return Math.round(finalPrice);
}

/**
 * DYNAMIC PRICING based on demand
 */
export function applyDemandPricing(
  basePrice: number,
  demandLevel: "low" | "medium" | "high" | "surge"
): number {
  const demandMultipliers = {
    low: 0.9, // 10% discount when demand is low
    medium: 1.0, // Standard price
    high: 1.2, // 20% premium when demand is high
    surge: 1.5, // 50% premium during surge demand
  };
  
  return Math.round(basePrice * demandMultipliers[demandLevel]);
}

/**
 * GEOGRAPHIC PRICING - Premium areas command higher prices
 */
export const PREMIUM_POSTCODES: Record<string, number> = {
  // Sydney premium suburbs
  "2000": 1.3, // Sydney CBD
  "2027": 1.4, // Darling Point
  "2030": 1.3, // Vaucluse
  "2061": 1.3, // Kirribilli
  "2088": 1.3, // Mosman
  
  // Melbourne premium suburbs
  "3000": 1.3, // Melbourne CBD
  "3142": 1.4, // Toorak
  "3141": 1.3, // South Yarra
  "3101": 1.3, // Kew
  
  // Brisbane premium suburbs
  "4000": 1.2, // Brisbane CBD
  "4005": 1.3, // New Farm
  "4007": 1.3, // Hamilton
  "4066": 1.3, // Paddington
  
  // Perth premium suburbs
  "6000": 1.2, // Perth CBD
  "6011": 1.4, // Cottesloe
  "6010": 1.3, // Claremont
  "6009": 1.3, // Nedlands
};

export function applyGeographicPricing(
  basePrice: number,
  postcode: string
): number {
  const multiplier = PREMIUM_POSTCODES[postcode] || 1.0;
  return Math.round(basePrice * multiplier);
}

/**
 * LEAD AUCTION SYSTEM for ultra-high-value leads
 */
export interface LeadAuction {
  leadId: number;
  startingPrice: number;
  currentBid: number;
  highestBidder: number | null;
  auctionEndsAt: Date;
  minimumIncrement: number;
}

export function createLeadAuction(
  leadId: number,
  estimatedValue: number
): LeadAuction {
  const startingPrice = Math.round(estimatedValue * 0.7); // Start at 70% of estimated value
  const auctionEndsAt = new Date();
  auctionEndsAt.setHours(auctionEndsAt.getHours() + 2); // 2-hour auction
  
  return {
    leadId,
    startingPrice,
    currentBid: startingPrice,
    highestBidder: null,
    auctionEndsAt,
    minimumIncrement: Math.round(startingPrice * 0.05), // 5% minimum increment
  };
}

/**
 * REVENUE OPTIMIZATION - Calculate optimal price point
 */
export function calculateOptimalPrice(
  historicalData: {
    price: number;
    conversionRate: number;
    volume: number;
  }[]
): number {
  // Find price point that maximizes revenue (price × conversion × volume)
  let optimalPrice = 60;
  let maxRevenue = 0;
  
  for (const data of historicalData) {
    const revenue = data.price * data.conversionRate * data.volume;
    if (revenue > maxRevenue) {
      maxRevenue = revenue;
      optimalPrice = data.price;
    }
  }
  
  return optimalPrice;
}

/**
 * BUNDLE PRICING - Discounts for bulk purchases
 */
export const BUNDLE_DISCOUNTS = {
  5: 0.05, // 5% off for 5+ leads
  10: 0.10, // 10% off for 10+ leads
  20: 0.15, // 15% off for 20+ leads
  50: 0.20, // 20% off for 50+ leads
  100: 0.25, // 25% off for 100+ leads
};

export function applyBundleDiscount(
  totalPrice: number,
  quantity: number
): number {
  let discount = 0;
  
  // Find applicable discount tier
  for (const [qty, discountRate] of Object.entries(BUNDLE_DISCOUNTS).reverse()) {
    if (quantity >= parseInt(qty)) {
      discount = discountRate;
      break;
    }
  }
  
  return Math.round(totalPrice * (1 - discount));
}

/**
 * MAXIMUM PROFIT CALCULATOR
 * Combines all pricing strategies for optimal revenue
 */
export function calculateMaximumProfitPrice(params: {
  basePrice: number;
  qualityScore: number;
  propertyType: string;
  postcode: string;
  tier?: string;
  subscriptionPlan?: string;
  demandLevel?: "low" | "medium" | "high" | "surge";
  quantity?: number;
}): {
  finalPrice: number;
  breakdown: {
    basePrice: number;
    tierMultiplier: number;
    geographicMultiplier: number;
    demandMultiplier: number;
    subscriptionDiscount: number;
    bundleDiscount: number;
  };
} {
  let price = params.basePrice;
  const breakdown = {
    basePrice: params.basePrice,
    tierMultiplier: 1.0,
    geographicMultiplier: 1.0,
    demandMultiplier: 1.0,
    subscriptionDiscount: 0,
    bundleDiscount: 0,
  };
  
  // Apply tier pricing
  if (params.tier) {
    const tierData = PRICING_TIERS[params.tier];
    if (tierData) {
      breakdown.tierMultiplier = tierData.priceMultiplier;
      price *= tierData.priceMultiplier;
    }
  }
  
  // Apply geographic pricing
  const geoMultiplier = PREMIUM_POSTCODES[params.postcode] || 1.0;
  breakdown.geographicMultiplier = geoMultiplier;
  price *= geoMultiplier;
  
  // Apply demand pricing
  if (params.demandLevel) {
    const demandMultipliers = {
      low: 0.9,
      medium: 1.0,
      high: 1.2,
      surge: 1.5,
    };
    breakdown.demandMultiplier = demandMultipliers[params.demandLevel];
    price *= demandMultipliers[params.demandLevel];
  }
  
  // Apply subscription discount
  if (params.subscriptionPlan) {
    const plan = SUBSCRIPTION_PLANS[params.subscriptionPlan];
    if (plan) {
      breakdown.subscriptionDiscount = plan.discountPercentage;
      price *= (1 - plan.discountPercentage / 100);
    }
  }
  
  // Apply bundle discount
  if (params.quantity && params.quantity >= 5) {
    let bundleDiscount = 0;
    for (const [qty, discountRate] of Object.entries(BUNDLE_DISCOUNTS).reverse()) {
      if (params.quantity >= parseInt(qty)) {
        bundleDiscount = discountRate;
        break;
      }
    }
    breakdown.bundleDiscount = bundleDiscount * 100;
    price *= (1 - bundleDiscount);
  }
  
  return {
    finalPrice: Math.round(price),
    breakdown,
  };
}
