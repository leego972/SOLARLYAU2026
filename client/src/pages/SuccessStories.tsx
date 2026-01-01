import { ArrowRight, Award, DollarSign, TrendingUp, Users, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { APP_TITLE } from "@/const";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { VideoTestimonials } from "@/components/VideoTestimonials";

interface SuccessStory {
  name: string;
  company: string;
  location: string;
  image: string;
  stats: {
    revenue: string;
    closeRate: string;
    leadsPerMonth: string;
    roi: string;
  };
  quote: string;
  challenge: string;
  solution: string;
  results: string[];
  certified: boolean;
}

const stories: SuccessStory[] = [
  {
    name: "James Thompson",
    company: "Solar Solutions QLD",
    location: "Brisbane, QLD",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=James",
    certified: true,
    stats: {
      revenue: "$180K",
      closeRate: "68%",
      leadsPerMonth: "45",
      roi: "12x",
    },
    quote: "SolarlyAU transformed my business from struggling to thriving. The quality of leads is unmatched, and the autonomous system means I focus on installations, not marketing.",
    challenge: "James was spending $3,000/month on Google Ads with a 15% close rate. He was overwhelmed with unqualified leads and wasting time on tire-kickers.",
    solution: "Switched to SolarlyAU's autonomous lead generation and enrolled in the certification program to improve his sales skills.",
    results: [
      "Revenue increased from $60K to $180K in 6 months (+200%)",
      "Close rate jumped from 15% to 68% after certification",
      "Marketing costs dropped from $3,000 to $600/month (-80%)",
      "Now installs 12-15 systems per month (was 4-5)",
      "Achieved ROI of 12x on lead purchases",
    ],
  },
  {
    name: "Sarah Mitchell",
    company: "Eco Solar NSW",
    location: "Sydney, NSW",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
    certified: true,
    stats: {
      revenue: "$320K",
      closeRate: "72%",
      leadsPerMonth: "60",
      roi: "15x",
    },
    quote: "The enrichment add-ons are a game-changer. Knowing the customer's credit score and seeing property photos before I call saves so much time. My close rate is now over 70%.",
    challenge: "Sarah's team was wasting hours on cold calls to unqualified leads. Her close rate was stuck at 22%, and she couldn't scale without hiring more salespeople.",
    solution: "Started using premium enriched leads and implemented the AI-recommended sales scripts from the training program.",
    results: [
      "Close rate increased from 22% to 72% (+227%)",
      "Revenue grew from $95K to $320K in 8 months (+237%)",
      "Reduced sales team time by 40% with pre-qualified leads",
      "Expanded from 1 to 3 installation crews",
      "Won 'Best Solar Installer Sydney 2024' award",
    ],
  },
  {
    name: "Mike Rodriguez",
    company: "Perth Solar Co",
    location: "Perth, WA",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mike",
    certified: false,
    stats: {
      revenue: "$145K",
      closeRate: "42%",
      leadsPerMonth: "35",
      roi: "9x",
    },
    quote: "I was skeptical at first, but after buying 5 leads and closing 3 of them, I was sold. The bundle deals make it affordable, and the quality is consistently high.",
    challenge: "Mike was relying on word-of-mouth referrals and had inconsistent monthly revenue. Some months he'd install 8 systems, other months only 2.",
    solution: "Started with the 'Buy 5 Get 1 Free' bundle to test quality, then scaled up to weekly bundles for consistent lead flow.",
    results: [
      "Stabilized revenue at $145K/year (was $60-120K variable)",
      "Consistent 8-10 installations per month",
      "Close rate of 42% (industry average is 20%)",
      "Reduced reliance on referrals from 90% to 40%",
      "Planning to get certified to boost close rate further",
    ],
  },
  {
    name: "David Chen",
    company: "Green Energy SA",
    location: "Adelaide, SA",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=David",
    certified: true,
    stats: {
      revenue: "$420K",
      closeRate: "78%",
      leadsPerMonth: "75",
      roi: "18x",
    },
    quote: "The commercial leads are pure gold. I closed a $85K system from a SolarlyAU lead last month. The ROI on commercial leads is insane - easily 20-30x.",
    challenge: "David wanted to break into the commercial solar market but didn't know how to find qualified commercial leads. Cold calling businesses wasn't working.",
    solution: "Focused exclusively on SolarlyAU's commercial leads ($200-500 each) and used the certification training to master commercial sales.",
    results: [
      "Pivoted to 70% commercial, 30% residential mix",
      "Revenue jumped from $120K to $420K in 12 months (+250%)",
      "Average deal size increased from $8K to $28K",
      "Close rate of 78% on commercial leads",
      "Hired 2 additional installers to handle demand",
    ],
  },
  {
    name: "Emma Wilson",
    company: "Sunshine Solar VIC",
    location: "Melbourne, VIC",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emma",
    certified: true,
    stats: {
      revenue: "$265K",
      closeRate: "65%",
      leadsPerMonth: "50",
      roi: "14x",
    },
    quote: "The monthly training webinars keep me ahead of the competition. I learn new objection-handling techniques every month, and my revenue keeps growing.",
    challenge: "Emma was good at installations but struggled with sales. She was losing deals to more aggressive competitors despite offering better quality.",
    solution: "Enrolled in the monthly training subscription ($99/month) and implemented the sales techniques learned in webinars.",
    results: [
      "Close rate improved from 28% to 65% in 4 months",
      "Revenue increased from $110K to $265K (+141%)",
      "Learned to handle price objections effectively",
      "Now wins 65% of competitive bids (was 30%)",
      "Became a top contributor in the certified installer community",
    ],
  },
  {
    name: "Tom Anderson",
    company: "Island Solar TAS",
    location: "Hobart, TAS",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Tom",
    certified: false,
    stats: {
      revenue: "$95K",
      closeRate: "38%",
      leadsPerMonth: "25",
      roi: "8x",
    },
    quote: "As the only SolarlyAU installer in Tasmania, I get exclusive access to all TAS leads. It's like having a monopoly on the best leads in the state!",
    challenge: "Tasmania's small market made it hard to find enough qualified leads. Tom was driving 2+ hours to chase low-quality leads from Facebook ads.",
    solution: "Became the first SolarlyAU installer in Tasmania, giving him exclusive access to all TAS leads in his service area.",
    results: [
      "Eliminated 2-hour drives to chase bad leads",
      "Revenue grew from $45K to $95K (+111%)",
      "Close rate of 38% (double his Facebook ad rate)",
      "Reduced marketing spend from $1,200 to $400/month",
      "Now considering certification to boost results further",
    ],
  },
];

export default function SuccessStories() {
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
            <Button variant="ghost" onClick={() => setLocation("/faq")}>
              FAQ
            </Button>
            <Button onClick={() => setLocation("/signup")}>Get Started</Button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 text-center">
        <div className="container">
          <div className="inline-block bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-semibold mb-6">
            Real Results from Real Installers
          </div>
          <h1 className="text-5xl font-bold mb-6">
            Success <span className="text-blue-600">Stories</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            See how Australian solar installers are growing their businesses with {APP_TITLE}'s autonomous lead generation
          </p>
        </div>
      </section>

      {/* Stats Overview */}
      <section className="py-12 bg-white">
        <div className="container">
          <div className="grid md:grid-cols-4 gap-8 max-w-5xl mx-auto text-center">
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">$1.4M+</div>
              <div className="text-gray-600">Combined Revenue Growth</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">64%</div>
              <div className="text-gray-600">Average Close Rate</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">290</div>
              <div className="text-gray-600">Leads Per Month</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">13x</div>
              <div className="text-gray-600">Average ROI</div>
            </div>
          </div>
        </div>
      </section>

      {/* Video Testimonials */}
      <section className="py-20 bg-gray-50">
        <div className="container max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Hear From Real Installers</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Watch how SolarlyAU helped these installers 3x their revenue and close more deals
            </p>
          </div>

          <VideoTestimonials />

          <div className="text-center mt-12">
            <p className="text-gray-600 mb-4">
              Want to share your success story? <strong>We'll feature you and give you $500 in free leads!</strong>
            </p>
            <Button className="bg-blue-600 hover:bg-blue-700">
              Submit Your Story
            </Button>
          </div>
        </div>
      </section>

      {/* Success Stories */}
      <section className="py-20">
        <div className="container max-w-6xl">
          <div className="space-y-16">
            {stories.map((story, index) => (
              <Card key={index} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="grid md:grid-cols-3 gap-8 p-8">
                    {/* Left: Profile */}
                    <div className="text-center md:text-left">
                      <img
                        src={story.image}
                        alt={story.name}
                        className="w-32 h-32 rounded-full mx-auto md:mx-0 mb-4 border-4 border-blue-100"
                      />
                      <h3 className="text-xl font-bold mb-1">{story.name}</h3>
                      <p className="text-gray-600 font-semibold">{story.company}</p>
                      <p className="text-sm text-gray-500 mb-3">{story.location}</p>
                      {story.certified && (
                        <Badge className="bg-blue-600">
                          <Award className="w-3 h-3 mr-1" />
                          Certified
                        </Badge>
                      )}
                      
                      {/* Stats */}
                      <div className="mt-6 space-y-3">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm text-gray-600">Revenue Growth:</span>
                          <span className="font-bold text-green-600">{story.stats.revenue}</span>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm text-gray-600">Close Rate:</span>
                          <span className="font-bold text-blue-600">{story.stats.closeRate}</span>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm text-gray-600">Leads/Month:</span>
                          <span className="font-bold">{story.stats.leadsPerMonth}</span>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm text-gray-600">ROI:</span>
                          <span className="font-bold text-orange-600">{story.stats.roi}</span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Story */}
                    <div className="md:col-span-2">
                      {/* Quote */}
                      <div className="bg-blue-50 p-6 rounded-lg mb-6">
                        <p className="text-lg italic text-gray-700">"{story.quote}"</p>
                      </div>

                      {/* Challenge */}
                      <div className="mb-6">
                        <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                          <Zap className="w-5 h-5 text-orange-600" />
                          The Challenge
                        </h4>
                        <p className="text-gray-600">{story.challenge}</p>
                      </div>

                      {/* Solution */}
                      <div className="mb-6">
                        <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                          <TrendingUp className="w-5 h-5 text-blue-600" />
                          The Solution
                        </h4>
                        <p className="text-gray-600">{story.solution}</p>
                      </div>

                      {/* Results */}
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <DollarSign className="w-5 h-5 text-green-600" />
                          The Results
                        </h4>
                        <ul className="space-y-2">
                          {story.results.map((result, i) => (
                            <li key={i} className="flex items-start gap-2 text-gray-600">
                              <ArrowRight className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                              <span>{result}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Common Themes */}
      <section className="py-20 bg-blue-50">
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-12">Common Success Patterns</h2>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card>
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Certification Matters</h3>
                <p className="text-gray-600 mb-4">
                  Certified installers average <strong>65% close rate</strong> vs 40% for non-certified. The training program pays for itself in 2-3 leads.
                </p>
                <p className="text-sm text-blue-600 font-semibold">
                  4 out of 6 success stories are certified
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Enrichment Boosts ROI</h3>
                <p className="text-gray-600 mb-4">
                  Installers using premium enriched leads report <strong>18x average ROI</strong> vs 9x for standard leads. Pre-qualification saves time.
                </p>
                <p className="text-sm text-green-600 font-semibold">
                  Sarah's close rate: 72% with enrichment
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                  <DollarSign className="w-6 h-6 text-orange-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Commercial = Higher Revenue</h3>
                <p className="text-gray-600 mb-4">
                  Installers focusing on commercial leads see <strong>3-4x higher revenue</strong> per lead. David grew from $120K to $420K in 12 months.
                </p>
                <p className="text-sm text-orange-600 font-semibold">
                  Average commercial deal: $28K vs $8K residential
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-500 text-white">
        <div className="container text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Write Your Success Story?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join 500+ installers growing their businesses with {APP_TITLE}
          </p>
          <div className="flex gap-4 justify-center">
            <Button
              size="lg"
              className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-6"
              onClick={() => setLocation("/signup")}
            >
              Start Today
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white/10 text-lg px-8 py-6"
              onClick={() => setLocation("/pricing")}
            >
              View Pricing
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
