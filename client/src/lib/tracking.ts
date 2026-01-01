/**
 * Marketing tracking utilities for Google Ads and Facebook Pixel
 */

// Google Ads Conversion Tracking
export function trackGoogleAdsConversion(conversionLabel: string, value?: number) {
  if (typeof window === 'undefined') return;
  
  // @ts-ignore
  if (window.gtag) {
    // @ts-ignore
    window.gtag('event', 'conversion', {
      'send_to': `AW-CONVERSION_ID/${conversionLabel}`,
      'value': value || 1.0,
      'currency': 'AUD'
    });
  }
}

// Facebook Pixel Tracking
export function trackFacebookEvent(eventName: string, params?: Record<string, any>) {
  if (typeof window === 'undefined') return;
  
  // @ts-ignore
  if (window.fbq) {
    // @ts-ignore
    window.fbq('track', eventName, params);
  }
}

// Track quote form submission
export function trackQuoteSubmission(leadValue: number) {
  // Google Ads conversion
  trackGoogleAdsConversion('quote_submission', leadValue);
  
  // Facebook Pixel
  trackFacebookEvent('Lead', {
    content_name: 'Solar Quote Request',
    value: leadValue,
    currency: 'AUD'
  });
  
  // Google Analytics (already integrated via umami)
  if (typeof window !== 'undefined' && (window as any).umami) {
    (window as any).umami.track('quote_submission', {
      value: leadValue
    });
  }
}

// Track installer signup
export function trackInstallerSignup() {
  trackGoogleAdsConversion('installer_signup');
  trackFacebookEvent('CompleteRegistration', {
    content_name: 'Installer Registration'
  });
  
  if (typeof window !== 'undefined' && (window as any).umami) {
    (window as any).umami.track('installer_signup');
  }
}

// Track lead purchase
export function trackLeadPurchase(amount: number, leadId: number) {
  trackGoogleAdsConversion('lead_purchase', amount);
  trackFacebookEvent('Purchase', {
    value: amount,
    currency: 'AUD',
    content_ids: [leadId],
    content_type: 'product'
  });
  
  if (typeof window !== 'undefined' && (window as any).umami) {
    (window as any).umami.track('lead_purchase', {
      amount,
      leadId
    });
  }
}
