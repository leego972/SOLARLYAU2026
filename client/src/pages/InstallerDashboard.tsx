import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { APP_LOGO } from "@/const";
import { 
  MapPin, 
  DollarSign, 
  Star, 
  Home, 
  Building2, 
  Zap, 
  Phone, 
  Mail,
  Calendar,
  Filter,
  Search,
  TrendingUp,
  CheckCircle,
  Clock
} from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { ProductTour } from "@/components/ProductTour";

export default function InstallerDashboard() {
  const { user, loading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterState, setFilterState] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const LEADS_PER_PAGE = 20;

  // Fetch available leads
  const { data: leads, isLoading: leadsLoading } = trpc.leads.getByStatus.useQuery({
    status: "new"
  });

  // Fetch installer stats (if they're registered)
  const { data: stats } = trpc.analytics.dashboard.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === "admin"
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-orange-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // Filter leads based on search and filters
  const filteredLeads = leads?.filter((lead) => {
    const matchesSearch = 
      lead.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.suburb.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.postcode.includes(searchQuery);
    
    const matchesState = filterState === "all" || lead.state === filterState;
    const matchesType = filterType === "all" || lead.propertyType === filterType;
    
    return matchesSearch && matchesState && matchesType;
  }) || [];

  // Pagination calculations
  const totalPages = Math.ceil(filteredLeads.length / LEADS_PER_PAGE);
  const startIndex = (currentPage - 1) * LEADS_PER_PAGE;
  const endIndex = startIndex + LEADS_PER_PAGE;
  const paginatedLeads = filteredLeads.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterState, filterType]);

  const handlePurchaseLead = (leadId: number) => {
    // Navigate to checkout
    setLocation(`/installer/checkout/${leadId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={APP_LOGO} alt="SolarlyAU" className="h-10" />
          </div>
          <div className="flex items-center gap-4">
            <Button id="my-leads-tab" variant="ghost" onClick={() => setLocation("/installer/my-leads")}>
              My Leads
            </Button>
            <Button id="pricing-link" variant="ghost" onClick={() => setLocation("/pricing")}>
              Pricing
            </Button>
            <Button variant="ghost" onClick={() => setLocation("/")}>
              Home
            </Button>
            {isAuthenticated && user?.role === "admin" && (
              <Button variant="outline" onClick={() => setLocation("/dashboard")}>
                Admin Dashboard
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Product Tour - Auto-starts for first-time users */}
        <ProductTour autoStart={!localStorage.getItem('productTourCompleted')} />
        
        {/* URGENCY BANNER - First Lead Free Promotion */}
        <div className="mb-6 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 rounded-full p-3">
                <Zap className="h-8 w-8" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">🎉 First Lead FREE for New Installers!</h2>
                <p className="text-green-100">Sign up today and get your first lead at no cost. Limited time offer!</p>
              </div>
            </div>
            <Button 
              size="lg" 
              className="bg-white text-green-700 hover:bg-green-50 font-bold px-8"
              onClick={() => setLocation("/installer/signup")}
            >
              Claim Free Lead
            </Button>
          </div>
        </div>

        {/* SCARCITY ALERT */}
        <div className="mb-6 bg-amber-50 border-2 border-amber-300 rounded-lg p-4 flex items-center gap-3">
          <div className="bg-amber-500 text-white rounded-full p-2">
            <Clock className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-amber-800">
              ⚡ {filteredLeads.length} leads available now - Average lead sells within 4 hours!
            </p>
            <p className="text-sm text-amber-700">New leads added every 4 hours. Don't miss out on your next customer.</p>
          </div>
        </div>

        {/* Welcome Section */}
        <div id="dashboard-welcome" className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to Your Lead Dashboard</h1>
          <p className="text-gray-600">Browse and purchase high-quality solar leads in your area</p>
        </div>

        {/* Stats Overview */}
        {stats && (
          <div className="grid gap-6 md:grid-cols-4 mb-8">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Leads
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-orange-600">
                  {stats?.leads?.total || 0}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Available Now
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">
                  {stats?.leads?.new || 0}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Revenue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">
                  ${stats?.revenue?.totalRevenue || 0}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Active Installers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-600">
                  {stats?.installers?.active || 0}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Page Title */}
        <div id="leads-section" className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Available Solar Leads
          </h1>
          <p className="text-lg text-gray-600">
            High-quality leads generated by our AI system across Australia
          </p>
        </div>

        {/* Filters */}
        <Card id="lead-filters" className="mb-8">
          <CardContent className="pt-6">
            <div className="grid gap-4 md:grid-cols-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by name, suburb, or postcode..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <Select value={filterState} onValueChange={setFilterState}>
                  <SelectTrigger>
                    <SelectValue placeholder="All States" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All States</SelectItem>
                    <SelectItem value="QLD">Queensland</SelectItem>
                    <SelectItem value="NSW">New South Wales</SelectItem>
                    <SelectItem value="WA">Western Australia</SelectItem>
                    <SelectItem value="SA">South Australia</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="residential">Residential</SelectItem>
                    <SelectItem value="commercial">Commercial</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Leads Grid */}
        {leadsLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin h-12 w-12 border-4 border-orange-500 border-t-transparent rounded-full"></div>
          </div>
        ) : paginatedLeads.length === 0 ? (
          <Card className="py-20">
            <CardContent className="text-center">
              <Zap className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-2xl font-semibold text-gray-700 mb-2">
                No leads available
              </h3>
              <p className="text-gray-500">
                {searchQuery || filterState !== "all" || filterType !== "all"
                  ? "Try adjusting your filters"
                  : "New leads are generated every 4 hours. Check back soon!"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {paginatedLeads.map((lead, index) => (
              <Card key={lead.id} id={index === 0 ? "lead-card" : undefined} className="hover:shadow-xl transition-shadow border-2 hover:border-orange-300">
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <Badge variant="secondary" className="bg-orange-100 text-orange-700">
                      {lead.propertyType === "residential" ? (
                        <Home className="h-3 w-3 mr-1" />
                      ) : (
                        <Building2 className="h-3 w-3 mr-1" />
                      )}
                      {lead.propertyType}
                    </Badge>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      <span className="text-sm font-semibold">{lead.qualityScore}/100</span>
                    </div>
                  </div>
                  <CardTitle className="text-xl">{lead.customerName}</CardTitle>
                  <CardDescription className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {lead.suburb}, {lead.state} {lead.postcode}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Lead Details */}
                  <div className="space-y-2 text-sm">
                    {lead.estimatedSystemSize && (
                      <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4 text-orange-500" />
                        <span className="text-gray-600">System Size:</span>
                        <span className="font-semibold">{lead.estimatedSystemSize}kW</span>
                      </div>
                    )}
                    {lead.currentElectricityBill && (
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-green-500" />
                        <span className="text-gray-600">Monthly Bill:</span>
                        <span className="font-semibold">${lead.currentElectricityBill}</span>
                      </div>
                    )}
                    {lead.customerPhone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-blue-500" />
                        <span className="text-gray-600">Phone verified</span>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      </div>
                    )}
                    {lead.customerEmail && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-purple-500" />
                        <span className="text-gray-600">Email verified</span>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">Listed:</span>
                      <span className="text-sm">
                        {new Date(lead.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Price and CTA */}
                  <div className="pt-4 border-t">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <div className="text-sm text-gray-600">Lead Price</div>
                        <div className="text-3xl font-bold text-orange-600">
                          ${lead.basePrice}
                        </div>
                      </div>
                      <Badge variant="outline" className="text-green-600 border-green-600">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        High Quality
                      </Badge>
                    </div>
                    <Button
                      id={index === 0 ? "buy-lead-button" : undefined}
                      className="w-full bg-orange-600 hover:bg-orange-700"
                      onClick={() => handlePurchaseLead(lead.id)}
                    >
                      <DollarSign className="mr-2 h-4 w-4" />
                      Purchase Lead
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white rounded-lg p-6 shadow-md">
              <div className="text-sm text-gray-600">
                Showing {startIndex + 1}-{Math.min(endIndex, filteredLeads.length)} of {filteredLeads.length} leads
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ← Previous
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(pageNum)}
                        className={currentPage === pageNum ? "bg-orange-600 hover:bg-orange-700" : ""}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next →
                </Button>
              </div>
            </div>
          )}
          </>
        )}
      </main>
    </div>
  );
}
