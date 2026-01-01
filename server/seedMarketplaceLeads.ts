/**
 * Seed Marketplace Leads
 * Creates realistic solar leads for installers to purchase
 */

import { getDb } from "./db";
import { leads } from "../drizzle/schema";

// Australian suburbs with high solar potential
const AUSTRALIAN_LOCATIONS = [
  { suburb: "Blacktown", state: "NSW", postcode: "2148", lat: "-33.7688", lng: "150.9063" },
  { suburb: "Parramatta", state: "NSW", postcode: "2150", lat: "-33.8151", lng: "151.0011" },
  { suburb: "Liverpool", state: "NSW", postcode: "2170", lat: "-33.9207", lng: "150.9238" },
  { suburb: "Penrith", state: "NSW", postcode: "2750", lat: "-33.7511", lng: "150.6942" },
  { suburb: "Castle Hill", state: "NSW", postcode: "2154", lat: "-33.7314", lng: "151.0056" },
  { suburb: "Campbelltown", state: "NSW", postcode: "2560", lat: "-34.0650", lng: "150.8142" },
  { suburb: "Hornsby", state: "NSW", postcode: "2077", lat: "-33.7025", lng: "151.0994" },
  { suburb: "Sutherland", state: "NSW", postcode: "2232", lat: "-34.0316", lng: "151.0583" },
  
  { suburb: "Dandenong", state: "VIC", postcode: "3175", lat: "-37.9870", lng: "145.2150" },
  { suburb: "Frankston", state: "VIC", postcode: "3199", lat: "-38.1431", lng: "145.1217" },
  { suburb: "Werribee", state: "VIC", postcode: "3030", lat: "-37.9000", lng: "144.6614" },
  { suburb: "Melton", state: "VIC", postcode: "3337", lat: "-37.6833", lng: "144.5833" },
  { suburb: "Cranbourne", state: "VIC", postcode: "3977", lat: "-38.1131", lng: "145.2831" },
  { suburb: "Sunbury", state: "VIC", postcode: "3429", lat: "-37.5775", lng: "144.7261" },
  
  { suburb: "Logan", state: "QLD", postcode: "4114", lat: "-27.6389", lng: "153.1086" },
  { suburb: "Ipswich", state: "QLD", postcode: "4305", lat: "-27.6167", lng: "152.7667" },
  { suburb: "Caboolture", state: "QLD", postcode: "4510", lat: "-27.0847", lng: "152.9511" },
  { suburb: "Redcliffe", state: "QLD", postcode: "4020", lat: "-27.2286", lng: "153.1117" },
  { suburb: "Toowoomba", state: "QLD", postcode: "4350", lat: "-27.5598", lng: "151.9507" },
  { suburb: "Bundaberg", state: "QLD", postcode: "4670", lat: "-24.8661", lng: "152.3489" },
  
  { suburb: "Rockingham", state: "WA", postcode: "6168", lat: "-32.2772", lng: "115.7294" },
  { suburb: "Mandurah", state: "WA", postcode: "6210", lat: "-32.5269", lng: "115.7217" },
  { suburb: "Joondalup", state: "WA", postcode: "6027", lat: "-31.7467", lng: "115.7661" },
  { suburb: "Armadale", state: "WA", postcode: "6112", lat: "-32.1531", lng: "116.0150" },
  
  { suburb: "Salisbury", state: "SA", postcode: "5108", lat: "-34.7606", lng: "138.6417" },
  { suburb: "Elizabeth", state: "SA", postcode: "5112", lat: "-34.7117", lng: "138.6667" },
  { suburb: "Morphett Vale", state: "SA", postcode: "5162", lat: "-35.1333", lng: "138.5167" },
  { suburb: "Gawler", state: "SA", postcode: "5118", lat: "-34.5983", lng: "138.7450" },
];

// First names
const FIRST_NAMES = [
  "James", "John", "Michael", "David", "Robert", "William", "Richard", "Joseph",
  "Thomas", "Christopher", "Daniel", "Matthew", "Anthony", "Mark", "Donald",
  "Sarah", "Jennifer", "Lisa", "Karen", "Michelle", "Amanda", "Jessica", "Emily",
  "Ashley", "Nicole", "Stephanie", "Rebecca", "Laura", "Melissa", "Elizabeth"
];

// Last names
const LAST_NAMES = [
  "Smith", "Johnson", "Williams", "Brown", "Jones", "Miller", "Davis", "Garcia",
  "Rodriguez", "Wilson", "Martinez", "Anderson", "Taylor", "Thomas", "Moore",
  "Jackson", "Martin", "Lee", "Thompson", "White", "Harris", "Clark", "Lewis"
];

// Street names
const STREET_NAMES = [
  "High Street", "Main Road", "Park Avenue", "Church Street", "Station Road",
  "Victoria Street", "George Street", "King Street", "Queen Street", "Albert Street",
  "Railway Parade", "Beach Road", "Hill Street", "River Road", "Lake Drive"
];

function randomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generatePhone(): string {
  const prefix = randomElement(["04", "04", "04", "02", "03", "07", "08"]);
  const number = Array.from({ length: 8 }, () => randomInt(0, 9)).join("");
  return prefix + number;
}

function generateEmail(firstName: string, lastName: string): string {
  const domains = ["gmail.com", "outlook.com", "yahoo.com.au", "hotmail.com", "icloud.com"];
  const separator = randomElement([".", "_", ""]);
  const num = randomElement(["", String(randomInt(1, 99))]);
  return `${firstName.toLowerCase()}${separator}${lastName.toLowerCase()}${num}@${randomElement(domains)}`;
}

function generateAddress(location: typeof AUSTRALIAN_LOCATIONS[0]): string {
  const streetNum = randomInt(1, 200);
  const street = randomElement(STREET_NAMES);
  return `${streetNum} ${street}, ${location.suburb}`;
}

export interface SeedLeadOptions {
  count?: number;
  minPrice?: number;
  maxPrice?: number;
  minQuality?: number;
  maxQuality?: number;
}

export async function seedMarketplaceLeads(options: SeedLeadOptions = {}): Promise<{ created: number; errors: number }> {
  const {
    count = 20,
    minPrice = 45,
    maxPrice = 95,
    minQuality = 60,
    maxQuality = 95,
  } = options;

  const db = await getDb();
  if (!db) {
    console.error("[SeedLeads] Database not available");
    return { created: 0, errors: 1 };
  }

  let created = 0;
  let errors = 0;

  for (let i = 0; i < count; i++) {
    try {
      const location = randomElement(AUSTRALIAN_LOCATIONS);
      const firstName = randomElement(FIRST_NAMES);
      const lastName = randomElement(LAST_NAMES);
      const customerName = `${firstName} ${lastName}`;
      const propertyType = randomElement(["residential", "residential", "residential", "commercial"]) as "residential" | "commercial";
      const roofType = randomElement(["tile", "metal", "concrete", "flat"]);
      const estimatedSystemSize = propertyType === "commercial" 
        ? randomInt(20, 100) 
        : randomInt(5, 15);
      const currentElectricityBill = propertyType === "commercial"
        ? randomInt(500, 2000)
        : randomInt(150, 500);
      const qualityScore = randomInt(minQuality, maxQuality);
      const basePrice = randomInt(minPrice, maxPrice);

      // Create expiry date 7 days from now
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      await db.insert(leads).values({
        source: "ai_generated",
        sourceDetails: JSON.stringify({ generator: "marketplace_seed", version: "1.0" }),
        customerName,
        customerEmail: generateEmail(firstName, lastName),
        customerPhone: generatePhone(),
        address: generateAddress(location),
        suburb: location.suburb,
        state: location.state,
        postcode: location.postcode,
        latitude: location.lat,
        longitude: location.lng,
        propertyType,
        roofType,
        estimatedSystemSize,
        currentElectricityBill,
        qualityScore,
        status: "new",
        basePrice,
        expiresAt,
      });

      created++;
    } catch (error) {
      console.error(`[SeedLeads] Error creating lead ${i + 1}:`, error);
      errors++;
    }
  }

  console.log(`[SeedLeads] Created ${created} leads, ${errors} errors`);
  return { created, errors };
}

// Export for direct execution
export async function runSeed() {
  console.log("[SeedLeads] Starting marketplace lead seeding...");
  const result = await seedMarketplaceLeads({ count: 30 });
  console.log(`[SeedLeads] Complete: ${result.created} created, ${result.errors} errors`);
  return result;
}
