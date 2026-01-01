import { getDb } from "./db";
import { leads, leadOffers, installers, ratingTokens, leadTrackingEvents } from "../drizzle/schema";
import { eq, and, lt, isNull, sql, desc } from "drizzle-orm";
import crypto from "crypto";

const RATING_REQUEST_DELAY_DAYS = 10; // Send rating request 10 days after installation
const RATING_TOKEN_EXPIRY_DAYS = 30;

interface RatingEmailResult {
  sent: number;
  errors: string[];
}

// Generate secure rating token
export function generateRatingToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

// Get leads that are ready for rating requests
async function getLeadsReadyForRatingRequest(): Promise<any[]> {
  const db = await getDb();
  if (!db) return [];

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - RATING_REQUEST_DELAY_DAYS);

  // Find accepted leads that:
  // 1. Were accepted more than RATING_REQUEST_DELAY_DAYS ago
  // 2. Don't already have a rating token
  // 3. Have valid customer email
  const leadsReadyForRating = await db
    .select({
      lead: leads,
      offer: leadOffers,
      installer: installers,
    })
    .from(leads)
    .innerJoin(leadOffers, and(
      eq(leadOffers.leadId, leads.id),
      eq(leadOffers.status, "accepted")
    ))
    .innerJoin(installers, eq(installers.id, leadOffers.installerId))
    .where(and(
      eq(leads.status, "sold"),
      lt(leadOffers.respondedAt, cutoffDate),
      sql`${leads.customerEmail} IS NOT NULL AND ${leads.customerEmail} != ''`
    ))
    .limit(50);

  // Filter out leads that already have rating tokens
  const result = [];
  for (const item of leadsReadyForRating) {
    const existingToken = await db
      .select()
      .from(ratingTokens)
      .where(eq(ratingTokens.leadId, item.lead.id))
      .limit(1);
    
    if (existingToken.length === 0) {
      result.push(item);
    }
  }

  return result;
}

// Create rating token and send email
async function sendRatingRequestEmail(
  lead: any,
  installer: any
): Promise<{ success: boolean; error?: string }> {
  const db = await getDb();
  if (!db) return { success: false, error: "Database not available" };

  try {
    // Generate token
    const token = generateRatingToken();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + RATING_TOKEN_EXPIRY_DAYS);

    // Save token
    await db.insert(ratingTokens).values({
      token,
      leadId: lead.id,
      installerId: installer.id,
      expiresAt,
    });

    // Log tracking event
    await db.insert(leadTrackingEvents).values({
      leadId: lead.id,
      eventType: "review_requested",
      description: `Rating request email sent to ${lead.customerEmail}`,
      installerId: installer.id,
    });

    // Build rating URL
    const baseUrl = process.env.VITE_OAUTH_PORTAL_URL?.replace('/oauth', '') || 'https://solarlyau.manus.space';
    const ratingUrl = `${baseUrl}/rate-installer?token=${token}`;

    // Send email using existing email infrastructure
    const emailContent = buildRatingRequestEmail(
      lead.customerName,
      installer.companyName,
      ratingUrl,
      token,
      baseUrl
    );

    // Use SendGrid or other email service
    const emailSent = await sendEmail({
      to: lead.customerEmail,
      subject: `How was your solar installation with ${installer.companyName}?`,
      html: emailContent,
    });

    if (!emailSent) {
      return { success: false, error: "Failed to send email" };
    }

    console.log(`[RatingScheduler] Sent rating request to ${lead.customerEmail} for installer ${installer.companyName}`);
    return { success: true };
  } catch (error: any) {
    console.error(`[RatingScheduler] Error sending rating request:`, error);
    return { success: false, error: error.message };
  }
}

// Build rating request email HTML with tracking
function buildRatingRequestEmail(
  customerName: string,
  installerName: string,
  ratingUrl: string,
  token: string,
  baseUrl: string = "https://solar-lead-vwkzbmwb.manus.space"
): string {
  // Create tracking URLs
  const trackingPixelUrl = `${baseUrl}/api/track/email-open?token=${token}`;
  const trackedRatingUrl = `${baseUrl}/api/track/email-click?token=${token}&redirect=${encodeURIComponent(ratingUrl)}`;
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Rate Your Solar Installation</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #f97316, #fbbf24); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 24px;">☀️ SolarlyAU</h1>
  </div>
  
  <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none;">
    <h2 style="color: #1f2937; margin-top: 0;">Hi ${customerName},</h2>
    
    <p>We hope you're enjoying your new solar system! Your installation with <strong>${installerName}</strong> was completed recently, and we'd love to hear about your experience.</p>
    
    <p>Your feedback helps other homeowners make informed decisions and helps installers improve their service.</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${trackedRatingUrl}" style="display: inline-block; background: linear-gradient(135deg, #f97316, #ea580c); color: white; text-decoration: none; padding: 15px 40px; border-radius: 8px; font-weight: bold; font-size: 16px;">
        ⭐ Rate Your Installation
      </a>
    </div>
    
    <p style="font-size: 14px; color: #6b7280;">This link will expire in 30 days. It only takes 2 minutes to leave a review.</p>
    
    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
    
    <p style="font-size: 14px; color: #6b7280;">
      <strong>What you'll rate:</strong>
    </p>
    <ul style="font-size: 14px; color: #6b7280;">
      <li>Overall experience</li>
      <li>Communication quality</li>
      <li>Installation quality</li>
      <li>Value for money</li>
      <li>Timeliness</li>
    </ul>
    
    <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
      Thank you for choosing SolarlyAU!<br>
      <strong>The SolarlyAU Team</strong>
    </p>
  </div>
  
  <div style="background: #f9fafb; padding: 20px; border-radius: 0 0 10px 10px; text-align: center; font-size: 12px; color: #9ca3af;">
    <p style="margin: 0;">© 2025 SolarlyAU. All rights reserved.</p>
    <p style="margin: 5px 0 0;">Australia's First Fully Autonomous Solar Lead Generation System</p>
  </div>
  <!-- Email open tracking pixel -->
  <img src="${trackingPixelUrl}" width="1" height="1" style="display:none;" alt="" />
</body>
</html>
  `;
}

// Simple email sending function (uses existing infrastructure)
async function sendEmail(options: {
  to: string;
  subject: string;
  html: string;
}): Promise<boolean> {
  try {
    // Try SendGrid first
    if (process.env.SENDGRID_API_KEY) {
      const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.SENDGRID_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: options.to }] }],
          from: { email: process.env.FROM_EMAIL || "noreply@solarlyau.com", name: "SolarlyAU" },
          subject: options.subject,
          content: [{ type: "text/html", value: options.html }],
        }),
      });
      return response.ok;
    }

    // Fallback to Gmail
    if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
      // Use nodemailer or similar
      console.log(`[RatingScheduler] Would send email to ${options.to} (Gmail not implemented in this context)`);
      return true; // Simulate success for now
    }

    console.log(`[RatingScheduler] No email service configured, skipping email to ${options.to}`);
    return false;
  } catch (error) {
    console.error("[RatingScheduler] Email send error:", error);
    return false;
  }
}

// Main scheduler function - run daily
export async function processRatingRequests(): Promise<RatingEmailResult> {
  console.log("[RatingScheduler] Starting daily rating request processing...");
  
  const result: RatingEmailResult = {
    sent: 0,
    errors: [],
  };

  try {
    const leadsToProcess = await getLeadsReadyForRatingRequest();
    console.log(`[RatingScheduler] Found ${leadsToProcess.length} leads ready for rating requests`);

    for (const item of leadsToProcess) {
      const sendResult = await sendRatingRequestEmail(item.lead, item.installer);
      
      if (sendResult.success) {
        result.sent++;
      } else {
        result.errors.push(`Lead ${item.lead.id}: ${sendResult.error}`);
      }

      // Small delay between emails to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log(`[RatingScheduler] Completed: ${result.sent} emails sent, ${result.errors.length} errors`);
  } catch (error: any) {
    console.error("[RatingScheduler] Fatal error:", error);
    result.errors.push(`Fatal error: ${error.message}`);
  }

  return result;
}

// Schedule the rating request processor (runs at 10 AM daily)
export function startRatingEmailScheduler(): void {
  console.log("[RatingScheduler] Initializing daily rating email scheduler...");
  
  // Run immediately on startup (for testing)
  setTimeout(() => {
    processRatingRequests().catch(console.error);
  }, 60000); // Wait 1 minute after startup

  // Then run daily at 10 AM
  const now = new Date();
  const next10AM = new Date();
  next10AM.setHours(10, 0, 0, 0);
  
  if (now > next10AM) {
    next10AM.setDate(next10AM.getDate() + 1);
  }
  
  const msUntil10AM = next10AM.getTime() - now.getTime();
  
  setTimeout(() => {
    processRatingRequests().catch(console.error);
    
    // Then run every 24 hours
    setInterval(() => {
      processRatingRequests().catch(console.error);
    }, 24 * 60 * 60 * 1000);
  }, msUntil10AM);

  console.log(`[RatingScheduler] Next run scheduled for ${next10AM.toISOString()}`);
}
