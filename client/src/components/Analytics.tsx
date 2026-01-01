import { useEffect } from "react";
import { useLocation } from "wouter";

/**
 * Analytics Tracking Component
 * Tracks page views and custom events
 */

// Google Analytics Measurement ID
const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID || "";

// Initialize Google Analytics
export function initializeAnalytics() {
  if (!GA_MEASUREMENT_ID) {
    console.warn("[Analytics] GA_MEASUREMENT_ID not set - analytics disabled");
    return;
  }

  // Load Google Analytics script
  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(script);

  // Initialize gtag
  window.dataLayer = window.dataLayer || [];
  function gtag(...args: any[]) {
    window.dataLayer.push(arguments);
  }
  gtag("js", new Date());
  gtag("config", GA_MEASUREMENT_ID);

  console.log("[Analytics] Google Analytics initialized");
}

/**
 * Track page view
 */
export function trackPageView(path: string, title?: string) {
  if (!GA_MEASUREMENT_ID || typeof window.gtag !== "function") return;

  window.gtag("config", GA_MEASUREMENT_ID, {
    page_path: path,
    page_title: title || document.title,
  });

  console.log(`[Analytics] Page view: ${path}`);
}

/**
 * Track custom event
 */
export function trackEvent(
  eventName: string,
  eventParams?: Record<string, any>
) {
  if (!GA_MEASUREMENT_ID || typeof window.gtag !== "function") return;

  window.gtag("event", eventName, eventParams);

  console.log(`[Analytics] Event: ${eventName}`, eventParams);
}

/**
 * Track email capture conversion
 */
export function trackEmailCapture(email: string, source: string) {
  trackEvent("email_capture", {
    email_domain: email.split("@")[1],
    source,
    event_category: "engagement",
    event_label: "Email Lead Captured",
  });
}

/**
 * Track installer signup
 */
export function trackInstallerSignup(companyName: string, state: string) {
  trackEvent("installer_signup", {
    company_name: companyName,
    state,
    event_category: "conversion",
    event_label: "Installer Registration",
  });
}

/**
 * Track lead purchase
 */
export function trackLeadPurchase(
  leadId: number,
  price: number,
  leadType: string
) {
  trackEvent("lead_purchase", {
    lead_id: leadId,
    value: price / 100, // Convert cents to dollars
    currency: "AUD",
    lead_type: leadType,
    event_category: "revenue",
    event_label: "Lead Purchased",
  });
}

/**
 * Track referral link click
 */
export function trackReferralClick(referrerId: number) {
  trackEvent("referral_click", {
    referrer_id: referrerId,
    event_category: "engagement",
    event_label: "Referral Link Clicked",
  });
}

/**
 * Track video testimonial view
 */
export function trackVideoView(testimonialId: number, installerName: string) {
  trackEvent("video_view", {
    testimonial_id: testimonialId,
    installer_name: installerName,
    event_category: "engagement",
    event_label: "Testimonial Video Viewed",
  });
}

/**
 * Track CTA button clicks
 */
export function trackCTAClick(buttonName: string, location: string) {
  trackEvent("cta_click", {
    button_name: buttonName,
    location,
    event_category: "engagement",
    event_label: "CTA Button Clicked",
  });
}

/**
 * Analytics Provider Component
 * Automatically tracks page views
 */
export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  useEffect(() => {
    // Initialize analytics on mount
    initializeAnalytics();
  }, []);

  useEffect(() => {
    // Track page view on route change
    trackPageView(location);
  }, [location]);

  return <>{children}</>;
}

// TypeScript declarations
declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}
