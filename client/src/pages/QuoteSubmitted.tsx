import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, Phone, Mail, Clock, Users } from "lucide-react";
import { Link } from "wouter";
import { APP_LOGO } from "@/const";
import { useEffect } from "react";
import { trackQuoteSubmission } from "@/lib/tracking";
import { trackQuoteSubmission as trackGoogleAdsQuote } from "@/lib/googleAdsTracking";

export default function QuoteSubmitted() {
  // Track conversion when page loads
  useEffect(() => {
    // Track with estimated lead value of $60
    trackQuoteSubmission(60);
    
    // Track Google Ads conversion
    trackGoogleAdsQuote();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={APP_LOGO} alt="SolarlyAU" className="h-10 w-10" />
            <span className="text-2xl font-bold text-orange-600">SolarlyAU</span>
          </div>
          <div className="text-sm text-gray-600">
            <Phone className="inline w-4 h-4 mr-1" />
            1300 SOLAR AU
          </div>
        </div>
      </header>

      {/* Success Message */}
      <section className="py-16">
        <div className="container max-w-3xl text-center">
          {/* Success Icon */}
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-16 h-16 text-green-600" />
          </div>

          {/* Headline */}
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
            Quote Request Received!
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Thank you for choosing SolarlyAU. We're already matching you with the best solar installers in your area.
          </p>

          {/* What Happens Next */}
          <Card className="mb-8">
            <CardContent className="p-8">
              <h2 className="text-2xl font-semibold mb-6">What Happens Next?</h2>
              
              <div className="space-y-6 text-left">
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Users className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">1. Installer Matching (Next 2 Hours)</h3>
                    <p className="text-gray-600">
                      Our AI system is automatically matching your requirements with verified solar installers in your area.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Phone className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">2. Installer Contact (Within 24 Hours)</h3>
                    <p className="text-gray-600">
                      Up to 3 qualified installers will contact you directly to arrange a free site inspection and provide detailed quotes.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Clock className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">3. Compare & Choose (2-7 Days)</h3>
                    <p className="text-gray-600">
                      Review quotes, compare pricing and warranties, then choose the installer that best fits your needs.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Information */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <h3 className="font-semibold text-lg mb-3 flex items-center justify-center gap-2">
              <Mail className="w-5 h-5 text-blue-600" />
              Check Your Email
            </h3>
            <p className="text-gray-700">
              We've sent a confirmation email with your quote request details. 
              If you don't see it, please check your spam folder.
            </p>
          </div>

          {/* Trust Indicators */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="text-3xl font-bold text-orange-600 mb-2">100%</div>
              <div className="text-sm text-gray-600">Free Service</div>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="text-3xl font-bold text-orange-600 mb-2">2,847+</div>
              <div className="text-sm text-gray-600">Happy Customers</div>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="text-3xl font-bold text-orange-600 mb-2">24hrs</div>
              <div className="text-sm text-gray-600">Average Response Time</div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/">
              <Button variant="outline" size="lg">
                Return to Homepage
              </Button>
            </Link>
            <a href="tel:1300765272">
              <Button size="lg" className="bg-orange-600 hover:bg-orange-700">
                <Phone className="w-5 h-5 mr-2" />
                Call Us: 1300 SOLAR AU
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-12 bg-white border-t">
        <div className="container max-w-3xl">
          <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2">How much does this service cost?</h3>
              <p className="text-gray-600">
                Absolutely nothing! Our service is 100% free for homeowners. Installers pay us a small fee only when they successfully purchase your lead.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Are the installers verified?</h3>
              <p className="text-gray-600">
                Yes! All installers in our network are CEC accredited, fully insured, and have been verified through our rigorous approval process.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Am I obligated to accept any quotes?</h3>
              <p className="text-gray-600">
                Not at all. You're free to compare quotes and choose the installer you prefer, or decline all quotes if none meet your requirements.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">What if I have questions?</h3>
              <p className="text-gray-600">
                Our support team is here to help! Call us at 1300 SOLAR AU or email support@solarlyau.com and we'll respond within 24 hours.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-gray-50 py-8">
        <div className="container text-center text-sm text-gray-600">
          <p>© 2025 SolarlyAU. All rights reserved.</p>
          <p className="mt-2">Connecting Australians with trusted solar installers since 2025</p>
        </div>
      </footer>
    </div>
  );
}
