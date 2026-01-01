#!/usr/bin/env node
/**
 * Comprehensive Google Ads API Diagnostic Script
 * Tests authentication, permissions, and campaign creation capabilities
 */

import { GoogleAdsApi } from 'google-ads-api';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load credentials
const envPath = path.join(__dirname, '.env.google-ads');
const credentials = {};

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value && !key.trim().startsWith('#')) {
      credentials[key.trim()] = value.trim();
    }
  });
}

console.log('🔍 GOOGLE ADS API DIAGNOSTIC TOOL');
console.log('=' .repeat(60));
console.log('');

// Step 1: Verify credentials are loaded
console.log('📋 Step 1: Verify Credentials');
console.log('-'.repeat(60));
console.log(`✓ Customer ID: ${credentials.GOOGLE_ADS_CUSTOMER_ID || '❌ MISSING'}`);
console.log(`✓ Developer Token: ${credentials.GOOGLE_ADS_DEVELOPER_TOKEN ? credentials.GOOGLE_ADS_DEVELOPER_TOKEN.substring(0, 10) + '...' : '❌ MISSING'}`);
console.log(`✓ Client ID: ${credentials.GOOGLE_ADS_CLIENT_ID ? credentials.GOOGLE_ADS_CLIENT_ID.substring(0, 30) + '...' : '❌ MISSING'}`);
console.log(`✓ Client Secret: ${credentials.GOOGLE_ADS_CLIENT_SECRET ? credentials.GOOGLE_ADS_CLIENT_SECRET.substring(0, 15) + '...' : '❌ MISSING'}`);
console.log(`✓ Refresh Token: ${credentials.GOOGLE_ADS_REFRESH_TOKEN ? credentials.GOOGLE_ADS_REFRESH_TOKEN.substring(0, 20) + '...' : '❌ MISSING'}`);
console.log('');

if (!credentials.GOOGLE_ADS_CUSTOMER_ID || !credentials.GOOGLE_ADS_DEVELOPER_TOKEN || 
    !credentials.GOOGLE_ADS_CLIENT_ID || !credentials.GOOGLE_ADS_CLIENT_SECRET || 
    !credentials.GOOGLE_ADS_REFRESH_TOKEN) {
  console.error('❌ Missing required credentials. Cannot proceed.');
  process.exit(1);
}

try {
  // Step 2: Initialize API client
  console.log('🔌 Step 2: Initialize Google Ads API Client');
  console.log('-'.repeat(60));
  
  const client = new GoogleAdsApi({
    client_id: credentials.GOOGLE_ADS_CLIENT_ID,
    client_secret: credentials.GOOGLE_ADS_CLIENT_SECRET,
    developer_token: credentials.GOOGLE_ADS_DEVELOPER_TOKEN,
  });
  
  console.log('✅ API client initialized successfully');
  console.log('');
  
  // Step 3: Create customer instance
  console.log('🔐 Step 3: Create Customer Instance');
  console.log('-'.repeat(60));
  
  const customer = client.Customer({
    customer_id: credentials.GOOGLE_ADS_CUSTOMER_ID,
    refresh_token: credentials.GOOGLE_ADS_REFRESH_TOKEN,
  });
  
  console.log('✅ Customer instance created');
  console.log('');
  
  // Step 4: Test API connection with simple query
  console.log('📊 Step 4: Test API Connection');
  console.log('-'.repeat(60));
  
  const customerQuery = `
    SELECT
      customer.id,
      customer.descriptive_name,
      customer.currency_code,
      customer.time_zone,
      customer.manager,
      customer.test_account
    FROM customer
    LIMIT 1
  `;
  
  const customerResult = await customer.query(customerQuery);
  const customerInfo = customerResult[0]?.customer;
  
  console.log('✅ API connection successful!');
  console.log('');
  console.log('Customer Information:');
  console.log(`  ID: ${customerInfo?.id}`);
  console.log(`  Name: ${customerInfo?.descriptive_name}`);
  console.log(`  Currency: ${customerInfo?.currency_code}`);
  console.log(`  Timezone: ${customerInfo?.time_zone}`);
  console.log(`  Is Manager Account: ${customerInfo?.manager ? 'Yes' : 'No'}`);
  console.log(`  Is Test Account: ${customerInfo?.test_account ? 'Yes ⚠️' : 'No'}`);
  console.log('');
  
  // Step 5: Check account permissions
  console.log('🔑 Step 5: Check Account Permissions');
  console.log('-'.repeat(60));
  
  try {
    const campaignsQuery = `
      SELECT
        campaign.id,
        campaign.name,
        campaign.status
      FROM campaign
      LIMIT 5
    `;
    
    const campaigns = await customer.query(campaignsQuery);
    console.log(`✅ Can read campaigns (found ${campaigns.length} campaigns)`);
    
    if (campaigns.length > 0) {
      console.log('');
      console.log('Existing Campaigns:');
      campaigns.forEach((c, i) => {
        console.log(`  ${i + 1}. ${c.campaign?.name} (ID: ${c.campaign?.id}, Status: ${c.campaign?.status})`);
      });
    }
  } catch (error) {
    console.error('❌ Cannot read campaigns:', error.message);
  }
  console.log('');
  
  // Step 6: Test campaign creation capability (dry run)
  console.log('🧪 Step 6: Test Campaign Creation (Dry Run)');
  console.log('-'.repeat(60));
  
  try {
    // Try to create a test budget (this will fail but show us the error)
    const testBudgetOp = {
      entity: 'campaign_budget',
      operation: 'create',
      resource: {
        name: 'Test Budget - Diagnostic',
        amount_micros: 10000000, // $10 AUD
        delivery_method: 2, // STANDARD
      },
    };
    
    console.log('Attempting to create test budget...');
    const budgetResult = await customer.mutateResources([testBudgetOp], {
      validate_only: true, // Dry run - won't actually create
    });
    
    console.log('✅ Campaign creation permissions verified (dry run successful)');
    console.log('');
    
  } catch (error) {
    console.error('❌ Campaign creation test failed:', error.message);
    if (error.errors) {
      console.error('');
      console.error('API Errors:');
      error.errors.forEach((err, i) => {
        console.error(`  ${i + 1}. ${err.error_code?.authorization_error || err.error_code?.request_error || 'Unknown'}`);
        console.error(`     Message: ${err.message}`);
      });
    }
    console.log('');
  }
  
  // Summary
  console.log('');
  console.log('=' .repeat(60));
  console.log('📝 DIAGNOSTIC SUMMARY');
  console.log('=' .repeat(60));
  console.log('');
  console.log('If all steps passed:');
  console.log('  ✅ Your Google Ads API is properly configured');
  console.log('  ✅ You can proceed with campaign creation');
  console.log('');
  console.log('If Step 6 failed with authorization errors:');
  console.log('  1. Check if your Google Ads account has billing enabled');
  console.log('  2. Verify your developer token is approved (not test mode)');
  console.log('  3. Ensure the account has campaign creation permissions');
  console.log('  4. Check if the account is a manager account (MCC) - campaigns');
  console.log('     must be created in client accounts, not manager accounts');
  console.log('');
  
} catch (error) {
  console.error('');
  console.error('❌ DIAGNOSTIC FAILED');
  console.error('=' .repeat(60));
  console.error('');
  console.error('Error:', error.message);
  console.error('');
  
  if (error.message.includes('refresh token')) {
    console.error('💡 Refresh Token Issue:');
    console.error('   Your refresh token may be expired or invalid.');
    console.error('   You need to regenerate it through OAuth2 flow.');
    console.error('');
  }
  
  if (error.message.includes('developer token')) {
    console.error('💡 Developer Token Issue:');
    console.error('   Your developer token may not be approved yet.');
    console.error('   Check your Google Ads API Center for approval status.');
    console.error('');
  }
  
  process.exit(1);
}
