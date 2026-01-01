/**
 * Script to create a Google Ads conversion action programmatically
 * This creates a "Solar Quote Submission" conversion action and returns the conversion label
 */

import { getGoogleAdsCustomer } from './googleAds';
import { resources, enums } from 'google-ads-api';

async function createConversionAction() {
  console.log('🎯 Creating Google Ads conversion action...');
  
  try {
    const customer = getGoogleAdsCustomer();
    if (!customer) {
      throw new Error('Google Ads client not configured. Please check your credentials.');
    }
    
    const customerId = process.env.GOOGLE_ADS_CUSTOMER_ID!;
    
    // Create conversion action resource
    const conversionActionResource: resources.IConversionAction = {
      name: 'Solar Quote Submission',
      category: 4, // LEAD category
      type: enums.ConversionActionType.WEBPAGE,
      status: enums.ConversionActionStatus.ENABLED,
      view_through_lookback_window_days: 30,
      click_through_lookback_window_days: 90,
      counting_type: enums.ConversionActionCountingType.ONE_PER_CLICK,
      value_settings: {
        default_value: 50.0, // Average lead value in AUD
        always_use_default_value: false,
      },
      attribution_model_settings: {
        attribution_model: 105, // LAST_CLICK model
      },
    };

    const operation: any = {
      entity: 'conversion_action',
      operation: 'create',
      resource: conversionActionResource,
    };

    console.log('[CreateConversion] Sending request to Google Ads API...');
    const result: any = await customer.mutateResources([operation]);

    if (result && result.length > 0 && result[0]?.conversion_action) {
      const resourceName = result[0]?.conversion_action?.resource_name;
      
      // Extract conversion ID from resource name
      // Format: customers/{customer_id}/conversionActions/{conversion_action_id}
      const conversionActionId = resourceName.split('/').pop();
      
      console.log('');
      console.log('✅ Conversion action created successfully!');
      console.log('📋 Resource Name:', resourceName);
      console.log('🔢 Conversion Action ID:', conversionActionId);
      console.log('🏷️  Conversion Label:', conversionActionId);
      console.log('');
      console.log('📝 Next steps:');
      console.log('1. Update client/src/pages/QuoteThankYou.tsx line 22:');
      console.log(`   const CONVERSION_LABEL = '${conversionActionId}';`);
      console.log('');
      console.log('2. Your full conversion tracking tag:');
      console.log(`   gtag('event', 'conversion', {'send_to': 'AW-${customerId}/${conversionActionId}'});`);
      console.log('');
      
      return {
        success: true,
        conversionActionId,
        conversionLabel: conversionActionId,
        customerId,
      };
    } else {
      console.error('❌ Failed to create conversion action - no response');
      return { success: false, error: 'No response from API' };
    }
  } catch (error: any) {
    console.error('❌ Error creating conversion action:', error.message);
    
    // Check if conversion action already exists
    if (error.message && (error.message.includes('DUPLICATE') || error.message.includes('already exists'))) {
      console.log('');
      console.log('ℹ️  Conversion action may already exist. Fetching existing conversion actions...');
      
      try {
        const customer = getGoogleAdsCustomer();
        if (!customer) {
          throw new Error('Google Ads client not configured');
        }
        
        // Query for existing conversion action
        const query = `
          SELECT 
            conversion_action.id,
            conversion_action.name,
            conversion_action.resource_name
          FROM conversion_action
          WHERE conversion_action.name = 'Solar Quote Submission'
          AND conversion_action.status = 'ENABLED'
        `;
        
        console.log('[CreateConversion] Querying for existing conversion action...');
        const results: any = await customer.query(query);
        
        if (results && results.length > 0) {
          const existingAction = results[0]?.conversion_action;
          const conversionActionId = existingAction?.id?.toString();
          
          if (conversionActionId) {
            console.log('');
            console.log('✅ Found existing conversion action!');
            console.log('📋 Resource Name:', existingAction?.resource_name);
            console.log('🔢 Conversion Action ID:', conversionActionId);
            console.log('🏷️  Conversion Label:', conversionActionId);
            console.log('');
            console.log('📝 Update client/src/pages/QuoteThankYou.tsx line 22:');
            console.log(`   const CONVERSION_LABEL = '${conversionActionId}';`);
            console.log('');
            
            return {
              success: true,
              conversionActionId,
              conversionLabel: conversionActionId,
              customerId: process.env.GOOGLE_ADS_CUSTOMER_ID!,
              existing: true,
            };
          }
        }
        
        console.log('');
        console.log('⚠️  No existing conversion action found with name "Solar Quote Submission"');
      } catch (queryError: any) {
        console.error('❌ Error querying existing conversion action:', queryError.message);
      }
    }
    
    console.log('');
    console.log('💡 Manual alternative:');
    console.log('1. Go to: https://ads.google.com/aw/conversions');
    console.log('2. Click "+ New conversion action"');
    console.log('3. Select "Website"');
    console.log('4. Category: "Lead"');
    console.log('5. Name: "Solar Quote Submission"');
    console.log('6. Copy the conversion label from the tracking code');
    console.log('');
    
    return { success: false, error: error.message };
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  createConversionAction()
    .then((result) => {
      if (result.success) {
        console.log('🎉 Conversion tracking setup complete!');
        process.exit(0);
      } else {
        console.error('❌ Conversion tracking setup failed:', result.error);
        console.log('');
        console.log('Please create the conversion action manually in Google Ads.');
        process.exit(1);
      }
    })
    .catch((error) => {
      console.error('❌ Unexpected error:', error);
      process.exit(1);
    });
}

export { createConversionAction };
