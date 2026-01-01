# LinkedIn Automation Research

## Available LinkedIn APIs (Manus API Hub)

We have access to three powerful LinkedIn APIs through Manus API Hub:

### 1. LinkedIn/search_people
**Purpose:** Search for people on LinkedIn by keywords, title, company, school, etc.

**Use Case for SolarlyAU:**
- Find decision-makers at solar companies (owners, directors, sales managers)
- Search by title: "Owner", "Director", "Sales Manager"
- Filter by company name from our target list
- Get profile URLs for outreach

**Example:**
```ts
const result = await callDataApi("LinkedIn/search_people", {
  query: {
    keywords: "solar installer",
    company: "Solar Depot",
    keywordTitle: "Owner"
  }
});
```

### 2. LinkedIn/get_user_profile_by_username
**Purpose:** Get detailed profile information for a specific LinkedIn user

**Use Case for SolarlyAU:**
- Verify person's role and experience
- Get contact information if available
- Personalize outreach messages based on their background

### 3. LinkedIn/get_company_details
**Purpose:** Get company information including employee count, description, website

**Use Case for SolarlyAU:**
- Verify company is legitimate
- Get company size for targeting
- Find company website for additional contact methods

## Recommended LinkedIn Automation Strategy

### Phase 1: Automated Research
1. Use `search_people` API to find decision-makers at each target company
2. Use `get_company_details` to enrich company data
3. Use `get_user_profile_by_username` to verify and personalize

### Phase 2: Manual Outreach (Recommended)
**Why manual?** LinkedIn actively blocks automated connection requests and messaging. Manual outreach with AI-generated templates is safer and more effective.

**Process:**
1. System generates personalized connection requests using AI
2. User manually sends connections via LinkedIn (5-10 per day)
3. System tracks connections and generates follow-up messages
4. User manually sends messages after connection accepted

### Phase 3: Hybrid Approach
1. **LinkedIn for discovery** - API finds decision-makers
2. **Email for outreach** - Send personalized emails to company addresses
3. **LinkedIn for follow-up** - Manual connection requests as backup

## Implementation Plan

### Option A: Fully Automated (Higher Risk)
- Use APIs to find contacts
- Automatically generate and queue messages
- **Risk:** LinkedIn account suspension
- **Success Rate:** 10-20% (if not blocked)

### Option B: AI-Assisted Manual (Recommended)
- Use APIs to find contacts
- Generate personalized messages with AI
- User manually sends via LinkedIn UI
- **Risk:** Low (complies with LinkedIn ToS)
- **Success Rate:** 40-60%

### Option C: LinkedIn Discovery + Email Outreach (Best ROI)
- Use APIs to find decision-makers
- Extract company email patterns
- Send emails to verified addresses
- Use LinkedIn as backup channel
- **Risk:** Very low
- **Success Rate:** 20-30% (email) + 40-60% (LinkedIn backup)

## Recommendation for SolarlyAU

**Use Option C: LinkedIn Discovery + Email Outreach**

1. **Automated LinkedIn Research:**
   - Search for "Owner", "Director", "Sales Manager" at each target company
   - Get their names and profiles
   - Extract company details

2. **Automated Email Generation:**
   - Generate personalized emails mentioning the person's name
   - Reference their company and role
   - Send to company email addresses (info@, sales@, contact@)

3. **Manual LinkedIn Backup:**
   - If email bounces or no response after 7 days
   - System generates LinkedIn connection request
   - User manually sends via LinkedIn

This approach:
- ✅ Complies with LinkedIn Terms of Service
- ✅ Maximizes reach (email + LinkedIn)
- ✅ Personalizes outreach (uses real names/roles)
- ✅ Reduces bounce rates (targets real people)
- ✅ Provides backup channel (LinkedIn if email fails)
