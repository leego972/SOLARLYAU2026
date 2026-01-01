import { GoogleAdsApi } from 'google-ads-api';
import fs from 'fs';

// Load credentials
const envContent = fs.readFileSync('.env.google-ads', 'utf-8');
const creds = {};
envContent.split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value && !key.trim().startsWith('#')) {
    creds[key.trim()] = value.trim();
  }
});

console.log('🔐 Loaded credentials:');
console.log('  Customer ID:', creds.GOOGLE_ADS_CUSTOMER_ID);
console.log('  Developer Token:', creds.GOOGLE_ADS_DEVELOPER_TOKEN?.substring(0, 10) + '...');
console.log('  Client ID:', creds.GOOGLE_ADS_CLIENT_ID?.substring(0, 20) + '...');
console.log('  Refresh Token:', creds.GOOGLE_ADS_REFRESH_TOKEN?.substring(0, 20) + '...');
console.log('');

try {
  console.log('📡 Initializing Google Ads API client...');
  const client = new GoogleAdsApi({
    client_id: creds.GOOGLE_ADS_CLIENT_ID,
    client_secret: creds.GOOGLE_ADS_CLIENT_SECRET,
    developer_token: creds.GOOGLE_ADS_DEVELOPER_TOKEN,
  });
  
  console.log('✅ Client initialized');
  console.log('');
  
  console.log('🔗 Creating customer instance...');
  const customer = client.Customer({
    customer_id: creds.GOOGLE_ADS_CUSTOMER_ID,
    refresh_token: creds.GOOGLE_ADS_REFRESH_TOKEN,
  });
  
  console.log('✅ Customer instance created');
  console.log('');
  
  console.log('🔍 Testing API connection...');
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
  
  if (result && result.length > 0) {
    const info = result[0].customer;
    console.log('✅ CONNECTION SUCCESSFUL!');
    console.log('');
    console.log('📊 Account Information:');
    console.log('  Customer ID:', info.id);
    console.log('  Account Name:', info.descriptive_name);
    console.log('  Currency:', info.currency_code);
    console.log('  Timezone:', info.time_zone);
    console.log('');
    console.log('🎉 Google Ads API is ready for autonomous advertising!');
  } else {
    console.log('❌ No data returned from API');
  }
} catch (error) {
  console.error('❌ Connection failed:', error.message);
  if (error.errors) {
    console.error('Errors:', JSON.stringify(error.errors, null, 2));
  }
}
