import { sendEmail } from "./emailServiceGmail";
import { getDb } from "./db";
import { conversionEvents } from "../drizzle/schema";
import { eq } from "drizzle-orm";

interface TestimonialRequest {
  installerId: number;
  installerName: string;
  installerEmail: string;
  leadId: number;
  customerName: string;
  dealValue: number;
}

/**
 * Send testimonial request email to installer after successful conversion
 */
export async function sendTestimonialRequest(request: TestimonialRequest) {
  const subject = `🎉 Congrats on closing ${request.customerName}! Share your success?`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Congratulations on Your Successful Installation!</h2>
      
      <p>Hi ${request.installerName},</p>
      
      <p>We saw that you successfully closed the lead for <strong>${request.customerName}</strong> with a deal value of <strong>$${(request.dealValue / 100).toLocaleString()}</strong>. That's fantastic!</p>
      
      <p><strong>Would you mind sharing your experience with SolarlyAU?</strong></p>
      
      <p>Your success story helps other installers understand the value of our platform. It only takes 2 minutes, and we'll feature you on our Success Metrics page.</p>
      
      <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 0; font-weight: bold;">We'd love to know:</p>
        <ul style="margin: 10px 0;">
          <li>How was the lead quality?</li>
          <li>How long did it take to close?</li>
          <li>What was your ROI on this lead?</li>
          <li>Would you recommend SolarlyAU to other installers?</li>
        </ul>
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="https://solar-lead-vwkzbmwb.manus.space/installer/testimonial?leadId=${request.leadId}" 
           style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
          Share My Success Story →
        </a>
      </div>
      
      <p>Thanks for being part of the SolarlyAU community!</p>
      
      <p>Best regards,<br>
      The SolarlyAU Team</p>
      
      <p style="font-size: 12px; color: #6b7280; margin-top: 30px;">
        P.S. If you prefer, you can also reply directly to this email with your feedback.
      </p>
    </div>
  `;

  try {
    await sendEmail({
      to: request.installerEmail,
      subject,
      html,
    });
    console.log(`[Testimonials] Request sent to ${request.installerEmail} for lead ${request.leadId}`);
    return true;
  } catch (error) {
    console.error(`[Testimonials] Failed to send request to ${request.installerEmail}:`, error);
    return false;
  }
}

/**
 * Automatically send testimonial requests after successful conversions
 * This should be called when a conversion event is recorded
 */
export async function triggerTestimonialRequest(conversionEventId: number) {
  const db = await getDb();
  if (!db) {
    console.error("[Testimonials] Database not available");
    return false;
  }

  try {
    // Get conversion event details
    const events = await db.select().from(conversionEvents).where(eq(conversionEvents.id, conversionEventId)).limit(1);
    const event = events[0];
    
    if (!event) {
      console.error(`[Testimonials] Conversion event ${conversionEventId} not found`);
      return false;
    }

    // Get installer details
    const { installers } = await import("../drizzle/schema");
    const installerResults = await db.select().from(installers).where(eq(installers.id, event.installerId)).limit(1);
    const installer = installerResults[0];
    
    if (!installer) {
      console.error(`[Testimonials] Installer ${event.installerId} not found`);
      return false;
    }

    // Get lead details
    const { leads } = await import("../drizzle/schema");
    const leadResults = await db.select().from(leads).where(eq(leads.id, event.leadId)).limit(1);
    const lead = leadResults[0];
    
    if (!lead) {
      console.error(`[Testimonials] Lead ${event.leadId} not found`);
      return false;
    }

    // Send testimonial request
    const request: TestimonialRequest = {
      installerId: installer.id,
      installerName: installer.contactName,
      installerEmail: installer.email,
      leadId: lead.id,
      customerName: lead.customerName,
      dealValue: event.dealValue,
    };

    return await sendTestimonialRequest(request);
  } catch (error) {
    console.error(`[Testimonials] Error triggering request for conversion ${conversionEventId}:`, error);
    return false;
  }
}

/**
 * Batch send testimonial requests to installers with recent conversions
 * Run this daily to catch any conversions that didn't trigger automatically
 */
export async function sendBatchTestimonialRequests() {
  const db = await getDb();
  if (!db) {
    console.error("[Testimonials] Database not available");
    return { sent: 0, failed: 0 };
  }

  try {
    // Get conversions from the last 7 days that haven't received testimonial requests
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { installers, leads } = await import("../drizzle/schema");
    const { gte } = await import("drizzle-orm");
    
    const recentConversions = await db
      .select()
      .from(conversionEvents)
      .where(gte(conversionEvents.createdAt, sevenDaysAgo));

    const results = {
      sent: 0,
      failed: 0,
    };

    for (const event of recentConversions) {
      // Get installer and lead details
      const installerResults = await db.select().from(installers).where(eq(installers.id, event.installerId)).limit(1);
      const installer = installerResults[0];
      
      const leadResults = await db.select().from(leads).where(eq(leads.id, event.leadId)).limit(1);
      const lead = leadResults[0];

      if (!installer || !lead) {
        results.failed++;
        continue;
      }

      const request: TestimonialRequest = {
        installerId: installer.id,
        installerName: installer.contactName,
        installerEmail: installer.email,
        leadId: lead.id,
        customerName: lead.customerName,
        dealValue: event.dealValue,
      };

      const success = await sendTestimonialRequest(request);
      if (success) {
        results.sent++;
      } else {
        results.failed++;
      }

      // Add delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    console.log(`[Testimonials] Batch send complete: ${results.sent} sent, ${results.failed} failed`);
    return results;
  } catch (error) {
    console.error("[Testimonials] Error in batch send:", error);
    return { sent: 0, failed: 0 };
  }
}
