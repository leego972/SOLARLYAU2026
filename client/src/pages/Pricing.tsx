import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { APP_TITLE } from "@/const";
import { useLocation } from "wouter";
import LiveChatWidget from "@/components/LiveChatWidget";

export default function Pricing() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-orange-600">{APP_TITLE}</h1>
          <nav className="flex gap-6">
            <Button variant="ghost" onClick={() => setLocation("/")}>
              Home
            </Button>
            <Button variant="ghost" onClick={() => setLocation("/for-installers")}>
              For Installers
            </Button>
            <Button onClick={() => setLocation("/signup")}>Get Started</Button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 text-center">
        <div className="container">
          <h1 className="text-5xl font-bold mb-6">
            Simple, Transparent <span className="text-orange-600">Pricing</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Pay only for the leads you need. No subscriptions, no hidden fees. Just high-quality solar leads delivered to your inbox.
          </p>
        </div>
      </section>

      {/* Individual Lead Pricing */}
      <section className="py-12">
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-12">Individual Leads</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Standard Lead */}
            <Card className="relative">
              <CardHeader>
                <CardTitle>Standard Lead</CardTitle>
                <CardDescription>Perfect for getting started</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">$60</span>
                  <span className="text-gray-600">/lead</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Verified contact details</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Property information</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Estimated system size</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Quality score 70-85</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button className="w-full" onClick={() => setLocation("/marketplace")}>
                  Browse Leads
                </Button>
              </CardFooter>
            </Card>

            {/* Premium Lead */}
            <Card className="relative border-orange-600 border-2 shadow-lg">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-orange-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                Most Popular
              </div>
              <CardHeader>
                <CardTitle>Premium Lead</CardTitle>
                <CardDescription>Enhanced with extra data</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">$80</span>
                  <span className="text-gray-600">/lead</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Everything in Standard</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Phone verification ($10 value)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Roof analysis report ($10 value)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Quality score 85-95</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button className="w-full bg-orange-600 hover:bg-orange-700" onClick={() => setLocation("/marketplace")}>
                  Browse Premium Leads
                </Button>
              </CardFooter>
            </Card>

            {/* Commercial Lead */}
            <Card className="relative">
              <CardHeader>
                <CardTitle>Commercial Lead</CardTitle>
                <CardDescription>High-value business properties</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">$240</span>
                  <span className="text-gray-600">/lead</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Everything in Premium</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Commercial property details</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>20-100kW system size</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>$10k-50k project value</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" onClick={() => setLocation("/marketplace")}>
                  Browse Commercial
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </section>

      {/* Bundle Pricing */}
      <section className="py-20 bg-orange-50">
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-4">Save with Bundles</h2>
          <p className="text-center text-gray-600 mb-12">Buy in bulk and get better value</p>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Buy 5 Get 1 Free */}
            <Card>
              <CardHeader>
                <CardTitle>Starter Bundle</CardTitle>
                <CardDescription>Buy 5, Get 1 Free</CardDescription>
                <div className="mt-4">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold">$299</span>
                    <span className="text-gray-400 line-through">$360</span>
                  </div>
                  <p className="text-sm text-green-600 font-semibold mt-1">Save $61 (17%)</p>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>6 high-quality leads</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>$50 per lead (vs $60)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Perfect for testing</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" onClick={() => setLocation("/marketplace")}>
                  Buy Bundle
                </Button>
              </CardFooter>
            </Card>

            {/* Weekly Bundle */}
            <Card className="border-orange-600 border-2">
              <CardHeader>
                <CardTitle>Weekly Bundle</CardTitle>
                <CardDescription>10 leads per week</CardDescription>
                <div className="mt-4">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold">$540</span>
                    <span className="text-gray-400 line-through">$600</span>
                  </div>
                  <p className="text-sm text-green-600 font-semibold mt-1">Save $60 (10%)</p>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>10 high-quality leads</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>$54 per lead (vs $60)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Steady weekly flow</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button className="w-full bg-orange-600 hover:bg-orange-700" onClick={() => setLocation("/marketplace")}>
                  Buy Bundle
                </Button>
              </CardFooter>
            </Card>

            {/* Monthly Bundle */}
            <Card>
              <CardHeader>
                <CardTitle>Monthly Bundle</CardTitle>
                <CardDescription>30 leads per month</CardDescription>
                <div className="mt-4">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold">$1,440</span>
                    <span className="text-gray-400 line-through">$1,800</span>
                  </div>
                  <p className="text-sm text-green-600 font-semibold mt-1">Save $360 (20%)</p>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>30 high-quality leads</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>$48 per lead (vs $60)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Best value for money</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" onClick={() => setLocation("/marketplace")}>
                  Buy Bundle
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </section>

      {/* Lead Enrichment Add-Ons */}
      <section className="py-20">
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-4">Lead Enrichment Add-Ons</h2>
          <p className="text-center text-gray-600 mb-12">Enhance any lead with premium data</p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {/* Phone Verification */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Phone Verification</CardTitle>
                <div className="mt-2">
                  <span className="text-3xl font-bold">+$10</span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  AI calls the lead to verify interest and availability. Get confirmation before you reach out.
                </p>
              </CardContent>
            </Card>

            {/* Property Photos */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Property Photos</CardTitle>
                <div className="mt-2">
                  <span className="text-3xl font-bold">+$5</span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Street view images of the property. See the roof and surroundings before your site visit.
                </p>
              </CardContent>
            </Card>

            {/* Roof Analysis */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Roof Analysis</CardTitle>
                <div className="mt-2">
                  <span className="text-3xl font-bold">+$10</span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  AI-powered roof suitability report. Includes orientation, shading, and recommended system size.
                </p>
              </CardContent>
            </Card>

            {/* Credit Check */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Credit Check</CardTitle>
                <div className="mt-2">
                  <span className="text-3xl font-bold">+$15</span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Financial capability assessment. Know if the lead can afford the installation before investing time.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-12">
            <Card className="inline-block p-6 bg-orange-50 border-orange-200">
              <p className="text-lg font-semibold mb-2">Full Enrichment Package</p>
              <p className="text-4xl font-bold text-orange-600 mb-2">+$40</p>
              <p className="text-sm text-gray-600">All 4 add-ons included (save $10)</p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-orange-600 to-orange-500 text-white">
        <div className="container text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join hundreds of installers already growing their business with {APP_TITLE}
          </p>
          <Button
            size="lg"
            className="bg-white text-orange-600 hover:bg-gray-100 text-lg px-8 py-6"
            onClick={() => setLocation("/signup")}
          >
            Start Buying Leads Today
          </Button>
        </div>
      </section>

      {/* Live Chat Widget */}
      <LiveChatWidget />

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
