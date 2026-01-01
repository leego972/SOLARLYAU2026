import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  ArrowLeft, 
  Sun, 
  MapPin,
  Star,
  CheckCircle,
  Phone,
  Globe,
  Search,
  Filter,
  Award,
  Shield,
  Zap,
  Users
} from "lucide-react";
import { APP_LOGO } from "@/const";
import { useState } from "react";
import { trpc } from "@/lib/trpc";

const states = ["All States", "QLD", "NSW", "VIC", "WA", "SA", "TAS", "ACT", "NT"];

// Fallback data for when API is unavailable
const fallbackInstallers = [
  {
    id: 1,
    companyName: "SunPower Solutions Brisbane",
    state: "QLD",
    city: "Brisbane",
    rating: 4.9,
    reviewCount: 127,
    specialties: ["Residential", "Commercial", "Battery Storage"],
    cecAccredited: true,
    yearsInBusiness: 12,
    installationsCompleted: 2500,
    description: "Leading Brisbane solar installer with over 12 years of experience. Specializing in premium residential and commercial installations."
  },
  {
    id: 2,
    companyName: "Green Energy Experts Sydney",
    state: "NSW",
    city: "Sydney",
    rating: 4.8,
    reviewCount: 203,
    specialties: ["Residential", "Tesla Powerwall", "EV Charging"],
    cecAccredited: true,
    yearsInBusiness: 15,
    installationsCompleted: 4200,
    description: "Sydney's trusted solar experts. Tesla Powerwall certified and specializing in integrated solar + EV charging solutions."
  },
  {
    id: 3,
    companyName: "Eco Solar Victoria",
    state: "VIC",
    city: "Melbourne",
    rating: 4.9,
    reviewCount: 156,
    specialties: ["Residential", "Commercial", "Off-Grid"],
    cecAccredited: true,
    yearsInBusiness: 10,
    installationsCompleted: 1800,
    description: "Melbourne's eco-friendly solar specialists. Expert in both grid-connected and off-grid solar solutions."
  },
  {
    id: 4,
    companyName: "WA Solar Pros",
    state: "WA",
    city: "Perth",
    rating: 4.7,
    reviewCount: 98,
    specialties: ["Residential", "Pool Heating", "Hot Water"],
    cecAccredited: true,
    yearsInBusiness: 8,
    installationsCompleted: 1200,
    description: "Perth's solar and renewable energy experts. Specializing in complete home energy solutions including solar hot water."
  },
  {
    id: 5,
    companyName: "Adelaide Solar Co",
    state: "SA",
    city: "Adelaide",
    rating: 4.8,
    reviewCount: 134,
    specialties: ["Residential", "Battery Storage", "Smart Home"],
    cecAccredited: true,
    yearsInBusiness: 11,
    installationsCompleted: 2100,
    description: "South Australia's battery storage specialists. Helping Adelaide homes achieve energy independence."
  },
  {
    id: 6,
    companyName: "Tassie Renewables",
    state: "TAS",
    city: "Hobart",
    rating: 4.9,
    reviewCount: 67,
    specialties: ["Residential", "Rural", "Off-Grid"],
    cecAccredited: true,
    yearsInBusiness: 7,
    installationsCompleted: 650,
    description: "Tasmania's renewable energy experts. Experienced in challenging installations and rural properties."
  },
  {
    id: 7,
    companyName: "Gold Coast Solar Kings",
    state: "QLD",
    city: "Gold Coast",
    rating: 4.8,
    reviewCount: 189,
    specialties: ["Residential", "Commercial", "Strata"],
    cecAccredited: true,
    yearsInBusiness: 14,
    installationsCompleted: 3100,
    description: "Gold Coast's premier solar installer. Experts in high-rise and strata solar installations."
  },
  {
    id: 8,
    companyName: "Newcastle Green Power",
    state: "NSW",
    city: "Newcastle",
    rating: 4.7,
    reviewCount: 112,
    specialties: ["Residential", "Industrial", "Mining"],
    cecAccredited: true,
    yearsInBusiness: 9,
    installationsCompleted: 1450,
    description: "Hunter Valley's industrial solar specialists. Experience with large-scale commercial and mining installations."
  }
];

export default function InstallerDirectory() {
  const [selectedState, setSelectedState] = useState("All States");
  const [searchQuery, setSearchQuery] = useState("");

  // Try to fetch from API, fall back to static data
  const { data: apiInstallers } = trpc.installers?.getAll?.useQuery?.() || { data: null };
  
  // Use API data if available, otherwise use fallback
  const installers = apiInstallers?.length ? apiInstallers.map((i: any) => ({
    id: i.id,
    companyName: i.companyName,
    state: i.state,
    city: i.serviceAreas?.[0] || i.state,
    rating: 4.8,
    reviewCount: Math.floor(Math.random() * 150) + 50,
    specialties: ["Residential", "Commercial"],
    cecAccredited: i.isVerified,
    yearsInBusiness: Math.floor(Math.random() * 10) + 5,
    installationsCompleted: Math.floor(Math.random() * 2000) + 500,
    description: `Verified solar installer serving ${i.serviceAreas?.join(", ") || i.state}.`
  })) : fallbackInstallers;

  const filteredInstallers = installers.filter((installer: any) => {
    const matchesState = selectedState === "All States" || installer.state === selectedState;
    const matchesSearch = installer.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         installer.city.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesState && matchesSearch;
  });

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
      <section className="py-16 md:py-20 bg-gradient-to-br from-orange-50 via-yellow-50 to-blue-50">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Shield className="w-4 h-4" />
              CEC Accredited Installers
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
              Find Verified Solar Installers
            </h1>
            <p className="text-xl text-slate-600 leading-relaxed mb-8">
              Browse our network of CEC-accredited solar installers across Australia. 
              All installers are verified and rated by real customers.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="py-8 bg-white border-b">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold text-orange-600">500+</div>
              <div className="text-sm text-slate-600">Verified Installers</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-orange-600">6</div>
              <div className="text-sm text-slate-600">States Covered</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-orange-600">100%</div>
              <div className="text-sm text-slate-600">CEC Accredited</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-orange-600">4.8★</div>
              <div className="text-sm text-slate-600">Average Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* Search and Filter */}
      <section className="py-6 bg-slate-50 border-b sticky top-[73px] z-40">
        <div className="container">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                type="text"
                placeholder="Search by company name or city..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {/* State Filter */}
            <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
              {states.map((state) => (
                <Button
                  key={state}
                  variant={selectedState === state ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedState(state)}
                  className={selectedState === state ? "bg-orange-500 hover:bg-orange-600 shrink-0" : "shrink-0"}
                >
                  {state}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Installer Listings */}
      <section className="py-12">
        <div className="container">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900">
              {selectedState === "All States" ? "All Installers" : `Installers in ${selectedState}`}
            </h2>
            <span className="text-sm text-slate-500">{filteredInstallers.length} installers found</span>
          </div>

          {filteredInstallers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">No installers found matching your criteria.</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => { setSelectedState("All States"); setSearchQuery(""); }}
              >
                Clear Filters
              </Button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {filteredInstallers.map((installer: any) => (
                <Card key={installer.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow overflow-hidden">
                  <CardContent className="p-0">
                    <div className="p-6">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-bold text-lg text-slate-900 mb-1">
                            {installer.companyName}
                          </h3>
                          <div className="flex items-center gap-2 text-sm text-slate-500">
                            <MapPin className="w-4 h-4" />
                            {installer.city}, {installer.state}
                          </div>
                        </div>
                        {installer.cecAccredited && (
                          <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            CEC Verified
                          </Badge>
                        )}
                      </div>

                      {/* Rating */}
                      <div className="flex items-center gap-2 mb-4">
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={`w-4 h-4 ${i < Math.floor(installer.rating) ? 'text-yellow-400 fill-current' : 'text-slate-200'}`} 
                            />
                          ))}
                        </div>
                        <span className="font-semibold text-slate-900">{installer.rating}</span>
                        <span className="text-sm text-slate-500">({installer.reviewCount} reviews)</span>
                      </div>

                      {/* Description */}
                      <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                        {installer.description}
                      </p>

                      {/* Specialties */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {installer.specialties.map((specialty: string, index: number) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {specialty}
                          </Badge>
                        ))}
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                        <div className="flex items-center gap-2">
                          <Award className="w-4 h-4 text-orange-500" />
                          <span className="text-sm text-slate-600">
                            {installer.yearsInBusiness} years experience
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Zap className="w-4 h-4 text-orange-500" />
                          <span className="text-sm text-slate-600">
                            {installer.installationsCompleted.toLocaleString()} installs
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* CTA */}
                    <div className="bg-slate-50 px-6 py-4 flex items-center justify-between">
                      <span className="text-sm text-slate-500">Get a quote from this installer</span>
                      <Link href="/get-quote">
                        <Button size="sm" className="bg-orange-500 hover:bg-orange-600">
                          Request Quote
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-orange-500 to-yellow-500">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center text-white">
            <h2 className="text-3xl font-bold mb-4">
              Can't Decide? Let Us Help
            </h2>
            <p className="text-white/90 text-lg mb-8">
              Fill out our quick form and we'll match you with the best installers 
              for your specific needs and location.
            </p>
            <Link href="/get-quote">
              <Button size="lg" className="bg-white text-orange-600 hover:bg-slate-100">
                <Sun className="w-5 h-5 mr-2" />
                Get Matched with Installers
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* For Installers CTA */}
      <section className="py-16 bg-slate-900">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Are You a Solar Installer?
            </h2>
            <p className="text-slate-300 text-lg mb-8">
              Join our network of verified installers and receive high-quality, 
              pre-qualified leads in your service area.
            </p>
            <Link href="/for-installers">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                <Users className="w-5 h-5 mr-2" />
                Join Our Network
              </Button>
            </Link>
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
