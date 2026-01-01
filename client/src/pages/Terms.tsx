import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";

export default function Terms() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container py-4">
          <Link href="/" className="inline-flex items-center gap-2 text-slate-600 hover:text-orange-600 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </header>

      <main className="container py-12 max-w-4xl">
        <h1 className="text-4xl font-bold text-slate-900 mb-2">Terms and Conditions</h1>
        <p className="text-slate-500 mb-8">Last updated: December 2024</p>

        <div className="prose prose-slate max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold text-slate-800 mb-4">1. Acceptance of Terms</h2>
            <p className="text-slate-600 leading-relaxed">
              By accessing or using SolarlyAU's services, you agree to be bound by these Terms and Conditions. If you do not agree to these terms, you must not use our services. These terms constitute a legally binding agreement between you and SolarlyAU, governed by the laws of Queensland, Australia.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-800 mb-4">2. Service Description</h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              SolarlyAU operates a lead generation marketplace connecting homeowners seeking solar panel installations with qualified solar installers. Our services include:
            </p>
            <ul className="list-disc pl-6 text-slate-600 space-y-2">
              <li>Collecting and verifying solar installation inquiries from homeowners</li>
              <li>Matching leads with registered solar installers based on location and preferences</li>
              <li>Facilitating the sale of verified leads to installers</li>
              <li>Providing a platform for installers to manage and respond to leads</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-800 mb-4">3. Terms for Homeowners</h2>
            <h3 className="text-xl font-medium text-slate-700 mb-3">3.1 Quote Requests</h3>
            <p className="text-slate-600 leading-relaxed mb-4">
              By submitting a quote request, you: (a) confirm that all information provided is accurate and complete; (b) consent to your contact information being shared with up to 5 matched solar installers; (c) understand that installers may contact you via phone, email, or SMS; (d) agree to complete phone verification to confirm your identity.
            </p>
            
            <h3 className="text-xl font-medium text-slate-700 mb-3">3.2 No Obligation</h3>
            <p className="text-slate-600 leading-relaxed">
              Submitting a quote request does not obligate you to purchase solar panels or engage any installer. You are free to accept or decline any quotes received.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-800 mb-4">4. Terms for Solar Installers</h2>
            <h3 className="text-xl font-medium text-slate-700 mb-3">4.1 Registration Requirements</h3>
            <p className="text-slate-600 leading-relaxed mb-4">
              To register as an installer, you must: (a) hold a valid Australian Business Number (ABN); (b) maintain appropriate licenses and accreditations for solar installation; (c) carry adequate public liability and professional indemnity insurance; (d) provide accurate business information.
            </p>
            
            <h3 className="text-xl font-medium text-slate-700 mb-3">4.2 Lead Purchases</h3>
            <p className="text-slate-600 leading-relaxed mb-4">
              When you purchase a lead: (a) payment is processed immediately via your registered payment method; (b) you receive the customer's contact details and property information; (c) you agree to contact the customer within 24 hours; (d) leads are non-refundable except as specified in our refund policy.
            </p>
            
            <h3 className="text-xl font-medium text-slate-700 mb-3">4.3 Lead Quality Guarantee</h3>
            <p className="text-slate-600 leading-relaxed mb-4">
              We guarantee that leads are: (a) verified through phone verification; (b) genuine inquiries from Australian residents; (c) within your specified service area. If a lead does not meet these criteria, you may request a review within 7 days of purchase.
            </p>
            
            <h3 className="text-xl font-medium text-slate-700 mb-3">4.4 Refund Policy</h3>
            <p className="text-slate-600 leading-relaxed">
              Refunds may be issued for: (a) invalid contact information (disconnected phone, bounced email); (b) leads outside your service area; (c) duplicate leads (same customer within 90 days); (d) customers who confirm they did not submit a request. Refund requests must be submitted within 7 days with supporting evidence.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-800 mb-4">5. Pricing and Payment</h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              Lead prices vary based on: location, property type, system size, and lead quality score. All prices are in Australian Dollars (AUD) and include GST. Payment is processed via Stripe using your registered credit card or bank account.
            </p>
            <p className="text-slate-600 leading-relaxed">
              We reserve the right to modify pricing at any time. Price changes will not affect leads already purchased or pending offers.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-800 mb-4">6. Prohibited Conduct</h2>
            <p className="text-slate-600 leading-relaxed mb-4">You agree not to:</p>
            <ul className="list-disc pl-6 text-slate-600 space-y-2">
              <li>Provide false or misleading information</li>
              <li>Use the service for any unlawful purpose</li>
              <li>Attempt to access other users' accounts or data</li>
              <li>Resell or redistribute leads to third parties</li>
              <li>Harass or spam customers with excessive communications</li>
              <li>Interfere with the proper functioning of the platform</li>
              <li>Circumvent any security measures</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-800 mb-4">7. Intellectual Property</h2>
            <p className="text-slate-600 leading-relaxed">
              All content, trademarks, and intellectual property on this platform are owned by SolarlyAU or its licensors. You may not copy, modify, distribute, or create derivative works without our written consent.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-800 mb-4">8. Disclaimer of Warranties</h2>
            <p className="text-slate-600 leading-relaxed">
              Our services are provided "as is" without warranties of any kind. We do not guarantee: (a) that leads will result in sales; (b) the quality of work performed by installers; (c) uninterrupted or error-free service; (d) the accuracy of information provided by users. We are a lead generation service only and are not responsible for the installation work or any disputes between homeowners and installers.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-800 mb-4">9. Limitation of Liability</h2>
            <p className="text-slate-600 leading-relaxed">
              To the maximum extent permitted by law, SolarlyAU shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of our services. Our total liability shall not exceed the amount paid by you in the 12 months preceding the claim.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-800 mb-4">10. Indemnification</h2>
            <p className="text-slate-600 leading-relaxed">
              You agree to indemnify and hold harmless SolarlyAU, its officers, directors, employees, and agents from any claims, damages, losses, or expenses arising from: (a) your use of the service; (b) your violation of these terms; (c) your violation of any third-party rights.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-800 mb-4">11. Termination</h2>
            <p className="text-slate-600 leading-relaxed">
              We may suspend or terminate your account at any time for violation of these terms or for any other reason at our discretion. Upon termination, your right to use the service ceases immediately. Provisions that by their nature should survive termination shall survive.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-800 mb-4">12. Dispute Resolution</h2>
            <p className="text-slate-600 leading-relaxed">
              Any disputes shall be resolved through: (a) good faith negotiation; (b) mediation through the Australian Disputes Centre; (c) if unresolved, the courts of Queensland, Australia. You agree to attempt informal resolution before initiating formal proceedings.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-800 mb-4">13. Governing Law</h2>
            <p className="text-slate-600 leading-relaxed">
              These terms are governed by the laws of Queensland, Australia. You submit to the exclusive jurisdiction of the courts of Queensland for any disputes arising from these terms or your use of our services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-800 mb-4">14. Changes to Terms</h2>
            <p className="text-slate-600 leading-relaxed">
              We reserve the right to modify these terms at any time. Changes will be posted on this page with an updated date. Continued use of the service after changes constitutes acceptance of the new terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-800 mb-4">15. Contact Information</h2>
            <div className="bg-slate-50 rounded-lg p-6">
              <p className="text-slate-700 mb-2"><strong>SolarlyAU</strong></p>
              <p className="text-slate-600 mb-1">Email: legal@solarlyau.com.au</p>
              <p className="text-slate-600 mb-1">Phone: 1300 SOLAR AU</p>
              <p className="text-slate-600">Brisbane, Queensland, Australia</p>
            </div>
          </section>
        </div>
      </main>

      <footer className="border-t bg-slate-50 py-8">
        <div className="container text-center text-slate-500 text-sm">
          <p>© {new Date().getFullYear()} SolarlyAU. All rights reserved.</p>
          <div className="mt-2 space-x-4">
            <Link href="/privacy" className="hover:text-orange-600">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-orange-600">Terms & Conditions</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
