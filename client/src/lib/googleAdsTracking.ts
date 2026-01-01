/**
 * Google Ads Conversion Tracking
 * 
 * This module handles Google Ads conversion tracking for quote submissions.
 * It sends conversion events to Google Ads when users submit the quote form.
 */

/**
 * Track a Google Ads conversion
 * 
 * @param conversionLabel - The conversion label from Google Ads
 * @param conversionValue - Optional value of the conversion (e.g., estimated lead value)
 */
export function trackGoogleAdsConversion(
  conversionLabel: string,
  conversionValue?: number
) {
  // Check if gtag is available (loaded from Google Ads script)
  if (typeof window !== 'undefined' && (window as any).gtag) {
    const gtag = (window as any).gtag;
    
    gtag('event', 'conversion', {
      'send_to': conversionLabel,
      'value': conversionValue || 0,
      'currency': 'AUD',
    });
    
    console.log('[GoogleAds] Conversion tracked:', conversionLabel, conversionValue);
  } else {
    console.warn('[GoogleAds] gtag not available, conversion not tracked');
  }
}

/**
 * Track a quote submission conversion
 * 
 * This is called when a user successfully submits the quote form.
 * The conversion value is estimated based on typical lead value.
 */
export function trackQuoteSubmission() {
  // Estimated value of a solar quote lead
  const estimatedLeadValue = 80; // $80 AUD average lead value
  
  // TODO: Replace with your actual Google Ads conversion label
  // You'll get this from Google Ads > Tools > Conversions > Your conversion action
  const conversionLabel = 'CONVERSION_LABEL_PLACEHOLDER';
  
  trackGoogleAdsConversion(conversionLabel, estimatedLeadValue);
}

/**
 * Initialize Google Ads tracking
 * 
 * This should be called once when the app loads.
 * It loads the Google Ads gtag.js script.
 * 
 * @param conversionId - Your Google Ads conversion ID (e.g., 'AW-123456789')
 */
export function initializeGoogleAdsTracking(conversionId: string) {
  if (typeof window === 'undefined') return;
  
  // Check if already initialized
  if ((window as any).gtagInitialized) return;
  
  // Load gtag.js script
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${conversionId}`;
  document.head.appendChild(script);
  
  // Initialize gtag
  (window as any).dataLayer = (window as any).dataLayer || [];
  function gtag(...args: any[]) {
    (window as any).dataLayer.push(arguments);
  }
  (window as any).gtag = gtag;
  
  gtag('js', new Date());
  gtag('config', conversionId);
  
  (window as any).gtagInitialized = true;
  
  console.log('[GoogleAds] Tracking initialized:', conversionId);
}

/**
 * Get conversion ID from environment
 * 
 * Returns the Google Ads conversion ID if configured.
 */
export function getGoogleAdsConversionId(): string | null {
  // This would come from environment variables in production
  // For now, return null to indicate not configured
  return null;
}
