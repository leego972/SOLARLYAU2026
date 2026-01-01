/**
 * Installer Notification Service
 * 
 * Sends email and SMS notifications to installers when new leads are matched.
 */

import { sendEmail } from './emailServiceGmail';
import { sendSMS } from './smsVerification';
import { Lead, Installer, LeadOffer } from '../drizzle/schema';
import * as db from './db';

export interface NotificationResult {
  emailSent: boolean;
  smsSent: boolean;
  error?: string;
}

/**
 * Generate lead notification email HTML
 */
function generateLeadEmailHtml(lead: Lead, installer: Installer, offer: LeadOffer): string {
  const leadUrl = `https://solar-lead-vwkzbmwb.manus.space/installer/leads/${offer.id}`;
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #f97316, #ea580c); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 28px;">🎯 New Solar Lead Available!</h1>
  </div>
  
  <div style="background: #fff; padding: 30px; border: 1px solid #e5e7eb; border-top: none;">
    <p style="font-size: 18px; margin-top: 0;">Hi ${installer.contactName || installer.companyName},</p>
    
    <p>Great news! A new solar lead has been matched to your service area and is ready for you to claim.</p>
    
    <div style="background: #f8fafc; border-radius: 8px; padding: 20px; margin: 20px 0;">
      <h2 style="margin-top: 0; color: #1e293b; font-size: 20px;">Lead Details</h2>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; color: #64748b; width: 140px;">Name:</td>
          <td style="padding: 8px 0; font-weight: 600;">${lead.customerName}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #64748b;">Location:</td>
          <td style="padding: 8px 0; font-weight: 600;">${lead.suburb}, ${lead.state} ${lead.postcode}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #64748b;">Property Type:</td>
          <td style="padding: 8px 0; font-weight: 600;">${lead.propertyType}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #64748b;">System Size:</td>
          <td style="padding: 8px 0; font-weight: 600;">${lead.estimatedSystemSize || 'To be determined'}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #64748b;">Quality Score:</td>
          <td style="padding: 8px 0; font-weight: 600;">
            <span style="background: ${lead.qualityScore >= 80 ? '#22c55e' : lead.qualityScore >= 60 ? '#f59e0b' : '#ef4444'}; color: white; padding: 2px 8px; border-radius: 4px; font-size: 14px;">
              ${lead.qualityScore}/100
            </span>
          </td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #64748b;">Lead Price:</td>
          <td style="padding: 8px 0; font-weight: 600; color: #22c55e; font-size: 18px;">$${offer.offerPrice}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #64748b;">Distance:</td>
          <td style="padding: 8px 0; font-weight: 600;">${offer.distance}km from your location</td>
        </tr>
      </table>
    </div>
    
    <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 0 8px 8px 0;">
      <p style="margin: 0; color: #92400e;">
        <strong>⏰ This offer expires in 48 hours.</strong> First installer to accept wins the lead!
      </p>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${leadUrl}" style="display: inline-block; background: linear-gradient(135deg, #f97316, #ea580c); color: white; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: 600; font-size: 18px;">
        View & Accept Lead
      </a>
    </div>
    
    <p style="color: #64748b; font-size: 14px; margin-top: 30px;">
      If you're not interested in this lead, simply ignore this email and it will be offered to other installers.
    </p>
  </div>
  
  <div style="background: #f8fafc; padding: 20px; border-radius: 0 0 12px 12px; text-align: center; border: 1px solid #e5e7eb; border-top: none;">
    <p style="margin: 0; color: #64748b; font-size: 14px;">
      SolarlyAU - Connecting Australians with Quality Solar Installers
    </p>
    <p style="margin: 10px 0 0; color: #94a3b8; font-size: 12px;">
      <a href="https://solar-lead-vwkzbmwb.manus.space/installer/settings" style="color: #94a3b8;">Manage notification preferences</a>
    </p>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Generate lead notification SMS text
 */
function generateLeadSmsText(lead: Lead, installer: Installer, offer: LeadOffer): string {
  return `🎯 New Solar Lead! ${lead.suburb}, ${lead.state} - ${lead.propertyType} - $${offer.offerPrice}. Quality: ${lead.qualityScore}/100. Expires in 48hrs. Login to accept: solar-lead-vwkzbmwb.manus.space`;
}

/**
 * Send notification to installer about a new lead offer
 */
export async function notifyInstallerOfNewLead(
  lead: Lead,
  installer: Installer,
  offer: LeadOffer
): Promise<NotificationResult> {
  const result: NotificationResult = {
    emailSent: false,
    smsSent: false,
  };

  try {
    // Send email notification
    if (installer.email) {
      const emailHtml = generateLeadEmailHtml(lead, installer, offer);
      result.emailSent = await sendEmail({
        to: installer.email,
        subject: `🎯 New Solar Lead in ${lead.suburb}, ${lead.state} - $${offer.offerPrice}`,
        html: emailHtml,
      });
      
      if (result.emailSent) {
        console.log(`[InstallerNotifications] Email sent to ${installer.companyName} (${installer.email})`);
      }
    }

    // Send SMS notification if phone available
    if (installer.phone) {
      const smsText = generateLeadSmsText(lead, installer, offer);
      const smsResult = await sendSMS(installer.phone, smsText);
      result.smsSent = smsResult.success;
      
      if (result.smsSent) {
        console.log(`[InstallerNotifications] SMS sent to ${installer.companyName} (${installer.phone})`);
      }
    }

    // Update offer record with notification status
    await db.updateLeadOffer(offer.id, {
      emailSent: result.emailSent,
      smsSent: result.smsSent,
    });

    return result;

  } catch (error) {
    console.error(`[InstallerNotifications] Error notifying installer ${installer.id}:`, error);
    result.error = error instanceof Error ? error.message : 'Unknown error';
    return result;
  }
}

/**
 * Send notifications to all matched installers for a lead
 */
export async function notifyMatchedInstallers(leadId: number): Promise<{
  total: number;
  emailsSent: number;
  smsSent: number;
}> {
  const lead = await db.getLeadById(leadId);
  if (!lead) {
    console.error(`[InstallerNotifications] Lead ${leadId} not found`);
    return { total: 0, emailsSent: 0, smsSent: 0 };
  }

  const offers = await db.getOffersByLeadId(leadId);
  let emailsSent = 0;
  let smsSent = 0;

  for (const offer of offers) {
    // Skip if already notified
    if (offer.emailSent || offer.smsSent) {
      continue;
    }

    const installer = await db.getInstallerById(offer.installerId);
    if (!installer) continue;

    const result = await notifyInstallerOfNewLead(lead, installer, offer);
    
    if (result.emailSent) emailsSent++;
    if (result.smsSent) smsSent++;
  }

  console.log(`[InstallerNotifications] Notified ${offers.length} installers for lead ${leadId}: ${emailsSent} emails, ${smsSent} SMS`);

  return {
    total: offers.length,
    emailsSent,
    smsSent,
  };
}

/**
 * Send lead accepted confirmation to installer
 */
export async function notifyLeadAccepted(
  lead: Lead,
  installer: Installer,
  offer: LeadOffer
): Promise<boolean> {
  if (!installer.email) return false;

  const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #22c55e, #16a34a); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 28px;">✅ Lead Accepted!</h1>
  </div>
  
  <div style="background: #fff; padding: 30px; border: 1px solid #e5e7eb; border-top: none;">
    <p style="font-size: 18px; margin-top: 0;">Hi ${installer.contactName || installer.companyName},</p>
    
    <p>Great news! You've successfully claimed the lead. Here are the full contact details:</p>
    
    <div style="background: #f0fdf4; border-radius: 8px; padding: 20px; margin: 20px 0; border: 2px solid #22c55e;">
      <h2 style="margin-top: 0; color: #166534; font-size: 20px;">Customer Contact Details</h2>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 10px 0; color: #64748b; width: 100px;">Name:</td>
          <td style="padding: 10px 0; font-weight: 600; font-size: 18px;">${lead.customerName}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; color: #64748b;">Phone:</td>
          <td style="padding: 10px 0; font-weight: 600; font-size: 18px;">
            <a href="tel:${lead.customerPhone}" style="color: #22c55e; text-decoration: none;">${lead.customerPhone}</a>
          </td>
        </tr>
        <tr>
          <td style="padding: 10px 0; color: #64748b;">Email:</td>
          <td style="padding: 10px 0; font-weight: 600;">
            <a href="mailto:${lead.customerEmail}" style="color: #22c55e; text-decoration: none;">${lead.customerEmail}</a>
          </td>
        </tr>
        <tr>
          <td style="padding: 10px 0; color: #64748b;">Address:</td>
          <td style="padding: 10px 0; font-weight: 600;">${lead.address || `${lead.suburb}, ${lead.state} ${lead.postcode}`}</td>
        </tr>
      </table>
    </div>
    
    <div style="background: #eff6ff; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0; border-radius: 0 8px 8px 0;">
      <p style="margin: 0; color: #1e40af;">
        <strong>💡 Pro Tip:</strong> Contact the customer within 1 hour for the best conversion rates. Customers who receive a quick response are 7x more likely to proceed.
      </p>
    </div>
    
    <p style="color: #64748b; font-size: 14px; margin-top: 30px;">
      Amount charged: <strong>$${offer.offerPrice}</strong>
    </p>
  </div>
  
  <div style="background: #f8fafc; padding: 20px; border-radius: 0 0 12px 12px; text-align: center; border: 1px solid #e5e7eb; border-top: none;">
    <p style="margin: 0; color: #64748b; font-size: 14px;">
      Good luck with the installation! 🌟
    </p>
  </div>
</body>
</html>
  `.trim();

  return await sendEmail({
    to: installer.email,
    subject: `✅ Lead Confirmed - ${lead.customerName} in ${lead.suburb}`,
    html: emailHtml,
  });
}
