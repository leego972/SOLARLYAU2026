import { sendEmail } from "./emailServiceGmail";

interface RecruitmentContact {
  firstName: string;
  companyName: string;
  email: string;
  location: string;
  state: string;
}

/**
 * Day 3 follow-up: Free lead offer
 */
export async function sendDay3FollowUp(contact: RecruitmentContact) {
  const subject = `Quick follow-up: Free lead for ${contact.companyName}`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <p>Hi ${contact.firstName},</p>
      
      <p>I sent you a note earlier this week about SolarlyAU's lead generation platform. I know you're busy running ${contact.companyName}, so I'll keep this brief.</p>
      
      <p><strong>I'd like to send you a free, fully-qualified solar lead this week</strong>—no signup required, no credit card, just a straight gift to demonstrate the quality.</p>
      
      <p>All I need is confirmation that you're open to receiving it. If the lead converts, great. If not, no harm done.</p>
      
      <p>Interested? Just reply to this email.</p>
      
      <p>Best regards,<br>
      The SolarlyAU Team<br>
      <a href="https://solar-lead-vwkzbmwb.manus.space">solar-lead-vwkzbmwb.manus.space</a></p>
    </div>
  `;

  try {
    await sendEmail({
      to: contact.email,
      subject,
      html,
    });
    console.log(`[Recruitment] Day 3 follow-up sent to ${contact.email}`);
    return true;
  } catch (error) {
    console.error(`[Recruitment] Failed to send Day 3 follow-up to ${contact.email}:`, error);
    return false;
  }
}

/**
 * Day 7 follow-up: Case study with real numbers
 */
export async function sendDay7FollowUp(contact: RecruitmentContact) {
  const subject = `Case study: 67% close rate on SolarlyAU leads`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <p>Hi ${contact.firstName},</p>
      
      <p>I wanted to share some real numbers from one of our installers who's been using the platform for 8 weeks:</p>
      
      <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <ul style="list-style: none; padding: 0;">
          <li style="margin: 8px 0;"><strong>12 leads purchased</strong> ($1,140 spent)</li>
          <li style="margin: 8px 0;"><strong>8 installations completed</strong> ($68,000 in revenue)</li>
          <li style="margin: 8px 0;"><strong>67% conversion rate</strong></li>
          <li style="margin: 8px 0;"><strong>Average deal size:</strong> $8,500</li>
          <li style="margin: 8px 0;"><strong>ROI:</strong> 59.6x</li>
        </ul>
      </div>
      
      <p><strong>The difference?</strong> These leads come pre-qualified by AI, with verified contact info and documented buying intent. No more cold calling or chasing ghosts.</p>
      
      <p>${contact.companyName} could be seeing similar results. Your first lead is still free if you'd like to test the quality.</p>
      
      <p>Worth a conversation?</p>
      
      <p>Best regards,<br>
      The SolarlyAU Team<br>
      <a href="https://solar-lead-vwkzbmwb.manus.space/installer/signup">Get Started →</a></p>
    </div>
  `;

  try {
    await sendEmail({
      to: contact.email,
      subject,
      html,
    });
    console.log(`[Recruitment] Day 7 follow-up sent to ${contact.email}`);
    return true;
  } catch (error) {
    console.error(`[Recruitment] Failed to send Day 7 follow-up to ${contact.email}:`, error);
    return false;
  }
}

/**
 * Day 14 follow-up: Final urgency message
 */
export async function sendDay14FollowUp(contact: RecruitmentContact) {
  const subject = `Last call: ${contact.state} installer slots filling up`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <p>Hi ${contact.firstName},</p>
      
      <p>This is my last outreach—I don't want to spam you.</p>
      
      <p><strong>We're down to our final installer slot in ${contact.state}</strong> before we pause new signups to maintain lead exclusivity. Once it's filled, there's typically a 4-6 week waitlist.</p>
      
      <p>If you've been on the fence about trying SolarlyAU, now's the time. Your first lead is still free, and you can cancel anytime if it doesn't work for ${contact.companyName}.</p>
      
      <p><strong>Let me know by Friday if you'd like to claim the spot.</strong></p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="https://solar-lead-vwkzbmwb.manus.space/installer/signup" 
           style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
          Claim Your Spot →
        </a>
      </div>
      
      <p>Cheers,<br>
      The SolarlyAU Team</p>
      
      <p style="font-size: 12px; color: #6b7280; margin-top: 30px;">
        P.S. If you're not interested, no worries—I won't reach out again. Thanks for your time.
      </p>
    </div>
  `;

  try {
    await sendEmail({
      to: contact.email,
      subject,
      html,
    });
    console.log(`[Recruitment] Day 14 follow-up sent to ${contact.email}`);
    return true;
  } catch (error) {
    console.error(`[Recruitment] Failed to send Day 14 follow-up to ${contact.email}:`, error);
    return false;
  }
}

/**
 * Schedule the complete follow-up sequence for a recruitment contact
 * This would typically be called after the initial outreach email is sent
 */
export async function scheduleRecruitmentFollowUpSequence(contact: RecruitmentContact) {
  // In a production system, you would use a job scheduler like Bull, Agenda, or AWS SQS
  // For now, we'll just log the scheduling
  console.log(`[Recruitment] Scheduling follow-up sequence for ${contact.email}`);
  console.log(`- Day 3: Free lead offer`);
  console.log(`- Day 7: Case study`);
  console.log(`- Day 14: Final urgency`);
  
  // TODO: Integrate with actual job scheduler
  // Example with Bull:
  // await emailQueue.add('recruitment-day3', { contact }, { delay: 3 * 24 * 60 * 60 * 1000 });
  // await emailQueue.add('recruitment-day7', { contact }, { delay: 7 * 24 * 60 * 60 * 1000 });
  // await emailQueue.add('recruitment-day14', { contact }, { delay: 14 * 24 * 60 * 60 * 1000 });
  
  return {
    success: true,
    message: `Follow-up sequence scheduled for ${contact.email}`,
  };
}

/**
 * Send initial recruitment email (Variant A, B, or C)
 */
export async function sendInitialRecruitmentEmail(
  contact: RecruitmentContact,
  variant: 'A' | 'B' | 'C' = 'A'
) {
  let subject: string;
  let html: string;

  if (variant === 'A') {
    // Value-First Approach
    subject = "Double your lead flow without lifting a finger";
    html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <p>Hi ${contact.firstName},</p>
        
        <p>I noticed ${contact.companyName} has built a solid reputation in ${contact.location}'s solar market. I'm reaching out because we've developed something that could significantly impact your bottom line.</p>
        
        <p><strong>SolarlyAU is Australia's first fully autonomous solar lead generation system.</strong> While you focus on installations, our AI handles everything from initial homeowner contact to qualification and delivery of purchase-ready leads directly to your dashboard.</p>
        
        <p><strong>What makes this different:</strong> Our leads come with verified phone numbers, email addresses, system size requirements, and monthly energy bills. No more chasing cold prospects or paying for leads that go nowhere.</p>
        
        <p><strong>The numbers:</strong> Our beta installers are seeing 40-60% conversion rates on purchased leads, with an average deal size of $8,500. At $50-$150 per lead, that's a 57x-170x ROI.</p>
        
        <p><strong>Your first lead is completely free</strong>—no credit card, no commitment. Just sign up, review the lead quality, and decide if it's worth continuing.</p>
        
        <p>Would you be open to a quick 10-minute call this week to see if this could work for ${contact.companyName}? I can show you exactly what the leads look like and how the system works.</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="https://solar-lead-vwkzbmwb.manus.space/installer/signup" 
             style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Claim Your Free Lead →
          </a>
        </div>
        
        <p>Best regards,<br>
        The SolarlyAU Team<br>
        <a href="https://solar-lead-vwkzbmwb.manus.space">solar-lead-vwkzbmwb.manus.space</a></p>
        
        <p style="font-size: 12px; color: #6b7280; margin-top: 30px;">
          P.S. We're currently onboarding 5 installers per week in ${contact.state}. Once your area is filled, we'll need to pause new signups to maintain lead exclusivity.
        </p>
      </div>
    `;
  } else if (variant === 'B') {
    // Problem-Solution Approach
    subject = "Tired of paying for solar leads that never convert?";
    html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <p>${contact.firstName},</p>
        
        <p>Quick question: How much are you currently spending on solar leads that either don't answer their phone, aren't serious about buying, or have already signed with someone else?</p>
        
        <p>If you're like most installers we talk to, it's probably 30-50% of your lead budget going straight down the drain.</p>
        
        <p><strong>Here's what we're doing differently at SolarlyAU:</strong></p>
        
        <p><strong>Pre-qualification happens before you pay.</strong> Our AI system engages homeowners through natural conversations, verifies their interest, collects system requirements, and only presents leads that are actively seeking quotes. You're not paying for tire-kickers or information gatherers.</p>
        
        <p><strong>Real-time delivery.</strong> The average lead in our marketplace sells within 4 hours. Why? Because these are people who filled out a form in the last 24-48 hours, not stale leads from three months ago being resold for the fifth time.</p>
        
        <p><strong>Transparent pricing.</strong> $50-$150 per lead based on system size and location. No monthly fees, no contracts, no minimum spend. Buy one lead or buy fifty—it's entirely up to you.</p>
        
        <p>${contact.companyName} has clearly built a strong business in ${contact.location}. I'd love to show you how we can help you scale without the usual headaches of lead generation.</p>
        
        <p><strong>Your first lead is free</strong>—I'll personally ensure it meets your standards before you spend a dollar.</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="https://solar-lead-vwkzbmwb.manus.space/installer/signup" 
             style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Get Your Free Lead →
          </a>
        </div>
        
        <p>Cheers,<br>
        The SolarlyAU Team<br>
        <a href="https://solar-lead-vwkzbmwb.manus.space">solar-lead-vwkzbmwb.manus.space</a></p>
      </div>
    `;
  } else {
    // Social Proof Approach
    subject = `How solar installers in ${contact.state} are closing 3 extra deals per month`;
    html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <p>Hi ${contact.firstName},</p>
        
        <p>I probably shouldn't be telling you this, but installers in ${contact.location} have been using our platform for the past few weeks and are now closing an additional 3-4 solar installations per month.</p>
        
        <p>They're not working harder. They're not spending more on marketing. They're just getting better leads.</p>
        
        <p><strong>SolarlyAU uses AI to autonomously generate, qualify, and deliver solar leads across Australia.</strong> The system runs 24/7, engages homeowners through natural conversations, and only charges you for leads that meet your specific criteria (system size, location, budget, timeline).</p>
        
        <p><strong>Here's what makes it work:</strong></p>
        
        <p>The leads are fresh (average age: 36 hours), verified (phone + email confirmation), and exclusive to your service area. When you purchase a lead, you get full contact details, property information, energy usage data, and conversation history—everything you need to close the deal on the first call.</p>
        
        <p>Our installers are seeing conversion rates 2-3x higher than traditional lead sources because the qualification work is already done. These aren't people researching solar panels for fun—they're homeowners who have already decided to buy and are actively comparing quotes.</p>
        
        <p><strong>I'd like to offer ${contact.companyName} your first lead completely free.</strong> No strings attached. Just see the quality for yourself and decide if it's worth continuing.</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="https://solar-lead-vwkzbmwb.manus.space/installer/signup" 
             style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Claim Your Free Lead →
          </a>
        </div>
        
        <p>Best,<br>
        The SolarlyAU Team<br>
        <a href="https://solar-lead-vwkzbmwb.manus.space">solar-lead-vwkzbmwb.manus.space</a></p>
        
        <p style="font-size: 12px; color: #6b7280; margin-top: 30px;">
          P.S. We limit installer density to maintain lead quality. Right now we have capacity for 2 more installers in ${contact.state} before we pause new signups.
        </p>
      </div>
    `;
  }

  try {
    await sendEmail({
      to: contact.email,
      subject,
      html,
    });
    console.log(`[Recruitment] Initial email (Variant ${variant}) sent to ${contact.email}`);
    
    // Schedule follow-up sequence
    await scheduleRecruitmentFollowUpSequence(contact);
    
    return true;
  } catch (error) {
    console.error(`[Recruitment] Failed to send initial email to ${contact.email}:`, error);
    return false;
  }
}
