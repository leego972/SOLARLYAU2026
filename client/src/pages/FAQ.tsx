import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { APP_TITLE } from "@/const";
import { useLocation } from "wouter";
import { useState } from "react";

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const faqs: FAQItem[] = [
  // Lead Quality
  {
    category: "Lead Quality",
    question: "How do you ensure lead quality?",
    answer: "Our AI analyzes multiple data points including property suitability, demographic factors, energy usage patterns, and financial capability. Each lead receives a quality score (0-100), and we only deliver leads scoring 70+. Plus, our autonomous quality control system continuously monitors conversion rates and adjusts targeting to maintain high standards.",
  },
  {
    category: "Lead Quality",
    question: "Are leads exclusive or shared?",
    answer: "All leads are 100% exclusive. Each lead is sold to only ONE installer in your service area. Once you purchase a lead, no other installer can access it. This ensures you're not competing with others for the same customer.",
  },
  {
    category: "Lead Quality",
    question: "What's the typical conversion rate?",
    answer: "Our certified installers report an average conversion rate of 25-35% (1 in 3-4 leads becomes a customer). This is significantly higher than industry average (15-20%) because our AI pre-qualifies leads for genuine interest and financial capability.",
  },
  {
    category: "Lead Quality",
    question: "Can I see a sample lead before buying?",
    answer: "Yes! Sign up for a free account and browse the marketplace. You'll see anonymized lead previews showing property details, quality scores, and estimated system sizes. This lets you evaluate quality before making any purchase.",
  },
  
  // Pricing & Payments
  {
    category: "Pricing & Payments",
    question: "How much do leads cost?",
    answer: "Standard residential leads start at $60. Premium leads with enrichment data are $80. Commercial leads range from $200-500 depending on system size. We also offer bundle discounts: buy 5 get 1 free ($299), weekly bundles (10 for $540), and monthly bundles (30 for $1,440).",
  },
  {
    category: "Pricing & Payments",
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards (Visa, Mastercard, Amex) and debit cards through Stripe. Payments are processed instantly and securely. Your card is charged only when you purchase a lead - no subscriptions or recurring fees.",
  },
  {
    category: "Pricing & Payments",
    question: "Is there a subscription fee?",
    answer: "No! There are no monthly fees, subscriptions, or commitments. You only pay for the leads you purchase. Buy one lead or buy 100 - it's completely flexible. Our training program has optional monthly access ($99/month), but lead purchasing is always pay-as-you-go.",
  },
  {
    category: "Pricing & Payments",
    question: "Do you offer refunds?",
    answer: "Yes. If a lead is invalid (wrong contact info, not interested, already installed solar), request a refund within 7 days and our AI will automatically approve it if the claim is valid. We also offer a replacement lead instead of a refund if you prefer. Our refund rate is under 3% because of our quality controls.",
  },
  
  // How It Works
  {
    category: "How It Works",
    question: "How does the autonomous system work?",
    answer: "Our AI runs 24/7 generating leads across Australia. Every 4 hours, it analyzes property data, demographic patterns, and solar suitability to create new leads. It then matches leads with nearby installers based on service area, capacity, and preferences. The entire process is automated - no human intervention required.",
  },
  {
    category: "How It Works",
    question: "How quickly will I receive leads?",
    answer: "Leads are delivered instantly to your dashboard after purchase. You'll receive an email notification with the customer's contact details, property information, and recommended approach. Fresh leads (< 1 hour old) are marked with a premium badge and cost 20% more because they convert better.",
  },
  {
    category: "How It Works",
    question: "What information do I get with each lead?",
    answer: "Standard leads include: full name, phone, email, property address, estimated system size (kW), roof orientation, quality score (0-100), and AI-generated notes. Premium leads add: phone verification status, property photos, roof analysis report, and credit score. Commercial leads include business details and energy usage data.",
  },
  {
    category: "How It Works",
    question: "Can I choose which areas I receive leads from?",
    answer: "Yes! During signup, you specify your service areas by postcode or radius. You can update these anytime in your dashboard. Leads are only shown to installers who service that specific area, ensuring you never waste money on leads you can't service.",
  },
  
  // Service & Support
  {
    category: "Service & Support",
    question: "What states do you cover?",
    answer: "We currently generate leads across 6 Australian states: Queensland (QLD), New South Wales (NSW), Western Australia (WA), South Australia (SA), Victoria (VIC), and Tasmania (TAS). We're expanding to ACT and NT in 2025.",
  },
  {
    category: "Service & Support",
    question: "Do you provide training or support?",
    answer: "Yes! We offer a comprehensive certification program ($299 one-time or $99/month subscription) covering solar sales, lead conversion, customer service, and compliance. Certified installers close 35% more deals on average. We also provide email support and a private community for networking.",
  },
  {
    category: "Service & Support",
    question: "What if I have technical issues?",
    answer: "Our support team responds within 24 hours via email (support@solarlyau.com). For urgent issues like payment problems or lead delivery failures, we offer priority support. Our AI chatbot is also available 24/7 for instant answers to common questions.",
  },
  {
    category: "Service & Support",
    question: "Can I pause or cancel anytime?",
    answer: "Yes! Since there's no subscription, you can simply stop buying leads whenever you want. No cancellation process needed. If you're enrolled in monthly training, you can cancel anytime and won't be charged for the next month.",
  },
  
  // Getting Started
  {
    category: "Getting Started",
    question: "How do I get started?",
    answer: "1) Click 'Sign Up' and create your free account. 2) Complete your installer profile (company details, ABN, service areas). 3) Browse available leads in the marketplace. 4) Purchase your first lead with a credit card. 5) Receive lead details instantly via email and dashboard. The entire process takes under 10 minutes!",
  },
  {
    category: "Getting Started",
    question: "Do I need special qualifications?",
    answer: "You must be a licensed solar installer with a valid ABN and CEC accreditation. We verify these during signup to ensure all installers on our platform are legitimate professionals. This protects both installers and customers.",
  },
  {
    category: "Getting Started",
    question: "Is there a minimum purchase requirement?",
    answer: "No minimum! You can buy a single lead to test the quality, or purchase bundles for better value. Many installers start with our 'Buy 5 Get 1 Free' bundle ($299) to evaluate the system before committing to larger purchases.",
  },
  {
    category: "Getting Started",
    question: "How long does verification take?",
    answer: "ABN verification is instant via automated checks. CEC accreditation verification typically takes 1-2 hours during business hours. Once verified, you can immediately start browsing and purchasing leads. We'll email you when verification is complete.",
  },
];

const categories = Array.from(new Set(faqs.map((f) => f.category)));

export default function FAQ() {
  const [, setLocation] = useLocation();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-orange-600">{APP_TITLE}</h1>
          <nav className="flex gap-6">
            <Button variant="ghost" onClick={() => setLocation("/")}>
              Home
            </Button>
            <Button variant="ghost" onClick={() => setLocation("/pricing")}>
              Pricing
            </Button>
            <Button variant="ghost" onClick={() => setLocation("/success-stories")}>
              Success Stories
            </Button>
            <Button onClick={() => setLocation("/signup")}>Get Started</Button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 text-center">
        <div className="container">
          <h1 className="text-5xl font-bold mb-6">
            Frequently Asked <span className="text-orange-600">Questions</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Everything you need to know about {APP_TITLE}, lead quality, pricing, and getting started
          </p>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="py-12 pb-20">
        <div className="container max-w-4xl">
          {categories.map((category) => (
            <div key={category} className="mb-12">
              <h2 className="text-2xl font-bold mb-6 text-gray-900">{category}</h2>
              <div className="space-y-4">
                {faqs
                  .filter((faq) => faq.category === category)
                  .map((faq, index) => {
                    const globalIndex = faqs.indexOf(faq);
                    const isOpen = openIndex === globalIndex;
                    
                    return (
                      <div
                        key={globalIndex}
                        className="border border-gray-200 rounded-lg bg-white hover:shadow-md transition-shadow"
                      >
                        <button
                          className="w-full px-6 py-4 flex justify-between items-center text-left"
                          onClick={() => setOpenIndex(isOpen ? null : globalIndex)}
                        >
                          <span className="font-semibold text-gray-900 pr-8">
                            {faq.question}
                          </span>
                          <ChevronDown
                            className={`w-5 h-5 text-gray-500 flex-shrink-0 transition-transform ${
                              isOpen ? "rotate-180" : ""
                            }`}
                          />
                        </button>
                        {isOpen && (
                          <div className="px-6 pb-4 text-gray-600 leading-relaxed">
                            {faq.answer}
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-orange-600 to-orange-500 text-white">
        <div className="container text-center">
          <h2 className="text-4xl font-bold mb-6">Still Have Questions?</h2>
          <p className="text-xl mb-8 opacity-90">
            Our support team is here to help. Get in touch anytime.
          </p>
          <div className="flex gap-4 justify-center">
            <Button
              size="lg"
              className="bg-white text-orange-600 hover:bg-gray-100 text-lg px-8 py-6"
              onClick={() => setLocation("/signup")}
            >
              Start Free Trial
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white/10 text-lg px-8 py-6"
              onClick={() => window.location.href = "mailto:support@solarlyau.com"}
            >
              Contact Support
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container text-center">
          <p className="text-gray-400">© 2025 {APP_TITLE}. All rights reserved.</p>
          <p className="text-sm text-gray-500 mt-2">Autonomous Solar Lead Generation for Australia</p>
        </div>
      </footer>
    </div>
  );
}
