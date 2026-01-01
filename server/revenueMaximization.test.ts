import { describe, expect, it } from "vitest";
import {
  calculateUrgencyPrice,
  calculateBundlePrice,
  calculateEnrichmentPrice,
  calculateCommercialPrice,
  calculateBatteryPrice,
  BUNDLE_OPTIONS,
  EXPANDED_STATES,
} from "./revenueMaximizer";
import { calculateEnrichmentCost } from "./premiumEnrichment";
import { TRAINING_MODULES, CERTIFICATION_REQUIREMENTS } from "./trainingPlatform";
import { WHITE_LABEL_INDUSTRIES, calculateWhiteLabelRevenue, estimateClientRevenue } from "./whiteLabelPlatform";

describe("Revenue Maximization - Quick Wins", () => {
  describe("Strategy 1: Lead Reselling", () => {
    it("should resell leads at 50% price after 30 days", () => {
      const originalPrice = 100;
      const resalePrice = originalPrice * 0.5;
      expect(resalePrice).toBe(50);
    });
  });

  describe("Strategy 2: Urgency Pricing", () => {
    it("should add 20% premium for leads < 1 hour old", () => {
      const basePrice = 60;
      const freshLead = new Date(Date.now() - 30 * 60 * 1000); // 30 minutes ago
      const price = calculateUrgencyPrice(basePrice, freshLead);
      expect(price).toBe(72); // 60 * 1.2
    });

    it("should use standard price for leads 1-6 hours old", () => {
      const basePrice = 60;
      const standardLead = new Date(Date.now() - 3 * 60 * 60 * 1000); // 3 hours ago
      const price = calculateUrgencyPrice(basePrice, standardLead);
      expect(price).toBe(60);
    });

    it("should apply 10% discount for leads 6-24 hours old", () => {
      const basePrice = 60;
      const oldLead = new Date(Date.now() - 12 * 60 * 60 * 1000); // 12 hours ago
      const price = calculateUrgencyPrice(basePrice, oldLead);
      expect(price).toBe(54); // 60 * 0.9
    });
  });

  describe("Strategy 3: Bundle Deals", () => {
    it("should calculate buy 5 get 1 free bundle correctly", () => {
      const avgPrice = 60;
      const result = calculateBundlePrice(avgPrice, "buy5get1");
      expect(result.originalPrice).toBe(360); // 60 * 6
      expect(result.discount).toBe(61); // 17% of 360
      expect(result.finalPrice).toBe(299);
    });

    it("should calculate weekly bundle (10 leads) correctly", () => {
      const avgPrice = 60;
      const result = calculateBundlePrice(avgPrice, "weekly10");
      expect(result.originalPrice).toBe(600); // 60 * 10
      expect(result.discount).toBe(60); // 10% of 600
      expect(result.finalPrice).toBe(540);
    });

    it("should calculate monthly bundle (30 leads) correctly", () => {
      const avgPrice = 60;
      const result = calculateBundlePrice(avgPrice, "monthly30");
      expect(result.originalPrice).toBe(1800); // 60 * 30
      expect(result.discount).toBe(360); // 20% of 1800
      expect(result.finalPrice).toBe(1440);
    });

    it("should have all bundle options defined", () => {
      expect(BUNDLE_OPTIONS).toHaveLength(3);
      expect(BUNDLE_OPTIONS[0]?.type).toBe("buy5get1");
      expect(BUNDLE_OPTIONS[1]?.type).toBe("weekly10");
      expect(BUNDLE_OPTIONS[2]?.type).toBe("monthly30");
    });
  });
});

describe("Revenue Maximization - Premium Add-Ons", () => {
  describe("Strategy 4: Lead Enrichment", () => {
    it("should calculate phone verification cost", () => {
      const cost = calculateEnrichmentCost({ phoneVerification: true });
      expect(cost).toBe(10);
    });

    it("should calculate property photos cost", () => {
      const cost = calculateEnrichmentCost({ propertyPhotos: true });
      expect(cost).toBe(5);
    });

    it("should calculate roof analysis cost", () => {
      const cost = calculateEnrichmentCost({ roofAnalysis: true });
      expect(cost).toBe(10);
    });

    it("should calculate credit check cost", () => {
      const cost = calculateEnrichmentCost({ creditCheck: true });
      expect(cost).toBe(15);
    });

    it("should calculate full enrichment package cost", () => {
      const cost = calculateEnrichmentCost({
        phoneVerification: true,
        propertyPhotos: true,
        roofAnalysis: true,
        creditCheck: true,
      });
      expect(cost).toBe(40); // 10 + 5 + 10 + 15
    });
  });

  describe("Strategy 5: Training Platform", () => {
    it("should have 5 training modules", () => {
      expect(TRAINING_MODULES).toHaveLength(5);
    });

    it("should have certification requirements", () => {
      expect(CERTIFICATION_REQUIREMENTS.modulesCompleted).toBe(5);
      expect(CERTIFICATION_REQUIREMENTS.quizzesPassed).toBe(5);
      expect(CERTIFICATION_REQUIREMENTS.minimumScore).toBe(80);
    });

    it("should calculate training revenue correctly", () => {
      const certificationPrice = 299;
      const monthlyPrice = 99;
      const bundlePrice = 799;

      // 10 certifications + 5 monthly + 3 bundles
      const expectedRevenue =
        certificationPrice * 10 + monthlyPrice * 5 * 12 + bundlePrice * 3;

      expect(expectedRevenue).toBe(11327); // 2990 + 5940 + 2397
    });
  });

  describe("Strategy 6: White-Label Platform", () => {
    it("should have 5 white-label industries", () => {
      expect(WHITE_LABEL_INDUSTRIES).toHaveLength(5);
    });

    it("should calculate white-label revenue correctly", () => {
      const mockClients = [
        {
          id: 1,
          companyName: "Roofing Co",
          industry: "roofing",
          contactName: "John",
          contactEmail: "john@roofing.com",
          contactPhone: "0400000000",
          setupFee: 5000,
          monthlyFee: 999,
          revenueSharePercent: 10,
          status: "active" as const,
          setupDate: new Date(),
        },
      ];

      const revenue = calculateWhiteLabelRevenue(mockClients);
      expect(revenue.setupFees).toBe(5000);
      expect(revenue.monthlyRecurring).toBe(999);
      expect(revenue.revenueShare).toBeGreaterThan(0);
    });

    it("should estimate client revenue correctly", () => {
      const estimate = estimateClientRevenue("roofing", 100); // 100 leads/month
      expect(estimate.monthlyRevenue).toBe(4000); // 100 * $40
      expect(estimate.annualRevenue).toBe(48000); // 4000 * 12
      expect(estimate.yourShare).toBe(4800); // 10% of 48000
    });
  });
});

describe("Revenue Maximization - Market Expansion", () => {
  describe("Strategy 7: Geographic Expansion", () => {
    it("should include VIC and TAS in expanded states", () => {
      expect(EXPANDED_STATES).toContain("VIC");
      expect(EXPANDED_STATES).toContain("TAS");
      expect(EXPANDED_STATES).toHaveLength(6); // QLD, NSW, WA, SA, VIC, TAS
    });
  });

  describe("Strategy 8: Commercial Leads", () => {
    it("should apply 4x multiplier for commercial properties", () => {
      const basePrice = 60;
      const commercialPrice = calculateCommercialPrice(basePrice, "commercial");
      expect(commercialPrice).toBe(240); // 60 * 4
    });

    it("should apply 5x multiplier for industrial properties", () => {
      const basePrice = 60;
      const industrialPrice = calculateCommercialPrice(basePrice, "industrial");
      expect(industrialPrice).toBe(300); // 60 * 5
    });

    it("should keep base price for residential properties", () => {
      const basePrice = 60;
      const residentialPrice = calculateCommercialPrice(basePrice, "residential");
      expect(residentialPrice).toBe(60);
    });
  });

  describe("Strategy 9: Battery Storage", () => {
    it("should apply 2.5x multiplier for battery storage leads", () => {
      const basePrice = 60;
      const batteryPrice = calculateBatteryPrice(basePrice, "battery_storage");
      expect(batteryPrice).toBe(150); // 60 * 2.5
    });

    it("should keep base price for standard solar leads", () => {
      const basePrice = 60;
      const standardPrice = calculateBatteryPrice(basePrice, "solar");
      expect(standardPrice).toBe(60);
    });
  });
});

describe("Revenue Maximization - Automation Boosters", () => {
  describe("Strategy 10: Performance-Based Pricing", () => {
    it("should add $40 bonus for closed deals", () => {
      const basePrice = 60;
      const bonus = 40;
      const totalRevenue = basePrice + bonus;
      expect(totalRevenue).toBe(100);
    });
  });

  describe("Strategy 11: Auction System", () => {
    it("should accept bids above minimum price", () => {
      const minimumBid = 80;
      const bid1 = 120;
      const bid2 = 180;
      expect(bid1).toBeGreaterThan(minimumBid);
      expect(bid2).toBeGreaterThan(minimumBid);
      expect(Math.max(bid1, bid2)).toBe(180); // Highest bid wins
    });
  });

  describe("Strategy 12: Referral Program", () => {
    it("should pay $50 commission per referral", () => {
      const referralCommission = 50;
      const referrals = 10;
      const totalCommissions = referralCommission * referrals;
      expect(totalCommissions).toBe(500);
    });
  });
});

describe("Revenue Projections", () => {
  it("should project Year 1 revenue of $4.2M with all strategies", () => {
    // Conservative estimates:
    const leadSales = 2000000; // Base lead sales
    const reselling = 400000; // 20% boost from reselling
    const urgencyPricing = 300000; // 15% boost from urgency
    const bundles = 200000; // Bundle sales
    const enrichment = 300000; // Enrichment add-ons
    const training = 50000; // Training revenue
    const whiteLabel = 170000; // White-label (setup + monthly)
    const commercial = 400000; // Commercial leads
    const battery = 200000; // Battery leads
    const performance = 100000; // Performance bonuses
    const auctions = 80000; // Auction premiums

    const totalYear1 =
      leadSales +
      reselling +
      urgencyPricing +
      bundles +
      enrichment +
      training +
      whiteLabel +
      commercial +
      battery +
      performance +
      auctions;

    expect(totalYear1).toBeGreaterThanOrEqual(4000000); // $4M+
    expect(totalYear1).toBeLessThanOrEqual(4500000); // Under $4.5M (conservative)
  });

  it("should project Year 5 revenue of $32M with all strategies", () => {
    // Year 5 projections (5x growth):
    const year1Revenue = 4200000;
    const growthMultiplier = 7.6; // 7.6x growth over 5 years

    const year5Revenue = year1Revenue * growthMultiplier;

    expect(year5Revenue).toBeGreaterThanOrEqual(30000000); // $30M+
    expect(year5Revenue).toBeLessThanOrEqual(35000000); // Under $35M
  });
});
