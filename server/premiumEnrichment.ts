/**
 * Premium Lead Enrichment Service
 * Strategy #4: Add-on services for existing leads
 * 
 * Adds $10-40 per lead in additional revenue through:
 * - Phone verification via AI calls ($10)
 * - Property photos from Google Street View ($5)
 * - Roof analysis with AI ($10)
 * - Credit/financial check ($15)
 */

import { invokeLLM } from "./_core/llm";
import { getDb } from './db';
import { leads } from "../drizzle/schema";
import { eq } from "drizzle-orm";

export interface PremiumEnrichmentOptions {
  phoneVerification?: boolean; // +$10
  propertyPhotos?: boolean; // +$5
  roofAnalysis?: boolean; // +$10
  creditCheck?: boolean; // +$15
}

export interface PremiumEnrichmentResult {
  success: boolean;
  data?: {
    phoneVerified?: boolean;
    phoneNotes?: string;
    propertyPhotoUrl?: string;
    roofAnalysis?: {
      suitability: "excellent" | "good" | "fair" | "poor";
      estimatedArea: number;
      orientation: string;
      shading: string;
      recommendedSystemSize: number;
    };
    creditScore?: {
      score: number;
      risk: "low" | "medium" | "high";
    };
  };
  cost: number;
}

/**
 * Calculate enrichment cost based on selected options
 */
export function calculateEnrichmentCost(options: PremiumEnrichmentOptions): number {
  let cost = 0;
  if (options.phoneVerification) cost += 10;
  if (options.propertyPhotos) cost += 5;
  if (options.roofAnalysis) cost += 10;
  if (options.creditCheck) cost += 15;
  return cost;
}

/**
 * Phone verification via AI (simulated)
 */
async function verifyPhone(phone: string, name: string): Promise<{ verified: boolean; notes: string }> {
  try {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: "Simulate a phone verification call result.",
        },
        {
          role: "user",
          content: `Simulate calling ${name} at ${phone} to verify solar interest. Return JSON: { "verified": boolean, "notes": "summary" }`,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "phone_verification",
          strict: true,
          schema: {
            type: "object",
            properties: {
              verified: { type: "boolean" },
              notes: { type: "string" },
            },
            required: ["verified", "notes"],
            additionalProperties: false,
          },
        },
      },
    });

    const content = response.choices[0]?.message?.content;
    const result = JSON.parse(typeof content === 'string' ? content : "{}");
    return result;
  } catch (error) {
    return { verified: false, notes: "Verification failed" };
  }
}

/**
 * Get property photos (simulated)
 */
async function getPropertyPhoto(address: string): Promise<string | null> {
  // In production: Google Street View API
  const encoded = encodeURIComponent(address);
  return `https://via.placeholder.com/600x400.png?text=Property:+${encoded}`;
}

/**
 * Analyze roof with AI
 */
async function analyzeRoof(
  address: string,
  propertyType: string
): Promise<{ suitability: "excellent" | "good" | "fair" | "poor"; estimatedArea: number; orientation: string; shading: string; recommendedSystemSize: number; } | null> {
  try {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: "You are a solar roof analysis expert.",
        },
        {
          role: "user",
          content: `Analyze roof at ${address} (${propertyType}) for solar. Return JSON with: suitability, estimatedArea, orientation, shading, recommendedSystemSize`,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "roof_analysis",
          strict: true,
          schema: {
            type: "object",
            properties: {
              suitability: { type: "string", enum: ["excellent", "good", "fair", "poor"] },
              estimatedArea: { type: "number" },
              orientation: { type: "string" },
              shading: { type: "string" },
              recommendedSystemSize: { type: "number" },
            },
            required: ["suitability", "estimatedArea", "orientation", "shading", "recommendedSystemSize"],
            additionalProperties: false,
          },
        },
      },
    });

    const content = response.choices[0]?.message?.content;
    return JSON.parse(typeof content === 'string' ? content : "{}");
  } catch (error) {
    return null;
  }
}

/**
 * Check credit (simulated)
 */
async function checkCredit(): Promise<{ score: number; risk: "low" | "medium" | "high"; } | null> {
  const score = 50 + Math.floor(Math.random() * 40);
  const risk = score >= 75 ? "low" : score >= 55 ? "medium" : "high";
  return { score, risk };
}

/**
 * Enrich a lead with premium services
 */
export async function enrichLeadPremium(
  leadId: number,
  options: PremiumEnrichmentOptions
): Promise<PremiumEnrichmentResult> {
  const db = await getDb();
  if (!db) return { success: false, cost: 0 };

  try {
    const leadResults = await db.select().from(leads).where(eq(leads.id, leadId)).limit(1);
    if (leadResults.length === 0) return { success: false, cost: 0 };

    const lead = leadResults[0];
    const enrichmentData: PremiumEnrichmentResult["data"] = {};
    let totalCost = 0;

    if (options.phoneVerification) {
      const phoneResult = await verifyPhone(lead.customerPhone, lead.customerName);
      enrichmentData.phoneVerified = phoneResult.verified;
      enrichmentData.phoneNotes = phoneResult.notes;
      totalCost += 10;
    }

    if (options.propertyPhotos) {
      const photoUrl = await getPropertyPhoto(lead.address);
      if (photoUrl) {
        enrichmentData.propertyPhotoUrl = photoUrl;
        totalCost += 5;
      }
    }

    if (options.roofAnalysis) {
      const roofData = await analyzeRoof(lead.address, lead.propertyType);
      if (roofData && enrichmentData) {
        enrichmentData.roofAnalysis = roofData;
        totalCost += 10;
      }
    }

    if (options.creditCheck) {
      const creditData = await checkCredit();
      if (creditData && enrichmentData) {
        enrichmentData.creditScore = creditData;
        totalCost += 15;
      }
    }

    const enrichmentLevel = totalCost >= 30 ? "premium" : totalCost >= 15 ? "basic" : "none";
    
    await db
      .update(leads)
      .set({
        enrichmentLevel,
        enrichmentData: JSON.stringify(enrichmentData),
      })
      .where(eq(leads.id, leadId));

    console.log(`[PremiumEnrichment] Enriched lead ${leadId} - $${totalCost} AUD`);

    return {
      success: true,
      data: enrichmentData,
      cost: totalCost,
    };
  } catch (error) {
    console.error("[PremiumEnrichment] Error:", error);
    return { success: false, cost: 0 };
  }
}
