/**
 * Autonomous Ad Campaign Manager
 * Automatically creates, optimizes, and manages Google Ads campaigns
 */

import { getGoogleAdsCustomer, isGoogleAdsConfigured } from './googleAds';
import { invokeLLM } from './_core/llm';
import { getDb } from './db';
import { adBudgets, adCampaigns, adPerformance } from '../drizzle/schema';
import { eq, and, gte } from 'drizzle-orm';
import { createGoogleAdsCampaign } from './googleAdsCampaigns';
import { ENV } from './_core/env';

// Solar-specific campaign configuration
const SOLAR_CAMPAIGN_CONFIG = {
  locations: [
    { name: 'Queensland', geoTargetConstant: 'geoTargetConstants/2036' },
    { name: 'New South Wales', geoTargetConstant: 'geoTargetConstants/2036' },
    { name: 'Western Australia', geoTargetConstant: 'geoTargetConstants/2009' },
    { name: 'South Australia', geoTargetConstant: 'geoTargetConstants/2017' },
  ],
  keywords: [
    // High-intent keywords
    { text: 'solar panels brisbane', matchType: 'EXACT' as const },
    { text: 'solar panels sydney', matchType: 'EXACT' as const },
    { text: 'solar panels perth', matchType: 'EXACT' as const },
    { text: 'solar panels adelaide', matchType: 'EXACT' as const },
    { text: 'solar panel installation', matchType: 'PHRASE' as const },
    { text: 'solar panel quotes', matchType: 'PHRASE' as const },
    { text: 'get solar quote', matchType: 'PHRASE' as const },
    { text: 'compare solar quotes', matchType: 'PHRASE' as const },
    { text: '6.6kw solar system', matchType: 'EXACT' as const },
    { text: 'solar system price', matchType: 'PHRASE' as const },
    { text: 'best solar panels australia', matchType: 'PHRASE' as const },
    { text: 'solar panel cost', matchType: 'PHRASE' as const },
  ],
  negativeKeywords: [
    'free',
    'diy',
    'second hand',
    'used',
    'cheap',
    'job',
    'jobs',
    'course',
    'training',
  ],
};

/**
 * Generate AI-powered ad copy variations
 */
async function generateAdCopy(): Promise<{
  headlines: string[];
  descriptions: string[];
}> {
  const prompt = `Generate Google Ads copy for a solar panel lead generation service in Australia.

Business: SolarlyAU - connects homeowners with verified solar installers
Value proposition: Free quotes, CEC accredited installers, save on electricity bills
Target audience: Australian homeowners in QLD, NSW, WA, SA

Generate:
1. 10 compelling headlines (max 30 characters each)
2. 4 descriptions (max 90 characters each)

Focus on: savings, free service, verified installers, quick quotes
Tone: Professional, trustworthy, benefit-focused

Return ONLY valid JSON in this exact format:
{
  "headlines": ["headline1", "headline2", ...],
  "descriptions": ["desc1", "desc2", "desc3", "desc4"]
}`;

  try {
    const response = await invokeLLM({
      messages: [
        { role: 'system', content: 'You are an expert Google Ads copywriter. Return only valid JSON.' },
        { role: 'user', content: prompt },
      ],
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'ad_copy',
          strict: true,
          schema: {
            type: 'object',
            properties: {
              headlines: {
                type: 'array',
                items: { type: 'string' },
                minItems: 10,
                maxItems: 10,
              },
              descriptions: {
                type: 'array',
                items: { type: 'string' },
                minItems: 4,
                maxItems: 4,
              },
            },
            required: ['headlines', 'descriptions'],
            additionalProperties: false,
          },
        },
      },
    });

    const content = response.choices[0]?.message?.content;
    if (!content || typeof content !== 'string') {
      throw new Error('No content in LLM response');
    }

    const adCopy = JSON.parse(content);
    console.log('[AdManager] Generated AI ad copy:', adCopy);
    return adCopy;
  } catch (error) {
    console.error('[AdManager] Failed to generate ad copy:', error);
    // Fallback to default copy
    return {
      headlines: [
        'Get Free Solar Quotes Today',
        'Compare Top Solar Installers',
        'Save $1000s On Power Bills',
        'CEC Accredited Installers',
        'Solar Panels From $3,990',
        "Australia's #1 Solar Platform",
        '100% Free Quote Service',
        'Get 3 Quotes In 24 Hours',
        'Premium Solar Systems',
        'Solar Specialists Near You',
      ],
      descriptions: [
        'Get matched with verified solar installers. Compare quotes and save thousands. 100% free service.',
        'Compare 3 competitive quotes from CEC accredited installers within 24 hours. No obligation.',
        'Save up to 80% on electricity bills with premium solar systems. Free quotes from top installers.',
        "Australia's first autonomous solar platform. Get quotes from verified installers in your area.",
      ],
    };
  }
}

/**
 * Create a new Google Ads campaign
 */
export async function createSolarCampaign(monthlyBudget: number): Promise<boolean> {
  if (!isGoogleAdsConfigured()) {
    console.warn('[AdManager] Google Ads not configured. Skipping campaign creation.');
    return false;
  }

  const customer = getGoogleAdsCustomer();
  if (!customer) {
    console.error('[AdManager] Failed to get Google Ads customer');
    return false;
  }

  try {
    console.log('[AdManager] Creating new solar lead campaign...');

    // Generate AI ad copy
    const adCopy = await generateAdCopy();

    // Calculate daily budget (monthly / 30)
    const dailyBudgetMicros = Math.floor((monthlyBudget / 30) * 1_000_000);

    // Create campaign
    const today = new Date().toISOString().split('T')[0];
    const campaignName = `Solar Leads - ${today}`;
    
    // Get the deployed domain for final URL
    const finalUrl = `https://solar-lead-vwkzbmwb.manus.space/get-quote`;
    
    // Create campaign in Google Ads
    const result = await createGoogleAdsCampaign({
      name: campaignName,
      dailyBudgetMicros,
      locations: SOLAR_CAMPAIGN_CONFIG.locations.map(loc => loc.geoTargetConstant),
      keywords: SOLAR_CAMPAIGN_CONFIG.keywords,
      adCopy,
      finalUrl,
    });
    
    if (!result.success) {
      console.error(`[AdManager] Failed to create Google Ads campaign: ${result.error}`);
      return false;
    }
    
    // Save campaign to database
    const db = await getDb();
    if (!db) {
      console.error('[AdManager] Database not available');
      return false;
    }

    await db.insert(adCampaigns).values({
      name: campaignName,
      status: 'paused', // Starts paused for safety
      dailyBudget: Math.floor(monthlyBudget / 30),
      monthlyBudget,
      targetCostPerLead: 20,
      keywords: JSON.stringify(SOLAR_CAMPAIGN_CONFIG.keywords),
      adCopy: JSON.stringify(adCopy),
      locations: JSON.stringify(SOLAR_CAMPAIGN_CONFIG.locations),
      googleCampaignId: result.campaignId || null,
    });

    console.log(`[AdManager] Campaign created: ${campaignName}`);
    console.log(`[AdManager] Daily budget: $${(monthlyBudget / 30).toFixed(2)}`);
    console.log(`[AdManager] Monthly budget: $${monthlyBudget}`);
    console.log(`[AdManager] Keywords: ${SOLAR_CAMPAIGN_CONFIG.keywords.length}`);
    console.log(`[AdManager] Ad variations: ${adCopy.headlines.length} headlines, ${adCopy.descriptions.length} descriptions`);

    return true;
  } catch (error) {
    console.error('[AdManager] Failed to create campaign:', error);
    return false;
  }
}

/**
 * Get current month's approved budget
 */
export async function getCurrentMonthBudget(): Promise<number | null> {
  const db = await getDb();
  if (!db) return null;

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const budgets = await db
    .select()
    .from(adBudgets)
    .where(
      and(
        eq(adBudgets.status, 'approved'),
        gte(adBudgets.month, monthStart)
      )
    )
    .limit(1);

  return budgets[0]?.amount ?? null;
}

/**
 * Check if daily spending limit has been reached
 */
export async function isDailyLimitReached(): Promise<boolean> {
  const monthlyBudget = await getCurrentMonthBudget();
  if (!monthlyBudget) return true; // No budget approved, stop spending

  const dailyLimit = monthlyBudget / 30;

  const db = await getDb();
  if (!db) return true;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todaySpend = await db
    .select()
    .from(adPerformance)
    .where(gte(adPerformance.date, today));

  const totalSpent = todaySpend.reduce((sum, record) => sum + (record.cost || 0), 0);

  const limitReached = totalSpent >= dailyLimit;
  if (limitReached) {
    console.warn(`[AdManager] Daily limit reached: $${totalSpent.toFixed(2)} / $${dailyLimit.toFixed(2)}`);
  }

  return limitReached;
}
