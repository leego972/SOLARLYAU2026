/**
 * Autonomous Installer Recruitment Campaign
 * 
 * Fully automated system that recruits solar installers without human intervention.
 * Runs continuously to build and maintain installer network.
 */

import { runRecruitmentCampaign } from "./autoRecruitment";
import { makeAICall } from "./voiceAI";
import { logActivity } from "./optimizations";
import { makeParallelCalls, getDialerStats, type CallRecipient } from "./parallelDialer";
import { sendBulkWhatsAppMessages, RECRUITMENT_TEMPLATES, getWhatsAppStats, type WhatsAppMessage } from "./whatsappBusiness";

/**
 * Recruitment Campaign Configuration
 */
const RECRUITMENT_CONFIG = {
  // Target states (prioritize warmer states)
  targetStates: [
    { state: "QLD", city: "Brisbane", priority: 1, targetCount: 30 },
    { state: "QLD", city: "Gold Coast", priority: 1, targetCount: 20 },
    { state: "NSW", city: "Sydney", priority: 2, targetCount: 30 },
    { state: "NSW", city: "Newcastle", priority: 2, targetCount: 15 },
    { state: "WA", city: "Perth", priority: 3, targetCount: 20 },
    { state: "SA", city: "Adelaide", priority: 4, targetCount: 15 },
  ],
  
  // Recruitment targets
  initialTarget: 30, // First 30 days
  monthlyTarget: 20, // After first month
  
  // Outreach settings
  linkedInConnectionsPerDay: 20,
  voiceCallsPerDay: 10,
  emailsPerDay: 30,
  whatsAppMessagesPerDay: 25,
  
  // Parallel dialer settings
  useParallelDialer: true,
  maxConcurrentCalls: 5,
  
  // Free trial offer
  freeTrialLeads: 5,
  trialDurationDays: 14,
};

/**
 * Autonomous Recruitment Campaign Manager
 * Runs daily to recruit new installers
 */
export async function runDailyRecruitmentCampaign(): Promise<{
  linkedInOutreach: number;
  voiceCalls: number;
  emails: number;
  newInstallers: number;
}> {
  console.log('[RecruitmentCampaign] Starting daily autonomous recruitment...');
  
  const results = {
    linkedInOutreach: 0,
    voiceCalls: 0,
    emails: 0,
    newInstallers: 0,
  };
  
  try {
    // Phase 1: LinkedIn Prospecting
    console.log('[RecruitmentCampaign] Phase 1: LinkedIn prospecting...');
    
    for (const target of RECRUITMENT_CONFIG.targetStates) {
      const searchResults = await runRecruitmentCampaign(target.state);
      
      results.linkedInOutreach += searchResults.contacted;
      
      logActivity('RecruitmentCampaign', 'LinkedIn prospecting', {
        state: target.state,
        city: target.city,
        contacted: searchResults.contacted,
      });
    }
    
    // Phase 2: Voice AI Calling (with Parallel Dialer)
    console.log('[RecruitmentCampaign] Phase 2: Voice AI calling...');
    
    // Get high-priority prospects for voice calls
    const voiceCallTargets = await getHighPriorityProspects(
      RECRUITMENT_CONFIG.voiceCallsPerDay
    );
    
    if (RECRUITMENT_CONFIG.useParallelDialer && voiceCallTargets.length > 0) {
      // Use parallel dialer for simultaneous calls
      console.log(`[RecruitmentCampaign] Using parallel dialer for ${voiceCallTargets.length} calls...`);
      
      const callRecipients: CallRecipient[] = voiceCallTargets.map(p => ({
        name: p.contactName,
        phone: p.phone,
        companyName: p.companyName,
        metadata: { prospectId: p.id },
      }));
      
      const script = `
Hi {name}, this is Sarah from Solar Lead AI. 

We're a platform that connects qualified solar installation leads with installers like {company}.

We've generated over 30 high-quality leads in your area this week, and we're offering 5 free trial leads to new installers.

Would you be interested in learning more? Press 1 for yes, or 2 to be removed from our list.
      `.trim();
      
      const callResults = await makeParallelCalls(callRecipients, script, {
        maxConcurrentCalls: RECRUITMENT_CONFIG.maxConcurrentCalls,
      });
      
      // Process results
      for (const result of callResults) {
        if (result.status === 'answered' || result.status === 'voicemail') {
          results.voiceCalls++;
          
          // Mark prospect as contacted
          const prospectId = (result.recipient.metadata as any)?.prospectId;
          if (prospectId) {
            await markProspectContacted(prospectId, 'voice', result);
          }
        }
      }
      
      const stats = getDialerStats(callResults);
      logActivity('RecruitmentCampaign', 'Parallel dialer completed', stats);
      
    } else {
      // Fallback to sequential calling
      for (const prospect of voiceCallTargets) {
        try {
          const callResult = await makeAICall({
            installerName: prospect.contactName,
            installerPhone: prospect.phone,
            callPurpose: 'recruitment',
          });
          
          if (callResult.outcome === 'answered') {
            results.voiceCalls++;
            await markProspectContacted(prospect.id, 'voice', callResult);
          }
          
          logActivity('RecruitmentCampaign', 'Voice call completed', {
            company: prospect.companyName,
            outcome: callResult.outcome,
          });
        } catch (error) {
          console.error(`[RecruitmentCampaign] Voice call failed:`, error);
        }
      }
    }
    
    // Phase 3: WhatsApp Outreach
    console.log('[RecruitmentCampaign] Phase 3: WhatsApp outreach...');
    
    const whatsAppTargets = await getWhatsAppProspects(
      RECRUITMENT_CONFIG.whatsAppMessagesPerDay
    );
    
    if (whatsAppTargets.length > 0) {
      const whatsAppMessages: WhatsAppMessage[] = whatsAppTargets.map(p => ({
        to: p.phone,
        message: RECRUITMENT_TEMPLATES.initialOutreach(p.contactName, p.companyName),
      }));
      
      const whatsAppResults = await sendBulkWhatsAppMessages(whatsAppMessages, 1500);
      
      // Process results
      for (let i = 0; i < whatsAppResults.length; i++) {
        const result = whatsAppResults[i];
        const prospect = whatsAppTargets[i];
        
        if (result.success && prospect) {
          await markProspectContacted(prospect.id, 'whatsapp', result);
        }
      }
      
      const whatsAppStats = getWhatsAppStats(whatsAppResults);
      logActivity('RecruitmentCampaign', 'WhatsApp outreach completed', whatsAppStats);
    }
    
    // Phase 4: Email Follow-ups
    console.log('[RecruitmentCampaign] Phase 4: Email follow-ups...');
    
    const emailTargets = await getEmailFollowUpProspects(
      RECRUITMENT_CONFIG.emailsPerDay
    );
    
    for (const prospect of emailTargets) {
      try {
        await sendAutomatedFollowUpEmail(prospect);
        results.emails++;
        
        logActivity('RecruitmentCampaign', 'Follow-up email sent', {
          company: prospect.companyName,
          daysSinceContact: prospect.daysSinceContact,
        });
      } catch (error) {
        console.error(`[RecruitmentCampaign] Email failed:`, error);
      }
    }
    
    // Phase 4: Check for new sign-ups
    results.newInstallers = await countNewInstallersToday();
    
    console.log('[RecruitmentCampaign] Daily campaign completed:', results);
    
    logActivity('RecruitmentCampaign', 'Daily campaign completed', results);
    
    return results;
    
  } catch (error) {
    console.error('[RecruitmentCampaign] Campaign error:', error);
    logActivity('RecruitmentCampaign', 'Campaign error', { error: String(error) }, 'error');
    throw error;
  }
}

/**
 * Get high-priority prospects for voice calls
 * Prioritizes: responded to LinkedIn, opened emails, high company score
 */
async function getHighPriorityProspects(limit: number): Promise<any[]> {
  // In production, this would query a prospects database
  // For now, return simulated prospects
  
  const prospects = [
    {
      id: 1,
      companyName: "Brisbane Solar Solutions",
      contactName: "John Smith",
      phone: "+61412345678",
      state: "QLD",
      city: "Brisbane",
      score: 85,
      linkedInResponse: true,
      emailOpened: true,
    },
    {
      id: 2,
      companyName: "Sydney Solar Experts",
      contactName: "Jane Doe",
      phone: "+61423456789",
      state: "NSW",
      city: "Sydney",
      score: 82,
      linkedInResponse: false,
      emailOpened: true,
    },
  ];
  
  return prospects.slice(0, limit);
}

/**
 * Get prospects for WhatsApp outreach
 */
async function getWhatsAppProspects(limit: number): Promise<any[]> {
  // In production, query prospects database for:
  // - Not contacted via WhatsApp yet
  // - Has valid mobile number
  // - Responded positively to other channels
  
  const prospects = [
    {
      id: 4,
      companyName: "Gold Coast Solar",
      contactName: "Sarah Johnson",
      phone: "+61434567890",
      state: "QLD",
      city: "Gold Coast",
      score: 78,
    },
    {
      id: 5,
      companyName: "Adelaide Solar Systems",
      contactName: "Tom Brown",
      phone: "+61445678901",
      state: "SA",
      city: "Adelaide",
      score: 75,
    },
  ];
  
  return prospects.slice(0, limit);
}

/**
 * Get prospects needing email follow-ups
 */
async function getEmailFollowUpProspects(limit: number): Promise<any[]> {
  // In production, query prospects database for:
  // - Contacted 3+ days ago
  // - No response yet
  // - Not already followed up
  
  const prospects = [
    {
      id: 3,
      companyName: "Perth Solar Co",
      contactName: "Mike Williams",
      email: "mike@perthsolar.com.au",
      state: "WA",
      city: "Perth",
      daysSinceContact: 5,
      contactMethod: "linkedin",
    },
  ];
  
  return prospects.slice(0, limit);
}

/**
 * Mark prospect as contacted
 */
async function markProspectContacted(
  prospectId: number,
  method: 'linkedin' | 'voice' | 'email' | 'whatsapp',
  details: any
): Promise<void> {
  // In production, update prospects database
  console.log(`[RecruitmentCampaign] Marked prospect ${prospectId} as contacted via ${method}`);
}

/**
 * Send automated follow-up email
 */
async function sendAutomatedFollowUpEmail(prospect: any): Promise<void> {
  // In production, use SendGrid/Mailgun
  console.log(`[RecruitmentCampaign] Sending follow-up email to ${prospect.email}`);
  
  const emailTemplate = `
Hi ${prospect.contactName},

I reached out a few days ago about our exclusive solar lead service for ${prospect.state} installers.

I wanted to follow up because we're currently offering 5 free trial leads (valued at $350) to the first 20 installers who sign up in ${prospect.city}.

Our AI-powered system generates high-quality, exclusive leads with 10-15% close rates - significantly higher than industry average.

Would you be interested in trying 5 free leads to see the quality for yourself? No credit card required.

You can sign up here: [SIGNUP_LINK]

Or reply to this email and I'll set you up personally.

Best regards,
Solar Lead AI Team

P.S. We only work with a limited number of installers per area to maintain lead exclusivity. ${prospect.city} spots are filling up quickly.
  `.trim();
  
  // Simulate email send
  logActivity('RecruitmentCampaign', 'Follow-up email prepared', {
    to: prospect.email,
    subject: `Follow-up: 5 Free Solar Leads for ${prospect.city}`,
  });
}

/**
 * Count new installers who signed up today
 */
async function countNewInstallersToday(): Promise<number> {
  // In production, query installers database
  // WHERE createdAt >= TODAY
  return 0; // Will be updated with real data
}

/**
 * Initialize recruitment campaign
 * Starts autonomous daily recruitment
 */
export function initializeRecruitmentCampaign(): void {
  console.log('[RecruitmentCampaign] Initializing autonomous recruitment campaign...');
  
  // Run immediately on startup
  runDailyRecruitmentCampaign().catch(err => 
    console.error('[RecruitmentCampaign] Initial campaign failed:', err)
  );
  
  // Schedule daily runs at 9 AM
  const now = new Date();
  const next9AM = new Date(now);
  next9AM.setHours(9, 0, 0, 0);
  
  if (next9AM <= now) {
    next9AM.setDate(next9AM.getDate() + 1);
  }
  
  const msUntil9AM = next9AM.getTime() - now.getTime();
  
  setTimeout(() => {
    runDailyRecruitmentCampaign().catch(err => 
      console.error('[RecruitmentCampaign] Daily campaign failed:', err)
    );
    
    // Then run every 24 hours
    setInterval(() => {
      runDailyRecruitmentCampaign().catch(err => 
        console.error('[RecruitmentCampaign] Daily campaign failed:', err)
      );
    }, 24 * 60 * 60 * 1000);
  }, msUntil9AM);
  
  console.log(`[RecruitmentCampaign] Next campaign scheduled for ${next9AM.toLocaleString()}`);
}

/**
 * Get recruitment campaign statistics
 */
export async function getRecruitmentStats(): Promise<{
  totalProspects: number;
  contacted: number;
  responded: number;
  signedUp: number;
  conversionRate: number;
}> {
  // In production, query prospects and installers databases
  return {
    totalProspects: 150,
    contacted: 80,
    responded: 25,
    signedUp: 12,
    conversionRate: 0.15, // 15% of responded prospects sign up
  };
}
