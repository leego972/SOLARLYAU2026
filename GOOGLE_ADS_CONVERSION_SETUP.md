# Google Ads Conversion Tracking Setup

## Overview

Your SolarlyAU system is now configured to track Google Ads conversions when users submit the quote form. This allows Google Ads to optimize your campaigns based on actual conversions, not just clicks.

---

## What's Already Implemented

✅ **Conversion tracking code** added to `/quote-submitted` page  
✅ **Tracking utility** created in `client/src/lib/googleAdsTracking.ts`  
✅ **Automatic tracking** fires when quote form is submitted  
✅ **Conversion value** set to $80 AUD (estimated lead value)

---

## Setup Steps (One-Time)

### Step 1: Create Conversion Action in Google Ads

1. **Log into Google Ads**: https://ads.google.com
2. **Go to Tools & Settings** (wrench icon in top right)
3. **Click "Conversions"** under "Measurement"
4. **Click the blue "+" button** to create a new conversion action
5. **Select "Website"** as the conversion source
6. **Choose "Manual code installation"** (not Google Tag Manager)

### Step 2: Configure Conversion Details

Fill in the conversion action details:

- **Conversion name**: `Solar Quote Submission`
- **Category**: `Lead`
- **Value**: `Use different values for each conversion`
- **Count**: `One` (count only one conversion per click)
- **Conversion window**: `30 days`
- **View-through conversion window**: `1 day`
- **Attribution model**: `Data-driven` (or `Last click` if data-driven unavailable)

Click **"Create and Continue"**

### Step 3: Get Your Conversion Label

After creating the conversion action, Google will show you a code snippet that looks like this:

```html
<!-- Event snippet for Solar Quote Submission conversion page -->
<script>
  gtag('event', 'conversion', {'send_to': 'AW-123456789/AbCdEfGhIjKlMnOpQrSt'});
</script>
```

**Copy the part after `send_to`**: `AW-123456789/AbCdEfGhIjKlMnOpQrSt`

This is your **Conversion Label**.

### Step 4: Update Your Code

1. Open `client/src/lib/googleAdsTracking.ts`
2. Find this line:
   ```typescript
   const conversionLabel = 'CONVERSION_LABEL_PLACEHOLDER';
   ```
3. Replace `'CONVERSION_LABEL_PLACEHOLDER'` with your actual conversion label:
   ```typescript
   const conversionLabel = 'AW-123456789/AbCdEfGhIjKlMnOpQrSt';
   ```
4. Save the file

### Step 5: Add Global Site Tag (Optional but Recommended)

For better tracking accuracy, add the Google Ads global site tag to your site:

1. In `client/index.html`, add this to the `<head>` section:

```html
<!-- Google Ads Global Site Tag -->
<script async src="https://www.googletagmanager.com/gtag/js?id=AW-123456789"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'AW-123456789');
</script>
```

**Replace `AW-123456789`** with your actual Google Ads Conversion ID (the part before the `/` in your conversion label).

### Step 6: Deploy and Test

1. Save your changes
2. Deploy to production (click **Publish** in Management UI)
3. Test the conversion tracking:
   - Visit your site
   - Fill out the quote form
   - Submit it
   - Check Google Ads > Conversions to see if it tracked (may take 24 hours to appear)

---

## Verification

### Check if Tracking is Working

1. **Google Ads Dashboard**:
   - Go to Tools & Settings > Conversions
   - Look for "Solar Quote Submission"
   - Check "Recent conversions" column (may take 24 hours)

2. **Browser Console**:
   - Open your site
   - Submit a quote
   - Open browser DevTools (F12)
   - Check Console for: `[GoogleAds] Conversion tracked: ...`

3. **Google Tag Assistant** (Chrome Extension):
   - Install "Tag Assistant Legacy" extension
   - Visit your site and submit a quote
   - Check if Google Ads conversion tag fires

---

## Troubleshooting

### Conversions Not Showing Up

**Problem**: Submitted quotes but no conversions in Google Ads

**Solutions**:
1. Wait 24 hours (Google Ads has a delay)
2. Check browser console for errors
3. Verify conversion label is correct
4. Make sure global site tag is installed
5. Check if ad blockers are interfering

### Duplicate Conversions

**Problem**: Multiple conversions for one quote submission

**Solutions**:
1. Ensure "Count" is set to "One" in conversion settings
2. Check that tracking code only fires once per page load
3. Verify users aren't refreshing the thank-you page

### Conversions Not Attributed to Campaigns

**Problem**: Conversions show up but not linked to specific campaigns

**Solutions**:
1. Make sure global site tag is installed on all pages
2. Verify users are clicking your ads (not direct traffic)
3. Check attribution window settings (30 days recommended)

---

## Advanced: Enhanced Conversions

For even better tracking accuracy, you can enable **Enhanced Conversions** which sends hashed user data (email, phone) to Google:

1. In Google Ads, go to your conversion action
2. Click "Settings"
3. Enable "Enhanced conversions"
4. Update `googleAdsTracking.ts` to include user data:

```typescript
export function trackQuoteSubmission(email?: string, phone?: string) {
  const conversionLabel = 'AW-123456789/AbCdEfGhIjKlMnOpQrSt';
  
  if (typeof window !== 'undefined' && (window as any).gtag) {
    const gtag = (window as any).gtag;
    
    gtag('event', 'conversion', {
      'send_to': conversionLabel,
      'value': 80,
      'currency': 'AUD',
      'email': email,  // User's email (hashed by Google)
      'phone_number': phone,  // User's phone (hashed by Google)
    });
  }
}
```

---

## What This Enables

Once conversion tracking is set up, Google Ads will:

✅ **Optimize bids** to get more conversions (not just clicks)  
✅ **Show performance** in terms of actual leads generated  
✅ **Calculate ROI** accurately (cost per lead)  
✅ **Use Smart Bidding** strategies like Target CPA  
✅ **Improve targeting** to users more likely to convert

---

## Next Steps

1. ✅ Complete the setup steps above
2. ✅ Test conversion tracking
3. ✅ Wait 24-48 hours for data to appear
4. ✅ Switch to Smart Bidding (Target CPA) once you have 30+ conversions
5. ✅ Monitor cost per lead in Google Ads dashboard

---

## Support

If you need help with conversion tracking setup:
- Google Ads Help: https://support.google.com/google-ads/answer/6331314
- Google Tag Assistant: https://tagassistant.google.com/
- Manus Support: support@manus.im

---

*Last Updated: December 10, 2025*
