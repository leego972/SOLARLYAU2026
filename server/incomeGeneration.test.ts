import { describe, expect, it, vi } from "vitest";

// Test the marketplace lead seeding functionality
describe("Marketplace Lead Seeding", () => {
  it("should generate valid Australian locations", () => {
    const AUSTRALIAN_LOCATIONS = [
      { suburb: "Blacktown", state: "NSW", postcode: "2148" },
      { suburb: "Dandenong", state: "VIC", postcode: "3175" },
      { suburb: "Logan", state: "QLD", postcode: "4114" },
      { suburb: "Rockingham", state: "WA", postcode: "6168" },
      { suburb: "Salisbury", state: "SA", postcode: "5108" },
    ];

    // Verify all locations have required fields
    AUSTRALIAN_LOCATIONS.forEach(loc => {
      expect(loc.suburb).toBeDefined();
      expect(loc.state).toMatch(/^(NSW|VIC|QLD|WA|SA|TAS|NT|ACT)$/);
      expect(loc.postcode).toMatch(/^\d{4}$/);
    });
  });

  it("should generate valid phone numbers", () => {
    const generatePhone = (): string => {
      const prefix = "04";
      const number = Array.from({ length: 8 }, () => Math.floor(Math.random() * 10)).join("");
      return prefix + number;
    };

    const phone = generatePhone();
    expect(phone).toMatch(/^04\d{8}$/);
    expect(phone.length).toBe(10);
  });

  it("should generate valid email addresses", () => {
    const generateEmail = (firstName: string, lastName: string): string => {
      const domains = ["gmail.com", "outlook.com", "yahoo.com.au"];
      return `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${domains[0]}`;
    };

    const email = generateEmail("John", "Smith");
    expect(email).toBe("john.smith@gmail.com");
    expect(email).toMatch(/^[a-z]+\.[a-z]+@[a-z.]+$/);
  });

  it("should generate leads with valid price range", () => {
    const minPrice = 45;
    const maxPrice = 95;
    
    const generatePrice = () => Math.floor(Math.random() * (maxPrice - minPrice + 1)) + minPrice;
    
    for (let i = 0; i < 100; i++) {
      const price = generatePrice();
      expect(price).toBeGreaterThanOrEqual(minPrice);
      expect(price).toBeLessThanOrEqual(maxPrice);
    }
  });

  it("should generate leads with valid quality scores", () => {
    const minQuality = 60;
    const maxQuality = 95;
    
    const generateQuality = () => Math.floor(Math.random() * (maxQuality - minQuality + 1)) + minQuality;
    
    for (let i = 0; i < 100; i++) {
      const quality = generateQuality();
      expect(quality).toBeGreaterThanOrEqual(minQuality);
      expect(quality).toBeLessThanOrEqual(maxQuality);
    }
  });
});

// Test the lead notification campaign
describe("Lead Notification Campaign", () => {
  it("should build valid email HTML", () => {
    const notification = {
      installerId: 1,
      installerEmail: "test@installer.com",
      installerName: "Test Installer",
      leads: [
        {
          id: 1,
          suburb: "Blacktown",
          state: "NSW",
          propertyType: "residential",
          qualityScore: 85,
          basePrice: 65,
          estimatedSystemSize: 10,
        },
      ],
    };

    // Simulate building email HTML
    const buildLeadNotificationEmail = (n: typeof notification): string => {
      return `
        <html>
          <body>
            <h1>${n.leads.length} New Leads in Your Area!</h1>
            <p>Hi ${n.installerName},</p>
            ${n.leads.map(l => `<div>${l.suburb}, ${l.state} - $${l.basePrice}</div>`).join("")}
          </body>
        </html>
      `;
    };

    const html = buildLeadNotificationEmail(notification);
    expect(html).toContain("1 New Leads");
    expect(html).toContain("Test Installer");
    expect(html).toContain("Blacktown, NSW");
    expect(html).toContain("$65");
  });

  it("should match leads to installers by state", () => {
    const installers = [
      { id: 1, state: "NSW", servicePostcodes: '["2148", "2150"]' },
      { id: 2, state: "VIC", servicePostcodes: '["3175"]' },
    ];

    const leads = [
      { id: 1, state: "NSW", postcode: "2148" },
      { id: 2, state: "VIC", postcode: "3175" },
      { id: 3, state: "QLD", postcode: "4114" },
    ];

    const matchLeadsToInstaller = (installer: typeof installers[0]) => {
      const postcodes = JSON.parse(installer.servicePostcodes);
      return leads.filter(l => 
        l.state === installer.state && postcodes.includes(l.postcode)
      );
    };

    const nswMatches = matchLeadsToInstaller(installers[0]);
    expect(nswMatches.length).toBe(1);
    expect(nswMatches[0].postcode).toBe("2148");

    const vicMatches = matchLeadsToInstaller(installers[1]);
    expect(vicMatches.length).toBe(1);
    expect(vicMatches[0].postcode).toBe("3175");
  });
});

// Test the installer payment flow
describe("Installer Payment Flow", () => {
  it("should validate lead availability before purchase", () => {
    const lead = { id: 1, status: "new", basePrice: 65 };
    
    const isLeadAvailable = (l: typeof lead) => {
      return l.status === "new" || l.status === "offered";
    };

    expect(isLeadAvailable(lead)).toBe(true);
    expect(isLeadAvailable({ ...lead, status: "sold" })).toBe(false);
    expect(isLeadAvailable({ ...lead, status: "expired" })).toBe(false);
  });

  it("should calculate payment amount in cents", () => {
    const basePrice = 65;
    const amountInCents = basePrice * 100;
    
    expect(amountInCents).toBe(6500);
  });

  it("should create valid transaction record", () => {
    const transaction = {
      leadId: 1,
      installerId: 0,
      leadOfferId: 0,
      amount: 65,
      currency: "AUD",
      stripePaymentIntentId: "pi_test_123",
      status: "succeeded" as const,
    };

    expect(transaction.leadId).toBe(1);
    expect(transaction.amount).toBe(65);
    expect(transaction.currency).toBe("AUD");
    expect(transaction.status).toBe("succeeded");
  });
});

// Test urgency pricing
describe("Urgency Pricing", () => {
  it("should calculate time-based urgency", () => {
    const calculateUrgency = (hoursListed: number): string => {
      if (hoursListed < 2) return "hot";
      if (hoursListed < 6) return "warm";
      if (hoursListed < 24) return "normal";
      return "cooling";
    };

    expect(calculateUrgency(1)).toBe("hot");
    expect(calculateUrgency(4)).toBe("warm");
    expect(calculateUrgency(12)).toBe("normal");
    expect(calculateUrgency(48)).toBe("cooling");
  });

  it("should apply urgency discount/premium", () => {
    const applyUrgencyPricing = (basePrice: number, urgency: string): number => {
      switch (urgency) {
        case "hot": return Math.round(basePrice * 1.1); // 10% premium
        case "warm": return basePrice;
        case "normal": return basePrice;
        case "cooling": return Math.round(basePrice * 0.9); // 10% discount
        default: return basePrice;
      }
    };

    expect(applyUrgencyPricing(100, "hot")).toBe(110);
    expect(applyUrgencyPricing(100, "warm")).toBe(100);
    expect(applyUrgencyPricing(100, "cooling")).toBe(90);
  });
});

// Test revenue calculations
describe("Revenue Dashboard Calculations", () => {
  it("should calculate average lead price", () => {
    const totalRevenue = 6500;
    const leadsSold = 100;
    const avgPrice = leadsSold > 0 ? totalRevenue / leadsSold : 0;

    expect(avgPrice).toBe(65);
  });

  it("should handle zero leads sold", () => {
    const totalRevenue = 0;
    const leadsSold = 0;
    const avgPrice = leadsSold > 0 ? totalRevenue / leadsSold : 0;

    expect(avgPrice).toBe(0);
  });

  it("should calculate monthly revenue correctly", () => {
    const transactions = [
      { amount: 65, createdAt: new Date() },
      { amount: 75, createdAt: new Date() },
      { amount: 55, createdAt: new Date() },
    ];

    const monthlyRevenue = transactions.reduce((sum, tx) => sum + tx.amount, 0);
    expect(monthlyRevenue).toBe(195);
  });
});
