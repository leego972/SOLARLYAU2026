import { invokeLLM } from "./_core/llm";
import { getAllInstallers, getInstallerById } from './db';
import { makeAICall } from "./voiceAI";
import type { Installer } from "../drizzle/schema";

/**
 * Autonomous Relationship Management System
 * Eliminates manual relationship building through AI-powered engagement
 */

interface RelationshipHealth {
  score: number;
  needsAttention: boolean;
  churnRisk: number;
  recentActivity: Record<string, any>;
  concerns: string[];
}

interface RetentionOffer {
  type: string;
  value: string;
  message: string;
  expiresIn: string;
}

/**
 * Autonomous installer engagement
 * Proactively reaches out to installers to maintain relationships
 */
export async function autonomousRelationshipManagement(): Promise<void> {
  const installers = await getAllInstallers();

  for (const installer of installers) {
    const relationship = await analyzeRelationshipHealth(installer);

    if (relationship.needsAttention) {
      // AI generates personalized outreach
      const message = await generatePersonalizedMessage(installer, relationship);

      // Send via preferred contact method
      if (installer.phone) {
        await makeAICall({
          installerPhone: installer.phone,
          installerName: installer.contactName,
          callPurpose: 'follow_up'
        });
      } else {
        // Send email (simulated for now)
        console.log('[AutonomousRelationships] Sending email to', installer.email, ':', message);
      }
    }

    // Autonomous retention strategy
    if (relationship.churnRisk > 0.7) {
      const retentionOffer = await generateRetentionOffer(installer, relationship);
      await sendRetentionOffer(installer, retentionOffer);
    }

    // Request feedback if installer has been active
    if (relationship.recentActivity.leadsPurchased > 5) {
      await requestFeedback(installer);
    }
  }
}

async function analyzeRelationshipHealth(installer: Installer): Promise<RelationshipHealth> {
  // Analyze installer activity and engagement
  // TODO: Query database for actual activity data
  const recentActivity = {
    leadsPurchased: Math.floor(Math.random() * 20),
    lastPurchaseDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
    acceptanceRate: Math.random(),
    avgResponseTime: Math.floor(Math.random() * 24),
    refundRate: Math.random() * 0.3
  };

  const daysSinceLastPurchase = Math.floor(
    (Date.now() - recentActivity.lastPurchaseDate.getTime()) / (24 * 60 * 60 * 1000)
  );

  // Calculate relationship health score
  let score = 100;
  let concerns: string[] = [];
  
  if (daysSinceLastPurchase > 14) {
    score -= 30;
    concerns.push('No recent purchases');
  }
  if (recentActivity.acceptanceRate < 0.3) {
    score -= 20;
    concerns.push('Low acceptance rate');
  }
  if (recentActivity.refundRate > 0.2) {
    score -= 25;
    concerns.push('High refund rate');
  }
  if (recentActivity.avgResponseTime > 12) {
    score -= 15;
    concerns.push('Slow response time');
  }

  // Calculate churn risk
  const churnRisk = Math.max(0, Math.min(1, (100 - score) / 100));

  return {
    score: Math.max(0, score),
    needsAttention: score < 70 || daysSinceLastPurchase > 14,
    churnRisk,
    recentActivity,
    concerns
  };
}

async function generatePersonalizedMessage(
  installer: Installer,
  relationship: RelationshipHealth
): Promise<string> {
  const response = await invokeLLM({
    messages: [{
      role: 'system',
      content: 'You are a friendly relationship manager for a solar lead generation business. Write warm, personalized check-in messages to installers. Be conversational, empathetic, and helpful. Keep messages under 150 words.'
    }, {
      role: 'user',
      content: `Write a check-in message for this installer:

Company: ${installer.companyName}
Contact: ${installer.contactName}

Recent Activity:
- Leads purchased: ${relationship.recentActivity.leadsPurchased}
- Last purchase: ${Math.floor((Date.now() - relationship.recentActivity.lastPurchaseDate.getTime()) / (24 * 60 * 60 * 1000))} days ago
- Acceptance rate: ${Math.round(relationship.recentActivity.acceptanceRate * 100)}%

Concerns:
${relationship.concerns.join('\n')}

Write a friendly check-in message that addresses these concerns naturally.`
    }]
  });

  const content = response.choices[0]?.message?.content;
  return typeof content === 'string' ? content : 'Hi! Just checking in to see how things are going. Let me know if you need anything!';
}

async function generateRetentionOffer(
  installer: Installer,
  relationship: RelationshipHealth
): Promise<RetentionOffer> {
  const response = await invokeLLM({
    messages: [{
      role: 'system',
      content: 'You are a retention specialist. Create compelling offers to retain at-risk installers. Offers should be valuable but sustainable for the business.'
    }, {
      role: 'user',
      content: `This installer has ${Math.round(relationship.churnRisk * 100)}% churn risk.

Concerns:
${relationship.concerns.join('\n')}

Create a retention offer that addresses their concerns and incentivizes continued engagement.`
    }],
    response_format: {
      type: 'json_schema',
      json_schema: {
        name: 'retention_offer',
        strict: true,
        schema: {
          type: 'object',
          properties: {
            type: { type: 'string' },
            value: { type: 'string' },
            message: { type: 'string' },
            expiresIn: { type: 'string' }
          },
          required: ['type', 'value', 'message', 'expiresIn'],
          additionalProperties: false
        }
      }
    }
  });

  const content = response.choices[0]?.message?.content;
  if (typeof content !== 'string') {
    throw new Error('Invalid LLM response');
  }

  return JSON.parse(content);
}

async function sendRetentionOffer(installer: Installer, offer: RetentionOffer): Promise<void> {
  console.log('[AutonomousRelationships] Sending retention offer to', installer.companyName, ':', offer);
  
  // Send email (simulated for now)
  console.log('[AutonomousRelationships] Sending email to', installer.email, ':', offer.message);
}

async function requestFeedback(installer: Installer): Promise<void> {
  console.log('[AutonomousRelationships] Requesting feedback from', installer.companyName);
  
  // TODO: Implement feedback request
}

/**
 * Autonomous feedback collection and analysis
 * Gathers feedback after lead sales and acts on insights
 */
export async function autonomousFeedbackLoop(): Promise<void> {
  // Get recently sold leads (7 days ago)
  const recentLeads = await getRecentlySoldLeads();

  for (const lead of recentLeads) {
    // AI calls installer to get feedback
    const feedback = await collectFeedback(lead.installerId, lead.id);

    if (feedback) {
      // AI analyzes feedback and takes action
      const analysis = await analyzeFeedback(feedback);

      if (analysis.qualityIssue) {
        await adjustLeadGenerationParameters(analysis.suggestions);
      }

      if (analysis.sentiment === 'positive' && analysis.testimonialWorthy) {
        await requestTestimonial(lead.installerId);
      }
    }
  }
}

async function getRecentlySoldLeads(): Promise<Array<{ id: number; installerId: number; daysSinceSold: number }>> {
  // TODO: Query database for leads sold 7 days ago
  return [];
}

async function collectFeedback(installerId: number, leadId: number): Promise<string | null> {
  const installer = await getInstallerById(installerId);
  if (!installer || !installer.phone) return null;

  // AI makes feedback call
  const result = await makeAICall({
    installerId: installer.id,
    installerName: installer.contactName,
    installerPhone: installer.phone,
    callPurpose: 'follow_up'
  });

  return result.transcript || null;
}

interface FeedbackAnalysis {
  sentiment: 'positive' | 'neutral' | 'negative';
  qualityIssue: boolean;
  testimonialWorthy: boolean;
  suggestions: string[];
}

async function analyzeFeedback(feedback: string): Promise<FeedbackAnalysis> {
  const response = await invokeLLM({
    messages: [{
      role: 'system',
      content: 'You are a feedback analyst. Analyze installer feedback about lead quality and extract actionable insights.'
    }, {
      role: 'user',
      content: `Analyze this feedback from an installer:

"${feedback}"

Determine:
1. Overall sentiment (positive/neutral/negative)
2. Whether there's a quality issue that needs addressing
3. Whether this is testimonial-worthy
4. Specific suggestions for improvement`
    }],
    response_format: {
      type: 'json_schema',
      json_schema: {
        name: 'feedback_analysis',
        strict: true,
        schema: {
          type: 'object',
          properties: {
            sentiment: { type: 'string', enum: ['positive', 'neutral', 'negative'] },
            qualityIssue: { type: 'boolean' },
            testimonialWorthy: { type: 'boolean' },
            suggestions: {
              type: 'array',
              items: { type: 'string' }
            }
          },
          required: ['sentiment', 'qualityIssue', 'testimonialWorthy', 'suggestions'],
          additionalProperties: false
        }
      }
    }
  });

  const content = response.choices[0]?.message?.content;
  if (typeof content !== 'string') {
    throw new Error('Invalid LLM response');
  }

  return JSON.parse(content);
}

async function adjustLeadGenerationParameters(suggestions: string[]): Promise<void> {
  console.log('[AutonomousRelationships] Adjusting lead generation based on feedback:', suggestions);
  // TODO: Implement parameter adjustments
}

async function requestTestimonial(installerId: number): Promise<void> {
  const installer = await getInstallerById(installerId);
  if (!installer) return;

  const message = await invokeLLM({
    messages: [{
      role: 'system',
      content: 'Write a friendly request for a testimonial. Keep it brief and make it easy for them to provide feedback.'
    }, {
      role: 'user',
      content: `Write a testimonial request for ${installer.companyName}. They've had positive experiences with our leads.`
    }]
  });

  const content = message.choices[0]?.message?.content;
  const emailContent = typeof content === 'string' ? content : 'We\'d love to hear about your experience with our leads!';
  
  // Send email (simulated for now)
  console.log('[AutonomousRelationships] Sending testimonial request to', installer.email, ':', emailContent);
}
