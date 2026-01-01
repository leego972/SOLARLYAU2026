const readline = require('readline');
const { google } = require('googleapis');
const fs = require('fs');

// Load credentials from .env.google-ads
const envContent = fs.readFileSync('.env.google-ads', 'utf-8');
const credentials = {};
envContent.split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value && !key.startsWith('#')) {
    credentials[key.trim()] = value.trim();
  }
});

const CLIENT_ID = credentials.GOOGLE_ADS_CLIENT_ID;
const CLIENT_SECRET = credentials.GOOGLE_ADS_CLIENT_SECRET;
const REDIRECT_URI = 'http://localhost:8080';

const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

const SCOPES = ['https://www.googleapis.com/auth/adwords'];

const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: SCOPES,
  prompt: 'consent'
});

console.log('\n===========================================');
console.log('GOOGLE ADS OAUTH AUTHORIZATION');
console.log('===========================================\n');
console.log('1. Open this URL in your browser:\n');
console.log(authUrl);
console.log('\n2. Authorize the application');
console.log('3. You will be redirected to localhost (page won\'t load - that\'s OK!)');
console.log('4. Copy the ENTIRE URL from your browser address bar');
console.log('   (It will look like: http://localhost:8080/?code=4/0AanRRrv...)');
console.log('5. Paste it below\n');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('Paste the full redirect URL here: ', async (redirectUrl) => {
  try {
    // Extract code from URL
    const urlParams = new URLSearchParams(redirectUrl.split('?')[1]);
    const code = urlParams.get('code');
    
    if (!code) {
      console.error('❌ No authorization code found in URL');
      rl.close();
      return;
    }
    
    console.log('\n⏳ Exchanging code for refresh token...\n');
    
    const { tokens } = await oauth2Client.getToken(code);
    
    console.log('✅ SUCCESS! Your refresh token:\n');
    console.log(tokens.refresh_token);
    console.log('\n===========================================\n');
    
    // Save to env file
    fs.appendFileSync('.env.google-ads', `\nGOOGLE_ADS_REFRESH_TOKEN=${tokens.refresh_token}\n`);
    console.log('✅ Refresh token saved to .env.google-ads\n');
    console.log('🚀 Google Ads autonomous system is now ready to activate!\n');
    
  } catch (error) {
    console.error('❌ Error getting tokens:', error.message);
  }
  rl.close();
});
