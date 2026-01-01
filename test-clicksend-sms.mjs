import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const username = process.env.CLICKSEND_USERNAME;
const apiKey = process.env.CLICKSEND_API_KEY;

console.log('Testing ClickSend SMS sending...');
console.log('Username:', username ? `${username.substring(0, 3)}...` : 'NOT SET');
console.log('API Key:', apiKey ? `${apiKey.substring(0, 5)}...` : 'NOT SET');

if (!username || !apiKey) {
  console.error('ClickSend credentials not configured');
  process.exit(1);
}

const auth = Buffer.from(`${username}:${apiKey}`).toString('base64');

// Send test SMS to the user's phone number
const response = await fetch('https://rest.clicksend.com/v3/sms/send', {
  method: 'POST',
  headers: {
    'Authorization': `Basic ${auth}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    messages: [
      {
        source: 'nodejs',
        body: 'Your SolarlyAU verification code is: 123456. This code expires in 10 minutes.',
        to: '+61447794136',
      },
    ],
  }),
});

const result = await response.json();
console.log('\nAPI Response:', JSON.stringify(result, null, 2));

if (result.response_code === 'SUCCESS') {
  console.log('\n✅ SMS sent successfully!');
  console.log('Message ID:', result.data?.messages?.[0]?.message_id);
  console.log('Status:', result.data?.messages?.[0]?.status);
} else {
  console.log('\n❌ SMS failed:', result.response_msg);
}
