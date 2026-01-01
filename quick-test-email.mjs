import { sendEmail } from './server/_core/email.ts';

console.log('Sending test email...');

try {
  await sendEmail({
    to: process.env.GMAIL_USER,
    subject: 'SolarlyAU Email Test - ' + new Date().toLocaleTimeString(),
    html: `
      <h2 style="color: #f97316;">✅ Email System Working!</h2>
      <p>Test sent at: ${new Date().toLocaleString()}</p>
      <p>Gmail SMTP is operational and ready to send to installers.</p>
    `,
  });
  
  console.log('✅ Test email sent successfully!');
  console.log('📧 Check inbox at:', process.env.GMAIL_USER);
} catch (error) {
  console.error('❌ Error:', error.message);
}
