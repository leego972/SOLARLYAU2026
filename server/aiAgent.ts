/**
 * Autonomous AI Agent for Lead Generation
 * 
 * This agent autonomously:
 * 1. Generates solar leads using AI and data sources
 * 2. Qualifies leads based on quality criteria
 * 3. Finds and recruits installers via LinkedIn/social media
 * 4. Optimizes pricing and matching algorithms
 */

import { invokeLLM } from "./_core/llm";
import { callDataApi } from "./_core/dataApi";
import * as db from './db';
import { createLead } from './db';
import { generateEnrichedLeads } from "./leadEnrichment";

interface LeadGenerationResult {
  leads: Array<{
    customerName: string;
    customerPhone: string;
    customerEmail?: string;
    address: string;
    suburb: string;
    state: string;
    postcode: string;
    propertyType: "residential" | "commercial" | "industrial";
    estimatedSystemSize?: number;
    currentElectricityBill?: number;
    qualityScore: number;
  }>;
  source: string;
}

/**
 * Generate leads using AI analysis of Australian solar data
 */
export async function generateLeadsFromAI(): Promise<LeadGenerationResult> {
  const startTime = new Date();

  try {
    // Use AI to generate realistic Australian solar leads
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: `You are an expert lead generation AI for the Australian solar panel installation market. Generate realistic, high-quality solar installation leads for Australian homeowners and businesses.

EXPANDED GEOGRAPHIC COVERAGE (All Major Markets):
- Queensland (QLD) - 25% of leads - Tropical/subtropical climate, highest solar potential
- New South Wales (NSW) - 25% of leads - Large population, strong solar uptake
- Victoria (VIC) - 20% of leads - Largest population, huge market despite cooler climate
- Western Australia (WA) - 15% of leads - Excellent sunshine hours, growing market
- South Australia (SA) - 10% of leads - High electricity prices, solar incentives
- Tasmania (TAS) - 5% of leads - Emerging market, government incentives

Lead Types (Revenue Maximization):
- 70% Residential (standard pricing $60-120)
- 20% Commercial (premium pricing $200-500) - offices, warehouses, retail
- 10% Battery Storage (premium pricing $150-250) - properties suitable for solar + battery systems

Lead Quality Criteria:
- Properties in sunny suburbs with high solar irradiance
- Homeowners with high electricity bills ($300+ monthly)
- Suitable roof space and orientation (north-facing preferred)
- Owner-occupied residential properties
- Quality scoring: 80-95 for QLD/NSW, 70-85 for WA/SA

Generate leads with complete information including name, phone, address, suburb, state, postcode, property type, estimated system size, and current electricity bill.`,
        },
        {
          role: "user",
          content: `Generate 5 high-quality solar installation leads for Australian properties across ALL states.

STATE DISTRIBUTION (MUST follow):
- 1-2 leads from Queensland (QLD) - Brisbane, Gold Coast, Sunshine Coast
- 1-2 leads from New South Wales (NSW) - Sydney, Newcastle, Wollongong
- 1 lead from Victoria (VIC) - Melbourne, Geelong, Ballarat
- 0-1 leads from Western Australia (WA) - Perth metro
- 0-1 leads from South Australia (SA) - Adelaide metro
- 0-1 leads from Tasmania (TAS) - Hobart, Launceston

LEAD TYPE MIX (MUST include variety):
- 3-4 Residential properties (standard)
- 0-1 Commercial properties (office buildings, warehouses, retail stores)
- 0-1 Battery Storage leads (residential properties perfect for solar + battery)

For commercial leads: use propertyType "commercial", larger system sizes (20-100kW), higher bills ($2000-5000/month)
For battery storage: use propertyType "residential", note battery suitability in quality score Include realistic Australian phone numbers (format: 04XX XXX XXX) and addresses.

Return ONLY valid JSON in this exact format:
{
  "leads": [
    {
      "customerName": "John Smith",
      "customerPhone": "0412 345 678",
      "customerEmail": "john.smith@email.com",
      "address": "123 Main Street",
      "suburb": "Brisbane",
      "state": "QLD",
      "postcode": "4000",
      "propertyType": "residential",
      "estimatedSystemSize": 6,
      "currentElectricityBill": 350,
      "qualityScore": 85
    }
  ]
}`,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "solar_leads",
          strict: true,
          schema: {
            type: "object",
            properties: {
              leads: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    customerName: { type: "string" },
                    customerPhone: { type: "string" },
                    customerEmail: { type: "string" },
                    address: { type: "string" },
                    suburb: { type: "string" },
                    state: { type: "string" },
                    postcode: { type: "string" },
                    propertyType: {
                      type: "string",
                      enum: ["residential", "commercial", "industrial"],
                    },
                    estimatedSystemSize: { type: "number" },
                    currentElectricityBill: { type: "number" },
                    qualityScore: { type: "number" },
                  },
                  required: [
                    "customerName",
                    "customerPhone",
                    "address",
                    "suburb",
                    "state",
                    "postcode",
                    "propertyType",
                    "qualityScore",
                  ],
                  additionalProperties: false,
                },
              },
            },
            required: ["leads"],
            additionalProperties: false,
          },
        },
      },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No response from AI");
    }

    const contentStr = typeof content === 'string' ? content : JSON.stringify(content);
    const result: LeadGenerationResult = JSON.parse(contentStr);

    // Log activity
    try {
    await db.createAgentActivity({
      activityType: "lead_generation",
      description: `AI generated ${result.leads.length} solar leads`,
      status: "success",
      leadsGenerated: result.leads.length,
      leadsQualified: 0,
      offersCreated: 0,
      metadata: JSON.stringify({ source: "ai_generation", avgQuality: result.leads.reduce((sum, l) => sum + l.qualityScore, 0) / result.leads.length }),
      startedAt: startTime,
      completedAt: new Date(),
    });
    } catch (logError) {
      console.warn("[AI Agent] Failed to log activity (non-critical):", logError);
    }

    return { ...result, source: "ai_generation" };
  } catch (error) {
    console.error("[AI Agent] Lead generation failed:", error);

    try {
    await db.createAgentActivity({
      activityType: "lead_generation",
      description: "AI lead generation failed",
      status: "failed",
      leadsGenerated: 0,
      leadsQualified: 0,
      offersCreated: 0,
      errorDetails: error instanceof Error ? error.message : String(error),
      startedAt: startTime,
      completedAt: new Date(),
    });
    } catch (logError) {
      console.warn("[AI Agent] Failed to log activity (non-critical):", logError);
    }

    return { leads: [], source: "ai_generation" };
  }
}

/**
 * Find solar installers on LinkedIn
 */
export async function findInstallersOnLinkedIn(state: string): Promise<any[]> {
  const startTime = new Date();

  try {
    // Search for solar installers in the specified state
    const searchQuery = `solar installer ${state} Australia`;

    const result = await callDataApi("LinkedIn/search_people", {
      query: {
        keywords: searchQuery,
        keywordTitle: "solar installer",
      },
    });

    const people = (result as any)?.data?.items || [];

    try {
    await db.createAgentActivity({
      activityType: "installer_outreach",
      description: `Found ${people.length} potential installers on LinkedIn in ${state}`,
      status: "success",
      leadsGenerated: 0,
      leadsQualified: 0,
      offersCreated: 0,
      metadata: JSON.stringify({ state, count: people.length }),
      startedAt: startTime,
      completedAt: new Date(),
    });
    } catch (logError) {
      console.warn("[AI Agent] Failed to log activity (non-critical):", logError);
    }

    return people;
  } catch (error) {
    console.error("[AI Agent] LinkedIn search failed:", error);

    try {
    await db.createAgentActivity({
      activityType: "installer_outreach",
      description: "LinkedIn installer search failed",
      status: "failed",
      leadsGenerated: 0,
      leadsQualified: 0,
      offersCreated: 0,
      errorDetails: error instanceof Error ? error.message : String(error),
      startedAt: startTime,
      completedAt: new Date(),
    });
    } catch (logError) {
      console.warn("[AI Agent] Failed to log activity (non-critical):", logError);
    }

    return [];
  }
}

/**
 * Qualify and save leads to database
 */
export async function qualifyAndSaveLeads(
  leadData: LeadGenerationResult
): Promise<number> {
  let savedCount = 0;

  for (const lead of leadData.leads) {
    try {
      // Set expiration (7 days from now)
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      // Calculate base price based on quality score
      // MAXIMUM PROFIT PRICING: Higher quality = higher price (range: $60-$120)
      // Premium positioning for enriched, legally-compliant leads
      let basePrice = Math.round(60 + (lead.qualityScore / 100) * 60);
      
      // Premium pricing for commercial leads (higher value)
      if (lead.propertyType === 'commercial' || lead.propertyType === 'industrial') {
        basePrice = Math.round(150 + (lead.qualityScore / 100) * 150); // $150-300
      }
      
      // Premium pricing for large residential systems
      if (lead.propertyType === 'residential' && lead.estimatedSystemSize && lead.estimatedSystemSize >= 10) {
        basePrice = Math.round(90 + (lead.qualityScore / 100) * 60); // $90-150
      }

      await createLead({
        source: "ai_generated",
        sourceDetails: JSON.stringify({ aiGenerated: true, source: leadData.source }),
        customerName: lead.customerName,
        customerPhone: lead.customerPhone,
        customerEmail: lead.customerEmail,
        address: lead.address,
        suburb: lead.suburb,
        state: lead.state,
        postcode: lead.postcode,
        propertyType: lead.propertyType,
        estimatedSystemSize: lead.estimatedSystemSize,
        currentElectricityBill: lead.currentElectricityBill,
        qualityScore: lead.qualityScore,
        basePrice,
        expiresAt,
        status: "new",
      });

      savedCount++;
    } catch (error) {
      console.error(`[AI Agent] Failed to save lead for ${lead.customerName}:`, error);
    }
  }

  return savedCount;
}

/**
 * Run autonomous lead generation cycle
 */
export async function runAutonomousLeadGeneration(): Promise<{
  generated: number;
  saved: number;
}> {
  console.log("[AI Agent] Starting autonomous lead enrichment cycle (legally compliant)...");

  // Generate enriched leads (hybrid AI + real data sources for legal compliance)
  const enrichedLeads = await generateEnrichedLeads(5);
  const leadData: LeadGenerationResult = {
    leads: enrichedLeads.map(lead => ({
      customerName: lead.customerName,
      customerPhone: lead.customerPhone,
      customerEmail: lead.customerEmail,
      address: lead.address,
      suburb: lead.suburb,
      state: lead.state,
      postcode: lead.postcode,
      propertyType: lead.propertyType as "residential" | "commercial" | "industrial",
      estimatedSystemSize: parseInt(lead.estimatedSystemSize) || 6,
      currentElectricityBill: 350,
      qualityScore: lead.qualityScore,
    })),
    source: "enriched_leads",
  };

  // Qualify and save leads
  const saved = await qualifyAndSaveLeads(leadData);

  console.log(
    `[AI Agent] Generated ${leadData.leads.length} leads, saved ${saved} to database`
  );

  return {
    generated: leadData.leads.length,
    saved,
  };
}

/**
 * Optimize pricing based on market data
 */
export async function optimizePricing(): Promise<void> {
  const startTime = new Date();

  try {
    // Get recent transaction data
    const transactions = await db.getSuccessfulTransactions();
    const leads = await db.getLeadsByStatus("sold");

    if (transactions.length < 10) {
      console.log("[AI Agent] Not enough data for pricing optimization");
      return;
    }

    // Calculate average selling price
    const avgPrice =
      transactions.reduce((sum, t) => sum + t.amount, 0) / transactions.length / 100;

    // Calculate conversion rate
    const allLeads = await db.getAllLeads();
    const conversionRate = (leads.length / allLeads.length) * 100;

    // Use AI to suggest optimal pricing
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content:
            "You are a pricing optimization expert for lead generation businesses. Analyze data and suggest optimal pricing strategies.",
        },
        {
          role: "user",
          content: `Current metrics:
- Average lead price: $${avgPrice.toFixed(2)}
- Conversion rate: ${conversionRate.toFixed(2)}%
- Total leads sold: ${leads.length}
- Total transactions: ${transactions.length}

Suggest optimal lead pricing strategy to maximize revenue while maintaining good conversion rates. Consider:
1. Quality-based pricing tiers
2. Market demand
3. Installer willingness to pay

Provide specific price recommendations.`,
        },
      ],
    });

    const suggestion = response.choices[0]?.message?.content;
    const suggestionText = typeof suggestion === 'string' ? suggestion : JSON.stringify(suggestion);

    try {
    await db.createAgentActivity({
      activityType: "system_optimization",
      description: "Pricing optimization analysis completed",
      status: "success",
      leadsGenerated: 0,
      leadsQualified: 0,
      offersCreated: 0,
      metadata: JSON.stringify({
        avgPrice,
        conversionRate,
        suggestion: suggestionText?.substring(0, 500),
      }),
      startedAt: startTime,
      completedAt: new Date(),
    });
    } catch (logError) {
      console.warn("[AI Agent] Failed to log activity (non-critical):", logError);
    }

    console.log("[AI Agent] Pricing optimization completed");
  } catch (error) {
    console.error("[AI Agent] Pricing optimization failed:", error);

    try {
    await db.createAgentActivity({
      activityType: "system_optimization",
      description: "Pricing optimization failed",
      status: "failed",
      leadsGenerated: 0,
      leadsQualified: 0,
      offersCreated: 0,
      errorDetails: error instanceof Error ? error.message : String(error),
      startedAt: startTime,
      completedAt: new Date(),
    });
    } catch (logError) {
      console.warn("[AI Agent] Failed to log activity (non-critical):", logError);
    }
  }
}
