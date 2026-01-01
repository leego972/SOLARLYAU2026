/**
 * Automated Lead Notification Campaign
 * Sends emails to installers when new leads match their service area
 */

import { getDb } from "./db";
import { leads, installers, leadOffers } from "../drizzle/schema";
import { eq, and, inArray, sql, desc, gt } from "drizzle-orm";

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const FROM_EMAIL = process.env.FROM_EMAIL || "leads@solarlyau.com";
const FROM_NAME = process.env.FROM_NAME || "SolarlyAU Leads";
const BASE_URL = "https://solar-lead-vwkzbmwb.manus.space";

interface LeadNotification {
  installerId: number;
  installerEmail: string;
  installerName: string;
  leads: Array<{
    id: number;
    suburb: string;
    state: string;
    propertyType: string;
    qualityScore: number;
    basePrice: number;
    estimatedSystemSize: number | null;
  }>;
}

/**
 * Find new leads that match installer service areas
 */
async function findMatchingLeads(): Promise<LeadNotification[]> {
  const db = await getDb();
  if (!db) return [];

  // Get active installers
  const activeInstallers = await db
    .select()
    .from(installers)
    .where(eq(installers.isActive, true));

  // Get new leads from last 6 hours
  const sixHoursAgo = new Date();
  sixHoursAgo.setHours(sixHoursAgo.getHours() - 6);

  const newLeads = await db
    .select()
    .from(leads)
    .where(and(
      eq(leads.status, "new"),
      gt(leads.createdAt, sixHoursAgo)
    ))
    .orderBy(desc(leads.qualityScore));

  // Match leads to installers based on service area
  const notifications: LeadNotification[] = [];

  for (const installer of activeInstallers) {
    if (!installer.email) continue;

    let servicePostcodes: string[] = [];
    try {
      servicePostcodes = JSON.parse(installer.servicePostcodes || "[]");
    } catch {
      servicePostcodes = [];
    }

    // Find leads in installer's service area
    const matchingLeads = newLeads.filter(lead => {
      // Check if lead is in installer's state
      if (lead.state !== installer.state) return false;
      
      // Check if lead postcode is in service area (or within radius)
      if (servicePostcodes.length > 0) {
        return servicePostcodes.includes(lead.postcode);
      }
      
      // If no specific postcodes, match all in state
      return true;
    });

    if (matchingLeads.length > 0) {
      notifications.push({
        installerId: installer.id,
        installerEmail: installer.email,
        installerName: installer.contactName || installer.companyName,
        leads: matchingLeads.slice(0, 5).map(l => ({
          id: l.id,
          suburb: l.suburb,
          state: l.state,
          propertyType: l.propertyType,
          qualityScore: l.qualityScore,
          basePrice: l.basePrice,
          estimatedSystemSize: l.estimatedSystemSize,
        })),
      });
    }
  }

  return notifications;
}

/**
 * Build lead notification email HTML
 */
function buildLeadNotificationEmail(notification: LeadNotification): string {
  const leadsHtml = notification.leads.map(lead => `
    <tr>
      <td style="padding: 15px; border-bottom: 1px solid #e5e7eb;">
        <div style="font-weight: 600; color: #1f2937;">${lead.suburb}, ${lead.state}</div>
        <div style="font-size: 14px; color: #6b7280;">${lead.propertyType} • ${lead.estimatedSystemSize || '6-10'}kW system</div>
      </td>
      <td style="padding: 15px; border-bottom: 1px solid #e5e7eb; text-align: center;">
        <div style="display: inline-block; background: ${lead.qualityScore >= 80 ? '#dcfce7' : lead.qualityScore >= 60 ? '#fef3c7' : '#fee2e2'}; color: ${lead.qualityScore >= 80 ? '#166534' : lead.qualityScore >= 60 ? '#92400e' : '#991b1b'}; padding: 4px 12px; border-radius: 20px; font-weight: 600;">
          ${lead.qualityScore}/100
        </div>
      </td>
      <td style="padding: 15px; border-bottom: 1px solid #e5e7eb; text-align: right;">
        <div style="font-size: 24px; font-weight: 700; color: #ea580c;">$${lead.basePrice}</div>
      </td>
    </tr>
  `).join('');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 0;">
  <div style="background: linear-gradient(135deg, #f97316, #ea580c); padding: 30px; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 28px;">🎯 ${notification.leads.length} New Leads in Your Area!</h1>
    <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0;">Hot leads ready for you to purchase</p>
  </div>
  
  <div style="background: #ffffff; padding: 30px;">
    <p style="font-size: 18px; margin-top: 0;">Hi ${notification.installerName},</p>
    
    <p>Great news! We've found <strong>${notification.leads.length} new solar leads</strong> in your service area. These homeowners are actively looking for quotes.</p>
    
    <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 0 8px 8px 0;">
      <p style="margin: 0; color: #92400e;">
        <strong>⏰ Act Fast!</strong> Average lead sells within 4 hours. First installer to respond wins!
      </p>
    </div>
    
    <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
      <thead>
        <tr style="background: #f9fafb;">
          <th style="padding: 12px 15px; text-align: left; font-weight: 600; color: #6b7280;">Location</th>
          <th style="padding: 12px 15px; text-align: center; font-weight: 600; color: #6b7280;">Quality</th>
          <th style="padding: 12px 15px; text-align: right; font-weight: 600; color: #6b7280;">Price</th>
        </tr>
      </thead>
      <tbody>
        ${leadsHtml}
      </tbody>
    </table>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${BASE_URL}/installer/dashboard" style="display: inline-block; background: linear-gradient(135deg, #f97316, #ea580c); color: white; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: 600; font-size: 18px;">
        View & Purchase Leads
      </a>
    </div>
    
    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
    
    <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
      <h3 style="margin: 0 0 10px; color: #166534;">💰 Why SolarlyAU Leads Convert Better</h3>
      <ul style="margin: 0; padding-left: 20px; color: #166534;">
        <li>AI-verified homeowner intent</li>
        <li>Phone numbers confirmed via SMS</li>
        <li>Quality guarantee - invalid leads refunded</li>
        <li>Exclusive to 3 installers max per lead</li>
      </ul>
    </div>
    
    <p style="color: #6b7280; font-size: 14px;">
      Questions? Reply to this email or visit our <a href="${BASE_URL}/faq" style="color: #ea580c;">FAQ</a>.
    </p>
  </div>
  
  <div style="background: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #9ca3af;">
    <p style="margin: 0;">© 2025 SolarlyAU. All rights reserved.</p>
    <p style="margin: 5px 0 0;">
      <a href="${BASE_URL}/unsubscribe" style="color: #9ca3af;">Unsubscribe</a> | 
      <a href="${BASE_URL}/preferences" style="color: #9ca3af;">Email Preferences</a>
    </p>
  </div>
</body>
</html>
  `;
}

/**
 * Send notification email via SendGrid
 */
async function sendNotificationEmail(notification: LeadNotification): Promise<boolean> {
  if (!SENDGRID_API_KEY) {
    console.log(`[LeadCampaign] Would send email to ${notification.installerEmail} (${notification.leads.length} leads)`);
    return true;
  }

  try {
    const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${SENDGRID_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        personalizations: [{
          to: [{ email: notification.installerEmail }],
          subject: `🎯 ${notification.leads.length} New Solar Leads in Your Area - Act Fast!`,
        }],
        from: { email: FROM_EMAIL, name: FROM_NAME },
        content: [{
          type: "text/html",
          value: buildLeadNotificationEmail(notification),
        }],
      }),
    });

    return response.ok;
  } catch (error) {
    console.error(`[LeadCampaign] Error sending to ${notification.installerEmail}:`, error);
    return false;
  }
}

/**
 * Run the lead notification campaign
 */
export async function runLeadNotificationCampaign(): Promise<{ sent: number; failed: number }> {
  console.log("[LeadCampaign] Starting lead notification campaign...");
  
  const notifications = await findMatchingLeads();
  console.log(`[LeadCampaign] Found ${notifications.length} installers with matching leads`);

  let sent = 0;
  let failed = 0;

  for (const notification of notifications) {
    const success = await sendNotificationEmail(notification);
    if (success) {
      sent++;
    } else {
      failed++;
    }
  }

  console.log(`[LeadCampaign] Complete: ${sent} sent, ${failed} failed`);
  return { sent, failed };
}

/**
 * Start the lead notification scheduler (runs every 6 hours)
 */
export function startLeadNotificationScheduler() {
  console.log("[LeadCampaign] Starting lead notification scheduler (every 6 hours)");
  
  // Run immediately on start
  runLeadNotificationCampaign().catch(console.error);
  
  // Then run every 6 hours
  setInterval(() => {
    runLeadNotificationCampaign().catch(console.error);
  }, 6 * 60 * 60 * 1000);
}
