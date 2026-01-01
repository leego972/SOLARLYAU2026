import sgMail from "@sendgrid/mail";

/**
 * SendGrid Email Service
 * Handles all email sending functionality
 */

// Initialize SendGrid with API key from environment
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const FROM_EMAIL = process.env.FROM_EMAIL || "support@solarlyau.com";
const FROM_NAME = process.env.FROM_NAME || "SolarlyAU";

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: { email: string; name: string };
}

/**
 * Generic email sending function
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    if (!SENDGRID_API_KEY) {
      console.log(`[EmailService] Would send email to ${options.to}`);
      console.log(`[EmailService] Subject: ${options.subject}`);
      return true;
    }

    const msg = {
      to: options.to,
      from: options.from || {
        email: FROM_EMAIL,
        name: FROM_NAME,
      },
      subject: options.subject,
      html: options.html,
    };

    await sgMail.send(msg);
    console.log(`[EmailService] Email sent to ${options.to}`);
    return true;
  } catch (error) {
    console.error(`[EmailService] Failed to send email to ${options.to}:`, error);
    return false;
  }
}

if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY);
  console.log("[EmailService] SendGrid initialized");
} else {
  console.warn("[EmailService] SENDGRID_API_KEY not set - emails will be logged only");
}

/**
 * Send Solar Lead Generation Guide to new email lead
 */
export async function sendGuideEmail(
  email: string,
  name: string,
  pdfUrl: string
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!SENDGRID_API_KEY) {
      // Development mode - just log
      console.log(`[EmailService] Would send guide to ${email}`);
      console.log(`[EmailService] PDF URL: ${pdfUrl}`);
      return { success: true };
    }

    const msg = {
      to: email,
      from: {
        email: FROM_EMAIL,
        name: FROM_NAME,
      },
      subject: "Your Free Solar Lead Generation Guide 📊",
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f5f5f5;
    }
    .container {
      background-color: #ffffff;
      border-radius: 10px;
      padding: 40px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
    }
    .logo {
      font-size: 28px;
      font-weight: bold;
      color: #f97316;
      margin-bottom: 10px;
    }
    h1 {
      color: #1e40af;
      font-size: 24px;
      margin-bottom: 20px;
    }
    .cta-button {
      display: inline-block;
      background-color: #f97316;
      color: #ffffff !important;
      text-decoration: none;
      padding: 15px 40px;
      border-radius: 5px;
      font-weight: bold;
      font-size: 16px;
      margin: 20px 0;
      text-align: center;
    }
    .cta-button:hover {
      background-color: #ea580c;
    }
    .benefits {
      background-color: #fef3c7;
      border-left: 4px solid #f97316;
      padding: 15px;
      margin: 20px 0;
    }
    .benefits ul {
      margin: 10px 0;
      padding-left: 20px;
    }
    .benefits li {
      margin: 8px 0;
    }
    .footer {
      text-align: center;
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      font-size: 14px;
      color: #6b7280;
    }
    .social-links {
      margin: 20px 0;
    }
    .social-links a {
      color: #f97316;
      text-decoration: none;
      margin: 0 10px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">☀️ SolarlyAU</div>
      <p style="color: #6b7280;">Australia's First Fully Autonomous Solar Lead Generation System</p>
    </div>

    <h1>Hi ${name}! 👋</h1>

    <p>Thanks for your interest in improving your solar lead generation!</p>

    <p>I'm excited to share your <strong>free copy</strong> of <em>"The Ultimate Solar Lead Generation Guide"</em> – a comprehensive 10-page resource that reveals exactly how top solar installers are 3x-ing their revenue in just 90 days.</p>

    <div style="text-align: center;">
      <a href="${pdfUrl}" class="cta-button">📥 Download Your Free Guide</a>
    </div>

    <div class="benefits">
      <strong>📊 What's Inside:</strong>
      <ul>
        <li>The 5 Pillars of High-Converting Leads (72% close rate formula)</li>
        <li>ROI calculations that actually matter</li>
        <li>How to scale from $60K to $320K annual revenue</li>
        <li>Real case studies from successful installers</li>
        <li>30-day action plan to get started immediately</li>
        <li>Common mistakes costing you thousands per month</li>
      </ul>
    </div>

    <p><strong>💡 Quick Win:</strong> Most installers see a 40-60% improvement in close rates just by implementing the lead enrichment strategy in Chapter 2.</p>

    <p>After you read the guide, I'd love to hear your thoughts! Reply to this email with any questions – I personally read and respond to every message.</p>

    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">

    <h2 style="color: #1e40af; font-size: 20px;">Ready to Get Started?</h2>

    <p>If you're serious about growing your solar business, check out <a href="https://solarlyau.com" style="color: #f97316; text-decoration: none;"><strong>SolarlyAU.com</strong></a> to:</p>

    <ul>
      <li>Browse high-quality solar leads in your area</li>
      <li>See real-time pricing and quality scores</li>
      <li>Get your first 5 leads at 20% off</li>
      <li>Access our installer certification program</li>
    </ul>

    <div style="text-align: center; margin: 30px 0;">
      <a href="https://solarlyau.com/pricing" class="cta-button">View Pricing & Plans</a>
    </div>

    <div class="footer">
      <p><strong>Questions? We're here to help!</strong></p>
      <p>Email: <a href="mailto:support@solarlyau.com" style="color: #f97316;">support@solarlyau.com</a></p>
      <p>Phone: 1300 SOLAR AU</p>
      
      <div class="social-links">
        <a href="https://solarlyau.com">Website</a> •
        <a href="https://solarlyau.com/success-stories">Success Stories</a> •
        <a href="https://solarlyau.com/faq">FAQ</a>
      </div>

      <p style="font-size: 12px; margin-top: 20px;">
        © 2025 SolarlyAU. All rights reserved.<br>
        Autonomous Solar Lead Generation for Australia
      </p>

      <p style="font-size: 11px; color: #9ca3af; margin-top: 15px;">
        You're receiving this email because you requested our free Solar Lead Generation Guide at SolarlyAU.com.
      </p>
    </div>
  </div>
</body>
</html>
      `,
      text: `
Hi ${name}!

Thanks for your interest in improving your solar lead generation!

Download your free copy of "The Ultimate Solar Lead Generation Guide" here:
${pdfUrl}

This comprehensive 10-page guide reveals exactly how top solar installers are 3x-ing their revenue in just 90 days.

What's Inside:
- The 5 Pillars of High-Converting Leads (72% close rate formula)
- ROI calculations that actually matter
- How to scale from $60K to $320K annual revenue
- Real case studies from successful installers
- 30-day action plan to get started immediately
- Common mistakes costing you thousands per month

Ready to Get Started?

Visit SolarlyAU.com to browse high-quality solar leads in your area, see real-time pricing, and get your first 5 leads at 20% off.

Questions? Reply to this email or visit https://solarlyau.com

Best regards,
The SolarlyAU Team
      `,
    };

    await sgMail.send(msg);
    console.log(`[EmailService] Guide sent successfully to ${email}`);
    
    return { success: true };
  } catch (error: any) {
    console.error("[EmailService] Error sending guide:", error);
    return { 
      success: false, 
      error: error.message || "Failed to send email" 
    };
  }
}

/**
 * Send welcome email to new installer
 */
export async function sendInstallerWelcomeEmail(
  email: string,
  name: string,
  dashboardUrl: string
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!SENDGRID_API_KEY) {
      console.log(`[EmailService] Would send welcome email to ${email}`);
      return { success: true };
    }

    const msg = {
      to: email,
      from: {
        email: FROM_EMAIL,
        name: FROM_NAME,
      },
      subject: "Welcome to SolarlyAU! 🎉",
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .cta-button {
      display: inline-block;
      background-color: #f97316;
      color: #ffffff !important;
      text-decoration: none;
      padding: 15px 40px;
      border-radius: 5px;
      font-weight: bold;
      margin: 20px 0;
    }
  </style>
</head>
<body>
  <h1>Welcome to SolarlyAU, ${name}! 🎉</h1>
  
  <p>Your installer account is now active and ready to go!</p>
  
  <p>You now have access to Australia's first fully autonomous solar lead generation system.</p>
  
  <div style="text-align: center;">
    <a href="${dashboardUrl}" class="cta-button">Access Your Dashboard</a>
  </div>
  
  <p><strong>What's Next?</strong></p>
  <ul>
    <li>Browse available leads in your service area</li>
    <li>Set your lead preferences and capacity</li>
    <li>Purchase your first leads and start closing deals</li>
    <li>Track your ROI in real-time</li>
  </ul>
  
  <p>Need help getting started? Check out our <a href="https://solarlyau.com/faq">FAQ</a> or reply to this email.</p>
  
  <p>Best regards,<br>The SolarlyAU Team</p>
</body>
</html>
      `,
    };

    await sgMail.send(msg);
    console.log(`[EmailService] Welcome email sent to ${email}`);
    
    return { success: true };
  } catch (error: any) {
    console.error("[EmailService] Error sending welcome email:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Send referral commission notification
 */
export async function sendReferralCommissionEmail(
  email: string,
  name: string,
  referredName: string,
  commission: number
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!SENDGRID_API_KEY) {
      console.log(`[EmailService] Would send referral commission email to ${email}`);
      return { success: true };
    }

    const msg = {
      to: email,
      from: {
        email: FROM_EMAIL,
        name: FROM_NAME,
      },
      subject: `You earned $${commission}! 💰`,
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .commission-box {
      background-color: #10b981;
      color: white;
      padding: 30px;
      border-radius: 10px;
      text-align: center;
      margin: 20px 0;
    }
    .commission-amount {
      font-size: 48px;
      font-weight: bold;
    }
  </style>
</head>
<body>
  <h1>Congratulations, ${name}! 🎉</h1>
  
  <p>Great news! Your referral <strong>${referredName}</strong> just signed up and you've earned a commission!</p>
  
  <div class="commission-box">
    <div class="commission-amount">$${commission}</div>
    <p>Referral Commission Earned</p>
  </div>
  
  <p>Your commission will be paid out at the end of the month via your preferred payment method.</p>
  
  <p>Keep sharing your referral link to earn more! Every installer you refer earns you $${commission}.</p>
  
  <p><a href="https://solarlyau.com/referral-dashboard">View Your Referral Dashboard</a></p>
  
  <p>Best regards,<br>The SolarlyAU Team</p>
</body>
</html>
      `,
    };

    await sgMail.send(msg);
    console.log(`[EmailService] Referral commission email sent to ${email}`);
    
    return { success: true };
  } catch (error: any) {
    console.error("[EmailService] Error sending referral email:", error);
    return { success: false, error: error.message };
  }
}
