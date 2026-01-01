import { config } from 'dotenv';
config({ path: '.env.local' });

console.log('Testing SMS verification...');
console.log('TWILIO_PHONE_NUMBER:', process.env.twilio_phone_number || 'NOT SET');

import twilio from 'twilio';

const accountSid = process.env.twilio_sid_account;
const authToken = process.env.twilio_auth_token;
const fromNumber = process.env.twilio_phone_number;

if (!accountSid || !authToken || !fromNumber) {
  console.log('Missing Twilio credentials');
  process.exit(1);
}

const client = twilio(accountSid, authToken);

try {
  const message = await client.messages.create({
    body: 'Your SolarlyAU verification code is: 123456',
    from: fromNumber,
    to: '+61447794136'
  });
  console.log('SMS sent successfully! SID:', message.sid);
} catch (error) {
  console.error('SMS error:', error.message);
}
