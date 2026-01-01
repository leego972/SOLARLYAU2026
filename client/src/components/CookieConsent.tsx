import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Cookie, X, Settings, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "wouter";

const COOKIE_CONSENT_KEY = "solarlyau_cookie_consent";

type ConsentPreferences = {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
};

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState<ConsentPreferences>({
    essential: true, // Always required
    analytics: true,
    marketing: false,
  });

  useEffect(() => {
    // Check if user has already given consent
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) {
      // Show banner after a short delay for better UX
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    const allConsent: ConsentPreferences = {
      essential: true,
      analytics: true,
      marketing: true,
    };
    saveConsent(allConsent);
  };

  const handleAcceptSelected = () => {
    saveConsent(preferences);
  };

  const handleRejectNonEssential = () => {
    const essentialOnly: ConsentPreferences = {
      essential: true,
      analytics: false,
      marketing: false,
    };
    saveConsent(essentialOnly);
  };

  const saveConsent = (consent: ConsentPreferences) => {
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify({
      ...consent,
      timestamp: new Date().toISOString(),
    }));
    setIsVisible(false);
    
    // Trigger analytics if consented
    if (consent.analytics && typeof window !== "undefined") {
      // Analytics will be enabled based on consent
      console.log("[CookieConsent] Analytics enabled");
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] p-4 md:p-6">
      <Card className={cn(
        "max-w-4xl mx-auto shadow-2xl border-0 overflow-hidden",
        "bg-white/95 backdrop-blur-lg"
      )}>
        <div className="p-4 md:p-6">
          {/* Main Banner */}
          {!showSettings ? (
            <div className="flex flex-col md:flex-row gap-4 md:items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                  <Cookie className="w-6 h-6 text-orange-600" />
                </div>
              </div>
              
              <div className="flex-1">
                <h3 className="font-semibold text-slate-900 mb-1">We value your privacy</h3>
                <p className="text-sm text-slate-600">
                  We use cookies to enhance your browsing experience, serve personalized ads or content, 
                  and analyze our traffic. By clicking "Accept All", you consent to our use of cookies. 
                  Read our <Link href="/privacy" className="text-orange-600 hover:underline">Privacy Policy</Link> for more information.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 md:flex-shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSettings(true)}
                  className="text-slate-600"
                >
                  <Settings className="w-4 h-4 mr-1" />
                  Customize
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRejectNonEssential}
                  className="text-slate-600"
                >
                  Reject All
                </Button>
                <Button
                  size="sm"
                  onClick={handleAcceptAll}
                  className="bg-orange-500 hover:bg-orange-600"
                >
                  <Check className="w-4 h-4 mr-1" />
                  Accept All
                </Button>
              </div>
            </div>
          ) : (
            /* Settings Panel */
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-slate-900">Cookie Preferences</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSettings(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-4 mb-6">
                {/* Essential Cookies */}
                <div className="flex items-start gap-4 p-3 bg-slate-50 rounded-lg">
                  <input
                    type="checkbox"
                    checked={true}
                    disabled
                    className="mt-1 h-4 w-4 rounded border-slate-300"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-slate-900">Essential Cookies</span>
                      <span className="text-xs bg-slate-200 text-slate-600 px-2 py-0.5 rounded">Required</span>
                    </div>
                    <p className="text-sm text-slate-600 mt-1">
                      These cookies are necessary for the website to function and cannot be switched off. 
                      They are usually only set in response to actions made by you such as setting your privacy preferences, 
                      logging in, or filling in forms.
                    </p>
                  </div>
                </div>

                {/* Analytics Cookies */}
                <div className="flex items-start gap-4 p-3 bg-slate-50 rounded-lg">
                  <input
                    type="checkbox"
                    checked={preferences.analytics}
                    onChange={(e) => setPreferences({ ...preferences, analytics: e.target.checked })}
                    className="mt-1 h-4 w-4 rounded border-slate-300 text-orange-600 focus:ring-orange-500"
                  />
                  <div className="flex-1">
                    <span className="font-medium text-slate-900">Analytics Cookies</span>
                    <p className="text-sm text-slate-600 mt-1">
                      These cookies allow us to count visits and traffic sources so we can measure and improve 
                      the performance of our site. They help us know which pages are the most and least popular 
                      and see how visitors move around the site.
                    </p>
                  </div>
                </div>

                {/* Marketing Cookies */}
                <div className="flex items-start gap-4 p-3 bg-slate-50 rounded-lg">
                  <input
                    type="checkbox"
                    checked={preferences.marketing}
                    onChange={(e) => setPreferences({ ...preferences, marketing: e.target.checked })}
                    className="mt-1 h-4 w-4 rounded border-slate-300 text-orange-600 focus:ring-orange-500"
                  />
                  <div className="flex-1">
                    <span className="font-medium text-slate-900">Marketing Cookies</span>
                    <p className="text-sm text-slate-600 mt-1">
                      These cookies may be set through our site by our advertising partners. They may be used 
                      by those companies to build a profile of your interests and show you relevant adverts on other sites.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRejectNonEssential}
                >
                  Reject All
                </Button>
                <Button
                  size="sm"
                  onClick={handleAcceptSelected}
                  className="bg-orange-500 hover:bg-orange-600"
                >
                  Save Preferences
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
