import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  ArrowLeft, 
  Star, 
  Quote, 
  Sun, 
  Users,
  MapPin,
  CheckCircle,
  TrendingUp
} from "lucide-react";
import { APP_LOGO } from "@/const";

const customerReviews = [
  {
    name: "Sarah Mitchell",
    location: "Brisbane, QLD",
    rating: 5,
    date: "November 2024",
    systemSize: "6.6kW",
    review: "The whole process was incredibly smooth. I filled out the form and within 24 hours had three quotes from verified installers. The installer I chose was professional, on time, and the system is performing better than expected. Already seeing 80% reduction in my power bills!",
    savings: "$1,200/year"
  },
  {
    name: "Michael Chen",
    location: "Sydney, NSW",
    rating: 5,
    date: "October 2024",
    systemSize: "10kW",
    review: "As a business owner, I was skeptical about solar ROI. SolarlyAU connected me with a commercial installer who understood my needs perfectly. The system paid for itself in 3 years and now I'm essentially getting free electricity. Highly recommend!",
    savings: "$4,500/year"
  },
  {
    name: "Emma Thompson",
    location: "Melbourne, VIC",
    rating: 5,
    date: "September 2024",
    systemSize: "8kW + Battery",
    review: "I wanted a battery system and was worried about finding the right installer. The team at SolarlyAU matched me with a Tesla Powerwall certified installer. The whole setup was seamless and now I have backup power during outages too.",
    savings: "$2,100/year"
  },
  {
    name: "David Williams",
    location: "Perth, WA",
    rating: 5,
    date: "August 2024",
    systemSize: "13kW",
    review: "Running a large household with pool and AC, our bills were astronomical. Got multiple quotes through SolarlyAU and found an installer who designed a system perfect for our usage. Bills went from $800/quarter to under $100!",
    savings: "$2,800/year"
  },
  {
    name: "Jennifer Brown",
    location: "Adelaide, SA",
    rating: 5,
    date: "July 2024",
    systemSize: "5kW",
    review: "First-time homeowner here. Was overwhelmed by all the solar options until I found SolarlyAU. They made it simple to compare quotes and the installer explained everything clearly. Love watching my app show how much power we're generating!",
    savings: "$950/year"
  },
  {
    name: "Robert Taylor",
    location: "Gold Coast, QLD",
    rating: 5,
    date: "June 2024",
    systemSize: "9.9kW",
    review: "Retired and on a fixed income, every dollar counts. The solar system has basically eliminated our electricity bills. The installer was patient, answered all our questions, and the installation was done in one day. Couldn't be happier!",
    savings: "$1,800/year"
  }
];

const installerSuccessStories = [
  {
    company: "SunPower Solutions",
    location: "Brisbane, QLD",
    owner: "James Anderson",
    photo: "JA",
    story: "Since joining SolarlyAU, our business has grown 300%. The leads are pre-qualified and genuinely interested in solar. We've gone from 5 installations per month to over 20. The quality of leads is exceptional.",
    stats: { leads: "150+", conversion: "45%", growth: "300%" }
  },
  {
    company: "Green Energy Experts",
    location: "Sydney, NSW",
    owner: "Lisa Wong",
    photo: "LW",
    story: "We used to spend thousands on Google Ads with mixed results. SolarlyAU's leads convert at nearly double the rate. The phone verification means we're only talking to serious buyers. Game changer for our business.",
    stats: { leads: "200+", conversion: "52%", growth: "250%" }
  },
  {
    company: "Eco Solar Victoria",
    location: "Melbourne, VIC",
    owner: "Mark Stevens",
    photo: "MS",
    story: "As a smaller installer, competing with big companies was tough. SolarlyAU levels the playing field. We get matched with customers in our service area who value quality over price. Our reviews have never been better.",
    stats: { leads: "100+", conversion: "48%", growth: "180%" }
  }
];

export default function Testimonials() {
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
              <Star className="w-4 h-4 fill-current" />
              Real Stories, Real Results
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
              What Our Customers Say
            </h1>
            <p className="text-xl text-slate-600 leading-relaxed">
              Thousands of Australian homeowners and installers trust SolarlyAU. 
              Here's what they have to say about their experience.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="py-8 bg-white border-y">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold text-orange-600">4.9/5</div>
              <div className="text-sm text-slate-600">Average Rating</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-orange-600">10,000+</div>
              <div className="text-sm text-slate-600">Happy Customers</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-orange-600">$15M+</div>
              <div className="text-sm text-slate-600">Customer Savings</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-orange-600">98%</div>
              <div className="text-sm text-slate-600">Would Recommend</div>
            </div>
          </div>
        </div>
      </section>

      {/* Customer Reviews */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
              <Sun className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Homeowner Reviews</h2>
              <p className="text-slate-600">Real feedback from solar customers across Australia</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {customerReviews.map((review, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-6">
                  {/* Rating */}
                  <div className="flex items-center gap-1 mb-3">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                    ))}
                  </div>

                  {/* Review Text */}
                  <div className="relative mb-4">
                    <Quote className="w-8 h-8 text-orange-100 absolute -top-2 -left-2" />
                    <p className="text-slate-600 text-sm leading-relaxed relative z-10">
                      "{review.review}"
                    </p>
                  </div>

                  {/* Customer Info */}
                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <div className="font-semibold text-slate-900">{review.name}</div>
                        <div className="flex items-center gap-1 text-xs text-slate-500">
                          <MapPin className="w-3 h-3" />
                          {review.location}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-slate-500">{review.date}</div>
                        <div className="text-xs font-medium text-orange-600">{review.systemSize}</div>
                      </div>
                    </div>
                    
                    {/* Savings Badge */}
                    <div className="flex items-center gap-2 mt-3 bg-green-50 text-green-700 px-3 py-1.5 rounded-full text-xs font-medium w-fit">
                      <CheckCircle className="w-3 h-3" />
                      Saving {review.savings}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Installer Success Stories */}
      <section className="py-16 md:py-24 bg-slate-50">
        <div className="container">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
              <Users className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Installer Success Stories</h2>
              <p className="text-slate-600">How solar businesses are growing with SolarlyAU</p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {installerSuccessStories.map((story, index) => (
              <Card key={index} className="border-0 shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-orange-500 to-yellow-500 p-6 text-white">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-xl font-bold">
                      {story.photo}
                    </div>
                    <div>
                      <div className="font-bold text-lg">{story.company}</div>
                      <div className="text-white/80 text-sm flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {story.location}
                      </div>
                    </div>
                  </div>
                </div>
                <CardContent className="p-6">
                  <p className="text-slate-600 text-sm leading-relaxed mb-4">
                    "{story.story}"
                  </p>
                  <div className="text-sm text-slate-500 mb-4">— {story.owner}, Owner</div>
                  
                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-2 pt-4 border-t">
                    <div className="text-center">
                      <div className="text-lg font-bold text-orange-600">{story.stats.leads}</div>
                      <div className="text-xs text-slate-500">Leads</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-600">{story.stats.conversion}</div>
                      <div className="text-xs text-slate-500">Conversion</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-blue-600">{story.stats.growth}</div>
                      <div className="text-xs text-slate-500">Growth</div>
                    </div>
                  </div>
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
              Join Thousands of Happy Customers
            </h2>
            <p className="text-slate-300 text-lg mb-8">
              Start your solar journey today and see why so many Australians trust SolarlyAU.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/get-quote">
                <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white">
                  <Sun className="w-5 h-5 mr-2" />
                  Get Your Free Quote
                </Button>
              </Link>
              <Link href="/for-installers">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  Grow Your Business
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
            <Link href="/about" className="hover:text-orange-600">About Us</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
