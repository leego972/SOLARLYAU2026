# Hybrid LinkedIn + Email Outreach System

## Overview

This system combines LinkedIn discovery with personalized email outreach to recruit solar installers. It finds decision-makers at target companies via LinkedIn API, sends personalized emails, and generates LinkedIn connection requests for manual sending.

## How It Works

1. **LinkedIn Discovery** - Searches for owners, directors, and sales managers at each target company
2. **Personalized Emails** - Sends emails mentioning the person's name and role
3. **Bounce Handling** - Automatically retries failed emails
4. **LinkedIn Backup** - Generates connection requests for manual sending if emails bounce

## Running the Campaign

### Option 1: Run via Command Line

```bash
cd /home/ubuntu/solar-lead-ai
pnpm exec tsx run_hybrid_outreach.ts
```

This will:
- Find decision-makers at all 18 target companies
- Send personalized emails
- Generate LinkedIn connection requests
- Save results to files

### Option 2: Run via Web Interface (Coming Soon)

Visit `/admin/recruitment` to run campaigns from the dashboard.

## Output Files

After running, you'll get three files:

1. **`outreach_results_[timestamp].json`** - Detailed campaign data
2. **`linkedin_connections_[timestamp].json`** - LinkedIn connection requests
3. **`outreach_summary_[timestamp].md`** - Human-readable summary

## LinkedIn Connection Requests

The system generates personalized connection requests for each decision-maker found. To send them:

1. Open `linkedin_connections_[timestamp].json`
2. For each contact:
   - Visit their LinkedIn URL
   - Click "Connect"
   - Paste the generated connection request message
   - Send

**Important:** Send 5-10 connections per day to avoid LinkedIn rate limits.

## Email Templates

The system uses two email templates:

### Template A: LinkedIn Discovery Follow-Up
Used when LinkedIn contacts are found. Mentions the person's name, title, and company.

### Template B: Direct Value Proposition
Used as fallback when no LinkedIn contacts found. Generic but still personalized to the company.

## Bounce Handling

Emails automatically retry up to 3 times with 24-hour delays. Bounce tracking prevents sending to known bad addresses.

## Expected Results

Based on industry benchmarks:

- **Email Response Rate:** 20-30%
- **LinkedIn Connection Accept Rate:** 40-60%
- **Overall Conversion to Sign-Up:** 10-15%

For 18 companies:
- Expected email responses: 4-6 companies
- Expected LinkedIn connections: 7-11 people
- Expected sign-ups: 2-3 installers

## Monitoring Results

### Email Responses
Check your Gmail inbox for replies. Look for:
- "Interested" or "Tell me more"
- Questions about pricing or lead quality
- Requests for sample leads

### LinkedIn Connections
Monitor LinkedIn for:
- Connection accepts
- Direct messages
- Profile views from target companies

### Platform Sign-Ups
Check `/admin/metrics` for:
- New installer registrations
- First lead purchases
- Conversion rates

## Follow-Up Sequence

### Day 1: Initial Outreach
- System sends emails
- You manually send LinkedIn connections

### Day 3: First Follow-Up
If no response, send follow-up email:

**Subject:** Following up - exclusive solar leads for [Company]

Hi [Name],

Just following up on my email from Monday about exclusive solar leads for [Company].

Quick reminder of what we offer:
- 10-15 pre-qualified leads per week
- 55-65% average conversion rate
- $12-15K average deal size
- First lead FREE

Would you like to see a sample lead from [City]?

Best,
SolarlyAU Team

### Day 7: LinkedIn Message
If connection accepted but no response, send LinkedIn message:

Use Message 1 from `linkedin_outreach_templates.md`

### Day 14: Final Follow-Up
Last attempt via email or LinkedIn:

**Subject:** Last chance - exclusive territory for [Company]

[Name],

This is my last email - I don't want to be a pest!

We're limiting to 3 installers per region, and we have 1 spot left in [City]. Once it's filled, we stop onboarding in your area.

Your first lead is still FREE if you want to test the quality.

Reply "interested" if you'd like to claim the spot, otherwise I'll assume it's not a fit right now.

Best,
SolarlyAU Team

## Troubleshooting

### Emails Bouncing
- Check `emailBounceHandler.ts` for bounce tracking
- Verify email addresses in target list
- Consider using alternative email patterns (sales@, contact@)

### LinkedIn API Rate Limits
- System includes 2-second delays between API calls
- If rate limited, wait 1 hour and retry
- Consider reducing batch size to 5 companies at a time

### No Decision-Makers Found
- Try alternative job titles ("Managing Director", "CEO", "Founder")
- Search by company name variations
- Fall back to generic emails to company addresses

## Best Practices

1. **Timing:** Run campaigns Tuesday-Thursday, 10am-2pm for best response rates
2. **Personalization:** Always verify names/titles before sending
3. **Follow-Up:** Don't give up after one email - 80% of sales require 5+ touchpoints
4. **Tracking:** Log all responses in a spreadsheet to measure conversion rates
5. **Testing:** A/B test different subject lines and email templates

## Next Steps

After running the campaign:

1. **Monitor responses** - Check email/LinkedIn daily
2. **Respond quickly** - Reply within 24 hours to maintain momentum
3. **Qualify leads** - Ask about current lead sources and pain points
4. **Set up accounts** - Guide interested installers through signup
5. **Deliver first lead** - Send high-quality free lead to prove value
6. **Collect testimonials** - Ask for feedback after 2-3 weeks

## Support

For issues or questions:
- Check logs in `/home/ubuntu/solar-lead-ai/`
- Review error messages in console output
- Test individual components (LinkedIn API, email sending) separately
