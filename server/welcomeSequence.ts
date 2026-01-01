/**
 * Automated Welcome Email Sequence
 * 3-email drip campaign for new installer signups
 */

import { sendEmail } from './emailServiceGmail';
import { getDb } from './db';
import { sql } from 'drizzle-orm';

/**
 * Day 1: Welcome email with platform tour
 */
export async function sendWelcomeEmail(installerId: number, email: string, name: string, companyName: string): Promise<boolean> {
  const emailContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Welcome to SolarlyAU</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; max-width: 100%; background-color: #ffffff; border-radius: 8px;">
          <tr>
            <td style="background: linear-gradient(135deg, #FF8C00 0%, #FFA500 100%); padding: 40px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px;">Welcome to SolarlyAU! 🎉</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px 0; font-size: 16px; color: #333;">Hi ${name},</p>
              
              <p style="margin: 0 0 20px 0; font-size: 16px; color: #333; line-height: 1.6;">
                Welcome to Australia's first fully autonomous solar lead platform! We're excited to help ${companyName} grow with high-quality solar leads.
              </p>

              <h2 style="margin: 30px 0 15px 0; color: #FF8C00; font-size: 20px;">🚀 Quick Start Guide:</h2>
              
              <ol style="margin: 0 0 20px 0; padding-left: 20px; color: #333; font-size: 15px; line-height: 1.8;">
                <li><strong>Browse Leads:</strong> Log in to your dashboard to see available leads in your area</li>
                <li><strong>Check Quality Scores:</strong> Every lead is rated 0-100 based on property value, location, and interest level</li>
                <li><strong>Purchase Instantly:</strong> One-click checkout with Stripe (secure payment processing)</li>
                <li><strong>Download Details:</strong> Get immediate access to contact info and property details</li>
              </ol>

              <table role="presentation" style="margin: 30px 0;">
                <tr>
                  <td style="text-align: center;">
                    <a href="https://solarlyau.com/dashboard" style="display: inline-block; background: linear-gradient(135deg, #FF8C00 0%, #FFA500 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 6px; font-size: 18px; font-weight: bold;">
                      Go to Dashboard →
                    </a>
                  </td>
                </tr>
              </table>

              <table role="presentation" style="width: 100%; background-color: #FFF8E7; padding: 20px; margin: 20px 0; border-radius: 4px; border-left: 4px solid #FF8C00;">
                <tr>
                  <td>
                    <h3 style="margin: 0 0 10px 0; color: #FF8C00; font-size: 16px;">💡 Pro Tips:</h3>
                    <ul style="margin: 0; padding-left: 20px; color: #333; font-size: 14px; line-height: 1.8;">
                      <li>New leads added every 4 hours – check back regularly</li>
                      <li>Bundle deals save up to 20% – buy weekly packs</li>
                      <li>100% money-back guarantee on invalid leads</li>
                    </ul>
                  </td>
                </tr>
              </table>

              <p style="margin: 30px 0 0 0; font-size: 16px; color: #333;">
                Questions? Just reply to this email – we're here to help!<br><br>
                Best regards,<br>
                <strong>The SolarlyAU Team</strong>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  return await sendEmail({
    to: email,
    subject: '🎉 Welcome to SolarlyAU - Your Solar Lead Marketplace',
    html: emailContent,
  });
}

/**
 * Day 3: First lead discount offer
 */
export async function sendDiscountEmail(installerId: number, email: string, name: string): Promise<boolean> {
  const emailContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Special Offer - 20% Off Your First Lead</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; max-width: 100%; background-color: #ffffff; border-radius: 8px;">
          <tr>
            <td style="background: linear-gradient(135deg, #FF6B6B 0%, #FF8C00 100%); padding: 40px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px;">🎁 Special Offer Inside!</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px 0; font-size: 16px; color: #333;">Hi ${name},</p>
              
              <p style="margin: 0 0 20px 0; font-size: 16px; color: #333; line-height: 1.6;">
                Ready to try your first SolarlyAU lead? We'd like to offer you an exclusive discount to get started!
              </p>

              <table role="presentation" style="width: 100%; background: linear-gradient(135deg, #FF6B6B 0%, #FF8C00 100%); padding: 30px; margin: 20px 0; border-radius: 8px; text-align: center;">
                <tr>
                  <td>
                    <h2 style="margin: 0 0 10px 0; color: #ffffff; font-size: 24px;">20% OFF</h2>
                    <p style="margin: 0 0 15px 0; color: #ffffff; font-size: 18px;">Your First 5 Leads</p>
                    <p style="margin: 0; color: #ffffff; font-size: 14px;">Use code: <strong style="background-color: rgba(255,255,255,0.2); padding: 5px 15px; border-radius: 4px;">FIRST20</strong></p>
                    <p style="margin: 10px 0 0 0; color: #ffffff; font-size: 12px; opacity: 0.9;">Expires in 4 days</p>
                  </td>
                </tr>
              </table>

              <h3 style="margin: 30px 0 15px 0; color: #333; font-size: 18px;">Why Installers Choose SolarlyAU:</h3>
              <ul style="margin: 0 0 20px 0; padding-left: 20px; color: #666; font-size: 15px; line-height: 1.8;">
                <li><strong>High Conversion Rates:</strong> Average 35-45% lead-to-sale conversion</li>
                <li><strong>Quality Guaranteed:</strong> Every lead verified and scored 0-100</li>
                <li><strong>Instant Access:</strong> Download contact details immediately</li>
                <li><strong>Risk-Free:</strong> 100% money-back guarantee on invalid leads</li>
              </ul>

              <table role="presentation" style="margin: 30px 0;">
                <tr>
                  <td style="text-align: center;">
                    <a href="https://solarlyau.com/dashboard" style="display: inline-block; background: linear-gradient(135deg, #FF8C00 0%, #FFA500 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 6px; font-size: 18px; font-weight: bold;">
                      Browse Leads Now →
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 30px 0 0 0; font-size: 14px; color: #666; font-style: italic;">
                💡 <strong>Tip:</strong> Premium leads (85-94 quality score) have the highest conversion rates!
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  return await sendEmail({
    to: email,
    subject: '🎁 Special Offer: 20% Off Your First 5 Solar Leads',
    html: emailContent,
  });
}

/**
 * Day 7: Success stories and social proof
 */
export async function sendSuccessStoriesEmail(installerId: number, email: string, name: string): Promise<boolean> {
  const emailContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>How Other Installers Are Winning with SolarlyAU</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; max-width: 100%; background-color: #ffffff; border-radius: 8px;">
          <tr>
            <td style="background: linear-gradient(135deg, #FF8C00 0%, #FFA500 100%); padding: 40px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px;">Real Results from Real Installers 📈</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px 0; font-size: 16px; color: #333;">Hi ${name},</p>
              
              <p style="margin: 0 0 30px 0; font-size: 16px; color: #333; line-height: 1.6;">
                See how other solar installers are growing their business with SolarlyAU leads:
              </p>

              <!-- Success Story 1 -->
              <table role="presentation" style="width: 100%; background-color: #F0F9FF; padding: 20px; margin: 0 0 20px 0; border-radius: 8px; border-left: 4px solid #3B82F6;">
                <tr>
                  <td>
                    <p style="margin: 0 0 10px 0; font-size: 18px; color: #3B82F6; font-weight: bold;">"45% conversion rate in first month"</p>
                    <p style="margin: 0 0 10px 0; font-size: 15px; color: #333; line-height: 1.6;">
                      "We purchased 20 leads and closed 9 installations. The quality is outstanding – every lead was genuinely interested in solar."
                    </p>
                    <p style="margin: 0; font-size: 14px; color: #666;">
                      <strong>— Sarah Chen, Brisbane Solar Solutions (QLD)</strong>
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Success Story 2 -->
              <table role="presentation" style="width: 100%; background-color: #FFF8E7; padding: 20px; margin: 0 0 20px 0; border-radius: 8px; border-left: 4px solid #FF8C00;">
                <tr>
                  <td>
                    <p style="margin: 0 0 10px 0; font-size: 18px; color: #FF8C00; font-weight: bold;">"$180k revenue from $3k investment"</p>
                    <p style="margin: 0 0 10px 0; font-size: 15px; color: #333; line-height: 1.6;">
                      "Best ROI we've ever seen. Spent $3,000 on leads over 3 months, generated $180,000 in solar installations. Game changer!"
                    </p>
                    <p style="margin: 0; font-size: 14px; color: #666;">
                      <strong>— Mike Thompson, Perth Solar Co (WA)</strong>
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Success Story 3 -->
              <table role="presentation" style="width: 100%; background-color: #F0FDF4; padding: 20px; margin: 0 0 30px 0; border-radius: 8px; border-left: 4px solid #10B981;">
                <tr>
                  <td>
                    <p style="margin: 0 0 10px 0; font-size: 18px; color: #10B981; font-weight: bold;">"Replaced our entire marketing budget"</p>
                    <p style="margin: 0 0 10px 0; font-size: 15px; color: #333; line-height: 1.6;">
                      "Cancelled our Google Ads and Facebook campaigns. SolarlyAU leads are higher quality and cost 60% less. Plus, zero time wasted on unqualified prospects."
                    </p>
                    <p style="margin: 0; font-size: 14px; color: #666;">
                      <strong>— James Wilson, Sydney Solar Experts (NSW)</strong>
                    </p>
                  </td>
                </tr>
              </table>

              <h3 style="margin: 30px 0 15px 0; color: #333; font-size: 18px;">📊 Platform Average Stats:</h3>
              <ul style="margin: 0 0 30px 0; padding-left: 20px; color: #666; font-size: 15px; line-height: 1.8;">
                <li><strong>38% average conversion rate</strong> (lead to installation)</li>
                <li><strong>$6,500 average installation value</strong></li>
                <li><strong>60:1 ROI</strong> on lead purchases</li>
                <li><strong>2-3 day average response time</strong> from lead to quote</li>
              </ul>

              <table role="presentation" style="margin: 30px 0;">
                <tr>
                  <td style="text-align: center;">
                    <a href="https://solarlyau.com/dashboard" style="display: inline-block; background: linear-gradient(135deg, #FF8C00 0%, #FFA500 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 6px; font-size: 18px; font-weight: bold;">
                      Start Winning Too →
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 30px 0 0 0; font-size: 14px; color: #666; text-align: center; font-style: italic;">
                Join 100+ installers already growing with SolarlyAU
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  return await sendEmail({
    to: email,
    subject: '📈 How Installers Are Getting 45% Conversion Rates',
    html: emailContent,
  });
}

/**
 * Schedule welcome sequence for new installer
 * Called when installer registers
 */
export async function scheduleWelcomeSequence(installerId: number, email: string, name: string, companyName: string): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn('[WelcomeSequence] Database not available');
    return;
  }

  // Send Day 1 email immediately
  console.log(`[WelcomeSequence] Sending Day 1 email to ${email}`);
  await sendWelcomeEmail(installerId, email, name, companyName);

  // Schedule Day 3 and Day 7 emails in database
  // (These will be sent by a scheduled job that checks for pending emails)
  const day3Date = new Date();
  day3Date.setDate(day3Date.getDate() + 3);

  const day7Date = new Date();
  day7Date.setDate(day7Date.getDate() + 7);

  const day3Key = `welcome_email_day3_${installerId}`;
  const day7Key = `welcome_email_day7_${installerId}`;
  const day3Value = JSON.stringify({ installerId, email, name, scheduledFor: day3Date });
  const day7Value = JSON.stringify({ installerId, email, name, scheduledFor: day7Date });
  
  await db.execute(sql.raw(`
    INSERT INTO systemConfig (\`key\`, value, updatedAt)
    VALUES 
      ('${day3Key}', '${day3Value.replace(/'/g, "''")}', NOW()),
      ('${day7Key}', '${day7Value.replace(/'/g, "''")}', NOW())
  `));

  console.log(`[WelcomeSequence] Scheduled Day 3 and Day 7 emails for ${email}`);
}

/**
 * Process pending welcome emails
 * Called by scheduler every hour
 */
export async function processPendingWelcomeEmails(): Promise<void> {
  const db = await getDb();
  if (!db) return;

  const now = new Date();

  // Get pending Day 3 emails
  const day3Emails = await db.execute(sql.raw(`
    SELECT \`key\`, value
    FROM systemConfig
    WHERE \`key\` LIKE 'welcome_email_day3_%'
  `));

  for (const row of (day3Emails[0] as unknown as any[])) {
    const data = JSON.parse(row.value);
    const scheduledFor = new Date(data.scheduledFor);

    if (scheduledFor <= now) {
      console.log(`[WelcomeSequence] Sending Day 3 email to ${data.email}`);
      await sendDiscountEmail(data.installerId, data.email, data.name);

      // Delete from config
      await db.execute(sql.raw(`DELETE FROM systemConfig WHERE \`key\` = '${row.key}'`));
    }
  }

  // Get pending Day 7 emails
  const day7Emails = await db.execute(sql.raw(`
    SELECT \`key\`, value
    FROM systemConfig
    WHERE \`key\` LIKE 'welcome_email_day7_%'
  `));

  for (const row of (day7Emails[0] as unknown as any[])) {
    const data = JSON.parse(row.value);
    const scheduledFor = new Date(data.scheduledFor);

    if (scheduledFor <= now) {
      console.log(`[WelcomeSequence] Sending Day 7 email to ${data.email}`);
      await sendSuccessStoriesEmail(data.installerId, data.email, data.name);

      // Delete from config
      await db.execute(sql.raw(`DELETE FROM systemConfig WHERE \`key\` = '${row.key}'`));
    }
  }
}
