#!/usr/bin/env node
/**
 * Test Google Ads API Connection
 */

import { GoogleAdsApi } from 'google-ads-api';
import fs from 'fs';
import path from 'path';

// Load credentials from .env.google-ads
const envPath = path.join(process.cwd(), 'solar-lead-ai', '.env.google-ads');
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

console.log('📋 Loaded credentials:');
console.log(`  Customer ID: ${credentials.GOOGLE_ADS_CUSTOMER_ID}`);
console.log(`  Developer Token: ${credentials.GOOGLE_ADS_DEVELOPER_TOKEN?.substring(0, 10)}...`);
console.log(`  Client ID: ${credentials.GOOGLE_ADS_CLIENT_ID?.substring(0, 30)}...`);
console.log(`  Client Secret: ${credentials.GOOGLE_ADS_CLIENT_SECRET?.substring(0, 15)}...`);
console.log(`  Refresh Token: ${credentials.GOOGLE_ADS_REFRESH_TOKEN?.substring(0, 20)}...`);
console.log('');

try {
  console.log('🔌 Initializing Google Ads API client...');
  
  const client = new GoogleAdsApi({
    client_id: credentials.GOOGLE_ADS_CLIENT_ID,
    client_secret: credentials.GOOGLE_ADS_CLIENT_SECRET,
    developer_token: credentials.GOOGLE_ADS_DEVELOPER_TOKEN,
  });
  
  console.log('✅ Client initialized');
  console.log('');
  
  console.log('🔐 Creating customer instance...');
  
  const customer = client.Customer({
    customer_id: credentials.GOOGLE_ADS_CUSTOMER_ID,
    refresh_token: credentials.GOOGLE_ADS_REFRESH_TOKEN,
  });
  
  console.log('✅ Customer instance created');
  console.log('');
  
  console.log('📊 Testing API connection with a simple query...');
  
  // Try to fetch customer info
  const query = `
    SELECT
      customer.id,
      customer.descriptive_name,
      customer.currency_code,
      customer.time_zone
    FROM customer
    LIMIT 1
  `;
  
  const result = await customer.query(query);
  
  console.log('✅ API connection successful!');
  console.log('');
  console.log('📋 Customer Info:');
  console.log(`  ID: ${result[0]?.customer?.id}`);
  console.log(`  Name: ${result[0]?.customer?.descriptive_name}`);
  console.log(`  Currency: ${result[0]?.customer?.currency_code}`);
  console.log(`  Timezone: ${result[0]?.customer?.time_zone}`);
  console.log('');
  console.log('🎉 Google Ads API is properly configured and working!');
  
} catch (error) {
  console.error('❌ Error testing Google Ads API:');
  console.error(error.message);
  if (error.details) {
    console.error('Details:', error.details);
  }
  process.exit(1);
}
