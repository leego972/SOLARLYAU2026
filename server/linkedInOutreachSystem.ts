import { callDataApi } from "./_core/dataApi";
import { getDb } from "./db";
import { sendEmailWithRetry } from "./emailBounceHandler";

/**
 * LinkedIn Discovery + Email Outreach System
 * 
 * Finds decision-makers at target solar companies via LinkedIn API,
 * then sends personalized emails with bounce handling.
 */

interface LinkedInContact {
  firstName: string;
  lastName: string;
  fullName: string;
  title: string;
  company: string;
  linkedInUrl: string;
  linkedInUsername: string;
  location: string;
}

interface OutreachCampaign {
  companyName: string;
  companyEmail: string;
  contacts: LinkedInContact[];
  emailsSent: number;
  emailsDelivered: number;
  emailsBounced: number;
  linkedInConnectionsGenerated: number;
}

/**
 * Find decision-makers at a company using LinkedIn People Search
 */
export async function findCompanyDecisionMakers(
  companyName: string,
  titles: string[] = ["Owner", "Director", "Sales Manager", "General Manager"]
): Promise<LinkedInContact[]> {
  const contacts: LinkedInContact[] = [];

  for (const title of titles) {
    try {
      const result = await callDataApi("LinkedIn/search_people", {
        query: {
          keywords: "solar",
          company: companyName,
          keywordTitle: title,
        },
      });

      if ((result as any).success && (result as any).data?.items) {
        for (const person of (result as any).data.items.slice(0, 3)) {
          // Limit to top 3 per title
          contacts.push({
            firstName: person.firstName || person.fullName?.split(" ")[0] || "",
            lastName: person.lastName || person.fullName?.split(" ").slice(1).join(" ") || "",
            fullName: person.fullName || "",
            title: person.headline || title,
            company: companyName,
            linkedInUrl: person.profileURL || "",
            linkedInUsername: person.username || "",
            location: person.location || "",
          });
        }
      }

      // Rate limiting: wait 2 seconds between API calls
      await new Promise((resolve) => setTimeout(resolve, 2000));
    } catch (error) {
      console.error(`Error searching for ${title} at ${companyName}:`, error);
    }
  }

  return contacts;
}

/**
 * Generate personalized email using LinkedIn data
 */
function generatePersonalizedEmail(
  contact: LinkedInContact,
  companyEmail: string,
  template: "A" | "B" = "A"
): { subject: string; html: string } {
  const { firstName, company: companyName, title, location } = contact;
  const city = location.split(",")[0]?.trim() || "your area";

  if (template === "A") {
    return {
      subject: `${firstName}, exclusive solar leads for ${companyName}`,
      html: `
        <p>Hi ${firstName},</p>
        
        <p>I came across ${companyName} on LinkedIn and noticed you're ${title} - impressive work in the ${city} solar market.</p>
        
        <p>I'm reaching out because we're helping Australian solar installers like ${companyName} scale with exclusive, pre-qualified leads.</p>
        
        <p><strong>Quick stats from our installers:</strong></p>
        <ul>
          <li>55-65% average conversion rate</li>
          <li>$12-15K average deal size</li>
          <li>10-15 exclusive leads per week</li>
          <li>No competition (leads aren't sold to multiple installers)</li>
        </ul>
        
        <p><strong>Your first lead is FREE.</strong> No credit card required - just see the quality for yourself.</p>
        
        <p>If you're interested in consistent, high-quality leads for ${companyName}, I can set up your account in 5 minutes. Just reply "interested" and I'll send you the details.</p>
        
        <p>Best regards,<br>
        SolarlyAU Team</p>
        
        <p><em>P.S. We're limiting to 3 installers per region. Currently 2 spots left in ${city}.</em></p>
      `,
    };
  } else {
    return {
      subject: `15+ exclusive solar leads/week for ${companyName}`,
      html: `
        <p>${firstName},</p>
        
        <p>Straight to the point: SolarlyAU delivers 10-15 exclusive, pre-qualified solar leads per week to installers in ${city}.</p>
        
        <p><strong>Why ${companyName} should care:</strong></p>
        <ul>
          <li>Exclusive leads (not sold to competitors)</li>
          <li>Pre-qualified (budget + timeline confirmed)</li>
          <li>High conversion (our installers average 55-65%)</li>
          <li>Large deals ($12-15K average)</li>
        </ul>
        
        <p><strong>Proof it works:</strong></p>
        <ul>
          <li>Solar Bright (Melbourne): 320% ROI, 60% conversion</li>
          <li>Sunboost Solar (Gold Coast): $180K in 90 days</li>
          <li>Solar Warehouse (Sydney): $15K avg deal size</li>
        </ul>
        
        <p><strong>Your first lead is FREE.</strong> Test the quality with zero risk.</p>
        
        <p>Want to see a sample lead from ${city}? Reply and I'll send one over.</p>
        
        <p>Best,<br>
        SolarlyAU Team</p>
      `,
    };
  }
}

/**
 * Generate LinkedIn connection request message
 */
export function generateLinkedInConnectionRequest(
  contact: LinkedInContact,
  variant: "A" | "B" | "C" = "A"
): string {
  const { firstName, company } = contact;

  const templates = {
    A: `Hi ${firstName}, I help solar installers like ${company} get 10-15 exclusive leads per week. Our clients close 60% at $12K+ average deal size. Would love to share how we're helping installers scale. Worth a quick chat?`,
    B: `${firstName}, saw ${company} on LinkedIn. We're helping 12+ Australian solar installers generate $180K+ in 90 days through exclusive lead generation. Happy to show you how it works if you're interested in scaling.`,
    C: `Hi ${firstName}, most solar installers struggle with inconsistent lead flow. We solve this with 10-15 exclusive, pre-qualified leads weekly. Our clients close 55-65%. Would you be open to learning more about ${company}'s growth?`,
  };

  return templates[variant];
}

/**
 * Run outreach campaign for a single company
 */
export async function runCompanyOutreachCampaign(
  companyName: string,
  companyEmail: string,
  sendEmailFn: (options: { to: string; subject: string; html: string }) => Promise<any>
): Promise<OutreachCampaign> {
  console.log(`Starting outreach campaign for ${companyName}...`);

  // Step 1: Find decision-makers on LinkedIn
  const contacts = await findCompanyDecisionMakers(companyName);
  console.log(`Found ${contacts.length} decision-makers at ${companyName}`);

  if (contacts.length === 0) {
    console.log(`No contacts found for ${companyName}, using generic email`);
    // Fallback to generic email if no LinkedIn contacts found
    const genericEmail = {
      subject: `Exclusive solar leads for ${companyName}`,
      html: `
        <p>Hi,</p>
        
        <p>We're helping Australian solar installers scale with exclusive, pre-qualified leads.</p>
        
        <p><strong>Quick stats:</strong></p>
        <ul>
          <li>55-65% average conversion rate</li>
          <li>$12-15K average deal size</li>
          <li>10-15 exclusive leads per week</li>
        </ul>
        
        <p><strong>Your first lead is FREE.</strong></p>
        
        <p>Reply "interested" to learn more.</p>
        
        <p>Best,<br>SolarlyAU Team</p>
      `,
    };

    const result = await sendEmailWithRetry({
      to: companyEmail,
      subject: genericEmail.subject,
      html: genericEmail.html,
      sendEmailFn,
    });

    return {
      companyName,
      companyEmail,
      contacts: [],
      emailsSent: 1,
      emailsDelivered: result.delivered ? 1 : 0,
      emailsBounced: result.bounced ? 1 : 0,
      linkedInConnectionsGenerated: 0,
    };
  }

  // Step 2: Send personalized emails to top contact
  const topContact = contacts[0];
  const { subject, html } = generatePersonalizedEmail(topContact, companyEmail, "A");

  const emailResult = await sendEmailWithRetry({
    to: companyEmail,
    subject,
    html,
    sendEmailFn,
  });

  console.log(
    `Email to ${companyName}: ${emailResult.delivered ? "delivered" : "bounced"}`
  );

  // Step 3: Generate LinkedIn connection requests for all contacts
  const linkedInMessages = contacts.map((contact, index) => {
    const variant = (["A", "B", "C"] as const)[index % 3];
    return {
      contact,
      message: generateLinkedInConnectionRequest(contact, variant),
    };
  });

  // Save LinkedIn connection requests to file for manual sending
  console.log(`Generated ${linkedInMessages.length} LinkedIn connection requests`);

  return {
    companyName,
    companyEmail,
    contacts,
    emailsSent: 1,
    emailsDelivered: emailResult.delivered ? 1 : 0,
    emailsBounced: emailResult.bounced ? 1 : 0,
    linkedInConnectionsGenerated: linkedInMessages.length,
  };
}

/**
 * Run outreach campaign for multiple companies
 */
export async function runMultiCompanyOutreach(
  companies: Array<{ name: string; email: string }>,
  sendEmailFn: (options: { to: string; subject: string; html: string }) => Promise<any>
): Promise<{
  campaigns: OutreachCampaign[];
  totalEmailsSent: number;
  totalEmailsDelivered: number;
  totalEmailsBounced: number;
  totalLinkedInConnections: number;
}> {
  const campaigns: OutreachCampaign[] = [];

  for (const company of companies) {
    try {
      const campaign = await runCompanyOutreachCampaign(
        company.name,
        company.email,
        sendEmailFn
      );
      campaigns.push(campaign);

      // Rate limiting: wait 5 seconds between companies
      await new Promise((resolve) => setTimeout(resolve, 5000));
    } catch (error) {
      console.error(`Error running campaign for ${company.name}:`, error);
      campaigns.push({
        companyName: company.name,
        companyEmail: company.email,
        contacts: [],
        emailsSent: 0,
        emailsDelivered: 0,
        emailsBounced: 0,
        linkedInConnectionsGenerated: 0,
      });
    }
  }

  const summary = {
    campaigns,
    totalEmailsSent: campaigns.reduce((sum, c) => sum + c.emailsSent, 0),
    totalEmailsDelivered: campaigns.reduce((sum, c) => sum + c.emailsDelivered, 0),
    totalEmailsBounced: campaigns.reduce((sum, c) => sum + c.emailsBounced, 0),
    totalLinkedInConnections: campaigns.reduce(
      (sum, c) => sum + c.linkedInConnectionsGenerated,
      0
    ),
  };

  console.log("\n=== Outreach Campaign Summary ===");
  console.log(`Total companies: ${campaigns.length}`);
  console.log(`Emails sent: ${summary.totalEmailsSent}`);
  console.log(`Emails delivered: ${summary.totalEmailsDelivered}`);
  console.log(`Emails bounced: ${summary.totalEmailsBounced}`);
  console.log(`LinkedIn connections generated: ${summary.totalLinkedInConnections}`);

  return summary;
}
