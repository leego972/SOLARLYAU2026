import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Sun, CheckCircle, Shield } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

/**
 * Lead Opt-In Page - Legal Compliance
 * 
 * This page allows potential solar customers to:
 * 1. Express interest in solar quotes
 * 2. Provide explicit consent to share details with installers
 * 3. Comply with Australian Consumer Law and Privacy Act
 * 
 * This makes leads legally compliant and higher quality.
 */
export default function LeadOptIn() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    suburb: "",
    state: "QLD",
    postcode: "",
    propertyType: "residential" as "residential" | "commercial",
    estimatedBill: "",
    consent: false,
  });

  const [submitted, setSubmitted] = useState(false);

  const createLead = trpc.leads.createOptIn.useMutation({
    onSuccess: () => {
      setSubmitted(true);
      toast.success("Thank you! We'll connect you with local solar installers.");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to submit. Please try again.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.consent) {
      toast.error("Please agree to the terms to continue");
      return;
    }

    createLead.mutate({
      ...formData,
      source: "opt_in_form",
    });
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-accent/20 p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle className="text-2xl">Request Received!</CardTitle>
            <CardDescription>
              We've received your solar quote request. Local installers will contact you within
              24-48 hours with competitive quotes.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-accent/50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">What happens next?</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>We match you with up to 3 verified local installers</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Installers will call/email you with free quotes</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Compare quotes and choose the best option</span>
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-accent/20 py-12 px-4">
      <div className="container max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sun className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold">Get Free Solar Quotes</h1>
          </div>
          <p className="text-lg text-muted-foreground">
            Connect with verified local solar installers. Compare quotes and save on your
            electricity bills.
          </p>
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>Request Your Free Quotes</CardTitle>
            <CardDescription>
              Fill in your details below and we'll match you with up to 3 local solar installers
              who will provide competitive quotes.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Details */}
              <div className="space-y-4">
                <h3 className="font-semibold text-sm">Personal Details</h3>

                <div>
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="John Smith"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="0412 345 678"
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="john@example.com"
                    />
                  </div>
                </div>
              </div>

              {/* Property Details */}
              <div className="space-y-4">
                <h3 className="font-semibold text-sm">Property Details</h3>

                <div>
                  <Label htmlFor="address">Street Address *</Label>
                  <Input
                    id="address"
                    required
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="123 Main Street"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="suburb">Suburb *</Label>
                    <Input
                      id="suburb"
                      required
                      value={formData.suburb}
                      onChange={(e) => setFormData({ ...formData, suburb: e.target.value })}
                      placeholder="Brisbane"
                    />
                  </div>

                  <div>
                    <Label htmlFor="state">State *</Label>
                    <select
                      id="state"
                      required
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="QLD">QLD</option>
                      <option value="NSW">NSW</option>
                      <option value="WA">WA</option>
                      <option value="SA">SA</option>
                      <option value="VIC">VIC</option>
                      <option value="TAS">TAS</option>
                      <option value="ACT">ACT</option>
                      <option value="NT">NT</option>
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="postcode">Postcode *</Label>
                    <Input
                      id="postcode"
                      required
                      value={formData.postcode}
                      onChange={(e) => setFormData({ ...formData, postcode: e.target.value })}
                      placeholder="4000"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="propertyType">Property Type *</Label>
                    <select
                      id="propertyType"
                      required
                      value={formData.propertyType}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          propertyType: e.target.value as "residential" | "commercial",
                        })
                      }
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="residential">Residential</option>
                      <option value="commercial">Commercial</option>
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="estimatedBill">Monthly Electricity Bill (Optional)</Label>
                    <Input
                      id="estimatedBill"
                      value={formData.estimatedBill}
                      onChange={(e) =>
                        setFormData({ ...formData, estimatedBill: e.target.value })
                      }
                      placeholder="$300"
                    />
                  </div>
                </div>
              </div>

              {/* Consent */}
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 bg-accent/50 rounded-lg">
                  <Shield className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-muted-foreground">
                    <p className="font-semibold text-foreground mb-1">Your Privacy Matters</p>
                    <p>
                      We only share your details with verified local solar installers. You'll
                      receive up to 3 quotes. No spam, no hidden fees.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Checkbox
                    id="consent"
                    checked={formData.consent}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, consent: checked as boolean })
                    }
                  />
                  <Label htmlFor="consent" className="text-sm leading-relaxed cursor-pointer">
                    I agree to receive solar quotes from up to 3 verified local installers. I
                    understand my details will be shared with these installers for the purpose of
                    providing quotes. I can opt-out at any time. *
                  </Label>
                </div>
              </div>

              {/* Submit */}
              <Button type="submit" className="w-full" size="lg" disabled={createLead.isPending}>
                {createLead.isPending ? "Submitting..." : "Get Free Quotes"}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                By submitting this form, you agree to our Terms of Service and Privacy Policy.
                Your information is secure and will only be used to connect you with solar
                installers.
              </p>
            </form>
          </CardContent>
        </Card>

        {/* Benefits */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <CheckCircle className="w-8 h-8 text-green-600 mb-2" />
              <h3 className="font-semibold mb-1">100% Free</h3>
              <p className="text-sm text-muted-foreground">
                No cost to request quotes. Compare and choose the best option.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <CheckCircle className="w-8 h-8 text-green-600 mb-2" />
              <h3 className="font-semibold mb-1">Verified Installers</h3>
              <p className="text-sm text-muted-foreground">
                All installers are CEC accredited and verified.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <CheckCircle className="w-8 h-8 text-green-600 mb-2" />
              <h3 className="font-semibold mb-1">Local Experts</h3>
              <p className="text-sm text-muted-foreground">
                Matched with installers in your area for best service.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
