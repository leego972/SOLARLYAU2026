import { invokeLLM } from "./_core/llm";
import { getLeadById, updateLead, getInstallerById, updateInstaller } from "./db";
import type { Lead, Installer } from "../drizzle/schema";

/**
 * Autonomous Quality Control System
 * Eliminates manual review of edge cases through AI-powered decision making
 */

interface QualityAssessment {
  score: number;
  confidence: number;
  reasoning: string;
  decision: 'approve' | 'reject' | 'improve';
  improvements?: string[];
}

interface InstallerVerification {
  approve: boolean;
  tier: 'premium' | 'standard' | 'trial';
  monitoring?: boolean;
  limits?: { maxLeads: number };
  reasoning: string;
}

interface RefundDecision {
  approve: boolean;
  reasoning: string;
  compensationOffer?: string;
  preventionSteps: string[];
}

/**
 * Multi-model consensus approach for lead quality assessment
 */
export async function autonomousLeadQualityControl(leadId: number): Promise<QualityAssessment> {
  const lead = await getLeadById(leadId);
  if (!lead) {
    throw new Error(`Lead ${leadId} not found`);
  }

  // Get LLM quality assessment
  const llmScore = await getLLMQualityAssessment(lead);
  
  // Get historical conversion prediction
  const historicalScore = await getHistoricalConversionPrediction(lead);
  
  // Get market demand score
  const marketScore = await getMarketDemandScore(lead);
  
  // Weighted decision (LLM 40%, Historical 40%, Market 20%)
  const finalScore = (llmScore.score * 0.4) + (historicalScore * 0.4) + (marketScore * 0.2);
  const confidence = Math.min(llmScore.confidence, 0.95);
  
  let decision: 'approve' | 'reject' | 'improve';
  let improvements: string[] | undefined;
  
  if (finalScore >= 80) {
    decision = 'approve';
  } else if (finalScore >= 60) {
    decision = 'improve';
    improvements = llmScore.improvements;
  } else {
    decision = 'reject';
  }
  
  return {
    score: Math.round(finalScore),
    confidence,
    reasoning: llmScore.reasoning,
    decision,
    improvements
  };
}

async function getLLMQualityAssessment(lead: Lead): Promise<{
  score: number;
  confidence: number;
  reasoning: string;
  improvements?: string[];
}> {
  const response = await invokeLLM({
    messages: [{
      role: 'system',
      content: 'You are an expert lead quality assessor for solar installation businesses. Analyze leads and provide quality scores.'
    }, {
      role: 'user',
      content: `Assess this solar lead:
      
Name: ${lead.customerName}
Phone: ${lead.customerPhone}
Email: ${lead.customerEmail}
Address: ${lead.address}, ${lead.suburb}, ${lead.state} ${lead.postcode}
Property Type: ${lead.propertyType}
Estimated Bill: $${lead.currentElectricityBill || 'N/A'}/month
System Size: ${lead.estimatedSystemSize || 'N/A'}kW
Quality Score: ${lead.qualityScore}

Provide a quality assessment with score (0-100), confidence level (0-1), reasoning, and suggestions for improvement if score is below 80.`
    }],
    response_format: {
      type: 'json_schema',
      json_schema: {
        name: 'quality_assessment',
        strict: true,
        schema: {
          type: 'object',
          properties: {
            score: { type: 'number' },
            confidence: { type: 'number' },
            reasoning: { type: 'string' },
            improvements: {
              type: 'array',
              items: { type: 'string' }
            }
          },
          required: ['score', 'confidence', 'reasoning'],
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

async function getHistoricalConversionPrediction(lead: Lead): Promise<number> {
  // Analyze historical data to predict conversion likelihood
  // For now, use quality score as baseline
  // TODO: Implement ML model trained on historical conversion data
  return lead.qualityScore || 70;
}

async function getMarketDemandScore(lead: Lead): Promise<number> {
  // Assess market demand in the lead's area
  // Higher scores for warmer states and high-demand postcodes
  const statePriority: Record<string, number> = {
    'QLD': 90,
    'NSW': 85,
    'WA': 80,
    'SA': 75,
    'VIC': 70,
    'ACT': 65,
    'TAS': 60,
    'NT': 55
  };
  
  return statePriority[lead.state] || 70;
}

/**
 * Self-healing installer approval with fallback verification strategies
 */
export async function autonomousInstallerApproval(installerId: number): Promise<InstallerVerification> {
  const installer = await getInstallerById(installerId);
  if (!installer) {
    throw new Error(`Installer ${installerId} not found`);
  }

  // Primary verification
  let abnValid = false;
  let licenseValid = true; // Assume valid if not provided
  let reputationScore = 70;

  // Verify ABN if provided
  if (installer.abn) {
    abnValid = await verifyABN(installer.abn);
    
    // If primary ABN verification fails, try secondary lookup
    if (!abnValid && installer.companyName) {
      const manualLookup = await scrapeABNRegister(installer.companyName);
      if (manualLookup.found) {
        abnValid = true;
      }
    }
  }

  // Get online reputation score
  if (installer.companyName) {
    reputationScore = await getOnlineReputationScore(installer.companyName);
  }

  // Calculate risk score (0-100, lower is better)
  const riskScore = calculateRiskScore(abnValid, licenseValid, reputationScore);

  // Risk-based approval decision
  if (riskScore < 20) {
    return {
      approve: true,
      tier: 'premium',
      reasoning: `Low risk score (${riskScore}). ABN verified, good reputation.`
    };
  } else if (riskScore < 40) {
    return {
      approve: true,
      tier: 'standard',
      monitoring: true,
      reasoning: `Moderate risk score (${riskScore}). Approved with monitoring.`
    };
  } else if (riskScore < 60) {
    return {
      approve: true,
      tier: 'trial',
      limits: { maxLeads: 5 },
      reasoning: `Higher risk score (${riskScore}). Approved for trial with 5 lead limit.`
    };
  } else {
    return {
      approve: false,
      tier: 'standard',
      reasoning: `High risk score (${riskScore}). Unable to verify business credentials.`
    };
  }
}

async function verifyABN(abn: string): Promise<boolean> {
  // Simulate ABN verification
  // TODO: Integrate with ABN Lookup API
  return abn.length === 11 && /^\d+$/.test(abn);
}

async function scrapeABNRegister(companyName: string): Promise<{ found: boolean; abn?: string }> {
  // Simulate ABN register scraping
  // TODO: Implement actual ABN register lookup
  return { found: false };
}

async function getOnlineReputationScore(businessName: string): Promise<number> {
  // Simulate reputation scoring
  // TODO: Scrape Google Reviews, Trustpilot, etc.
  return 75;
}

function calculateRiskScore(abnValid: boolean, licenseValid: boolean, reputationScore: number): number {
  let risk = 0;
  
  if (!abnValid) risk += 40;
  if (!licenseValid) risk += 30;
  if (reputationScore < 50) risk += 30;
  else if (reputationScore < 70) risk += 15;
  
  return Math.min(risk, 100);
}

/**
 * AI-powered autonomous refund dispute resolution
 */
export async function autonomousRefundDecision(
  leadId: number,
  installerId: number,
  reason: string
): Promise<RefundDecision> {
  const lead = await getLeadById(leadId);
  const installer = await getInstallerById(installerId);
  
  if (!lead || !installer) {
    throw new Error('Lead or installer not found');
  }

  // Gather evidence
  const leadQualityEvidence = {
    qualityScore: lead.qualityScore,
    dataCompleteness: checkDataCompleteness(lead),
    propertyVerification: await verifyProperty(lead)
  };

  const installerHistoryEvidence = {
    totalLeadsPurchased: 0, // TODO: Get from database
    refundRate: 0, // TODO: Calculate from history
    averageRating: 0 // TODO: Get from reviews
  };

  // AI judge analyzes evidence
  const response = await invokeLLM({
    messages: [{
      role: 'system',
      content: 'You are an impartial judge resolving a lead quality dispute between a lead provider and an installer. Analyze the evidence objectively and make a fair decision based on the quality guarantee terms: leads must have accurate contact information, suitable property for solar, and genuine interest signals.'
    }, {
      role: 'user',
      content: `Dispute Details:
      
Installer Complaint: ${reason}

Lead Quality Evidence:
- Quality Score: ${leadQualityEvidence.qualityScore}/100
- Data Completeness: ${leadQualityEvidence.dataCompleteness}%
- Property Verified: ${leadQualityEvidence.propertyVerification}

Installer History:
- Total Leads Purchased: ${installerHistoryEvidence.totalLeadsPurchased}
- Refund Rate: ${installerHistoryEvidence.refundRate}%
- Average Rating: ${installerHistoryEvidence.averageRating}/5

Should this refund be approved? Provide reasoning and prevention steps.`
    }],
    response_format: {
      type: 'json_schema',
      json_schema: {
        name: 'refund_decision',
        strict: true,
        schema: {
          type: 'object',
          properties: {
            approve: { type: 'boolean' },
            reasoning: { type: 'string' },
            compensationOffer: { type: 'string' },
            preventionSteps: {
              type: 'array',
              items: { type: 'string' }
            }
          },
          required: ['approve', 'reasoning', 'preventionSteps'],
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

function checkDataCompleteness(lead: Lead): number {
  let complete = 0;
  let total = 0;
  
  const fields = ['customerName', 'customerPhone', 'customerEmail', 'address', 'suburb', 'state', 'postcode'];
  
  for (const field of fields) {
    total++;
    if (lead[field as keyof Lead]) complete++;
  }
  
  return Math.round((complete / total) * 100);
}

async function verifyProperty(lead: Lead): Promise<boolean> {
  // Simulate property verification
  // TODO: Integrate with property data APIs
  return lead.address !== null && lead.postcode !== null;
}

/**
 * Autonomous quality improvement
 * Attempts to enrich leads that score 60-79 to bring them above 80
 */
export async function autonomousLeadImprovement(leadId: number): Promise<boolean> {
  const lead = await getLeadById(leadId);
  if (!lead) return false;

  // Use AI to suggest data enrichment strategies
  const response = await invokeLLM({
    messages: [{
      role: 'system',
      content: 'You are a data enrichment specialist. Suggest ways to improve lead quality through additional data gathering.'
    }, {
      role: 'user',
      content: `This lead scored ${lead.qualityScore}/100. Suggest specific data points to gather to improve quality:
      
Current Data:
Name: ${lead.customerName}
Phone: ${lead.customerPhone}
Email: ${lead.customerEmail}
Address: ${lead.address}
Property Type: ${lead.propertyType}

What additional information should we gather?`
    }]
  });

  const content = response.choices[0]?.message?.content;
  if (typeof content !== 'string') {
    return false;
  }

  // TODO: Implement actual data enrichment based on AI suggestions
  console.log('[AutonomousQuality] Improvement suggestions:', content);
  
  return false; // Return true if improvements were successfully applied
}
