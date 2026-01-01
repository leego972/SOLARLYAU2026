#!/usr/bin/env tsx
/**
 * Hybrid LinkedIn + Email Outreach Campaign
 * 
 * This script runs the complete recruitment workflow:
 * 1. Discovers decision-makers via LinkedIn API
 * 2. Sends personalized emails with bounce handling
 * 3. Generates LinkedIn connection requests for manual sending
 * 4. Saves all results to files for tracking
 */

import { runMultiCompanyOutreach } from "./server/linkedInOutreachSystem";
import { writeFileSync } from "fs";
import { ENV } from "./server/_core/env";

// Import email sending function
async function sendEmail(options: {
  to: string;
  subject: string;
  html: string;
}): Promise<any> {
  // Use Gmail API or SendGrid
  const nodemailer = await import("nodemailer");
  
  const transporter = nodemailer.createTransporter({
    service: "gmail",
    auth: {
      user: ENV.gmailUser,
      pass: ENV.gmailAppPassword,
    },
  });

  try {
    const info = await transporter.sendMail({
      from: `"SolarlyAU" <${ENV.gmailUser}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
    });

    console.log(`✓ Email sent to ${options.to}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`✗ Email failed to ${options.to}:`, error);
    throw error;
  }
}

// Target companies list
const targetCompanies = [
  { name: "Solar Depot", email: "info@solardepot.com.au" },
  { name: "Energy Matters", email: "info@energymatters.com.au" },
  { name: "Natural Solar", email: "sales@naturalsolar.com.au" },
  { name: "Solar Bright", email: "info@solarbright.com.au" },
  { name: "Sunboost Solar", email: "info@sunboostsolar.com.au" },
  { name: "Solar Warehouse", email: "sales@solarwarehouse.com.au" },
  { name: "Adelaide Solar Power", email: "lisa@adelaidesolarpower.com.au" },
  { name: "Solar Choice", email: "info@solarchoice.net.au" },
  { name: "Infinite Energy", email: "info@infiniteenergy.com.au" },
  { name: "Solar Naturally", email: "info@solarnaturally.com.au" },
  { name: "Solaray Energy", email: "info@solarayenergy.com.au" },
  { name: "Solar Run", email: "info@solarrun.com.au" },
  { name: "MC Electrical", email: "info@mcelectrical.com.au" },
  { name: "Solargain", email: "info@solargain.com.au" },
  { name: "Captain Green Solar", email: "info@captaingreensolar.com.au" },
  { name: "Solar Market", email: "info@solarmarket.com.au" },
  { name: "Skylight Solar", email: "info@skylightsolar.com.au" },
  { name: "GI Energy", email: "info@gienergy.com.au" },
];

async function main() {
  console.log("=".repeat(60));
  console.log("HYBRID LINKEDIN + EMAIL OUTREACH CAMPAIGN");
  console.log("=".repeat(60));
  console.log(`\nTargeting ${targetCompanies.length} solar companies...`);
  console.log("This will:");
  console.log("  1. Find decision-makers on LinkedIn");
  console.log("  2. Send personalized emails");
  console.log("  3. Generate LinkedIn connection requests");
  console.log("\n" + "=".repeat(60) + "\n");

  try {
    const results = await runMultiCompanyOutreach(targetCompanies, sendEmail);

    // Save detailed results to JSON
    const resultsFile = `/home/ubuntu/solar-lead-ai/outreach_results_${Date.now()}.json`;
    writeFileSync(resultsFile, JSON.stringify(results, null, 2));
    console.log(`\n✓ Detailed results saved to: ${resultsFile}`);

    // Generate LinkedIn connection requests file
    const linkedInRequests = results.campaigns
      .filter((c) => c.contacts.length > 0)
      .map((campaign) => {
        return {
          company: campaign.companyName,
          contacts: campaign.contacts.map((contact, index) => {
            const variant = (["A", "B", "C"] as const)[index % 3];
            const templates = {
              A: `Hi ${contact.firstName}, I help solar installers like ${contact.company} get 10-15 exclusive leads per week. Our clients close 60% at $12K+ average deal size. Would love to share how we're helping installers scale. Worth a quick chat?`,
              B: `${contact.firstName}, saw ${contact.company} on LinkedIn. We're helping 12+ Australian solar installers generate $180K+ in 90 days through exclusive lead generation. Happy to show you how it works if you're interested in scaling.`,
              C: `Hi ${contact.firstName}, most solar installers struggle with inconsistent lead flow. We solve this with 10-15 exclusive, pre-qualified leads weekly. Our clients close 55-65%. Would you be open to learning more about ${contact.company}'s growth?`,
            };

            return {
              name: contact.fullName,
              title: contact.title,
              linkedInUrl: contact.linkedInUrl,
              connectionRequest: templates[variant],
            };
          }),
        };
      });

    const linkedInFile = `/home/ubuntu/solar-lead-ai/linkedin_connections_${Date.now()}.json`;
    writeFileSync(linkedInFile, JSON.stringify(linkedInRequests, null, 2));
    console.log(`✓ LinkedIn connection requests saved to: ${linkedInFile}`);

    // Generate human-readable summary
    const summary = `
# Hybrid Outreach Campaign Results
Generated: ${new Date().toLocaleString()}

## Summary
- **Total Companies:** ${results.campaigns.length}
- **Emails Sent:** ${results.totalEmailsSent}
- **Emails Delivered:** ${results.totalEmailsDelivered}
- **Emails Bounced:** ${results.totalEmailsBounced}
- **LinkedIn Connections Generated:** ${results.totalLinkedInConnections}

## Delivery Rate
- **Success Rate:** ${((results.totalEmailsDelivered / results.totalEmailsSent) * 100).toFixed(1)}%
- **Bounce Rate:** ${((results.totalEmailsBounced / results.totalEmailsSent) * 100).toFixed(1)}%

## Next Steps
1. **Check Email Responses:** Monitor your inbox for replies from installers
2. **Send LinkedIn Connections:** Use the generated connection requests in \`${linkedInFile}\`
3. **Follow Up:** Send follow-up emails to non-responders after 3 days
4. **Track Conversions:** Monitor which companies sign up via the platform

## Campaign Details

${results.campaigns
  .map(
    (c) => `
### ${c.companyName}
- Email: ${c.companyEmail}
- Email Status: ${c.emailsDelivered ? "✓ Delivered" : "✗ Bounced"}
- LinkedIn Contacts Found: ${c.contacts.length}
${c.contacts.map((contact) => `  - ${contact.fullName} (${contact.title})`).join("\n")}
`
  )
  .join("\n")}
`;

    const summaryFile = `/home/ubuntu/solar-lead-ai/outreach_summary_${Date.now()}.md`;
    writeFileSync(summaryFile, summary);
    console.log(`✓ Human-readable summary saved to: ${summaryFile}`);

    console.log("\n" + "=".repeat(60));
    console.log("CAMPAIGN COMPLETE!");
    console.log("=".repeat(60));
    console.log(`\nNext steps:`);
    console.log(`1. Review summary: ${summaryFile}`);
    console.log(`2. Send LinkedIn connections: ${linkedInFile}`);
    console.log(`3. Monitor email responses in your inbox`);
    console.log(`4. Follow up with non-responders in 3 days\n`);
  } catch (error) {
    console.error("\n✗ Campaign failed:", error);
    process.exit(1);
  }
}

main();
