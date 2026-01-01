# Google Ads Autonomous Advertising Setup Guide

This guide walks you through setting up Google Ads API credentials so your SolarlyAU system can automatically create, manage, and optimize advertising campaigns without manual intervention.

---

## Overview

Your system includes an **Autonomous Advertising Engine** that:

- Creates Google Ads campaigns automatically when you approve monthly budgets
- Generates AI-powered ad copy variations optimized for solar leads
- Adjusts bids hourly based on performance data
- Pauses underperforming keywords automatically (cost per lead > $30)
- Scales winning campaigns by increasing bids (cost per lead < $15)
- Sends weekly performance summaries (no action required)
- Requests monthly budget approval with ROI projections
- Generates month-end reports with recommendations

**Your only manual task:** Approve the monthly advertising budget (takes 2 minutes).

---

## Prerequisites

Before starting, you need:

1. A Google Ads account (create at [ads.google.com](https://ads.google.com))
2. A Google Cloud Platform account (create at [console.cloud.google.com](https://console.cloud.google.com))
3. Admin access to your SolarlyAU system

---

## Step 1: Create Google Cloud Project

The Google Ads API requires OAuth credentials from Google Cloud Platform.

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click **Select a project** → **New Project**
3. Project name: `SolarlyAU Ads`
4. Click **Create**
5. Wait for the project to be created (takes ~30 seconds)

---

## Step 2: Enable Google Ads API

1. In Google Cloud Console, select your `SolarlyAU Ads` project
2. Go to **APIs & Services** → **Library**
3. Search for "Google Ads API"
4. Click **Google Ads API**
5. Click **Enable**
6. Wait for activation (takes ~1 minute)

---

## Step 3: Create OAuth Credentials

1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth client ID**
3. If prompted, configure the OAuth consent screen:
   - User Type: **External**
   - App name: `SolarlyAU Autonomous Ads`
   - User support email: Your email
   - Developer contact: Your email
   - Click **Save and Continue** through all steps
4. Back on Credentials page, click **Create Credentials** → **OAuth client ID**
5. Application type: **Web application**
6. Name: `SolarlyAU Server`
7. Authorized redirect URIs: `https://your-domain.manus.space/api/google-ads/callback`
   - Replace `your-domain` with your actual Manus domain
8. Click **Create**
9. **Save these credentials:**
   - Client ID (looks like `123456789-abc.apps.googleusercontent.com`)
   - Client Secret (looks like `GOCSPX-abc123xyz`)

---

## Step 4: Apply for Developer Token

Google requires a developer token to use the Ads API.

1. Go to [Google Ads](https://ads.google.com/)
2. Click **Tools & Settings** (wrench icon)
3. Under **Setup**, click **API Center**
4. Click **Apply for access** (if you don't see this, you may already have a token)
5. Fill out the application:
   - API usage: "Automated campaign management for solar lead generation"
   - Expected volume: "Managing 1-5 campaigns with daily optimization"
6. Submit and wait for approval (usually 24-48 hours)
7. Once approved, copy your **Developer Token** (looks like `ABcdeFGH93KL-NOPQ_RsTUvw`)

**Note:** You can use a test developer token immediately while waiting for production approval. Test tokens work but have limited functionality.

---

## Step 5: Generate Refresh Token

The refresh token allows your system to access Google Ads without requiring you to log in repeatedly.

1. Install Google Ads API OAuth helper:
   ```bash
   npm install -g google-ads-api
   ```

2. Run the OAuth flow:
   ```bash
   google-ads-api oauth --client-id YOUR_CLIENT_ID --client-secret YOUR_CLIENT_SECRET
   ```

3. A browser window will open asking you to authorize the app
4. Log in with your Google Ads account
5. Click **Allow**
6. Copy the **Refresh Token** from the terminal (looks like `1//abc123xyz...`)

---

## Step 6: Get Your Customer ID

1. Go to [Google Ads](https://ads.google.com/)
2. Look at the top right corner
3. Your Customer ID is the 10-digit number (format: `123-456-7890`)
4. Remove the dashes: `1234567890`

---

## Step 7: Add Credentials to SolarlyAU

1. Log in to your SolarlyAU admin dashboard
2. Go to **Settings** → **Secrets**
3. Add these five secrets:

| Secret Name | Value | Example |
|------------|-------|---------|
| `GOOGLE_ADS_CLIENT_ID` | Your OAuth Client ID | `123456789-abc.apps.googleusercontent.com` |
| `GOOGLE_ADS_CLIENT_SECRET` | Your OAuth Client Secret | `GOCSPX-abc123xyz` |
| `GOOGLE_ADS_DEVELOPER_TOKEN` | Your Developer Token | `ABcdeFGH93KL-NOPQ_RsTUvw` |
| `GOOGLE_ADS_REFRESH_TOKEN` | Your Refresh Token | `1//abc123xyz...` |
| `GOOGLE_ADS_CUSTOMER_ID` | Your Customer ID (no dashes) | `1234567890` |

4. Click **Save** for each secret

---

## Step 8: Approve Your First Budget

1. In your admin dashboard, go to **Advertising** → **Budget Approvals**
2. You should see a pending budget request for next month
3. Review the recommended budget (default: $3,000/month)
4. Adjust if needed (minimum recommended: $1,500/month for meaningful data)
5. Click **Approve**

**What happens next:**

- System creates a Google Ads campaign within 24 hours
- AI generates 10 headline variations and 4 description variations
- Campaign targets QLD, NSW, WA, SA with solar-specific keywords
- Bids are optimized hourly based on performance
- You receive weekly performance summaries via email
- No further action required until next month's budget approval

---

## Budget Recommendations

| Monthly Budget | Expected Leads | Cost Per Lead | Time to Profitability |
|---------------|----------------|---------------|----------------------|
| $1,500 | 50-75 | $20-30 | 2-3 months |
| $3,000 | 100-150 | $20-30 | 1-2 months |
| $5,000 | 167-250 | $20-30 | 1 month |
| $10,000 | 333-500 | $20-30 | 2 weeks |

**Note:** These are estimates based on Australian solar lead generation benchmarks. Actual results vary by location, seasonality, and competition.

---

## Safety Features

Your autonomous advertising system includes multiple safety mechanisms:

1. **Daily Spending Cap:** System never exceeds monthly budget ÷ 30 per day
2. **Cost Per Lead Limit:** Automatically pauses keywords if cost exceeds $30 per lead
3. **Minimum Data Threshold:** Requires 50 clicks before pausing (prevents premature decisions)
4. **Emergency Stop Button:** Available in admin dashboard to pause all campaigns instantly
5. **Monthly Approval Required:** System stops spending if next month's budget isn't approved

---

## Monitoring & Optimization

### Hourly (Automatic)
- Bid adjustments based on performance
- Budget reallocation to winning campaigns

### Daily (Automatic)
- Performance monitoring
- Spending limit checks
- Keyword pause/resume decisions

### Weekly (Automatic)
- Email summary of performance metrics
- No action required from you

### Monthly (Manual - 2 minutes)
- Review budget recommendation
- Approve/adjust next month's budget
- Review month-end performance report

---

## Troubleshooting

### "Google Ads not configured" Error

**Solution:** Verify all five environment variables are set correctly in Settings → Secrets.

### "Invalid refresh token" Error

**Solution:** Regenerate the refresh token using Step 5 and update `GOOGLE_ADS_REFRESH_TOKEN`.

### "Developer token not approved" Warning

**Solution:** You can continue using the test token. Apply for production approval in Google Ads API Center for full functionality.

### No campaigns created after budget approval

**Solution:** Check the system logs in admin dashboard. Common issues:
- Missing or invalid credentials
- Google Ads account suspended
- API quota exceeded (rare, but contact Google support)

---

## Support

For technical issues with the autonomous advertising system:
- Check system logs in admin dashboard
- Review weekly performance emails for alerts
- Contact Manus support at [help.manus.im](https://help.manus.im)

For Google Ads API issues:
- Google Ads API Forum: [developers.google.com/google-ads/api/community](https://developers.google.com/google-ads/api/community)
- Google Ads Support: [support.google.com/google-ads](https://support.google.com/google-ads)

---

## Next Steps

Once your first campaign is running:

1. **Week 1:** Monitor daily performance in admin dashboard
2. **Week 2:** Review first weekly summary email
3. **Week 3:** Check if cost per lead is within target ($20-30)
4. **Week 4:** Review month-end report and approve next month's budget

The system learns and improves over time. Best results typically appear after 2-3 months of continuous optimization.

---

**Congratulations!** Your autonomous advertising system is now ready to generate solar leads 24/7 while you focus on growing your business.
