import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Activity,
  Zap,
  DollarSign,
  Users,
  TrendingUp,
  CheckCircle,
  ArrowRight,
  Target,
  BarChart3,
  Sparkles,
  Phone,
  Mail,
  Linkedin,
} from "lucide-react";
import { APP_LOGO, getLoginUrl } from "@/const";
import EmailCapturePopup from "@/components/EmailCapturePopup";
import { SocialProofTicker } from "@/components/SocialProofTicker";
import { MobileMenu } from "@/components/MobileMenu";
import { Link } from "wouter";

export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-blue-50">
        <Activity className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-blue-50">
      {/* Header with small admin button */}
      <header className="absolute top-0 left-0 right-0 z-50">
        <div className="container flex h-16 md:h-20 items-center justify-between gap-2">
          <div className="flex items-center gap-2 shrink-0">
            <img src={APP_LOGO} alt="SolarlyAU" className="h-10 md:h-16 w-auto drop-shadow-lg" />
          </div>
          <nav className="hidden lg:flex items-center gap-4 xl:gap-6">
            <Link href="/pricing">
              <Button variant="ghost" className="text-gray-700 hover:text-orange-600 text-sm">
                Pricing
              </Button>
            </Link>
            <Link href="/for-installers">
              <Button variant="ghost" className="text-gray-700 hover:text-orange-600 text-sm">
                For Installers
              </Button>
            </Link>
            <Link href="/success-stories">
              <Button variant="ghost" className="text-white hover:text-white/80 text-sm">
                Success Stories
              </Button>
            </Link>
            {isAuthenticated ? (
              <Link href="/installer/dashboard">
                <Button variant="ghost" className="text-white hover:text-white/80 text-sm">
                  Dashboard
                </Button>
              </Link>
            ) : (
              <a href={getLoginUrl()}>
                <Button variant="ghost" className="text-white hover:text-white/80 text-sm">
                  Login
                </Button>
              </a>
            )}
            <Link href="/faq">
              <Button variant="ghost" className="text-gray-700 hover:text-orange-600 text-sm">
                FAQ
              </Button>
            </Link>
          </nav>
          <div className="flex items-center gap-2 shrink-0">
            {/* Mobile Menu */}
            <MobileMenu isAuthenticated={isAuthenticated} />
            
            {/* Admin Button */}
            {isAuthenticated && user?.role === "admin" ? (
              <Link href="/dashboard">
                <Button 
                  size="sm" 
                  variant="outline"
                  className="bg-black text-white hover:bg-gray-800 border-black text-[10px] md:text-xs px-2 md:px-3 py-1 h-7 md:h-8"
                >
                  Admin
                </Button>
              </Link>
            ) : (
              <Button 
                size="sm" 
                variant="outline"
                asChild 
                className="bg-black text-white hover:bg-gray-800 border-black text-[10px] md:text-xs px-2 md:px-3 py-1 h-7 md:h-8"
              >
                <a href={getLoginUrl()}>Admin</a>
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section with Background Image */}
      <section 
        className="relative min-h-[600px] flex items-center justify-center bg-cover bg-center"
        style={{ backgroundImage: 'url(/hero-bg.jpg)' }}
      >
        {/* Overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70"></div>
        
        <div className="container relative z-10 py-32 md:py-40">
          <div className="mx-auto max-w-4xl text-center">
            <Badge className="mb-6 px-2.5 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm shadow-2xl bg-orange-500 text-white border-0 hover:bg-orange-600 max-w-[90vw] sm:max-w-none mx-auto inline-flex items-center justify-center">
              <Sparkles className="w-2.5 h-2.5 sm:w-4 sm:h-4 mr-1 sm:mr-2 animate-pulse shrink-0" />
              <span className="text-[9px] sm:text-sm leading-tight">100% Autonomous AI System • Running 24/7</span>
            </Badge>
            <h1 className="text-6xl md:text-8xl font-black tracking-tight mb-8 text-white drop-shadow-2xl">
              Solar Leads on
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-yellow-300 to-orange-400">
                Autopilot
              </span>
            </h1>
            <p className="text-2xl md:text-3xl text-white mb-6 leading-relaxed drop-shadow-lg font-semibold">
              Australia's First Fully Autonomous Solar Lead Generation System
            </p>
            <p className="text-lg md:text-xl text-gray-200 mb-8 max-w-3xl mx-auto drop-shadow-md">
              Our AI generates high-quality leads across <span className="font-bold text-yellow-300">QLD, NSW, WA, and SA</span>, 
                 automatically matches them with local installers, and handles all payments. <span className="font-bold text-yellow-300">Zero manual work required.</span>
            </p>
            
            {/* Social Proof Ticker */}
            <div className="mb-12 max-w-4xl mx-auto">
              <SocialProofTicker />
            </div>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link href="/get-quote">
                <Button 
                  size="lg" 
                  className="w-full sm:w-auto text-xl px-12 py-8 shadow-2xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 border-0 font-bold"
                >
                  <Zap className="mr-3 w-6 h-6" />
                  Get Free Solar Quote
                </Button>
              </Link>
              {isAuthenticated && user?.role === "admin" ? (
                <Link href="/dashboard">
                  <Button 
                    size="lg" 
                    variant="outline"
                    className="w-full sm:w-auto text-xl px-12 py-8 shadow-2xl bg-white/90 hover:bg-white border-2 border-white font-bold"
                  >
                    <BarChart3 className="mr-3 w-6 h-6" />
                    Admin Dashboard
                  </Button>
                </Link>
              ) : (
                <Link href="/installer/signup">
                  <Button 
                    size="lg" 
                    variant="outline"
                    className="w-full sm:w-auto text-xl px-12 py-8 shadow-2xl bg-white/90 hover:bg-white border-2 border-white font-bold"
                  >
                    <Users className="mr-3 w-6 h-6" />
                    For Installers
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="container py-20 -mt-16 relative z-20">
        <div className="grid gap-8 md:grid-cols-3 max-w-5xl mx-auto">
          <Card className="text-center shadow-2xl border-4 border-orange-200 bg-white/95 backdrop-blur">
            <CardHeader className="pb-4">
              <CardTitle className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-orange-500 to-orange-600">
                24/7
              </CardTitle>
              <CardDescription className="text-lg font-semibold text-gray-700">
                Autonomous Operation
              </CardDescription>
            </CardHeader>
          </Card>
          <Card className="text-center shadow-2xl border-4 border-orange-200 bg-white/95 backdrop-blur">
            <CardHeader className="pb-4">
              <CardTitle className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-orange-500 to-orange-600">
                100%
              </CardTitle>
              <CardDescription className="text-lg font-semibold text-gray-700">
                Automated Workflow
              </CardDescription>
            </CardHeader>
          </Card>
          <Card className="text-center shadow-2xl border-4 border-orange-200 bg-white/95 backdrop-blur">
            <CardHeader className="pb-4">
              <CardTitle className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-orange-500 to-orange-600">
                4 States
              </CardTitle>
              <CardDescription className="text-lg font-semibold text-gray-700">
                QLD, NSW, WA, SA
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container py-20">
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-black mb-6 text-transparent bg-clip-text bg-gradient-to-r from-orange-600 via-orange-500 to-yellow-500">
            How It Works
          </h2>
          <p className="text-xl md:text-2xl text-gray-700 max-w-3xl mx-auto font-medium">
            Six autonomous systems working together to generate revenue while you sleep
          </p>
        </div>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto">
          {/* AI Lead Generation */}
          <Card className="shadow-2xl hover:shadow-3xl transition-all border-4 border-orange-100 hover:border-orange-300 bg-white">
            <CardHeader>
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center mb-6 shadow-xl">
                <Zap className="w-10 h-10 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">AI Lead Generation</CardTitle>
              <CardDescription className="text-base text-gray-600 leading-relaxed">
                Autonomous AI generates qualified solar leads every 4 hours using advanced algorithms
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-orange-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Generates leads every 4 hours</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-orange-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Quality scoring 0-100</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-orange-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Focuses on warmest states</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Smart Matching */}
          <Card className="shadow-2xl hover:shadow-3xl transition-all border-4 border-orange-100 hover:border-orange-300 bg-white">
            <CardHeader>
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center mb-6 shadow-xl">
                <Target className="w-10 h-10 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">Smart Matching</CardTitle>
              <CardDescription className="text-base text-gray-600 leading-relaxed">
                Automatically matches leads with the closest qualified installers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-orange-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Distance-based matching</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-orange-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Installer capacity tracking</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-orange-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Auto-accept options</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Automated Payments */}
          <Card className="shadow-2xl hover:shadow-3xl transition-all border-4 border-orange-100 hover:border-orange-300 bg-white">
            <CardHeader>
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center mb-6 shadow-xl">
                <DollarSign className="w-10 h-10 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">Automated Payments</CardTitle>
              <CardDescription className="text-base text-gray-600 leading-relaxed">
                Stripe integration handles all payments, invoicing, and refunds automatically
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-orange-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Secure Stripe payments</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-orange-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Automatic invoicing</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-orange-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Revenue tracking</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Installer Recruitment */}
          <Card className="shadow-2xl hover:shadow-3xl transition-all border-4 border-orange-100 hover:border-orange-300 bg-white">
            <CardHeader>
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center mb-6 shadow-xl">
                <Users className="w-10 h-10 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">Installer Recruitment</CardTitle>
              <CardDescription className="text-base text-gray-600 leading-relaxed">
                AI finds and recruits installers via LinkedIn, voice calls, and email campaigns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <Linkedin className="w-6 h-6 text-orange-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">LinkedIn prospecting (20/day)</span>
                </li>
                <li className="flex items-start gap-3">
                  <Phone className="w-6 h-6 text-orange-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">AI voice calls (10/day)</span>
                </li>
                <li className="flex items-start gap-3">
                  <Mail className="w-6 h-6 text-orange-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Email campaigns (30/day)</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Revenue Optimization */}
          <Card className="shadow-2xl hover:shadow-3xl transition-all border-4 border-orange-100 hover:border-orange-300 bg-white">
            <CardHeader>
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center mb-6 shadow-xl">
                <TrendingUp className="w-10 h-10 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">Revenue Optimization</CardTitle>
              <CardDescription className="text-base text-gray-600 leading-relaxed">
                AI continuously optimizes pricing and matching
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-orange-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Dynamic pricing ($60-$300)</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-orange-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Quality-based pricing</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-orange-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Market analysis</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Real-time Monitoring */}
          <Card className="shadow-2xl hover:shadow-3xl transition-all border-4 border-orange-100 hover:border-orange-300 bg-white">
            <CardHeader>
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center mb-6 shadow-xl">
                <BarChart3 className="w-10 h-10 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">Real-time Monitoring</CardTitle>
              <CardDescription className="text-base text-gray-600 leading-relaxed">
                Comprehensive dashboard shows all system activity and performance metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-orange-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Live system status</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-orange-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Revenue analytics</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-orange-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Performance metrics</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Success Stories Section */}
      <section className="container py-20">
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-orange-500 text-white px-4 py-2 text-sm">Installer Success Stories</Badge>
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6">
            Real Results from Real Installers
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            See how Australian solar installers are growing their business with SolarlyAU
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3 max-w-6xl mx-auto mb-12">
          {/* Testimonial 1 */}
          <Card className="shadow-xl hover:shadow-2xl transition-all border-2 border-orange-100">
            <CardContent className="p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold text-xl">
                  JM
                </div>
                <div>
                  <p className="font-bold text-gray-900">James Mitchell</p>
                  <p className="text-sm text-gray-600">Solar Bright, Melbourne</p>
                </div>
              </div>
              <div className="mb-4">
                <div className="flex gap-1 mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span key={star} className="text-yellow-400 text-xl">★</span>
                  ))}
                </div>
              </div>
              <p className="text-gray-700 italic mb-6">
                "SolarlyAU transformed our lead generation. We went from 2-3 leads per week to 15+ qualified leads. The ROI is incredible - we're closing 60% of leads at an average deal size of $12,000."
              </p>
              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <p className="text-2xl font-bold text-green-600">320%</p>
                  <p className="text-xs text-gray-600">ROI</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-orange-600">60%</p>
                  <p className="text-xs text-gray-600">Conversion Rate</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Testimonial 2 */}
          <Card className="shadow-xl hover:shadow-2xl transition-all border-2 border-orange-100">
            <CardContent className="p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-xl">
                  SC
                </div>
                <div>
                  <p className="font-bold text-gray-900">Sarah Chen</p>
                  <p className="text-sm text-gray-600">Sunboost Solar, Gold Coast</p>
                </div>
              </div>
              <div className="mb-4">
                <div className="flex gap-1 mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span key={star} className="text-yellow-400 text-xl">★</span>
                  ))}
                </div>
              </div>
              <p className="text-gray-700 italic mb-6">
                "The lead quality is outstanding. Every lead is pre-qualified and ready to buy. We've closed $180,000 in sales in just 3 months. Best investment we've made this year."
              </p>
              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <p className="text-2xl font-bold text-green-600">$180K</p>
                  <p className="text-xs text-gray-600">Revenue (3mo)</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-orange-600">55%</p>
                  <p className="text-xs text-gray-600">Conversion Rate</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Testimonial 3 */}
          <Card className="shadow-xl hover:shadow-2xl transition-all border-2 border-orange-100">
            <CardContent className="p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-bold text-xl">
                  DW
                </div>
                <div>
                  <p className="font-bold text-gray-900">David Wong</p>
                  <p className="text-sm text-gray-600">Solar Warehouse, Sydney</p>
                </div>
              </div>
              <div className="mb-4">
                <div className="flex gap-1 mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span key={star} className="text-yellow-400 text-xl">★</span>
                  ))}
                </div>
              </div>
              <p className="text-gray-700 italic mb-6">
                "Finally, a lead platform that actually works. The leads are exclusive, the pricing is fair, and the support is excellent. We're averaging $15,000 per closed deal."
              </p>
              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <p className="text-2xl font-bold text-green-600">$15K</p>
                  <p className="text-xs text-gray-600">Avg Deal Size</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-orange-600">65%</p>
                  <p className="text-xs text-gray-600">Conversion Rate</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <Link href="/success-metrics">
            <Button size="lg" variant="outline" className="text-lg px-8 py-6">
              View All Success Metrics <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container py-20">
        <Card className="max-w-4xl mx-auto shadow-2xl border-4 border-orange-200 bg-gradient-to-br from-orange-500 via-orange-400 to-yellow-400">
          <CardContent className="p-12 text-center">
            <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur flex items-center justify-center mx-auto mb-8 shadow-xl">
              <Sparkles className="w-12 h-12 text-white animate-pulse" />
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6 drop-shadow-lg">
              Ready to Generate Solar Leads Automatically?
            </h2>
            <p className="text-xl text-white/95 mb-10 max-w-2xl mx-auto drop-shadow-md font-medium">
              Join the future of solar lead generation. No laptop required - runs 24/7 in the cloud.
            </p>
            {isAuthenticated && user?.role === "admin" ? (
              <Link href="/dashboard">
                <Button 
                  size="lg" 
                  className="text-xl px-12 py-8 bg-white text-orange-600 hover:bg-gray-100 shadow-2xl font-bold"
                >
                  <BarChart3 className="mr-3 w-6 h-6" />
                  Open Dashboard
                </Button>
              </Link>
            ) : (
              <Button 
                size="lg" 
                asChild 
                className="text-xl px-12 py-8 bg-white text-orange-600 hover:bg-gray-100 shadow-2xl font-bold"
              >
                <a href="/installer/signup">
                  <Zap className="mr-3 w-6 h-6" />
                  Get Started Now
                </a>
              </Button>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Email Capture Popup */}
      <EmailCapturePopup />

      {/* Footer */}
      <footer className="border-t bg-white/50 backdrop-blur py-8">
        <div className="container text-center">
          <p className="text-sm text-gray-600 font-medium">
            © 2025 SolarlyAU. All rights reserved.
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Autonomous Solar Lead Generation for Australia
          </p>
          <div className="mt-4 flex justify-center gap-6">
            <Link href="/privacy" className="text-xs text-gray-500 hover:text-orange-600 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-xs text-gray-500 hover:text-orange-600 transition-colors">
              Terms & Conditions
            </Link>
            <Link href="/faq" className="text-xs text-gray-500 hover:text-orange-600 transition-colors">
              FAQ
            </Link>
            <Link href="/about" className="text-xs text-gray-500 hover:text-orange-600 transition-colors">
              About Us
            </Link>
            <Link href="/testimonials" className="text-xs text-gray-500 hover:text-orange-600 transition-colors">
              Testimonials
            </Link>
            <Link href="/blog" className="text-xs text-gray-500 hover:text-orange-600 transition-colors">
              Blog
            </Link>
            <Link href="/installers" className="text-xs text-gray-500 hover:text-orange-600 transition-colors">
              Find Installers
            </Link>
            <Link href="/contact" className="text-xs text-gray-500 hover:text-orange-600 transition-colors">
              Contact Us
            </Link>
            <Link href="/track-quote" className="text-xs text-gray-500 hover:text-orange-600 transition-colors">
              Track My Quote
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
