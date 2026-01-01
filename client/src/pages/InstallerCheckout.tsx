import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  CreditCard,
  Shield,
  CheckCircle,
  ArrowLeft,
  Lock,
  Loader2,
  AlertTriangle
} from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation, useParams, Link } from "wouter";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "");

function CheckoutForm({ lead, onSuccess }: { lead: any; onSuccess: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Create payment intent mutation
  const createPayment = trpc.installerPayments.createPaymentIntent.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      // Create payment intent on server
      const { clientSecret } = await createPayment.mutateAsync({
        leadId: lead.id,
        amount: lead.basePrice,
      });

      // Confirm payment with Stripe
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        throw new Error("Card element not found");
      }

      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: user?.name || "Solar Installer",
            email: user?.email || undefined,
          },
        },
      });

      if (stripeError) {
        setError(stripeError.message || "Payment failed");
        setProcessing(false);
        return;
      }

      if (paymentIntent?.status === "succeeded") {
        toast.success("Payment successful! Lead details unlocked.");
        onSuccess();
      }
    } catch (err: any) {
      setError(err.message || "Payment failed. Please try again.");
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <Label>Card Details</Label>
        <div className="p-4 border rounded-lg bg-white">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: "16px",
                  color: "#424770",
                  "::placeholder": {
                    color: "#aab7c4",
                  },
                },
                invalid: {
                  color: "#9e2146",
                },
              },
            }}
          />
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
          <AlertTriangle className="h-4 w-4" />
          {error}
        </div>
      )}

      <Button
        type="submit"
        disabled={!stripe || processing}
        className="w-full bg-orange-600 hover:bg-orange-700 h-14 text-lg"
      >
        {processing ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <Lock className="mr-2 h-5 w-5" />
            Pay ${lead.basePrice} AUD
          </>
        )}
      </Button>

      <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
        <Shield className="h-4 w-4" />
        Secured by Stripe. Your payment is encrypted.
      </div>
    </form>
  );
}

export default function InstallerCheckout() {
  const { id } = useParams<{ id: string }>();
  const leadId = parseInt(id || "0");
  const [, setLocation] = useLocation();
  const { user, loading, isAuthenticated } = useAuth();
  const [paymentComplete, setPaymentComplete] = useState(false);

  // Fetch lead details
  const { data: lead, isLoading } = trpc.leads.getById.useQuery(
    { id: leadId },
    { enabled: leadId > 0 }
  );

  if (loading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-amber-50 to-orange-50">
        <div className="animate-spin h-12 w-12 border-4 border-orange-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="pt-6 text-center">
            <AlertTriangle className="h-16 w-16 text-amber-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Lead Not Found</h2>
            <p className="text-gray-600 mb-4">This lead may have been purchased or is no longer available.</p>
            <Link href="/installer/dashboard">
              <Button className="bg-orange-600 hover:bg-orange-700">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (paymentComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50 flex items-center justify-center">
        <Card className="max-w-lg w-full mx-4">
          <CardContent className="pt-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
            <p className="text-lg text-gray-600 mb-6">
              You now have full access to this lead's contact information.
            </p>
            
            <Card className="bg-orange-50 border-orange-200 mb-6 text-left">
              <CardHeader>
                <CardTitle className="text-lg">Lead Details Unlocked</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-orange-600" />
                  <span className="font-medium">{lead.customerPhone}</span>
                </div>
                {lead.customerEmail && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-orange-600" />
                    <span className="font-medium">{lead.customerEmail}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-orange-600" />
                  <span className="font-medium">{lead.address}</span>
                </div>
              </CardContent>
            </Card>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
              <p className="text-amber-800 font-medium">
                ⏰ Contact this lead within 2 hours for the best conversion rate!
              </p>
            </div>

            <Link href="/installer/dashboard">
              <Button className="bg-orange-600 hover:bg-orange-700">
                Back to Dashboard
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/installer/dashboard">
            <div className="flex items-center gap-3 cursor-pointer">
              <ArrowLeft className="h-5 w-5 text-gray-600" />
              <img src={APP_LOGO} alt="SolarlyAU" className="h-10" />
            </div>
          </Link>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Lock className="h-4 w-4" />
            Secure Checkout
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Lead Summary */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Complete Your Purchase</h1>
            
            <Card className="mb-6">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Lead Summary</CardTitle>
                  <Badge className="bg-orange-100 text-orange-700">
                    {lead.propertyType === "residential" ? (
                      <Home className="h-3 w-3 mr-1" />
                    ) : (
                      <Building2 className="h-3 w-3 mr-1" />
                    )}
                    {lead.propertyType}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-orange-500" />
                  <span className="font-medium">{lead.suburb}, {lead.state} {lead.postcode}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  <span>Quality Score: <strong>{lead.qualityScore}/100</strong></span>
                </div>

                {lead.estimatedSystemSize && (
                  <div className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-blue-500" />
                    <span>Est. System Size: <strong>{lead.estimatedSystemSize} kW</strong></span>
                  </div>
                )}

                {lead.currentElectricityBill && (
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-green-500" />
                    <span>Monthly Bill: <strong>${lead.currentElectricityBill}</strong></span>
                  </div>
                )}

                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Lead Price</span>
                    <span className="text-3xl font-bold text-orange-600">${lead.basePrice}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* What You Get */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">What You'll Receive</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>Full customer name and contact details</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>Verified phone number</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>Complete property address</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>Property and energy usage details</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>24/7 support if lead is invalid</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Payment Form */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment Details
                </CardTitle>
                <CardDescription>
                  Enter your card details to complete the purchase
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Elements stripe={stripePromise}>
                  <CheckoutForm 
                    lead={lead} 
                    onSuccess={() => setPaymentComplete(true)} 
                  />
                </Elements>
              </CardContent>
            </Card>

            {/* Trust Badges */}
            <div className="mt-6 flex items-center justify-center gap-6 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <Shield className="h-4 w-4" />
                SSL Encrypted
              </div>
              <div className="flex items-center gap-1">
                <CreditCard className="h-4 w-4" />
                Stripe Secure
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle className="h-4 w-4" />
                Quality Guarantee
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
