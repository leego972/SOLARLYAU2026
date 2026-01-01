/**
 * AI Customer Support Chatbot
 * Handles 80% of common installer questions automatically
 */

import { invokeLLM } from "./_core/llm";

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface ChatbotResponse {
  message: string;
  needsHumanEscalation: boolean;
  category: string;
  confidence: number;
}

/**
 * Knowledge base for common questions
 */
const KNOWLEDGE_BASE = {
  leadQuality: {
    keywords: ["quality", "good lead", "verified", "real", "fake"],
    response: `Our leads are enriched from multiple sources including LinkedIn profiles and property analysis. Each lead has a quality score (0-100) based on:
- Interest signals (LinkedIn activity, solar-related content)
- Property suitability (roof type, orientation, size)
- Financial capacity (estimated electricity bill, property value)
- Location (solar irradiance, state incentives)

Leads scoring 80+ have a 10-15% close rate on average. All leads come with our quality guarantee - if a lead doesn't respond after 3 contact attempts, we'll replace it for free.`,
  },

  pricing: {
    keywords: ["price", "cost", "how much", "expensive", "cheap", "discount"],
    response: `Our pricing is based on lead quality and type:

**Residential Leads:**
- Standard tier: $60-120 (quality score 70-85)
- Premium tier: $90-180 (quality score 85-95, exclusive territory)
- Platinum tier: $120-240 (quality score 95-100, pre-qualified)

**Commercial Leads:** $150-300 (higher value projects)

**Subscription Plans:**
- Starter: $499/month (10 leads included, 15% discount on additional)
- Growth: $1,499/month (30 leads included, 25% discount)
- Professional: $3,999/month (100 leads included, 35% discount)

All leads come with a 24-hour acceptance window and quality guarantee.`,
  },

  contactLead: {
    keywords: ["contact", "call", "email", "reach", "phone number"],
    response: `To contact a lead:

1. **Accept the lead offer** in your dashboard within 24 hours
2. **Payment is processed** automatically via Stripe
3. **Full contact details** are revealed (name, phone, email, address)
4. **Contact within 2 hours** for best results - leads are hot!

**Best practices:**
- Call first, then follow up with email
- Mention you're responding to their solar inquiry
- Offer a free quote/assessment
- Be professional and helpful

**Script template:**
"Hi [Name], this is [Your Name] from [Company]. I understand you're interested in solar panels for your property at [Address]. I'd love to offer you a free assessment and quote. When would be a good time to visit?"`,
  },

  refund: {
    keywords: ["refund", "money back", "bad lead", "not responding", "guarantee"],
    response: `Our Quality Guarantee:

**Automatic Refund If:**
- Lead doesn't respond after 3 contact attempts (over 5 days)
- Phone number is disconnected/invalid
- Lead says they never inquired about solar
- Duplicate lead (you already received this person)

**How to Request:**
1. Go to your dashboard → Purchased Leads
2. Click on the lead
3. Click "Request Refund"
4. Select reason
5. Refund processed within 24 hours

**Important:** You must attempt contact at least 3 times before requesting a refund. We track all communication attempts.

Most leads respond within 24-48 hours. If no response after 5 days, refund is automatic.`,
  },

  exclusiveTerritory: {
    keywords: ["exclusive", "territory", "competition", "other installers", "shared"],
    response: `**Territory Options:**

**Standard Tier:** Leads may be offered to up to 3 installers in your area (first to accept wins)

**Premium Tier:** Exclusive territory - leads in your service area are offered ONLY to you
- No competition
- Guaranteed first access
- Higher close rates
- 1.5x price multiplier

**Platinum Tier:** Custom territory design - we work with you to define your exclusive zones
- Complete exclusivity
- Pre-qualified leads
- White-glove service
- 2.0x price multiplier

Upgrade to Premium or Platinum in your account settings to get exclusive access.`,
  },

  howItWorks: {
    keywords: ["how does it work", "process", "how do i", "explain", "what happens"],
    response: `**How Our System Works:**

1. **AI Generates Leads:** Our AI scans LinkedIn, property records, and market data every 4 hours to find homeowners interested in solar

2. **Quality Scoring:** Each lead is scored 0-100 based on multiple factors (interest signals, property suitability, financial capacity)

3. **Smart Matching:** Leads are automatically matched with the 3 closest installers in our network

4. **Instant Notifications:** You receive email + dashboard alerts with lead details and 24-hour timer

5. **Accept & Pay:** Click "Accept" to purchase the lead - Stripe processes payment automatically

6. **Contact Details Revealed:** Full contact info (name, phone, email, address) is immediately available

7. **Contact the Lead:** Call/email within 2 hours for best results

8. **Close the Sale:** Convert the lead to a customer and install solar!

The entire process is automated - leads flow to you 24/7 without any manual work on our end.`,
  },

  payment: {
    keywords: ["payment", "pay", "stripe", "credit card", "billing", "invoice"],
    response: `**Payment Process:**

**How It Works:**
- When you accept a lead, Stripe automatically charges your saved card
- You receive an invoice via email immediately
- Payment is processed in real-time (2-3 seconds)
- Money is non-refundable unless lead is invalid (see Quality Guarantee)

**Payment Methods:**
- Credit card (Visa, Mastercard, Amex)
- Debit card
- Bank account (ACH/direct debit)

**Billing:**
- Pay-per-lead: Charged per lead accepted
- Subscription: Monthly recurring charge + per-lead fees for additional leads

**Manage Payment:**
- Go to Settings → Billing
- Update card details
- View payment history
- Download invoices

All payments are secure and processed by Stripe (PCI-DSS compliant).`,
  },

  leadResponse: {
    keywords: ["not responding", "no answer", "voicemail", "no reply", "ignore"],
    response: `**If a Lead Isn't Responding:**

**Best Practices:**
1. **Call 3 times** at different times of day (morning, afternoon, evening)
2. **Leave a voicemail** after 2nd attempt - be specific and helpful
3. **Send an email** with your contact info and value proposition
4. **Wait 24 hours** between attempts
5. **Try SMS** if phone/email don't work

**Timing Matters:**
- Best times to call: 10am-12pm, 4pm-7pm on weekdays
- Avoid early morning (<9am) and late evening (>8pm)
- Saturday mornings (9am-12pm) work well

**If Still No Response After 5 Days:**
- Request a refund via dashboard
- We'll replace the lead for free
- Or credit your account

**Average Response Rates:**
- Within 24 hours: 60%
- Within 48 hours: 80%
- Within 5 days: 90%

Don't give up too early - persistence pays off!`,
  },

  subscription: {
    keywords: ["subscription", "monthly", "plan", "package", "bundle"],
    response: `**Subscription Plans:**

**Starter Plan - $499/month**
- 10 leads included
- 15% discount on additional leads
- Standard tier access
- Email support
- **Best for:** New installers, 1-2 installs/month

**Growth Plan - $1,499/month**
- 30 leads included
- 25% discount on additional leads
- Premium tier access (exclusive territory)
- Priority support
- Monthly performance report
- **Best for:** Growing businesses, 5-10 installs/month

**Professional Plan - $3,999/month**
- 100 leads included
- 35% discount on additional leads
- Platinum tier access (pre-qualified leads)
- Exclusive territory guarantee
- Dedicated account manager
- Custom integrations
- Weekly strategy calls
- **Best for:** Established companies, 20+ installs/month

**Cancel Anytime:** No long-term contracts, cancel with 30 days notice

**Upgrade/Downgrade:** Change plans anytime in your account settings`,
  },
};

/**
 * Determine if question needs human escalation
 */
function needsEscalation(question: string): boolean {
  const escalationKeywords = [
    "speak to human",
    "talk to person",
    "manager",
    "complaint",
    "legal",
    "lawyer",
    "sue",
    "fraud",
    "scam",
    "cancel account",
    "delete data",
    "privacy",
    "urgent",
    "emergency",
  ];

  const lowerQuestion = question.toLowerCase();
  return escalationKeywords.some(keyword => lowerQuestion.includes(keyword));
}

/**
 * Find best matching knowledge base entry
 */
function findBestMatch(question: string): { category: string; response: string; confidence: number } | null {
  const lowerQuestion = question.toLowerCase();
  
  let bestMatch: { category: string; response: string; confidence: number } | null = null;
  let highestScore = 0;
  
  for (const [category, data] of Object.entries(KNOWLEDGE_BASE)) {
    let score = 0;
    for (const keyword of data.keywords) {
      if (lowerQuestion.includes(keyword)) {
        score++;
      }
    }
    
    if (score > highestScore) {
      highestScore = score;
      bestMatch = {
        category,
        response: data.response,
        confidence: Math.min(score * 25, 95), // Max 95% confidence
      };
    }
  }
  
  return bestMatch;
}

/**
 * Generate AI response using LLM
 */
async function generateAIResponse(question: string, context: ChatMessage[]): Promise<string> {
  const systemPrompt = `You are a helpful customer support assistant for a solar lead generation platform. 

Your role:
- Answer installer questions about leads, pricing, quality, refunds, and how the system works
- Be professional, friendly, and concise
- If you don't know something, say so and offer to escalate to a human
- Focus on helping installers succeed with our leads

Key facts about the platform:
- We generate 30 high-quality solar leads per day using AI
- Leads are priced $60-300 based on quality and type
- We offer Standard, Premium, and Platinum tiers
- Quality guarantee: refund if lead doesn't respond after 3 attempts
- Subscription plans available: $499-3,999/month
- Leads are exclusive to Premium/Platinum tiers
- Average close rate: 10-15% for quality leads

Be helpful and solution-oriented!`;

  const messages = [
    { role: "system" as const, content: systemPrompt },
    ...context.map(m => ({ role: m.role as "user" | "assistant" | "system", content: m.content })),
    { role: "user" as const, content: question },
  ];

  const response = await invokeLLM({
    messages,
  });

  const content = response.choices[0]?.message?.content;
  return typeof content === 'string' ? content : "I'm sorry, I couldn't generate a response. Please contact support.";
}

/**
 * Main chatbot function
 */
export async function getChatbotResponse(
  question: string,
  conversationHistory: ChatMessage[] = []
): Promise<ChatbotResponse> {
  // Check if needs immediate escalation
  if (needsEscalation(question)) {
    return {
      message: "I understand this is important. Let me connect you with a human support agent who can better assist you. Please email support@yourdomain.com or we'll have someone contact you within 2 hours.",
      needsHumanEscalation: true,
      category: "escalation",
      confidence: 100,
    };
  }

  // Try to find knowledge base match
  const kbMatch = findBestMatch(question);
  
  if (kbMatch && kbMatch.confidence >= 50) {
    // High confidence match - use knowledge base
    return {
      message: kbMatch.response,
      needsHumanEscalation: false,
      category: kbMatch.category,
      confidence: kbMatch.confidence,
    };
  }

  // Low confidence or no match - use AI
  try {
    const aiResponse = await generateAIResponse(question, conversationHistory);
    
    return {
      message: aiResponse,
      needsHumanEscalation: false,
      category: "ai_generated",
      confidence: kbMatch ? kbMatch.confidence : 30,
    };
  } catch (error) {
    console.error("[Chatbot] Error generating AI response:", error);
    
    // Fallback to human escalation
    return {
      message: "I'm having trouble answering that question right now. Let me connect you with a human support agent. Please email support@yourdomain.com and we'll respond within 2 hours.",
      needsHumanEscalation: true,
      category: "error",
      confidence: 0,
    };
  }
}

/**
 * Get suggested questions for user
 */
export function getSuggestedQuestions(): string[] {
  return [
    "How does your lead generation work?",
    "What's your refund policy?",
    "How much do leads cost?",
    "How do I contact a lead?",
    "What's the difference between Standard and Premium tiers?",
    "Do you offer subscription plans?",
    "What if a lead doesn't respond?",
    "Are leads exclusive to me?",
  ];
}
