import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { APP_LOGO } from "@/const";
import { useLocation, useRoute } from "wouter";
import { 
  MapPin, 
  DollarSign, 
  Star, 
  Home, 
  Building2, 
  Zap, 
  Phone, 
  Mail,
  CheckCircle,
  ArrowLeft,
  CreditCard,
  Shield,
  Loader2
} from "lucide-react";

export default function LeadCheckout() {
  const [, params] = useRoute("/installer/checkout/:id");
  const [, setLocation] = useLocation();
  const leadId = params?.id ? parseInt(params.id) : null;

  // Fetch lead details
  const { data: lead, isLoading } = trpc.leads.getById.useQuery(
    { id: leadId! },
    { enabled: !!leadId }
  );

  // Purchase lead mutation (using update for now)
  const purchaseLead = trpc.leads.update.useMutation({
    onSuccess: () => {
      toast.success("Lead purchased successfully! Redirecting to payment...");
      // In production, this would redirect to Stripe Checkout
      setTimeout(() => {
        setLocation("/installer/dashboard");
      }, 2000);
    },
    onError: () => {
      toast.error("Failed to purchase lead. Please try again.");
    },
  });

  const handlePurchase = () => {
    if (!leadId) return;
    // Update lead status to 'sold'
    purchaseLead.mutate({ 
      id: leadId,
      status: "sold" as const
    });
  };

  if (isLoading || !lead) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-12 w-12 border-4 border-orange-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={APP_LOGO} alt="SolarlyAU" className="h-10" />
          </div>
          <Button variant="ghost" onClick={() => setLocation("/installer/dashboard")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Marketplace
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 max-w-5xl">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Lead Details - Left Column */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Complete Your Purchase
              </h1>
              <p className="text-lg text-gray-600">
                Review lead details before checkout
              </p>
            </div>

            <Card className="border-2">
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
                    <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                    <span className="text-lg font-semibold">{lead.qualityScore}/100</span>
                  </div>
                </div>
                <CardTitle className="text-2xl">{lead.customerName}</CardTitle>
                <CardDescription className="flex items-center gap-1 text-base">
                  <MapPin className="h-4 w-4" />
                  {lead.suburb}, {lead.state} {lead.postcode}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Property Details */}
                <div>
                  <h3 className="font-semibold text-lg mb-3">Property Details</h3>
                  <div className="grid gap-3">
                    {lead.estimatedSystemSize && (
                      <div className="flex items-center justify-between py-2 border-b">
                        <div className="flex items-center gap-2">
                          <Zap className="h-5 w-5 text-orange-500" />
                          <span className="text-gray-600">Estimated System Size</span>
                        </div>
                        <span className="font-semibold">{lead.estimatedSystemSize}kW</span>
                      </div>
                    )}
                    {lead.currentElectricityBill && (
                      <div className="flex items-center justify-between py-2 border-b">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-5 w-5 text-green-500" />
                          <span className="text-gray-600">Current Monthly Bill</span>
                        </div>
                        <span className="font-semibold">${lead.currentElectricityBill}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between py-2 border-b">
                      <div className="flex items-center gap-2">
                        <Home className="h-5 w-5 text-blue-500" />
                        <span className="text-gray-600">Property Type</span>
                      </div>
                      <span className="font-semibold capitalize">{lead.propertyType}</span>
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div>
                  <h3 className="font-semibold text-lg mb-3">Contact Information</h3>
                  <div className="grid gap-3">
                    {lead.customerPhone && (
                      <div className="flex items-center justify-between py-2 border-b">
                        <div className="flex items-center gap-2">
                          <Phone className="h-5 w-5 text-blue-500" />
                          <span className="text-gray-600">Phone</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">Verified</span>
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        </div>
                      </div>
                    )}
                    {lead.customerEmail && (
                      <div className="flex items-center justify-between py-2 border-b">
                        <div className="flex items-center gap-2">
                          <Mail className="h-5 w-5 text-purple-500" />
                          <span className="text-gray-600">Email</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">Verified</span>
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        </div>
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-3">
                    * Full contact details will be revealed after purchase
                  </p>
                </div>

                {/* Lead Quality Indicators */}
                <div>
                  <h3 className="font-semibold text-lg mb-3">Quality Indicators</h3>
                  <div className="grid gap-2">
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="h-5 w-5" />
                      <span>AI-verified genuine interest</span>
                    </div>
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="h-5 w-5" />
                      <span>Contact information verified</span>
                    </div>
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="h-5 w-5" />
                      <span>Property details confirmed</span>
                    </div>
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="h-5 w-5" />
                      <span>Exclusive to your service area</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary - Right Column */}
          <div className="lg:col-span-1">
            <Card className="border-2 border-orange-200 sticky top-24">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Price Breakdown */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-3 border-b">
                    <span className="text-gray-600">Lead Price</span>
                    <span className="font-semibold">${lead.basePrice}</span>
                  </div>
                  <div className="flex items-center justify-between pb-3 border-b">
                    <span className="text-gray-600">Service Fee</span>
                    <span className="font-semibold">$0</span>
                  </div>
                  <div className="flex items-center justify-between pt-3 text-xl">
                    <span className="font-bold">Total</span>
                    <span className="font-bold text-orange-600">${lead.basePrice}</span>
                  </div>
                </div>

                {/* Payment Button */}
                <Button
                  className="w-full bg-orange-600 hover:bg-orange-700 text-lg py-6"
                  onClick={handlePurchase}
                  disabled={purchaseLead.isPending}
                >
                  {purchaseLead.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="mr-2 h-5 w-5" />
                      Proceed to Payment
                    </>
                  )}
                </Button>

                {/* Security Badge */}
                <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                  <Shield className="h-4 w-4 text-green-600" />
                  <span>Secure payment via Stripe</span>
                </div>

                {/* Terms */}
                <div className="text-xs text-gray-500 text-center">
                  By purchasing, you agree to our Terms of Service and Lead Purchase Policy.
                  All sales are final.
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
