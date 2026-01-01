import { sendEmail } from "./emailServiceGmail";

/**
 * Send welcome email to new installer signups
 */
export async function sendInstallerWelcomeEmail(installer: {
  email: string;
  companyName: string;
  firstName?: string;
}): Promise<boolean> {
  const name = installer.firstName || "there";
  
  const subject = `Welcome to SolarlyAU, ${installer.companyName}! 🎉`;
  
  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background: linear-gradient(135deg, #f97316 0%, #fb923c 100%);
      color: white;
      padding: 30px 20px;
      border-radius: 8px 8px 0 0;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
    }
    .content {
      background: #ffffff;
      padding: 30px 20px;
      border-left: 1px solid #e5e7eb;
      border-right: 1px solid #e5e7eb;
    }
    .cta-button {
      display: inline-block;
      background: #f97316;
      color: white !important;
      padding: 14px 28px;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 600;
      margin: 20px 0;
      text-align: center;
    }
    .cta-button:hover {
      background: #ea580c;
    }
    .promo-box {
      background: #fef3c7;
      border-left: 4px solid #f59e0b;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .promo-box strong {
      color: #92400e;
      font-size: 18px;
    }
    .step {
      background: #f9fafb;
      padding: 15px;
      margin: 15px 0;
      border-radius: 6px;
      border-left: 3px solid #f97316;
    }
    .step-number {
      display: inline-block;
      background: #f97316;
      color: white;
      width: 28px;
      height: 28px;
      border-radius: 50%;
      text-align: center;
      line-height: 28px;
      font-weight: bold;
      margin-right: 10px;
    }
    .stats {
      display: flex;
      justify-content: space-around;
      margin: 25px 0;
      text-align: center;
    }
    .stat {
      flex: 1;
      padding: 15px;
    }
    .stat-number {
      font-size: 32px;
      font-weight: bold;
      color: #f97316;
    }
    .stat-label {
      font-size: 14px;
      color: #6b7280;
    }
    .footer {
      background: #f9fafb;
      padding: 20px;
      border-radius: 0 0 8px 8px;
      border: 1px solid #e5e7eb;
      border-top: none;
      text-align: center;
      font-size: 14px;
      color: #6b7280;
    }
    .footer a {
      color: #f97316;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>🎉 Welcome to SolarlyAU!</h1>
    <p style="margin: 10px 0 0 0; font-size: 16px;">Australia's First Autonomous Solar Lead Marketplace</p>
  </div>
  
  <div class="content">
    <p>Hi ${name},</p>
    
    <p>Welcome to <strong>SolarlyAU</strong>! We're excited to have ${installer.companyName} join our marketplace.</p>
    
    <p>You're now part of a growing community of Australian solar installers who are tired of expensive subscriptions, shared leads, and poor-quality contacts. We've built something different - a transparent marketplace where you're in complete control.</p>
    
    <div class="promo-box">
      <strong>🎁 Your First Lead is FREE!</strong><br>
      Use promo code <strong>FIRSTFREE</strong> at checkout to claim your complimentary lead. No credit card required for your first purchase.
    </div>
    
    <h2 style="color: #f97316; margin-top: 30px;">Get Started in 5 Minutes</h2>
    
    <div class="step">
      <span class="step-number">1</span>
      <strong>Complete Your Profile</strong><br>
      Add your service areas and payment method so you can start purchasing leads.
    </div>
    
    <div class="step">
      <span class="step-number">2</span>
      <strong>Browse the Marketplace</strong><br>
      Check out the 654 verified leads currently available across Australia.
    </div>
    
    <div class="step">
      <span class="step-number">3</span>
      <strong>Claim Your Free Lead</strong><br>
      Find a high-quality lead (85%+ score) in your area and use code FIRSTFREE at checkout.
    </div>
    
    <div class="step">
      <span class="step-number">4</span>
      <strong>Contact Within 1 Hour</strong><br>
      Speed matters! Our data shows installers who call within 1 hour have 45% conversion rates.
    </div>
    
    <div style="text-align: center;">
      <a href="https://solar-lead-vwkzbmwb.manus.space/installer/dashboard" class="cta-button">
        Browse Leads Now →
      </a>
    </div>
    
    <h2 style="color: #f97316; margin-top: 35px;">Current Marketplace</h2>
    
    <div class="stats">
      <div class="stat">
        <div class="stat-number">654</div>
        <div class="stat-label">Leads Available</div>
      </div>
      <div class="stat">
        <div class="stat-number">4hrs</div>
        <div class="stat-label">Avg. Sell Time</div>
      </div>
      <div class="stat">
        <div class="stat-number">$45-95</div>
        <div class="stat-label">Price Range</div>
      </div>
    </div>
    
    <p style="background: #f0fdf4; padding: 15px; border-radius: 6px; border-left: 3px solid #10b981;">
      <strong>💡 Pro Tip:</strong> New leads are added every 4 hours. Check the marketplace multiple times per day during business hours to catch fresh leads before your competitors.
    </p>
    
    <h2 style="color: #f97316; margin-top: 35px;">What Makes SolarlyAU Different?</h2>
    
    <p><strong>✅ Complete Transparency</strong> - See full lead details before you buy (name, phone, email, address, system size, quality score)</p>
    
    <p><strong>✅ You're in Control</strong> - Only pay for leads you actually want. No subscriptions, no contracts, no minimums.</p>
    
    <p><strong>✅ Quality Guaranteed</strong> - Every lead is phone verified, email verified, and AI-scored (60-95%). Refund available if contact details are invalid.</p>
    
    <p><strong>✅ Exclusive Leads</strong> - Once you purchase a lead, it's yours. We don't share it with other installers.</p>
    
    <h2 style="color: #f97316; margin-top: 35px;">Need Help?</h2>
    
    <p>We're here to help you succeed:</p>
    
    <p>
      📧 <strong>Email:</strong> <a href="mailto:support@solarlyau.com">support@solarlyau.com</a> (24-hour response)<br>
      💬 <strong>Live Chat:</strong> Click the chat icon in your dashboard (9 AM - 5 PM AEST)<br>
      📚 <strong>Knowledge Base:</strong> <a href="https://solar-lead-vwkzbmwb.manus.space/help">solar-lead-vwkzbmwb.manus.space/help</a>
    </p>
    
    <div style="text-align: center; margin-top: 35px;">
      <a href="https://solar-lead-vwkzbmwb.manus.space/installer/dashboard" class="cta-button">
        Get Your Free Lead →
      </a>
    </div>
    
    <p style="margin-top: 30px;">Welcome aboard! Let's grow ${installer.companyName} together.</p>
    
    <p>
      Best regards,<br>
      <strong>The SolarlyAU Team</strong>
    </p>
  </div>
  
  <div class="footer">
    <p>
      <a href="https://solar-lead-vwkzbmwb.manus.space">SolarlyAU</a> | 
      <a href="https://solar-lead-vwkzbmwb.manus.space/help">Help Center</a> | 
      <a href="https://solar-lead-vwkzbmwb.manus.space/pricing">Pricing</a>
    </p>
    <p style="margin-top: 10px; font-size: 12px;">
      You're receiving this email because you signed up for SolarlyAU.<br>
      If you have any questions, reply to this email.
    </p>
  </div>
</body>
</html>
  `;
  
  const textContent = `
Welcome to SolarlyAU, ${installer.companyName}!

Hi ${name},

Welcome to SolarlyAU! We're excited to have ${installer.companyName} join Australia's first autonomous solar lead marketplace.

🎁 YOUR FIRST LEAD IS FREE!
Use promo code FIRSTFREE at checkout to claim your complimentary lead.

GET STARTED IN 5 MINUTES:

1. Complete Your Profile
   Add your service areas and payment method.

2. Browse the Marketplace
   Check out 654 verified leads currently available.

3. Claim Your Free Lead
   Find a high-quality lead (85%+ score) and use code FIRSTFREE.

4. Contact Within 1 Hour
   Speed matters! 45% conversion rate when you call within 1 hour.

Browse leads now: https://solar-lead-vwkzbmwb.manus.space/installer/dashboard

CURRENT MARKETPLACE:
- 654 leads available
- Average sell time: 4 hours
- Price range: $45-$95 per lead
- New leads added every 4 hours

WHAT MAKES US DIFFERENT:
✅ Complete transparency - see full details before you buy
✅ You're in control - pay only for leads you want
✅ Quality guaranteed - phone & email verified, AI-scored
✅ Exclusive leads - no sharing with competitors

NEED HELP?
📧 Email: support@solarlyau.com (24-hour response)
💬 Live Chat: In your dashboard (9 AM - 5 PM AEST)
📚 Knowledge Base: https://solar-lead-vwkzbmwb.manus.space/help

Get your free lead: https://solar-lead-vwkzbmwb.manus.space/installer/dashboard

Welcome aboard! Let's grow ${installer.companyName} together.

Best regards,
The SolarlyAU Team
https://solar-lead-vwkzbmwb.manus.space
  `;
  
  try {
    await sendEmail({
      to: installer.email,
      subject,
      html: htmlContent,
      text: textContent,
    });
    
    console.log(`[InstallerWelcome] Welcome email sent to ${installer.email}`);
    return true;
  } catch (error) {
    console.error(`[InstallerWelcome] Failed to send welcome email to ${installer.email}:`, error);
    return false;
  }
}

/**
 * Send follow-up email 3 days after signup if installer hasn't purchased a lead
 */
export async function sendInstallerFollowUpEmail(installer: {
  email: string;
  companyName: string;
  firstName?: string;
  signupDate: Date;
}): Promise<boolean> {
  const name = installer.firstName || "there";
  const daysSinceSignup = Math.floor((Date.now() - installer.signupDate.getTime()) / (1000 * 60 * 60 * 24));
  
  const subject = `${installer.companyName} - Your free lead is still waiting`;
  
  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .cta-button {
      display: inline-block;
      background: #f97316;
      color: white !important;
      padding: 14px 28px;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 600;
      margin: 20px 0;
    }
    .highlight-box {
      background: #fef3c7;
      border-left: 4px solid #f59e0b;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
    }
  </style>
</head>
<body>
  <h1 style="color: #f97316;">Don't Miss Your Free Lead</h1>
  
  <p>Hi ${name},</p>
  
  <p>You signed up for SolarlyAU ${daysSinceSignup} days ago, but we noticed you haven't claimed your free lead yet.</p>
  
  <div class="highlight-box">
    <strong>🎁 Your FIRSTFREE promo code is still active!</strong><br>
    Claim your complimentary lead before this offer expires.
  </div>
  
  <p><strong>Current marketplace:</strong></p>
  <ul>
    <li>654 verified leads available right now</li>
    <li>New leads added every 4 hours</li>
    <li>Quality scores from 60-95%</li>
    <li>Prices from $45-$95 per lead</li>
  </ul>
  
  <p><strong>Getting started takes 2 minutes:</strong></p>
  <ol>
    <li>Browse the marketplace</li>
    <li>Find a lead in your service area</li>
    <li>Use code FIRSTFREE at checkout</li>
    <li>Contact the lead within 1 hour</li>
  </ol>
  
  <div style="text-align: center;">
    <a href="https://solar-lead-vwkzbmwb.manus.space/installer/dashboard" class="cta-button">
      Claim Your Free Lead →
    </a>
  </div>
  
  <p>Questions? Just reply to this email.</p>
  
  <p>
    Best regards,<br>
    <strong>The SolarlyAU Team</strong>
  </p>
</body>
</html>
  `;
  
  const textContent = `
Don't Miss Your Free Lead

Hi ${name},

You signed up for SolarlyAU ${daysSinceSignup} days ago, but we noticed you haven't claimed your free lead yet.

🎁 Your FIRSTFREE promo code is still active!
Claim your complimentary lead before this offer expires.

Current marketplace:
- 654 verified leads available right now
- New leads added every 4 hours
- Quality scores from 60-95%
- Prices from $45-$95 per lead

Getting started takes 2 minutes:
1. Browse the marketplace
2. Find a lead in your service area
3. Use code FIRSTFREE at checkout
4. Contact the lead within 1 hour

Claim your free lead: https://solar-lead-vwkzbmwb.manus.space/installer/dashboard

Questions? Just reply to this email.

Best regards,
The SolarlyAU Team
  `;
  
  try {
    await sendEmail({
      to: installer.email,
      subject,
      html: htmlContent,
      text: textContent,
    });
    
    console.log(`[InstallerFollowUp] Follow-up email sent to ${installer.email}`);
    return true;
  } catch (error) {
    console.error(`[InstallerFollowUp] Failed to send follow-up email to ${installer.email}:`, error);
    return false;
  }
}
