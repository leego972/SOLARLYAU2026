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

const client = new GoogleAdsApi({
  client_id: credentials.GOOGLE_ADS_CLIENT_ID,
  client_secret: credentials.GOOGLE_ADS_CLIENT_SECRET,
  developer_token: credentials.GOOGLE_ADS_DEVELOPER_TOKEN,
});

const customer = client.Customer({
  customer_id: credentials.GOOGLE_ADS_CUSTOMER_ID,
  refresh_token: credentials.GOOGLE_ADS_REFRESH_TOKEN,
});

console.log('Fetching client accounts under manager account...\n');

try {
  const query = `
    SELECT
      customer_client.id,
      customer_client.descriptive_name,
      customer_client.currency_code,
      customer_client.time_zone,
      customer_client.test_account,
      customer_client.status,
      customer_client.manager
    FROM customer_client
    ORDER BY customer_client.descriptive_name
  `;

  const results = await customer.query(query);
  
  console.log(`Found ${results.length} accounts:\n`);
  
  results.forEach((result, i) => {
    const acc = result.customer_client;
    console.log(`${i+1}. ${acc.descriptive_name || 'Unnamed'}`);
    console.log(`   ID: ${acc.id}`);
    console.log(`   Currency: ${acc.currency_code}`);
    console.log(`   Status: ${acc.status}`);
    console.log(`   Is Manager: ${acc.manager ? 'Yes' : 'No'}`);
    console.log(`   Test Account: ${acc.test_account ? 'Yes' : 'No'}`);
    console.log('');
  });
  
  // Filter to only non-manager accounts (client accounts)
  const clientAccounts = results.filter(r => !r.customer_client.manager);
  console.log(`\n${clientAccounts.length} client accounts available for campaign creation.`);
  
} catch (error) {
  console.error('Error:', error.message);
  if (error.errors) {
    console.error('API errors:', JSON.stringify(error.errors, null, 2));
  }
}
