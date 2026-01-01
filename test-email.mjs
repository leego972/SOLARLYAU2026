import nodemailer from 'nodemailer';

const transporter = nodemailer.default.createTransporter({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

const mailOptions = {
  from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
  to: process.env.GMAIL_USER,
  subject: 'SolarlyAU Email System Test - ' + new Date().toLocaleTimeString(),
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #f97316;">✅ Email System Test Successful</h2>
      <p>This is a test email from SolarlyAU autonomous system.</p>
      <p><strong>Sent at:</strong> ${new Date().toLocaleString()}</p>
      <p><strong>System Status:</strong> ✅ Operational</p>
      <p><strong>Gmail SMTP:</strong> ✅ Working</p>
      <hr style="border: 1px solid #e5e7eb; margin: 20px 0;">
      <p style="color: #666; font-size: 12px;">
        This email confirms that the Gmail SMTP integration is working correctly.
        You can safely send emails to installers.
      </p>
    </div>
  `,
};

try {
  const info = await transporter.sendMail(mailOptions);
  console.log('✅ TEST EMAIL SENT SUCCESSFULLY!');
  console.log('━'.repeat(50));
  console.log('Message ID:', info.messageId);
  console.log('To:', mailOptions.to);
  console.log('From:', mailOptions.from);
  console.log('Subject:', mailOptions.subject);
  console.log('━'.repeat(50));
  console.log('\n📧 Check your inbox at:', process.env.GMAIL_USER);
} catch (error) {
  console.error('❌ FAILED TO SEND TEST EMAIL');
  console.error('Error:', error.message);
  if (error.code) console.error('Code:', error.code);
  process.exit(1);
}
