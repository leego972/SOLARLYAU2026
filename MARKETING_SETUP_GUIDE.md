# SolarlyAU Marketing Setup Guide

**Complete Step-by-Step Instructions for Driving Real Traffic & Revenue**

---

## Overview

Your SolarlyAU system is now technically ready to generate real leads from actual homeowners. This guide provides complete instructions for setting up the external marketing platforms that will drive traffic to your `/get-quote` page and generate revenue.

**What's Already Done (Technical Setup):**

- ✅ SEO meta tags added to all pages
- ✅ XML sitemap created (`/sitemap.xml`)
- ✅ Robots.txt configured for search engines
- ✅ Google Ads conversion tracking code installed (needs your Conversion ID)
- ✅ Facebook Pixel code installed (needs your Pixel ID)
- ✅ Lead validation and spam filtering implemented
- ✅ Conversion tracking integrated on quote form
- ✅ Professional quote request form at `/get-quote`

**What You Need to Do (Platform Setup):**

This guide covers three critical marketing channels in order of priority and ROI.

---

## Channel 1: Google Ads (Highest Priority - Immediate Results)

**Why Start Here:** Google Ads delivers the highest-intent traffic. People searching "solar panels Brisbane" are actively looking to buy solar systems right now. Expected results: 5-10 leads/day with $50-100/day budget.

### Step 1: Create Google Ads Account

1. Go to [ads.google.com](https://ads.google.com)
2. Click **"Start Now"** and sign in with your Google account
3. Choose **"Switch to Expert Mode"** (bottom of page)
4. Select **"Create an account without a campaign"** (skip the guided setup)
5. Confirm your business information and billing country (Australia)

### Step 2: Set Up Conversion Tracking

1. In Google Ads, click **Tools & Settings** (wrench icon, top right)
2. Under **Measurement**, click **Conversions**
3. Click the **+ New Conversion Action** button
4. Select **Website**
5. Enter your website domain: `solarlyau.com`
6. Click **Scan** (Google will find your site)
7. Click **Add a conversion action manually**
8. Fill in the details:
   - **Category:** Lead
   - **Conversion name:** Solar Quote Request
   - **Value:** Use different values for each conversion (recommended)
   - **Count:** Every conversion
   - **Conversion window:** 30 days
9. Click **Create and Continue**
10. On the next screen, you'll see your **Conversion ID** (format: `AW-123456789`)
11. **IMPORTANT:** Copy this Conversion ID

### Step 3: Install Your Conversion ID

1. Open your SolarlyAU admin panel
2. Go to **Settings → Secrets**
3. Look for the placeholder `AW-CONVERSION_ID` in your site's HTML (or ask me to update it)
4. Replace `AW-CONVERSION_ID` with your actual ID (e.g., `AW-123456789`)

**Note:** I've already installed the Google Ads tracking code in your site. You just need to replace the placeholder with your real Conversion ID.

### Step 4: Create Your First Campaign

1. In Google Ads, click **Campaigns** (left sidebar)
2. Click the **+ New Campaign** button
3. Select goal: **Leads**
4. Campaign type: **Search**
5. Click **Continue**

**Campaign Settings:**

- **Campaign name:** Solar Leads - QLD NSW WA SA
- **Networks:** Uncheck "Include Google Display Network" (search only)
- **Locations:** 
  - Click **Enter another location**
  - Add: Queensland, New South Wales, Western Australia, South Australia
  - Click **Save**
- **Languages:** English
- **Budget:** $50-100 per day (start with $50)
- **Bidding:** Click **"Select a bid strategy directly"** → Choose **"Maximize conversions"**
- **Ad schedule:** All days, all hours (or customize based on your availability)

Click **Save and Continue**

### Step 5: Create Ad Groups & Keywords

**Ad Group 1: Solar Panels General**

Keywords (Exact Match):
```
[solar panels brisbane]
[solar panels sydney]
[solar panels perth]
[solar panels adelaide]
[solar panel installation brisbane]
[solar panel installation sydney]
[solar panel installation perth]
[solar panel installation adelaide]
[solar panel quotes]
[solar panel cost]
[best solar panels australia]
```

**Ad Group 2: Solar Quotes**

Keywords (Phrase Match):
```
"get solar quote"
"solar panel quote"
"free solar quote"
"compare solar quotes"
"solar installation quote"
```

**Ad Group 3: Solar Systems**

Keywords:
```
[6.6kw solar system]
[solar system price]
[residential solar panels]
[home solar panels]
```

### Step 6: Write Your Ads

For each ad group, create 3-4 responsive search ads. Here's a template:

**Headline Ideas (use 8-10):**
- Get Free Solar Quotes Today
- Compare Top Solar Installers
- Save $1000s On Electricity Bills
- CEC Accredited Installers Only
- Solar Panels From $3,990
- Australia's #1 Solar Platform
- 100% Free Quote Service
- Get 3 Quotes In 24 Hours
- Premium Solar Systems
- [City] Solar Specialists

**Description Ideas (use 3-4):**
- Get matched with verified solar installers in your area. Compare quotes and save thousands. 100% free service for homeowners.
- Australia's first fully autonomous solar lead platform. Get 3 competitive quotes from CEC accredited installers within 24 hours.
- No obligation quotes from top-rated solar companies. Save up to 80% on electricity bills with premium solar systems.

**Final URL:** `https://solarlyau.com/get-quote`

**Display Path:** `solarlyau.com/free-quote`

### Step 7: Launch & Monitor

1. Review your campaign settings
2. Click **Publish Campaign**
3. Your ads will go into review (usually approved within 24 hours)
4. Monitor performance daily for the first week:
   - Click **Campaigns** to see impressions, clicks, conversions
   - Adjust bids if cost per lead is too high (target: $10-20 per lead)
   - Pause keywords with high cost and no conversions after 50 clicks

**Expected Results:**
- Week 1: 10-30 leads
- Month 1: 100-200 leads
- Revenue: $6,000-12,000/month (at $60 average per lead)

---

## Channel 2: Google Search Console (Free Organic Traffic)

**Why This Matters:** Free organic traffic from Google search. Takes 2-3 months to see results, but it's completely free and compounds over time.

### Step 1: Verify Your Website

1. Go to [search.google.com/search-console](https://search.google.com/search-console)
2. Click **Add Property**
3. Select **URL prefix** (not domain)
4. Enter: `https://solarlyau.com`
5. Click **Continue**

### Step 2: Verify Ownership

Choose **HTML tag** method:

1. Google will show you a meta tag like: `<meta name="google-site-verification" content="ABC123..." />`
2. Copy this tag
3. Contact me and I'll add it to your site's `<head>` section
4. Return to Google Search Console and click **Verify**

### Step 3: Submit Your Sitemap

1. In Google Search Console, click **Sitemaps** (left sidebar)
2. Enter: `sitemap.xml`
3. Click **Submit**

Google will now start crawling and indexing your pages. Check back in 7-14 days to see your pages appearing in search results.

### Step 4: Monitor Performance

After 2-4 weeks, check the **Performance** tab to see:
- Which keywords are driving traffic
- Your average position in search results
- Click-through rates

**Optimization Tips:**
- Target keywords with high impressions but low clicks (improve your titles/descriptions)
- Create blog content around high-volume keywords
- Build backlinks from solar industry websites

---

## Channel 3: Facebook & Instagram Ads (Visual Marketing)

**Why This Works:** Highly visual platform perfect for showcasing solar installations. Great for retargeting website visitors and building brand awareness.

### Step 1: Create Facebook Business Account

1. Go to [business.facebook.com](https://business.facebook.com)
2. Click **Create Account**
3. Enter your business name: **SolarlyAU**
4. Fill in your details and click **Submit**

### Step 2: Set Up Facebook Pixel

1. In Facebook Business Manager, click **Business Settings** (gear icon)
2. Click **Data Sources** → **Pixels**
3. Click **Add** → **Create a Pixel**
4. Name it: **SolarlyAU Pixel**
5. Click **Create**
6. You'll see your **Pixel ID** (a long number like `123456789012345`)
7. **Copy this Pixel ID**

### Step 3: Install Your Pixel ID

1. Contact me with your Pixel ID
2. I'll replace `YOUR_PIXEL_ID` in your site's code with your actual ID
3. Return to Facebook and click **Continue Pixel Setup**
4. Choose **Install code manually** → Click **Check** to verify installation

### Step 4: Create Your First Campaign

1. Go to [facebook.com/adsmanager](https://facebook.com/adsmanager)
2. Click **+ Create**
3. Choose objective: **Leads**
4. Click **Continue**

**Campaign Settings:**

- **Campaign name:** Solar Quote Leads - Australia
- **Special ad category:** Select **"Housing"** (required for home services)
- **Budget:** $30-50 per day
- **Campaign bid strategy:** Lowest cost

**Ad Set Settings:**

- **Conversion:** Website → Lead (your pixel event)
- **Budget:** $30 per day
- **Schedule:** Run continuously
- **Audience:**
  - Location: Australia → Add QLD, NSW, WA, SA
  - Age: 35-65
  - Gender: All
  - Detailed targeting: 
    - Homeowners
    - Interested in: Solar energy, Renewable energy, Sustainability
    - Behaviors: Likely to move (homeowners)
- **Placements:** Automatic (Facebook & Instagram feeds)

**Ad Creative:**

- **Format:** Single image or carousel
- **Primary text:** "Thinking about solar panels? Get 3 free quotes from verified installers in your area. Compare prices and save thousands on electricity bills. 100% free service."
- **Headline:** "Get Free Solar Quotes Today"
- **Description:** "Australia's #1 Solar Comparison Platform"
- **Call-to-action button:** "Get Quote"
- **Destination:** `https://solarlyau.com/get-quote`

**Image Ideas:**
- Solar panels on Australian homes (bright, sunny)
- Happy homeowners with electricity bills showing savings
- Before/after electricity bill comparisons
- Map of Australia highlighting your service areas

### Step 5: Create Retargeting Campaign

1. Create a second campaign: **Solar Retargeting**
2. Objective: **Conversions**
3. Custom audience: **Website visitors (past 30 days)**
4. Show ads to people who visited `/get-quote` but didn't submit
5. Lower budget: $10-20/day
6. More aggressive messaging: "Still thinking about solar? Get your free quote in 2 minutes"

**Expected Results:**
- Week 1: 5-15 leads
- Month 1: 50-100 leads
- Cost per lead: $15-30

---

## Channel 4: SEO Content Strategy (Long-term Growth)

**Why This Matters:** Organic traffic is free and compounds over time. A well-optimized blog can generate 100+ leads/month after 6-12 months.

### Content Ideas (Create 1-2 per week):

1. **"Solar Panel Cost in [City] 2025: Complete Pricing Guide"**
   - Target keyword: "solar panel cost brisbane"
   - Include pricing tables, system size comparisons
   - Link to `/get-quote` page

2. **"Best Solar Panels in Australia 2025: Top 10 Brands Compared"**
   - Target keyword: "best solar panels australia"
   - Product comparisons, pros/cons tables
   - CTA: Get quotes for these brands

3. **"How Much Can You Save With Solar Panels in [State]?"**
   - Target keyword: "solar panel savings qld"
   - Include savings calculator
   - Real case studies from your installers

4. **"Solar Rebates & Incentives in Australia 2025"**
   - Target keyword: "solar rebates australia"
   - Government incentives, STC calculator
   - State-by-state breakdown

5. **"6.6kW Solar System: Complete Guide & Best Prices"**
   - Target keyword: "6.6kw solar system price"
   - Most popular system size in Australia
   - Include installation costs, payback period

### SEO Optimization Checklist:

- [ ] Use target keyword in page title
- [ ] Use target keyword in first paragraph
- [ ] Include keyword in at least 2 headings
- [ ] Add internal links to `/get-quote` page
- [ ] Include images with alt text
- [ ] Write 1500+ words per article
- [ ] Add FAQ schema markup
- [ ] Include "Get Free Quote" CTA every 300 words

---

## Budget Recommendations

**Startup Budget (Month 1):**
- Google Ads: $1,500-3,000 ($50-100/day)
- Facebook Ads: $900-1,500 ($30-50/day)
- **Total:** $2,400-4,500/month

**Expected ROI:**
- Leads generated: 150-300
- Revenue (at $60 avg): $9,000-18,000
- **Net profit:** $4,500-13,500/month

**Scale-up Budget (Month 3+):**
- Google Ads: $6,000/month ($200/day)
- Facebook Ads: $3,000/month ($100/day)
- **Total:** $9,000/month
- **Expected revenue:** $36,000-54,000/month
- **Net profit:** $27,000-45,000/month

---

## Tracking & Analytics

### Key Metrics to Monitor Daily:

1. **Website Traffic**
   - Check Google Analytics dashboard
   - Track visitors to `/get-quote` page
   - Monitor bounce rate (should be <60%)

2. **Lead Volume**
   - Check admin dashboard → Leads tab
   - Filter by `source: web_form`
   - Track conversion rate (target: 15-25%)

3. **Cost Per Lead**
   - Google Ads: $10-20 per lead (good)
   - Facebook Ads: $15-30 per lead (good)
   - If higher, pause low-performing keywords/audiences

4. **Lead Quality**
   - Check quality scores in admin dashboard
   - Track installer acceptance rate (target: >70%)
   - Monitor installer feedback

### Weekly Review Checklist:

- [ ] Review Google Ads performance (pause bad keywords)
- [ ] Review Facebook Ads performance (test new creatives)
- [ ] Check lead quality scores
- [ ] Review installer feedback
- [ ] Adjust bids based on cost per lead
- [ ] Test new ad copy variations
- [ ] Analyze top-performing landing pages

---

## Next Steps

**Immediate Actions (This Week):**

1. ✅ Set up Google Ads account and create first campaign
2. ✅ Verify website in Google Search Console
3. ✅ Submit sitemap to Google
4. ✅ Set up Facebook Business account and Pixel
5. ✅ Create first Facebook ad campaign

**Short-term Actions (This Month):**

1. Monitor campaign performance daily
2. Optimize based on data (pause bad keywords, increase budget on winners)
3. Create 2-4 blog posts for SEO
4. Set up retargeting campaigns
5. Test different ad creatives and copy

**Long-term Strategy (3-6 Months):**

1. Scale winning campaigns (increase budget 20% per week)
2. Expand to new geographic areas (VIC, TAS)
3. Build backlink profile for SEO
4. Create video testimonials for ads
5. Launch referral program for installers
6. Test Google Display Network for brand awareness

---

## Support & Questions

If you need help with any of these steps:

1. **Technical issues** (tracking codes, website changes): Contact me directly
2. **Google Ads support**: [support.google.com/google-ads](https://support.google.com/google-ads)
3. **Facebook Ads support**: [facebook.com/business/help](https://facebook.com/business/help)

**Pro Tip:** Start with Google Ads first (highest ROI), then add Facebook Ads after you've optimized your Google campaigns. Don't try to do everything at once—focus on one channel, master it, then expand.

---

**Your system is ready to generate real revenue. Follow this guide step-by-step, and you'll have your first real leads within 48 hours of launching Google Ads.**

Good luck! 🚀

---

*Document created by Manus AI for SolarlyAU - December 2025*
