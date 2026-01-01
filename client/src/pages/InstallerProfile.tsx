import { Link, useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  MapPin,
  Phone,
  Mail,
  Globe,
  Star,
  CheckCircle,
  Award,
  Users,
  Calendar,
  Zap,
  Shield,
  Clock,
  ThumbsUp,
  Building2,
  Sun
} from "lucide-react";
import { APP_LOGO } from "@/const";
import { trpc } from "@/lib/trpc";

// Fallback installer data for demonstration
const fallbackInstallers: Record<number, {
  id: number;
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  state: string;
  city: string;
  postcode: string;
  abn: string;
  cecAccreditation: string;
  yearsExperience: number;
  installationsCompleted: number;
  rating: number;
  reviewCount: number;
  specialties: string[];
  description: string;
  website: string;
  portfolio: { title: string; size: string; location: string }[];
  reviews: { name: string; rating: number; date: string; comment: string }[];
}> = {
  1: {
    id: 1,
    companyName: "SunPower Solutions Brisbane",
    contactName: "Michael Chen",
    email: "info@sunpowerbrisbane.com.au",
    phone: "07 3000 1234",
    state: "QLD",
    city: "Brisbane",
    postcode: "4000",
    abn: "12 345 678 901",
    cecAccreditation: "A1234567",
    yearsExperience: 12,
    installationsCompleted: 2500,
    rating: 4.9,
    reviewCount: 487,
    specialties: ["Residential", "Commercial", "Battery Storage", "EV Chargers"],
    description: "SunPower Solutions Brisbane has been helping Queensland families go solar since 2012. As a CEC-accredited installer with over 2,500 installations completed, we pride ourselves on quality workmanship, premium products, and exceptional customer service. Our team of 15 certified electricians ensures every installation meets the highest standards.",
    website: "www.sunpowerbrisbane.com.au",
    portfolio: [
      { title: "Residential 10kW System", size: "10kW + 13.5kWh Battery", location: "Paddington, QLD" },
      { title: "Commercial Warehouse", size: "100kW Rooftop", location: "Eagle Farm, QLD" },
      { title: "Multi-Unit Complex", size: "50kW Shared System", location: "South Brisbane, QLD" },
    ],
    reviews: [
      { name: "Sarah M.", rating: 5, date: "November 2024", comment: "Excellent service from start to finish. The team was professional, punctual, and cleaned up perfectly after installation. Highly recommend!" },
      { name: "David L.", rating: 5, date: "October 2024", comment: "Best decision we made. System is performing above expectations and the after-sales support has been fantastic." },
      { name: "Jennifer K.", rating: 4, date: "September 2024", comment: "Great installation, very happy with the system. Minor delay in paperwork but overall excellent experience." },
    ]
  },
  2: {
    id: 2,
    companyName: "Sydney Solar Experts",
    contactName: "James Wilson",
    email: "hello@sydneysolarexperts.com.au",
    phone: "02 9000 5678",
    state: "NSW",
    city: "Sydney",
    postcode: "2000",
    abn: "23 456 789 012",
    cecAccreditation: "A2345678",
    yearsExperience: 15,
    installationsCompleted: 4200,
    rating: 4.8,
    reviewCount: 892,
    specialties: ["Residential", "Commercial", "Industrial", "Off-Grid"],
    description: "Sydney Solar Experts is one of NSW's most trusted solar installation companies. With 15 years of experience and over 4,200 installations, we've helped thousands of Sydney homes and businesses reduce their energy costs. We offer premium tier-1 panels, industry-leading warranties, and dedicated after-sales support.",
    website: "www.sydneysolarexperts.com.au",
    portfolio: [
      { title: "Heritage Home Installation", size: "8kW Integrated System", location: "Balmain, NSW" },
      { title: "Office Building", size: "150kW Commercial", location: "Parramatta, NSW" },
      { title: "Factory Rooftop", size: "500kW Industrial", location: "Wetherill Park, NSW" },
    ],
    reviews: [
      { name: "Robert T.", rating: 5, date: "December 2024", comment: "Professional team, competitive pricing, and the system is generating more than quoted. Very impressed!" },
      { name: "Michelle P.", rating: 5, date: "November 2024", comment: "From the initial consultation to final inspection, everything was handled smoothly. Great communication throughout." },
      { name: "Andrew S.", rating: 4, date: "October 2024", comment: "Quality installation and good value. Would recommend to anyone considering solar." },
    ]
  },
  3: {
    id: 3,
    companyName: "Perth Green Energy",
    contactName: "Emma Thompson",
    email: "contact@perthgreenenergy.com.au",
    phone: "08 9000 9012",
    state: "WA",
    city: "Perth",
    postcode: "6000",
    abn: "34 567 890 123",
    cecAccreditation: "A3456789",
    yearsExperience: 10,
    installationsCompleted: 1800,
    rating: 4.9,
    reviewCount: 356,
    specialties: ["Residential", "Battery Storage", "Smart Home Integration"],
    description: "Perth Green Energy specializes in premium residential solar and battery solutions. Our focus on quality over quantity means every installation receives personal attention from our experienced team. We're passionate about helping WA families achieve energy independence with the latest solar technology.",
    website: "www.perthgreenenergy.com.au",
    portfolio: [
      { title: "Luxury Home", size: "15kW + 2x Powerwall", location: "Cottesloe, WA" },
      { title: "New Build Integration", size: "12kW + Battery Ready", location: "Scarborough, WA" },
      { title: "Rural Property", size: "20kW Off-Grid System", location: "Margaret River, WA" },
    ],
    reviews: [
      { name: "Lisa H.", rating: 5, date: "December 2024", comment: "Emma and her team were fantastic. They took the time to explain everything and the installation was flawless." },
      { name: "Mark D.", rating: 5, date: "November 2024", comment: "Best solar company in Perth hands down. Professional, knowledgeable, and great after-sales service." },
      { name: "Susan W.", rating: 5, date: "October 2024", comment: "Couldn't be happier with our system. It's been 6 months and we've barely paid any electricity bills!" },
    ]
  }
};

export default function InstallerProfile() {
  const params = useParams();
  const installerId = parseInt(params.id as string);
  
  // Try to fetch from API
  const { data: apiInstaller } = trpc.installers?.getById?.useQuery?.({ id: installerId }) || { data: null };
  
  // Use API data or fallback
  const installer = apiInstaller || fallbackInstallers[installerId];

  if (!installer) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="container py-4 flex items-center justify-between">
            <Link href="/installers" className="inline-flex items-center gap-2 text-slate-600 hover:text-orange-600 transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Back to Directory
            </Link>
            <img src={APP_LOGO} alt="SolarlyAU" className="h-10 w-auto" />
          </div>
        </header>
        <div className="container py-20 text-center">
          <h1 className="text-3xl font-bold text-slate-900 mb-4">Installer Not Found</h1>
          <p className="text-slate-600 mb-8">The installer profile you're looking for doesn't exist.</p>
          <Link href="/installers">
            <Button className="bg-orange-500 hover:bg-orange-600">
              Browse All Installers
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Type guard for fallback data
  const profile = installer as typeof fallbackInstallers[1];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container py-4 flex items-center justify-between">
          <Link href="/installers" className="inline-flex items-center gap-2 text-slate-600 hover:text-orange-600 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Directory
          </Link>
          <img src={APP_LOGO} alt="SolarlyAU" className="h-10 w-auto" />
        </div>
      </header>

      {/* Profile Header */}
      <section className="py-12 bg-gradient-to-br from-orange-50 via-yellow-50 to-blue-50">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              {/* Logo/Avatar */}
              <div className="w-24 h-24 rounded-2xl bg-white shadow-lg flex items-center justify-center">
                <Building2 className="w-12 h-12 text-orange-500" />
              </div>
              
              {/* Info */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-slate-900">{profile.companyName}</h1>
                  <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Verified
                  </Badge>
                </div>
                
                <div className="flex items-center gap-4 text-slate-600 mb-4">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {profile.city}, {profile.state}
                  </span>
                  <span className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    {profile.rating} ({profile.reviewCount} reviews)
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {profile.specialties.map((specialty, i) => (
                    <Badge key={i} variant="secondary">{specialty}</Badge>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <div className="flex flex-col gap-2">
                <Link href="/get-quote">
                  <Button className="bg-orange-500 hover:bg-orange-600 w-full">
                    <Zap className="w-4 h-4 mr-2" />
                    Request Quote
                  </Button>
                </Link>
                <Button variant="outline" className="gap-2">
                  <Phone className="w-4 h-4" />
                  {profile.phone}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="py-6 bg-white border-b">
        <div className="container">
          <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">{profile.yearsExperience}+</div>
              <div className="text-sm text-slate-600">Years Experience</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">{profile.installationsCompleted.toLocaleString()}</div>
              <div className="text-sm text-slate-600">Installations</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">{profile.rating}</div>
              <div className="text-sm text-slate-600">Average Rating</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">CEC</div>
              <div className="text-sm text-slate-600">Accredited</div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="container">
          <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-8">
            {/* Left Column - Main Info */}
            <div className="md:col-span-2 space-y-8">
              {/* About */}
              <Card className="border-0 shadow-md">
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold text-slate-900 mb-4">About</h2>
                  <p className="text-slate-600 leading-relaxed">{profile.description}</p>
                </CardContent>
              </Card>

              {/* Portfolio */}
              <Card className="border-0 shadow-md">
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold text-slate-900 mb-4">Recent Projects</h2>
                  <div className="space-y-4">
                    {profile.portfolio.map((project, i) => (
                      <div key={i} className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg">
                        <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center">
                          <Sun className="w-6 h-6 text-orange-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-slate-900">{project.title}</h3>
                          <p className="text-sm text-slate-600">{project.size}</p>
                          <p className="text-xs text-slate-500">{project.location}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Reviews */}
              <Card className="border-0 shadow-md">
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold text-slate-900 mb-4">Customer Reviews</h2>
                  <div className="space-y-4">
                    {profile.reviews.map((review, i) => (
                      <div key={i} className="p-4 bg-slate-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-slate-900">{review.name}</span>
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, j) => (
                              <Star 
                                key={j} 
                                className={`w-4 h-4 ${j < review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-slate-300'}`} 
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-slate-600 text-sm mb-2">{review.comment}</p>
                        <p className="text-xs text-slate-400">{review.date}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Sidebar */}
            <div className="space-y-6">
              {/* Contact Card */}
              <Card className="border-0 shadow-md">
                <CardContent className="p-6">
                  <h3 className="font-bold text-slate-900 mb-4">Contact Information</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm">
                      <Users className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-600">{profile.contactName}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Phone className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-600">{profile.phone}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Mail className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-600">{profile.email}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Globe className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-600">{profile.website}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Credentials Card */}
              <Card className="border-0 shadow-md">
                <CardContent className="p-6">
                  <h3 className="font-bold text-slate-900 mb-4">Credentials</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Award className="w-5 h-5 text-orange-500" />
                      <div>
                        <p className="text-sm font-medium text-slate-900">CEC Accredited</p>
                        <p className="text-xs text-slate-500">#{profile.cecAccreditation}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Shield className="w-5 h-5 text-green-500" />
                      <div>
                        <p className="text-sm font-medium text-slate-900">Fully Insured</p>
                        <p className="text-xs text-slate-500">Public Liability & WorkCover</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <ThumbsUp className="w-5 h-5 text-blue-500" />
                      <div>
                        <p className="text-sm font-medium text-slate-900">Verified ABN</p>
                        <p className="text-xs text-slate-500">{profile.abn}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Service Area */}
              <Card className="border-0 shadow-md">
                <CardContent className="p-6">
                  <h3 className="font-bold text-slate-900 mb-4">Service Area</h3>
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-orange-500" />
                    <div>
                      <p className="text-sm font-medium text-slate-900">{profile.city} & Surrounds</p>
                      <p className="text-xs text-slate-500">Within 50km radius</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Response Time */}
              <Card className="border-0 shadow-md bg-orange-50">
                <CardContent className="p-6 text-center">
                  <Clock className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                  <p className="font-semibold text-slate-900">Fast Response</p>
                  <p className="text-sm text-slate-600">Usually responds within 2 hours</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-slate-900">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-white mb-6">
              Ready to Get a Quote from {profile.companyName}?
            </h2>
            <p className="text-slate-300 text-lg mb-8">
              Submit your details and receive a personalized solar quote within 24 hours.
            </p>
            <Link href="/get-quote">
              <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white">
                <Zap className="w-5 h-5 mr-2" />
                Get Free Quote Now
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
