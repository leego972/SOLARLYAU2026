import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPolicy() {
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
        <h1 className="text-4xl font-bold text-slate-900 mb-2">Privacy Policy</h1>
        <p className="text-slate-500 mb-8">Last updated: December 2024</p>

        <div className="prose prose-slate max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold text-slate-800 mb-4">1. Introduction</h2>
            <p className="text-slate-600 leading-relaxed">
              SolarlyAU ("we", "our", or "us") operates the solar lead generation marketplace. This Privacy Policy explains how we collect, use, disclose, and safeguard your information in accordance with the Australian Privacy Principles (APPs) contained in the Privacy Act 1988 (Cth). By using our services, you consent to the collection and use of information in accordance with this policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-800 mb-4">2. Information We Collect</h2>
            <h3 className="text-xl font-medium text-slate-700 mb-3">2.1 From Homeowners</h3>
            <p className="text-slate-600 leading-relaxed mb-4">When you request a solar quote, we collect: full name, contact details (email, phone), property address and location, property type and roof characteristics, electricity usage, and phone verification data.</p>
            
            <h3 className="text-xl font-medium text-slate-700 mb-3">2.2 From Solar Installers</h3>
            <p className="text-slate-600 leading-relaxed mb-4">When you register as an installer, we collect: business name, ABN, contact details, service areas, payment information, and licensing details.</p>
            
            <h3 className="text-xl font-medium text-slate-700 mb-3">2.3 Automatically Collected</h3>
            <p className="text-slate-600 leading-relaxed">We automatically collect: IP address, device information, browser type, pages visited, and cookies.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-800 mb-4">3. How We Use Your Information</h2>
            <p className="text-slate-600 leading-relaxed">
              We use your information for: matching homeowners with qualified solar installers, facilitating communication between parties, verifying lead authenticity through phone verification, processing payments, sending service notifications, improving our services, and complying with legal obligations.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-800 mb-4">4. Disclosure of Information</h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              <strong>With Solar Installers:</strong> When a homeowner submits a quote request, their contact information and property details are shared with matched installers who purchase the lead.
            </p>
            <p className="text-slate-600 leading-relaxed mb-4">
              <strong>Service Providers:</strong> We share information with payment processors (Stripe), SMS services (ClickSend), email providers, analytics providers, and cloud hosting.
            </p>
            <p className="text-slate-600 leading-relaxed">
              <strong>Legal Requirements:</strong> We may disclose information if required by law, court order, or to protect rights and safety.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-800 mb-4">5. Data Security</h2>
            <p className="text-slate-600 leading-relaxed">
              We implement appropriate technical and organizational measures including: SSL/TLS encryption, secure database storage with access controls, regular security assessments, employee training, and incident response procedures. However, no method of transmission is 100% secure.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-800 mb-4">6. Your Rights Under Australian Privacy Law</h2>
            <p className="text-slate-600 leading-relaxed">
              Under the Privacy Act 1988 (Cth), you have the right to: access your personal information, request correction of inaccurate data, lodge a complaint with us or the OAIC, and opt out of marketing communications. Contact us to exercise these rights.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-800 mb-4">7. Cookies</h2>
            <p className="text-slate-600 leading-relaxed">
              We use essential cookies (required for functionality), analytics cookies (to understand usage), and marketing cookies (for relevant ads). You can control cookies through your browser settings.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-800 mb-4">8. Data Retention</h2>
            <p className="text-slate-600 leading-relaxed">
              We retain personal information for as long as necessary to fulfill purposes, comply with legal obligations, and enforce agreements. Lead data is typically retained for 7 years for tax and legal compliance.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-800 mb-4">9. Contact Us</h2>
            <div className="bg-slate-50 rounded-lg p-6">
              <p className="text-slate-700 mb-2"><strong>SolarlyAU</strong></p>
              <p className="text-slate-600 mb-1">Email: privacy@solarlyau.com.au</p>
              <p className="text-slate-600 mb-1">Phone: 1300 SOLAR AU</p>
              <p className="text-slate-600">Brisbane, Queensland, Australia</p>
            </div>
            <p className="text-slate-600 leading-relaxed mt-4">
              You may also contact the Office of the Australian Information Commissioner (OAIC): <a href="https://www.oaic.gov.au" className="text-orange-600 hover:underline" target="_blank" rel="noopener noreferrer">www.oaic.gov.au</a>
            </p>
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
