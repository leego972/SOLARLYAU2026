/**
 * Google Ads Campaign Creation & Management
 * Handles actual Google Ads API calls to create and manage campaigns
 */

import { getGoogleAdsCustomer } from './googleAds';
import { resources, enums } from 'google-ads-api';

export interface CampaignConfig {
  name: string;
  dailyBudgetMicros: number; // Budget in micros (1 AUD = 1,000,000 micros)
  locations: string[]; // Geo target constants (e.g., 'geoTargetConstants/2036')
  keywords: Array<{ text: string; matchType: 'EXACT' | 'PHRASE' | 'BROAD' }>;
  adCopy: {
    headlines: string[];
    descriptions: string[];
  };
  finalUrl: string; // Landing page URL
}

/**
 * Create a complete Google Ads campaign with ad groups, keywords, and ads
 */
export async function createGoogleAdsCampaign(config: CampaignConfig): Promise<{
  success: boolean;
  campaignId?: string;
  adGroupId?: string;
  error?: string;
}> {
  try {
    const customer = getGoogleAdsCustomer();
    if (!customer) {
      return { success: false, error: 'Google Ads customer not initialized' };
    }

    console.log(`[GoogleAdsCampaigns] Creating campaign: ${config.name}`);

    // Step 1: Create Budget
    const budgetResourceName = await createCampaignBudget(customer, config.name, config.dailyBudgetMicros);
    if (!budgetResourceName) {
      return { success: false, error: 'Failed to create campaign budget' };
    }

    // Step 2: Create Campaign
    const campaignResourceName = await createCampaign(customer, config.name, budgetResourceName, config.locations);
    if (!campaignResourceName) {
      return { success: false, error: 'Failed to create campaign' };
    }

    const campaignId = extractIdFromResourceName(campaignResourceName);

    // Step 3: Create Ad Group
    const adGroupResourceName = await createAdGroup(customer, campaignResourceName, `${config.name} - Ad Group`);
    if (!adGroupResourceName) {
      return { success: false, error: 'Failed to create ad group' };
    }

    const adGroupId = extractIdFromResourceName(adGroupResourceName);

    // Step 4: Add Keywords
    await addKeywords(customer, adGroupResourceName, config.keywords);

    // Step 5: Create Responsive Search Ad
    await createResponsiveSearchAd(customer, adGroupResourceName, config.adCopy, config.finalUrl);

    console.log(`[GoogleAdsCampaigns] ✅ Campaign created successfully`);
    console.log(`[GoogleAdsCampaigns] Campaign ID: ${campaignId}`);
    console.log(`[GoogleAdsCampaigns] Ad Group ID: ${adGroupId}`);

    return {
      success: true,
      campaignId,
      adGroupId,
    };
  } catch (error: any) {
    console.error('[GoogleAdsCampaigns] Error creating campaign:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Create a campaign budget
 */
async function createCampaignBudget(
  customer: any,
  name: string,
  dailyBudgetMicros: number
): Promise<string | null> {
  try {
    const budgetOperation = {
      entity: 'campaign_budget',
      operation: 'create',
      resource: {
        name: `${name} Budget`,
        amount_micros: dailyBudgetMicros,
        delivery_method: enums.BudgetDeliveryMethod.STANDARD,
      } as resources.ICampaignBudget,
    };

    const result = await customer.mutateResources([budgetOperation]);
    const budgetResourceName = result[0]?.campaign_budget?.resource_name;

    console.log(`[GoogleAdsCampaigns] Budget created: ${budgetResourceName}`);
    return budgetResourceName || null;
  } catch (error: any) {
    console.error('[GoogleAdsCampaigns] Error creating budget:', error.message);
    return null;
  }
}

/**
 * Create a Search campaign
 */
async function createCampaign(
  customer: any,
  name: string,
  budgetResourceName: string,
  locations: string[]
): Promise<string | null> {
  try {
    const campaignOperation = {
      entity: 'campaign',
      operation: 'create',
      resource: {
        name,
        advertising_channel_type: enums.AdvertisingChannelType.SEARCH,
        status: enums.CampaignStatus.PAUSED, // Start paused for safety
        campaign_budget: budgetResourceName,
        network_settings: {
          target_google_search: true,
          target_search_network: true,
          target_content_network: false,
          target_partner_search_network: false,
        },
        bidding_strategy_type: enums.BiddingStrategyType.TARGET_CPA,
        target_cpa: {
          target_cpa_micros: 40_000_000, // $40 target CPA
        },
      } as resources.ICampaign,
    };

    const result = await customer.mutateResources([campaignOperation]);
    const campaignResourceName = result[0]?.campaign?.resource_name;

    // Add location targeting
    if (campaignResourceName && locations.length > 0) {
      await addLocationTargeting(customer, campaignResourceName, locations);
    }

    console.log(`[GoogleAdsCampaigns] Campaign created: ${campaignResourceName}`);
    return campaignResourceName || null;
  } catch (error: any) {
    console.error('[GoogleAdsCampaigns] Error creating campaign:', error.message);
    return null;
  }
}

/**
 * Add location targeting to campaign
 */
async function addLocationTargeting(
  customer: any,
  campaignResourceName: string,
  locations: string[]
): Promise<void> {
  try {
    const operations = locations.map(location => ({
      entity: 'campaign_criterion',
      operation: 'create',
      resource: {
        campaign: campaignResourceName,
        location: {
          geo_target_constant: location,
        },
      } as resources.ICampaignCriterion,
    }));

    await customer.mutateResources(operations);
    console.log(`[GoogleAdsCampaigns] Added ${locations.length} location targets`);
  } catch (error: any) {
    console.error('[GoogleAdsCampaigns] Error adding location targeting:', error.message);
  }
}

/**
 * Create an ad group
 */
async function createAdGroup(
  customer: any,
  campaignResourceName: string,
  name: string
): Promise<string | null> {
  try {
    const adGroupOperation = {
      entity: 'ad_group',
      operation: 'create',
      resource: {
        name,
        campaign: campaignResourceName,
        status: enums.AdGroupStatus.ENABLED,
        type: enums.AdGroupType.SEARCH_STANDARD,
      } as resources.IAdGroup,
    };

    const result = await customer.mutateResources([adGroupOperation]);
    const adGroupResourceName = result[0]?.ad_group?.resource_name;

    console.log(`[GoogleAdsCampaigns] Ad group created: ${adGroupResourceName}`);
    return adGroupResourceName || null;
  } catch (error: any) {
    console.error('[GoogleAdsCampaigns] Error creating ad group:', error.message);
    return null;
  }
}

/**
 * Add keywords to ad group
 */
async function addKeywords(
  customer: any,
  adGroupResourceName: string,
  keywords: Array<{ text: string; matchType: 'EXACT' | 'PHRASE' | 'BROAD' }>
): Promise<void> {
  try {
    const operations = keywords.map(keyword => ({
      entity: 'ad_group_criterion',
      operation: 'create',
      resource: {
        ad_group: adGroupResourceName,
        status: enums.AdGroupCriterionStatus.ENABLED,
        keyword: {
          text: keyword.text,
          match_type: enums.KeywordMatchType[keyword.matchType],
        },
      } as resources.IAdGroupCriterion,
    }));

    await customer.mutateResources(operations);
    console.log(`[GoogleAdsCampaigns] Added ${keywords.length} keywords`);
  } catch (error: any) {
    console.error('[GoogleAdsCampaigns] Error adding keywords:', error.message);
  }
}

/**
 * Create a Responsive Search Ad
 */
async function createResponsiveSearchAd(
  customer: any,
  adGroupResourceName: string,
  adCopy: { headlines: string[]; descriptions: string[] },
  finalUrl: string
): Promise<void> {
  try {
    // Google Ads requires at least 3 headlines and 2 descriptions
    const headlines = adCopy.headlines.slice(0, 15).map(text => ({ text }));
    const descriptions = adCopy.descriptions.slice(0, 4).map(text => ({ text }));

    const adOperation = {
      entity: 'ad_group_ad',
      operation: 'create',
      resource: {
        ad_group: adGroupResourceName,
        status: enums.AdGroupAdStatus.ENABLED,
        ad: {
          final_urls: [finalUrl],
          responsive_search_ad: {
            headlines,
            descriptions,
          },
        },
      } as resources.IAdGroupAd,
    };

    await customer.mutateResources([adOperation]);
    console.log(`[GoogleAdsCampaigns] Responsive search ad created`);
  } catch (error: any) {
    console.error('[GoogleAdsCampaigns] Error creating ad:', error.message);
  }
}

/**
 * Enable a paused campaign
 */
export async function enableCampaign(campaignId: string): Promise<boolean> {
  try {
    const customer = getGoogleAdsCustomer();
    if (!customer) return false;

    const campaignResourceName = `customers/${customer.credentials.customer_id}/campaigns/${campaignId}`;

    const operation = {
      entity: 'campaign' as const,
      operation: 'update' as const,
      resource: {
        resource_name: campaignResourceName,
        status: enums.CampaignStatus.ENABLED,
      } as resources.ICampaign,
      update_mask: {
        paths: ['status'],
      },
    };

    await customer.mutateResources([operation]);
    console.log(`[GoogleAdsCampaigns] Campaign ${campaignId} enabled`);
    return true;
  } catch (error: any) {
    console.error('[GoogleAdsCampaigns] Error enabling campaign:', error.message);
    return false;
  }
}

/**
 * Pause a campaign
 */
export async function pauseCampaign(campaignId: string): Promise<boolean> {
  try {
    const customer = getGoogleAdsCustomer();
    if (!customer) return false;

    const campaignResourceName = `customers/${customer.credentials.customer_id}/campaigns/${campaignId}`;

    const operation = {
      entity: 'campaign' as const,
      operation: 'update' as const,
      resource: {
        resource_name: campaignResourceName,
        status: enums.CampaignStatus.PAUSED,
      } as resources.ICampaign,
      update_mask: {
        paths: ['status'],
      },
    };

    await customer.mutateResources([operation]);
    console.log(`[GoogleAdsCampaigns] Campaign ${campaignId} paused`);
    return true;
  } catch (error: any) {
    console.error('[GoogleAdsCampaigns] Error pausing campaign:', error.message);
    return false;
  }
}

/**
 * Extract numeric ID from Google Ads resource name
 * Example: "customers/1234567890/campaigns/9876543210" -> "9876543210"
 */
function extractIdFromResourceName(resourceName: string): string {
  const parts = resourceName.split('/');
  return parts[parts.length - 1] || '';
}
