import { sendEmailWithGuide } from './server/emailService.ts';

const testEmail = 'test@example.com';
const testName = 'Test User';

console.log('🧪 Testing SendGrid email delivery...');
console.log('To:', testEmail);
console.log('Name:', testName);
console.log('');

try {
  const result = await sendEmailWithGuide(testEmail, testName);
  console.log('✅ Email sent successfully!');
  console.log('Result:', JSON.stringify(result, null, 2));
} catch (err) {
  console.error('❌ Email failed:', err.message);
  console.error('Full error:', err);
  process.exit(1);
}
