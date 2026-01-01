import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useLocation } from "wouter";
import { CheckCircle2, Home, Zap, DollarSign, Phone, Mail, MapPin, Shield, Loader2 } from "lucide-react";
import { APP_LOGO } from "@/const";
import { trackQuoteSubmission } from "@/lib/tracking";

export default function GetQuote() {
  const [, setLocation] = useLocation();
  const [formData, setFormData] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    address: "",
    suburb: "",
    state: "",
    postcode: "",
    propertyType: "residential" as "residential" | "commercial" | "industrial",
    roofType: "",
    estimatedSystemSize: "",
    currentElectricityBill: "",
    notes: "",
  });

  // Phone verification state
  const [verificationStep, setVerificationStep] = useState<"none" | "sending" | "verifying" | "verified">("none");
  const [verificationId, setVerificationId] = useState<string | null>(null);
  const [verificationCode, setVerificationCode] = useState("");

  // tRPC mutations
  const sendCodeMutation = trpc.smsVerification.sendCode.useMutation({
    onSuccess: (result) => {
      if (result.success && result.verificationId) {
        setVerificationId(result.verificationId);
        setVerificationStep("verifying");
        toast.success("Verification code sent! Check your phone.");
      } else {
        toast.error(result.error || "Failed to send verification code");
        setVerificationStep("none");
      }
    },
    onError: (error) => {
      toast.error(error.message || "Failed to send verification code");
      setVerificationStep("none");
    },
  });

  const verifyCodeMutation = trpc.smsVerification.verifyCode.useMutation({
    onSuccess: (result) => {
      if (result.success && result.verified) {
        setVerificationStep("verified");
        toast.success("Phone number verified!");
      } else {
        toast.error(result.error || "Invalid verification code");
      }
    },
    onError: (error) => {
      toast.error(error.message || "Verification failed");
    },
  });

  const submitQuoteMutation = trpc.leads.submitQuoteRequest.useMutation({
    onSuccess: () => {
      // Track conversion
      const leadValue = parseFloat(formData.estimatedSystemSize) * 15 || 100;
      trackQuoteSubmission(leadValue);
      
      toast.success("Quote request submitted! We'll match you with local installers within 24 hours.");
      setLocation("/quote-submitted");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to submit quote request. Please try again.");
    },
  });

  const handleSendVerification = () => {
    if (!formData.customerPhone || formData.customerPhone.length < 8) {
      toast.error("Please enter a valid phone number");
      return;
    }
    setVerificationStep("sending");
    sendCodeMutation.mutate({ phoneNumber: formData.customerPhone });
  };

  const handleVerifyCode = () => {
    if (!verificationId || verificationCode.length !== 6) {
      toast.error("Please enter the 6-digit code");
      return;
    }
    verifyCodeMutation.mutate({ verificationId, code: verificationCode });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.customerName || !formData.customerPhone || !formData.address || 
        !formData.suburb || !formData.state || !formData.postcode) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Check if phone is verified
    if (verificationStep !== "verified") {
      toast.error("Please verify your phone number first");
      return;
    }

    submitQuoteMutation.mutate({
      ...formData,
      estimatedSystemSize: formData.estimatedSystemSize ? parseInt(formData.estimatedSystemSize) : undefined,
      currentElectricityBill: formData.currentElectricityBill ? parseInt(formData.currentElectricityBill) : undefined,
    });
  };

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Reset verification if phone number changes
    if (field === "customerPhone" && verificationStep !== "none") {
      setVerificationStep("none");
      setVerificationId(null);
      setVerificationCode("");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={APP_LOGO} alt="SolarlyAU" className="h-10 w-10" />
            <span className="text-2xl font-bold text-orange-600">SolarlyAU</span>
          </div>
          <div className="text-sm text-gray-600">
            <Phone className="inline w-4 h-4 mr-1" />
            1300 SOLAR AU
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-12 bg-gradient-to-r from-orange-500 to-yellow-500 text-white">
        <div className="container max-w-4xl text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Get Your Free Solar Quote
          </h1>
          <p className="text-xl md:text-2xl opacity-90 mb-6">
            Compare quotes from verified solar installers in your area
          </p>
          <div className="flex flex-wrap justify-center gap-6 text-sm md:text-base">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              <span>100% Free, No Obligation</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              <span>Verified Installers Only</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              <span>Get Quotes in 24 Hours</span>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-8 bg-white border-b">
        <div className="container max-w-4xl">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Home className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="font-semibold mb-2">Save on Energy Bills</h3>
              <p className="text-sm text-gray-600">Reduce your electricity costs by up to 80%</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Zap className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="font-semibold mb-2">Clean Energy</h3>
              <p className="text-sm text-gray-600">Reduce your carbon footprint and help the planet</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <DollarSign className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="font-semibold mb-2">Increase Property Value</h3>
              <p className="text-sm text-gray-600">Solar panels can increase your home's value</p>
            </div>
          </div>
        </div>
      </section>

      {/* Quote Form */}
      <section className="py-12">
        <div className="container max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Request Your Free Quote</CardTitle>
              <CardDescription>
                Fill in your details below and we'll connect you with up to 3 verified solar installers in your area
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Personal Information */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <Mail className="w-5 h-5 text-orange-600" />
                    Your Contact Information
                  </h3>
                  
                  <div>
                    <Label htmlFor="customerName">Full Name *</Label>
                    <Input
                      id="customerName"
                      value={formData.customerName}
                      onChange={(e) => updateField("customerName", e.target.value)}
                      placeholder="John Smith"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="customerEmail">Email Address</Label>
                    <Input
                      id="customerEmail"
                      type="email"
                      value={formData.customerEmail}
                      onChange={(e) => updateField("customerEmail", e.target.value)}
                      placeholder="john@example.com"
                    />
                  </div>

                  {/* Phone Number with Verification */}
                  <div className="space-y-3">
                    <Label htmlFor="customerPhone">Phone Number * (Verification Required)</Label>
                    <div className="flex gap-2">
                      <Input
                        id="customerPhone"
                        type="tel"
                        value={formData.customerPhone}
                        onChange={(e) => updateField("customerPhone", e.target.value)}
                        placeholder="0412 345 678"
                        required
                        disabled={verificationStep === "verified"}
                        className={verificationStep === "verified" ? "bg-green-50 border-green-500" : ""}
                      />
                      {verificationStep === "none" && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleSendVerification}
                          disabled={!formData.customerPhone || formData.customerPhone.length < 8}
                          className="whitespace-nowrap"
                        >
                          <Shield className="w-4 h-4 mr-2" />
                          Verify
                        </Button>
                      )}
                      {verificationStep === "sending" && (
                        <Button type="button" variant="outline" disabled className="whitespace-nowrap">
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Sending...
                        </Button>
                      )}
                      {verificationStep === "verified" && (
                        <div className="flex items-center text-green-600 font-medium px-3">
                          <CheckCircle2 className="w-5 h-5 mr-1" />
                          Verified
                        </div>
                      )}
                    </div>

                    {/* Verification Code Input */}
                    {verificationStep === "verifying" && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
                        <p className="text-sm text-blue-800">
                          We've sent a 6-digit code to your phone. Enter it below to verify your number.
                        </p>
                        <div className="flex gap-2">
                          <Input
                            type="text"
                            value={verificationCode}
                            onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                            placeholder="Enter 6-digit code"
                            maxLength={6}
                            className="text-center text-lg tracking-widest font-mono"
                          />
                          <Button
                            type="button"
                            onClick={handleVerifyCode}
                            disabled={verificationCode.length !== 6 || verifyCodeMutation.isPending}
                          >
                            {verifyCodeMutation.isPending ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              "Verify"
                            )}
                          </Button>
                        </div>
                        <button
                          type="button"
                          onClick={handleSendVerification}
                          className="text-sm text-blue-600 hover:underline"
                          disabled={sendCodeMutation.isPending}
                        >
                          Didn't receive the code? Send again
                        </button>
                      </div>
                    )}

                    {verificationStep === "verified" && (
                      <p className="text-sm text-green-600 flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" />
                        Your phone number has been verified. You can now submit your quote request.
                      </p>
                    )}
                  </div>
                </div>

                {/* Property Information */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-orange-600" />
                    Property Details
                  </h3>

                  <div>
                    <Label htmlFor="address">Street Address *</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => updateField("address", e.target.value)}
                      placeholder="123 Main Street"
                      required
                    />
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="suburb">Suburb *</Label>
                      <Input
                        id="suburb"
                        value={formData.suburb}
                        onChange={(e) => updateField("suburb", e.target.value)}
                        placeholder="Brisbane"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="state">State *</Label>
                      <Select value={formData.state} onValueChange={(value) => updateField("state", value)}>
                        <SelectTrigger id="state">
                          <SelectValue placeholder="Select state" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="QLD">Queensland</SelectItem>
                          <SelectItem value="NSW">New South Wales</SelectItem>
                          <SelectItem value="WA">Western Australia</SelectItem>
                          <SelectItem value="SA">South Australia</SelectItem>
                          <SelectItem value="VIC">Victoria</SelectItem>
                          <SelectItem value="TAS">Tasmania</SelectItem>
                          <SelectItem value="NT">Northern Territory</SelectItem>
                          <SelectItem value="ACT">ACT</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="postcode">Postcode *</Label>
                      <Input
                        id="postcode"
                        value={formData.postcode}
                        onChange={(e) => updateField("postcode", e.target.value)}
                        placeholder="4000"
                        maxLength={4}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="propertyType">Property Type</Label>
                    <Select value={formData.propertyType} onValueChange={(value: any) => updateField("propertyType", value)}>
                      <SelectTrigger id="propertyType">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="residential">Residential Home</SelectItem>
                        <SelectItem value="commercial">Commercial Building</SelectItem>
                        <SelectItem value="industrial">Industrial Facility</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Solar Requirements */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <Zap className="w-5 h-5 text-orange-600" />
                    Solar Requirements
                  </h3>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="roofType">Roof Type</Label>
                      <Select value={formData.roofType} onValueChange={(value) => updateField("roofType", value)}>
                        <SelectTrigger id="roofType">
                          <SelectValue placeholder="Select roof type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="tile">Tile</SelectItem>
                          <SelectItem value="metal">Metal</SelectItem>
                          <SelectItem value="colorbond">Colorbond</SelectItem>
                          <SelectItem value="flat">Flat</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="estimatedSystemSize">Desired System Size (kW)</Label>
                      <Input
                        id="estimatedSystemSize"
                        type="number"
                        value={formData.estimatedSystemSize}
                        onChange={(e) => updateField("estimatedSystemSize", e.target.value)}
                        placeholder="6.6"
                        step="0.1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="currentElectricityBill">Current Quarterly Electricity Bill ($)</Label>
                    <Input
                      id="currentElectricityBill"
                      type="number"
                      value={formData.currentElectricityBill}
                      onChange={(e) => updateField("currentElectricityBill", e.target.value)}
                      placeholder="500"
                    />
                  </div>

                  <div>
                    <Label htmlFor="notes">Additional Information</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => updateField("notes", e.target.value)}
                      placeholder="Any specific requirements or questions? (e.g., battery storage, timeframe, roof concerns)"
                      rows={4}
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                  <Button
                    type="submit"
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white py-6 text-lg font-semibold"
                    disabled={submitQuoteMutation.isPending || verificationStep !== "verified"}
                  >
                    {submitQuoteMutation.isPending ? "Submitting..." : "Get My Free Quotes"}
                  </Button>
                  {verificationStep !== "verified" && (
                    <p className="text-xs text-amber-600 text-center mt-2">
                      Please verify your phone number to submit your quote request
                    </p>
                  )}
                  <p className="text-xs text-gray-500 text-center mt-3">
                    By submitting this form, you agree to be contacted by verified solar installers in your area. 
                    We respect your privacy and will never share your information with third parties.
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Trust Indicators */}
          <div className="mt-8 text-center space-y-4">
            <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <span>Over 2,847 Australians have saved with SolarlyAU</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <span>All installers are CEC accredited and fully insured</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
              <Shield className="w-5 h-5 text-green-600" />
              <span>Phone verification ensures only genuine leads</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-gray-50 py-8 mt-12">
        <div className="container text-center text-sm text-gray-600">
          <p>© 2025 SolarlyAU. All rights reserved.</p>
          <p className="mt-2">Connecting Australians with trusted solar installers since 2025</p>
        </div>
      </footer>
    </div>
  );
}
