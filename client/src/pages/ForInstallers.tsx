import { Award, BookOpen, CheckCircle, GraduationCap, TrendingUp, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { APP_TITLE } from "@/const";
import { useLocation } from "wouter";
import LiveChatWidget from "@/components/LiveChatWidget";

export default function ForInstallers() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
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
            <Button onClick={() => setLocation("/signup")}>Get Started</Button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 text-center">
        <div className="container">
          <div className="inline-block bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold mb-6">
            Professional Development
          </div>
          <h1 className="text-5xl font-bold mb-6">
            Become a <span className="text-blue-600">Certified Solar Professional</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Join our exclusive training program and earn your {APP_TITLE} Certification. Stand out from competitors, close more deals, and grow your business.
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700" onClick={() => setLocation("/signup")}>
              Enroll Now
            </Button>
            <Button size="lg" variant="outline" onClick={() => setLocation("/pricing")}>
              View Pricing
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white">
        <div className="container">
          <div className="grid md:grid-cols-4 gap-8 max-w-5xl mx-auto text-center">
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">500+</div>
              <div className="text-gray-600">Certified Installers</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">35%</div>
              <div className="text-gray-600">Higher Close Rate</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">5 Hours</div>
              <div className="text-gray-600">Total Course Time</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">98%</div>
              <div className="text-gray-600">Pass Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* Training Modules */}
      <section className="py-20">
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-4">Comprehensive Training Curriculum</h2>
          <p className="text-center text-gray-600 mb-12">5 modules covering everything you need to succeed</p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {/* Module 1 */}
            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <GraduationCap className="w-6 h-6 text-blue-600" />
                </div>
                <CardTitle>Solar Installation Basics</CardTitle>
                <CardDescription>45 minutes</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Solar panel types and efficiency</li>
                  <li>• Inverter selection and sizing</li>
                  <li>• Australian Standards AS/NZS 5033</li>
                  <li>• Safety requirements and PPE</li>
                </ul>
              </CardContent>
            </Card>

            {/* Module 2 */}
            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                </div>
                <CardTitle>Solar Sales Mastery</CardTitle>
                <CardDescription>60 minutes</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Objection handling techniques</li>
                  <li>• ROI calculations and presentations</li>
                  <li>• Financing options for customers</li>
                  <li>• Follow-up strategies that work</li>
                </ul>
              </CardContent>
            </Card>

            {/* Module 3 */}
            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <CheckCircle className="w-6 h-6 text-blue-600" />
                </div>
                <CardTitle>Lead Conversion Optimization</CardTitle>
                <CardDescription>30 minutes</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• First contact best practices</li>
                  <li>• Site assessment techniques</li>
                  <li>• Proposal creation that sells</li>
                  <li>• Closing strategies</li>
                </ul>
              </CardContent>
            </Card>

            {/* Module 4 */}
            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <CardTitle>Customer Service Excellence</CardTitle>
                <CardDescription>40 minutes</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Managing customer expectations</li>
                  <li>• Post-installation support</li>
                  <li>• Handling complaints effectively</li>
                  <li>• Generating referrals</li>
                </ul>
              </CardContent>
            </Card>

            {/* Module 5 */}
            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <BookOpen className="w-6 h-6 text-blue-600" />
                </div>
                <CardTitle>Australian Solar Compliance</CardTitle>
                <CardDescription>50 minutes</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• CEC accreditation requirements</li>
                  <li>• STCs and rebates explained</li>
                  <li>• Grid connection requirements</li>
                  <li>• Warranty obligations</li>
                </ul>
              </CardContent>
            </Card>

            {/* Certification */}
            <Card className="border-blue-600 border-2">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Award className="w-6 h-6 text-blue-600" />
                </div>
                <CardTitle>Final Certification</CardTitle>
                <CardDescription>Earn your certificate</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Complete all 5 modules</li>
                  <li>• Pass all quizzes (80%+ score)</li>
                  <li>• Practical assessment</li>
                  <li>• Receive digital certificate</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Plans */}
      <section className="py-20 bg-blue-50">
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-4">Choose Your Plan</h2>
          <p className="text-center text-gray-600 mb-12">Flexible options to fit your learning style</p>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* One-Time Certification */}
            <Card>
              <CardHeader>
                <CardTitle>Certification Only</CardTitle>
                <CardDescription>One-time payment</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">$299</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Access to all 5 modules</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Lifetime certificate access</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Digital certificate</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Badge for your website</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" onClick={() => setLocation("/signup")}>
                  Get Certified
                </Button>
              </CardFooter>
            </Card>

            {/* Monthly Subscription */}
            <Card className="border-blue-600 border-2 shadow-lg">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                Best Value
              </div>
              <CardHeader>
                <CardTitle>Monthly Training</CardTitle>
                <CardDescription>Ongoing education</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">$99</span>
                  <span className="text-gray-600">/month</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Everything in Certification</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Monthly live webinars</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>New content every month</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Private community access</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={() => setLocation("/signup")}>
                  Start Learning
                </Button>
              </CardFooter>
            </Card>

            {/* Bundle */}
            <Card>
              <CardHeader>
                <CardTitle>6-Month Bundle</CardTitle>
                <CardDescription>Save $95 upfront</CardDescription>
                <div className="mt-4">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold">$799</span>
                    <span className="text-gray-400 line-through text-xl">$894</span>
                  </div>
                  <p className="text-sm text-green-600 font-semibold mt-1">Save $95</p>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Certification + 6 months training</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>All monthly benefits</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Priority support</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Best value for money</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" onClick={() => setLocation("/signup")}>
                  Get Bundle
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20">
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-12">Why Get Certified?</h2>
          
          <div className="grid md:grid-cols-2 gap-12 max-w-4xl mx-auto">
            <div>
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-blue-600" />
                Increase Your Revenue
              </h3>
              <p className="text-gray-600">
                Certified installers close 35% more deals on average. Learn proven sales techniques and objection handling strategies that work in the Australian solar market.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Award className="w-6 h-6 text-blue-600" />
                Stand Out from Competitors
              </h3>
              <p className="text-gray-600">
                Display your {APP_TITLE} Certification badge on your website and marketing materials. Show customers you're a verified, professional installer they can trust.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Users className="w-6 h-6 text-blue-600" />
                Join an Exclusive Community
              </h3>
              <p className="text-gray-600">
                Connect with other certified installers, share best practices, and get support from industry experts. Network with Australia's top solar professionals.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <BookOpen className="w-6 h-6 text-blue-600" />
                Stay Up to Date
              </h3>
              <p className="text-gray-600">
                Monthly subscribers get access to new content covering industry changes, new technologies, and evolving sales strategies. Never fall behind.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-blue-50">
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-12">What Our Certified Installers Say</h2>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card>
              <CardContent className="pt-6">
                <div className="flex gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <span key={i} className="text-yellow-400">★</span>
                  ))}
                </div>
                <p className="text-gray-600 mb-4">
                  "The sales training module completely transformed my close rate. I went from 40% to 68% in just 2 months. Best $299 I've ever spent."
                </p>
                <p className="font-semibold">— James T., Brisbane</p>
                <p className="text-sm text-gray-500">Solar Solutions QLD</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <span key={i} className="text-yellow-400">★</span>
                  ))}
                </div>
                <p className="text-gray-600 mb-4">
                  "The certification badge on my website has been a game-changer. Customers specifically mention it when they call. It builds instant trust."
                </p>
                <p className="font-semibold">— Sarah M., Sydney</p>
                <p className="text-sm text-gray-500">Eco Solar NSW</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <span key={i} className="text-yellow-400">★</span>
                  ))}
                </div>
                <p className="text-gray-600 mb-4">
                  "The monthly webinars keep me ahead of the competition. I learn new strategies every month and my revenue keeps growing."
                </p>
                <p className="font-semibold">— Mike R., Perth</p>
                <p className="text-sm text-gray-500">Perth Solar Co</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-500 text-white">
        <div className="container text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Level Up Your Business?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join 500+ certified installers and start closing more deals today
          </p>
          <div className="flex gap-4 justify-center">
            <Button
              size="lg"
              className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-6"
              onClick={() => setLocation("/signup")}
            >
              Enroll in Training
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white/10 text-lg px-8 py-6"
              onClick={() => setLocation("/pricing")}
            >
              View All Pricing
            </Button>
          </div>
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
