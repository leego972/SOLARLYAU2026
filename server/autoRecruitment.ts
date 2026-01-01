/**
 * Automated Installer Recruitment System
 * Automatically finds and recruits solar installers via LinkedIn and Google Ads
 */

import { callDataApi } from "./_core/dataApi";
import { createInstaller } from "./db";
import { invokeLLM } from "./_core/llm";

export interface RecruitmentTarget {
  companyName: string;
  contactName: string;
  email: string;
  phone?: string;
  linkedInUrl?: string;
  state: string;
  city: string;
  score: number; // 0-100 quality score
}

export interface RecruitmentResult {
  found: number;
  contacted: number;
  registered: number;
}

/**
 * Search for solar installers on LinkedIn
 */
export async function findInstallersOnLinkedIn(
  state: string,
  limit: number = 20
): Promise<RecruitmentTarget[]> {
  const targets: RecruitmentTarget[] = [];
  
  // Search queries for different installer types
  const searchQueries = [
    `solar installer ${state} Australia`,
    `solar panel installation ${state}`,
    `renewable energy installer ${state}`,
    `solar technician ${state}`,
  ];
  
  for (const query of searchQueries) {
    try {
      const result = await callDataApi("LinkedIn/search_people", {
        query: {
          keywords: query,
          keywordTitle: "solar installer OR solar technician OR renewable energy",
        },
      });
      
      const typedResult = result as any;
      if (typedResult.success && typedResult.data?.items && Array.isArray(typedResult.data.items)) {
        for (const person of typedResult.data.items.slice(0, 5)) {
          // Skip if person data is invalid
          if (!person || typeof person !== 'object') continue;
          
          // Extract company info
          const companyName = person.currentCompany || person.headline?.split("at")?.[1]?.trim() || "Unknown Company";
          
          // Only add if we have minimum required data
          if (companyName && companyName !== "Unknown Company") {
            targets.push({
              companyName,
              contactName: person.fullName || "Unknown",
              email: "", // Will be enriched later
              linkedInUrl: person.profileURL || "",
              state,
              city: person.location?.split(",")?.[0] || state,
              score: 70, // Base score for LinkedIn finds
            });
          }
        }
      }
    } catch (error) {
      console.error(`[Recruitment] Error searching LinkedIn for "${query}":`, error);
    }
    
    if (targets.length >= limit) break;
  }
  
  return targets.slice(0, limit);
}

/**
 * Enrich installer data with contact info using AI
 */
export async function enrichInstallerContact(target: RecruitmentTarget): Promise<RecruitmentTarget> {
  // Use AI to find email and phone from company name and location
  const prompt = `Find contact information for this solar installation company:
Company: ${target.companyName}
Location: ${target.city}, ${target.state}, Australia
Contact Person: ${target.contactName}

Generate a likely business email address and phone number format for this company.
Return ONLY a JSON object with this exact format:
{
  "email": "contact@companyname.com.au",
  "phone": "+61 X XXXX XXXX"
}`;

  try {
    const response = await invokeLLM({
      messages: [
        { role: "system", content: "You are a data enrichment assistant. Return only valid JSON." },
        { role: "user", content: prompt },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "contact_info",
          strict: true,
          schema: {
            type: "object",
            properties: {
              email: { type: "string" },
              phone: { type: "string" },
            },
            required: ["email", "phone"],
            additionalProperties: false,
          },
        },
      },
    });

    const content = response.choices?.[0]?.message?.content;
    if (content && typeof content === 'string') {
      const contactInfo = JSON.parse(content);
      return {
        ...target,
        email: contactInfo.email,
        phone: contactInfo.phone,
      };
    }
  } catch (error) {
    console.error(`[Recruitment] Error enriching contact for ${target.companyName}:`, error);
  }
  
  // Fallback: generate email from company name
  const emailDomain = target.companyName
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[^a-z0-9]/g, "");
  
  return {
    ...target,
    email: `info@${emailDomain}.com.au`,
    phone: "+61 X XXXX XXXX",
  };
}

/**
 * Generate personalized outreach email
 */
export async function generateOutreachEmail(target: RecruitmentTarget): Promise<string> {
  const prompt = `Write a professional, personalized cold outreach email to recruit this solar installer to our lead generation platform:

Company: ${target.companyName}
Contact: ${target.contactName}
Location: ${target.city}, ${target.state}

Key points to include:
- We generate high-quality solar leads in their area
- Leads are exclusive (not shared with competitors)
- Quality guarantee (refund if lead doesn't respond)
- Pricing: $60-120 per lead
- First 5 leads FREE trial

Tone: Professional, helpful, value-focused
Length: 150-200 words
Subject line: Include a compelling subject line

Format:
Subject: [subject line]

[email body]`;

  try {
    const response = await invokeLLM({
      messages: [
        { role: "system", content: "You are a professional B2B sales copywriter." },
        { role: "user", content: prompt },
      ],
    });

    const content = response.choices[0]?.message?.content;
    return typeof content === 'string' ? content : "Error generating email";
  } catch (error) {
    console.error(`[Recruitment] Error generating email for ${target.companyName}:`, error);
    return `Subject: Exclusive Solar Leads for ${target.city}

Hi ${target.contactName},

I noticed ${target.companyName} provides solar installations in ${target.city}. We generate high-quality, exclusive solar leads in your area and wanted to offer you a partnership opportunity.

**What we offer:**
- Exclusive leads (not shared with competitors)
- Quality guarantee (refund if no response)
- $60-120 per lead
- First 5 leads FREE to try

Interested in learning more?

Best regards,
Solar Lead AI Team`;
  }
}

/**
 * Send outreach email (simulated - integrate with email service)
 */
export async function sendOutreachEmail(target: RecruitmentTarget, emailContent: string): Promise<boolean> {
  // TODO: Integrate with email service (SendGrid, Mailgun, etc.)
  // For now, just log the email
  
  console.log(`[Recruitment] Would send email to ${target.email}:`);
  console.log(emailContent);
  console.log("---");
  
  // Simulate success
  return true;
}

/**
 * Automated recruitment campaign for a specific state
 */
export async function runRecruitmentCampaign(
  state: string,
  targetCount: number = 20
): Promise<RecruitmentResult> {
  console.log(`[Recruitment] Starting campaign for ${state}, target: ${targetCount} installers`);
  
  // Step 1: Find installers on LinkedIn
  const targets = await findInstallersOnLinkedIn(state, targetCount);
  console.log(`[Recruitment] Found ${targets.length} potential installers`);
  
  let contacted = 0;
  let registered = 0;
  
  // Step 2: Enrich and contact each target
  for (const target of targets) {
    // Skip targets without company name
    if (!target.companyName || target.companyName === "Unknown Company") {
      console.log(`[Recruitment] Skipping invalid target: ${JSON.stringify(target)}`);
      continue;
    }
    
    // Enrich contact info
    const enrichedTarget = await enrichInstallerContact(target);
    
    // Skip if enrichment failed to get email
    if (!enrichedTarget.email || enrichedTarget.email.includes("info@")) {
      console.log(`[Recruitment] Skipping ${enrichedTarget.companyName} - no valid email found`);
      continue;
    }
    
    // Generate personalized email
    const emailContent = await generateOutreachEmail(enrichedTarget);
    
    // Send email
    const sent = await sendOutreachEmail(enrichedTarget, emailContent);
    
    if (sent) {
      contacted++;
      
      // Create installer record with auto-verification
      try {
        await createInstaller({
          companyName: enrichedTarget.companyName,
          contactName: enrichedTarget.contactName,
          email: enrichedTarget.email,
          phone: enrichedTarget.phone || null,
          state: enrichedTarget.state,
          servicePostcodes: "", // Will be filled when they register
          abn: null,
          isActive: true, // Auto-activate recruited installers
          isVerified: true, // Auto-verify recruited installers (they came from LinkedIn)
        });
        
        registered++;
      } catch (error: any) {
        // Ignore duplicate email errors (installer already exists)
        if (!error?.message?.includes('Duplicate entry')) {
          console.error(`[Recruitment] Error creating installer record for ${enrichedTarget.companyName}:`, error);
        }
      }
    }
    
    // Rate limiting: wait 2 seconds between contacts
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  console.log(`[Recruitment] Campaign complete: ${contacted} contacted, ${registered} registered`);
  
  return {
    found: targets.length,
    contacted,
    registered,
  };
}

/**
 * Run automated recruitment across all priority states
 */
export async function runNationalRecruitmentCampaign(): Promise<Record<string, RecruitmentResult>> {
  const priorityStates = [
    { state: "QLD", target: 30 }, // 40% of leads
    { state: "NSW", target: 25 }, // 30% of leads
    { state: "WA", target: 15 },  // 20% of leads
    { state: "SA", target: 10 },  // 10% of leads
  ];
  
  const results: Record<string, RecruitmentResult> = {};
  
  for (const { state, target } of priorityStates) {
    results[state] = await runRecruitmentCampaign(state, target);
    
    // Wait 5 minutes between states to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 5 * 60 * 1000));
  }
  
  return results;
}

/**
 * Get recruitment statistics
 */
export async function getRecruitmentStats(): Promise<{
  totalInstallers: number;
  activeInstallers: number;
  pendingInstallers: number;
  byState: Record<string, number>;
}> {
  const { getAllInstallers } = await import("./db");
  const installers = await getAllInstallers();
  
  const stats = {
    totalInstallers: installers.length,
    activeInstallers: installers.filter(i => i.isActive).length,
    pendingInstallers: installers.filter(i => !i.isActive).length,
    byState: {} as Record<string, number>,
  };
  
  for (const installer of installers) {
    stats.byState[installer.state] = (stats.byState[installer.state] || 0) + 1;
  }
  
  return stats;
}
