import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { 
  Sun, 
  Loader2, 
  CheckCircle, 
  Clock, 
  Users, 
  FileText, 
  Calendar,
  Building2,
  MapPin,
  Zap,
  ArrowRight,
  Search,
  AlertCircle
} from "lucide-react";
import { Link } from "wouter";

// Timeline event icons
const eventIcons: Record<string, React.ReactNode> = {
  submitted: <FileText className="w-5 h-5" />,
  verified: <CheckCircle className="w-5 h-5" />,
  matched: <Users className="w-5 h-5" />,
  installer_notified: <Building2 className="w-5 h-5" />,
  installer_viewed: <Search className="w-5 h-5" />,
  installer_responded: <ArrowRight className="w-5 h-5" />,
  quote_received: <FileText className="w-5 h-5" />,
  installation_scheduled: <Calendar className="w-5 h-5" />,
  installation_completed: <Zap className="w-5 h-5" />,
  review_requested: <CheckCircle className="w-5 h-5" />,
};

// Status badge colors
const statusColors: Record<string, string> = {
  new: "bg-blue-100 text-blue-800",
  offered: "bg-yellow-100 text-yellow-800",
  accepted: "bg-green-100 text-green-800",
  sold: "bg-purple-100 text-purple-800",
  expired: "bg-gray-100 text-gray-800",
  invalid: "bg-red-100 text-red-800",
};

export default function TrackQuote() {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [searched, setSearched] = useState(false);

  const { data, isLoading, refetch } = trpc.leadTracking.getLeadStatus.useQuery(
    { email, phone },
    { enabled: false }
  );

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setSearched(true);
    refetch();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Sun className="w-8 h-8 text-orange-500" />
            <span className="text-xl font-bold text-gray-800">SolarlyAU</span>
          </Link>
          <Link href="/get-quote">
            <Button className="bg-orange-500 hover:bg-orange-600">Get Free Quote</Button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          {/* Page Title */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Track Your Quote Request
            </h1>
            <p className="text-gray-600">
              Enter your details to see the status of your solar quote request
            </p>
          </div>

          {/* Search Form */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="w-5 h-5 text-orange-500" />
                Find Your Quote
              </CardTitle>
              <CardDescription>
                Enter the email and phone number you used when requesting a quote
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSearch} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="0412 345 678"
                      required
                    />
                  </div>
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-orange-500 hover:bg-orange-600"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Searching...
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4 mr-2" />
                      Track My Quote
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Results */}
          {searched && data && (
            <>
              {!data.found ? (
                <Card className="border-red-200 bg-red-50">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3 text-red-700">
                      <AlertCircle className="w-6 h-6" />
                      <div>
                        <p className="font-semibold">No Quote Found</p>
                        <p className="text-sm">
                          We couldn't find a quote request with these details. Please check your email and phone number.
                        </p>
                      </div>
                    </div>
                    <div className="mt-4">
                      <Link href="/get-quote">
                        <Button className="bg-orange-500 hover:bg-orange-600">
                          Request a New Quote
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <>
                  {/* Quote Summary */}
                  <Card className="mb-6">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                          <FileText className="w-5 h-5 text-orange-500" />
                          Quote Request #{data.lead?.id}
                        </CardTitle>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[data.lead?.status || "new"]}`}>
                          {data.lead?.status ? data.lead.status.charAt(0).toUpperCase() + data.lead.status.slice(1) : "New"}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <div>
                            <p className="text-xs text-gray-500">Location</p>
                            <p className="font-medium">{data.lead?.suburb}, {data.lead?.state}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-gray-400" />
                          <div>
                            <p className="text-xs text-gray-500">Property Type</p>
                            <p className="font-medium capitalize">{data.lead?.propertyType}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Zap className="w-4 h-4 text-gray-400" />
                          <div>
                            <p className="text-xs text-gray-500">System Size</p>
                            <p className="font-medium">{data.lead?.estimatedSystemSize || "TBD"} kW</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <div>
                            <p className="text-xs text-gray-500">Submitted</p>
                            <p className="font-medium">
                              {data.lead?.createdAt ? new Date(data.lead.createdAt).toLocaleDateString() : "N/A"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Matched Installers */}
                  {data.matchedInstallers && data.matchedInstallers.length > 0 && (
                    <Card className="mb-6">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Users className="w-5 h-5 text-orange-500" />
                          Matched Installers ({data.matchedInstallers.length})
                        </CardTitle>
                        <CardDescription>
                          These installers have been notified about your quote request
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {data.matchedInstallers.map((installer, index) => (
                            <div 
                              key={index}
                              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                                  <Building2 className="w-5 h-5 text-orange-600" />
                                </div>
                                <div>
                                  <p className="font-medium">{installer.companyName}</p>
                                  <p className="text-sm text-gray-500">
                                    Notified {installer.sentAt ? new Date(installer.sentAt).toLocaleDateString() : "recently"}
                                  </p>
                                </div>
                              </div>
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                installer.status === "accepted" ? "bg-green-100 text-green-700" :
                                installer.status === "pending" ? "bg-yellow-100 text-yellow-700" :
                                "bg-gray-100 text-gray-700"
                              }`}>
                                {installer.status === "accepted" ? "Responded" :
                                 installer.status === "pending" ? "Reviewing" :
                                 installer.status}
                              </span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Timeline */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-orange-500" />
                        Activity Timeline
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {data.events && data.events.length > 0 ? (
                        <div className="relative">
                          {/* Timeline line */}
                          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />
                          
                          <div className="space-y-6">
                            {data.events.map((event, index) => (
                              <div key={index} className="relative flex gap-4">
                                {/* Icon */}
                                <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center ${
                                  index === 0 ? "bg-orange-500 text-white" : "bg-gray-100 text-gray-500"
                                }`}>
                                  {eventIcons[event.type] || <Clock className="w-4 h-4" />}
                                </div>
                                
                                {/* Content */}
                                <div className="flex-1 pb-2">
                                  <p className="font-medium text-gray-900">
                                    {event.type?.split("_").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ") || "Event"}
                                  </p>
                                  {event.description && (
                                    <p className="text-sm text-gray-600">{event.description}</p>
                                  )}
                                  {event.installerName && (
                                    <p className="text-sm text-orange-600">{event.installerName}</p>
                                  )}
                                  <p className="text-xs text-gray-400 mt-1">
                                    {new Date(event.createdAt).toLocaleString()}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <Clock className="w-12 h-12 mx-auto mb-2 opacity-50" />
                          <p>Your quote request is being processed.</p>
                          <p className="text-sm">Check back soon for updates!</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Help Section */}
                  <div className="mt-8 text-center">
                    <p className="text-gray-600 mb-4">
                      Need help or have questions about your quote?
                    </p>
                    <Link href="/contact">
                      <Button variant="outline">Contact Support</Button>
                    </Link>
                  </div>
                </>
              )}
            </>
          )}

          {/* Initial State */}
          {!searched && (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-10 h-10 text-orange-500" />
              </div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                Enter Your Details Above
              </h2>
              <p className="text-gray-600 max-w-md mx-auto">
                Use the same email and phone number you provided when requesting your solar quote to track its status.
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 border-t mt-12 py-8">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p>&copy; {new Date().getFullYear()} SolarlyAU. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
