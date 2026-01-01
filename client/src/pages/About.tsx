import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  ArrowLeft, 
  Sun, 
  Users, 
  Target, 
  Award, 
  Zap, 
  Shield, 
  TrendingUp,
  MapPin,
  Heart,
  Leaf
} from "lucide-react";
import { APP_LOGO } from "@/const";

export default function About() {
  const values = [
    {
      icon: Shield,
      title: "Trust & Transparency",
      description: "We verify every installer and validate every lead, ensuring quality connections for all parties."
    },
    {
      icon: Zap,
      title: "Innovation",
      description: "Our AI-powered platform continuously optimizes lead matching and campaign performance."
    },
    {
      icon: Heart,
      title: "Customer First",
      description: "We're committed to helping Australian homeowners make informed decisions about solar energy."
    },
    {
      icon: Leaf,
      title: "Sustainability",
      description: "Every solar installation we facilitate contributes to Australia's clean energy future."
    }
  ];

  const stats = [
    { value: "10,000+", label: "Leads Generated" },
    { value: "500+", label: "Verified Installers" },
    { value: "98%", label: "Customer Satisfaction" },
    { value: "6", label: "States Covered" }
  ];

  const team = [
    {
      name: "Solar Industry Experts",
      role: "Our team brings decades of combined experience in solar energy, digital marketing, and technology."
    },
    {
      name: "AI & Technology",
      role: "We leverage cutting-edge AI to optimize every aspect of lead generation and matching."
    },
    {
      name: "Customer Success",
      role: "Dedicated support teams ensure both homeowners and installers have the best experience."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container py-4 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2 text-slate-600 hover:text-orange-600 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <img src={APP_LOGO} alt="SolarlyAU" className="h-10 w-auto" />
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-orange-50 via-yellow-50 to-blue-50">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Sun className="w-4 h-4" />
              Powering Australia's Solar Revolution
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
              About SolarlyAU
            </h1>
            <p className="text-xl text-slate-600 leading-relaxed">
              We're on a mission to accelerate Australia's transition to clean energy by connecting 
              homeowners with the best solar installers in their area. Our AI-powered platform makes 
              going solar simple, transparent, and affordable.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white border-y">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-orange-600 mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-slate-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                <Target className="w-6 h-6 text-orange-600" />
              </div>
              <h2 className="text-3xl font-bold text-slate-900">Our Story</h2>
            </div>
            
            <div className="prose prose-lg prose-slate max-w-none">
              <p className="text-slate-600 leading-relaxed mb-6">
                SolarlyAU was founded with a simple observation: the solar industry in Australia was 
                fragmented, with homeowners struggling to find reliable installers and installers 
                spending too much time and money on ineffective marketing.
              </p>
              
              <p className="text-slate-600 leading-relaxed mb-6">
                We built an autonomous lead generation platform that uses artificial intelligence to 
                match homeowners with the perfect solar installers for their needs. Our system verifies 
                every lead through phone verification, ensuring installers only pay for genuine, 
                high-quality opportunities.
              </p>
              
              <p className="text-slate-600 leading-relaxed mb-6">
                Based in Brisbane, Queensland, we now serve solar installers and homeowners across 
                all six Australian states. Our platform has facilitated thousands of solar installations, 
                helping Australian families save money on electricity while reducing their carbon footprint.
              </p>

              <div className="bg-orange-50 border-l-4 border-orange-500 p-6 rounded-r-lg my-8">
                <p className="text-slate-700 italic mb-0">
                  "Our vision is a future where every Australian home is powered by clean, affordable 
                  solar energy. We're building the technology to make that vision a reality."
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-16 md:py-24 bg-slate-50">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Our Values</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              These core principles guide everything we do at SolarlyAU.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {values.map((value, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-6 text-center">
                  <div className="w-14 h-14 rounded-full bg-orange-100 flex items-center justify-center mx-auto mb-4">
                    <value.icon className="w-7 h-7 text-orange-600" />
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-2">{value.title}</h3>
                  <p className="text-sm text-slate-600">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How We Work */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-orange-600" />
              </div>
              <h2 className="text-3xl font-bold text-slate-900">How We Work</h2>
            </div>

            <div className="space-y-8">
              <div className="flex gap-6">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold">
                  1
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 mb-2">AI-Powered Lead Generation</h3>
                  <p className="text-slate-600">
                    Our autonomous system creates and optimizes Google Ads campaigns, targeting 
                    homeowners actively searching for solar solutions in your service area.
                  </p>
                </div>
              </div>

              <div className="flex gap-6">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold">
                  2
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 mb-2">Verified Lead Quality</h3>
                  <p className="text-slate-600">
                    Every lead goes through phone verification to confirm genuine interest. 
                    Our quality scoring system ensures you receive only the most promising opportunities.
                  </p>
                </div>
              </div>

              <div className="flex gap-6">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold">
                  3
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 mb-2">Smart Matching</h3>
                  <p className="text-slate-600">
                    Our algorithm matches leads with installers based on location, capacity, 
                    specialization, and performance history to maximize conversion rates.
                  </p>
                </div>
              </div>

              <div className="flex gap-6">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold">
                  4
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 mb-2">Continuous Optimization</h3>
                  <p className="text-slate-600">
                    Machine learning algorithms continuously improve targeting, pricing, and 
                    matching based on real conversion data and installer feedback.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Coverage Map */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-orange-50 via-yellow-50 to-blue-50">
        <div className="container">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <MapPin className="w-8 h-8 text-orange-600" />
              <h2 className="text-3xl font-bold text-slate-900">Australia-Wide Coverage</h2>
            </div>
            <p className="text-slate-600 max-w-2xl mx-auto">
              We connect homeowners with verified solar installers across all major Australian cities and regions.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 max-w-4xl mx-auto">
            {[
              { state: "QLD", cities: "Brisbane, Gold Coast, Sunshine Coast" },
              { state: "NSW", cities: "Sydney, Newcastle, Wollongong" },
              { state: "VIC", cities: "Melbourne, Geelong, Ballarat" },
              { state: "WA", cities: "Perth, Fremantle, Mandurah" },
              { state: "SA", cities: "Adelaide, Mount Gambier" },
              { state: "TAS", cities: "Hobart, Launceston, Devonport" }
            ].map((region, index) => (
              <Card key={index} className="border-0 shadow-md">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-orange-600 mb-1">{region.state}</div>
                  <div className="text-xs text-slate-500">{region.cities}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-slate-900">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to Go Solar?
            </h2>
            <p className="text-slate-300 text-lg mb-8">
              Whether you're a homeowner looking for quotes or an installer seeking quality leads, 
              we're here to help you succeed.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/get-quote">
                <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white">
                  <Sun className="w-5 h-5 mr-2" />
                  Get Free Solar Quote
                </Button>
              </Link>
              <Link href="/for-installers">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                  <Users className="w-5 h-5 mr-2" />
                  Join as Installer
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white py-8">
        <div className="container text-center text-slate-500 text-sm">
          <p>© {new Date().getFullYear()} SolarlyAU. All rights reserved.</p>
          <div className="mt-2 space-x-4">
            <Link href="/privacy" className="hover:text-orange-600">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-orange-600">Terms & Conditions</Link>
            <Link href="/faq" className="hover:text-orange-600">FAQ</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
