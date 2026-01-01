/**
 * Launch Email Campaign
 * Sends promotional email to verified installers announcing available leads
 */

import { getDb } from './db';
import { sendEmail } from './emailServiceGmail';
import { sql } from 'drizzle-orm';

export interface CampaignStats {
  sent: number;
  failed: number;
  totalInstallers: number;
}

/**
 * Send launch campaign email to all verified installers
 */
export async function sendLaunchCampaign(): Promise<CampaignStats> {
  const db = await getDb();
  if (!db) {
    throw new Error('Database not available');
  }

  // Get all verified, active installers
  const result = await db.execute(sql`
    SELECT id, companyName, contactName, email, state
    FROM installers 
    WHERE isVerified = 1 AND isActive = 1
    AND email NOT LIKE 'test%@example.com'
  `);

  const installers = result[0] as unknown as any[];

  const stats: CampaignStats = {
    sent: 0,
    failed: 0,
    totalInstallers: installers.length,
  };

  console.log(`[LaunchCampaign] Sending to ${stats.totalInstallers} verified installers...`);

  for (const installer of installers) {
    try {
      const emailContent = generateLaunchEmail(
        installer.contactName,
        installer.companyName,
        installer.state
      );

      const sent = await sendEmail({
        to: installer.email,
        subject: '🎉 637 High-Quality Solar Leads Available Now + 20% Launch Discount',
        html: emailContent,
      });

      if (sent) {
        stats.sent++;
        console.log(`[LaunchCampaign] ✅ Sent to ${installer.companyName} (${installer.email})`);
      } else {
        stats.failed++;
        console.log(`[LaunchCampaign] ❌ Failed to send to ${installer.email}`);
      }

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      stats.failed++;
      console.error(`[LaunchCampaign] Error sending to ${installer.email}:`, error);
    }
  }

  console.log(`[LaunchCampaign] Campaign complete: ${stats.sent} sent, ${stats.failed} failed`);
  return stats;
}

/**
 * Send single launch email
 */
export async function sendLaunchEmail(params: {
  to: string;
  companyName: string;
  contactName: string;
  state?: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const emailContent = generateLaunchEmail(
      params.contactName,
      params.companyName,
      params.state || 'your area'
    );

    const sent = await sendEmail({
      to: params.to,
      subject: '🎉 637 High-Quality Solar Leads Available Now + 20% Launch Discount',
      html: emailContent,
    });

    return { success: sent };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Generate personalized launch email HTML
 */
function generateLaunchEmail(contactName: string, companyName: string, state: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SolarlyAU Launch - Exclusive Offer</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; max-width: 100%; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #FF8C00 0%, #FFA500 100%); padding: 40px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: bold;">🎉 SolarlyAU is Live!</h1>
              <p style="margin: 10px 0 0 0; color: #ffffff; font-size: 18px;">Your Solar Lead Marketplace is Ready</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px 0; font-size: 16px; color: #333333;">Hi ${contactName},</p>
              
              <p style="margin: 0 0 20px 0; font-size: 16px; color: #333333; line-height: 1.6;">
                Great news! We've just launched <strong>SolarlyAU</strong> – Australia's first fully autonomous solar lead generation platform – and you're one of our verified founding installers.
              </p>

              <!-- Key Stats Box -->
              <table role="presentation" style="width: 100%; background-color: #FFF8E7; border-left: 4px solid #FF8C00; padding: 20px; margin: 20px 0; border-radius: 4px;">
                <tr>
                  <td>
                    <h2 style="margin: 0 0 15px 0; color: #FF8C00; font-size: 20px;">📊 What's Available Right Now:</h2>
                    <ul style="margin: 0; padding-left: 20px; color: #333333; font-size: 16px; line-height: 1.8;">
                      <li><strong>637 high-quality leads</strong> ready to purchase</li>
                      <li>Average quality score: <strong>89/100</strong></li>
                      <li>Covering <strong>${state} and surrounding areas</strong></li>
                      <li>Fresh homeowners actively interested in solar</li>
                      <li>Verified contact details and property information</li>
                    </ul>
                  </td>
                </tr>
              </table>

              <!-- Launch Offer -->
              <table role="presentation" style="width: 100%; background: linear-gradient(135deg, #FF6B6B 0%, #FF8C00 100%); padding: 30px; margin: 20px 0; border-radius: 8px; text-align: center;">
                <tr>
                  <td>
                    <h2 style="margin: 0 0 10px 0; color: #ffffff; font-size: 24px;">🎁 Exclusive Launch Offer</h2>
                    <p style="margin: 0 0 20px 0; color: #ffffff; font-size: 18px; font-weight: bold;">20% OFF Your First 5 Leads</p>
                    <p style="margin: 0; color: #ffffff; font-size: 14px;">Use code: <strong style="background-color: rgba(255,255,255,0.2); padding: 5px 15px; border-radius: 4px;">LAUNCH20</strong></p>
                    <p style="margin: 10px 0 0 0; color: #ffffff; font-size: 12px; opacity: 0.9;">Offer expires in 7 days</p>
                  </td>
                </tr>
              </table>

              <!-- Pricing Info -->
              <h3 style="margin: 30px 0 15px 0; color: #333333; font-size: 18px;">💰 Transparent Pricing:</h3>
              <ul style="margin: 0 0 20px 0; padding-left: 20px; color: #666666; font-size: 15px; line-height: 1.8;">
                <li>Standard leads (75-84 quality): $100-$200</li>
                <li>Premium leads (85-94 quality): $200-$280</li>
                <li>Platinum leads (95-100 quality): $280-$300</li>
              </ul>

              <p style="margin: 0 0 20px 0; font-size: 14px; color: #666666; font-style: italic;">
                💡 <strong>Pro tip:</strong> Bundle deals available – buy weekly packs and save up to 20%!
              </p>

              <!-- CTA Button -->
              <table role="presentation" style="margin: 30px 0;">
                <tr>
                  <td style="text-align: center;">
                    <a href="https://solarlyau.com/dashboard" style="display: inline-block; background: linear-gradient(135deg, #FF8C00 0%, #FFA500 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 6px; font-size: 18px; font-weight: bold; box-shadow: 0 4px 12px rgba(255,140,0,0.3);">
                      Browse Available Leads →
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Why SolarlyAU -->
              <h3 style="margin: 30px 0 15px 0; color: #333333; font-size: 18px;">⚡ Why Installers Love SolarlyAU:</h3>
              <ul style="margin: 0 0 20px 0; padding-left: 20px; color: #666666; font-size: 15px; line-height: 1.8;">
                <li><strong>AI-Qualified Leads:</strong> Every lead scored 0-100 for quality</li>
                <li><strong>Geographic Matching:</strong> Only see leads in your service area</li>
                <li><strong>Instant Access:</strong> Download contact details immediately after purchase</li>
                <li><strong>100% Money-Back Guarantee:</strong> Invalid lead? Full refund, no questions asked</li>
                <li><strong>Fresh Daily:</strong> New leads added every 4 hours</li>
              </ul>

              <!-- Next Steps -->
              <table role="presentation" style="width: 100%; background-color: #F0F9FF; padding: 20px; margin: 20px 0; border-radius: 4px; border-left: 4px solid #3B82F6;">
                <tr>
                  <td>
                    <h3 style="margin: 0 0 10px 0; color: #3B82F6; font-size: 16px;">🚀 Get Started in 3 Easy Steps:</h3>
                    <ol style="margin: 0; padding-left: 20px; color: #333333; font-size: 15px; line-height: 1.8;">
                      <li>Log in to your dashboard at <a href="https://solarlyau.com/dashboard" style="color: #FF8C00;">solarlyau.com/dashboard</a></li>
                      <li>Browse available leads in ${state}</li>
                      <li>Purchase with one click (Stripe secure checkout)</li>
                    </ol>
                  </td>
                </tr>
              </table>

              <p style="margin: 30px 0 20px 0; font-size: 16px; color: #333333; line-height: 1.6;">
                We're excited to help ${companyName} grow with high-quality solar leads. If you have any questions, just reply to this email – we're here to help!
              </p>

              <p style="margin: 0; font-size: 16px; color: #333333;">
                Best regards,<br>
                <strong>The SolarlyAU Team</strong><br>
                <span style="color: #666666; font-size: 14px;">Australia's #1 Autonomous Solar Lead Platform</span>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f5f5f5; padding: 30px; text-align: center; border-radius: 0 0 8px 8px;">
              <p style="margin: 0 0 10px 0; font-size: 14px; color: #666666;">
                <a href="https://solarlyau.com" style="color: #FF8C00; text-decoration: none; margin: 0 10px;">Website</a> |
                <a href="https://solarlyau.com/pricing" style="color: #FF8C00; text-decoration: none; margin: 0 10px;">Pricing</a> |
                <a href="https://solarlyau.com/success-stories" style="color: #FF8C00; text-decoration: none; margin: 0 10px;">Success Stories</a> |
                <a href="https://solarlyau.com/faq" style="color: #FF8C00; text-decoration: none; margin: 0 10px;">FAQ</a>
              </p>
              <p style="margin: 10px 0 0 0; font-size: 12px; color: #999999;">
                © 2025 SolarlyAU. All rights reserved.<br>
                You're receiving this because you're a verified installer on our platform.
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
}
