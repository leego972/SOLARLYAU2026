import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useLocation } from "wouter";
import { APP_LOGO, APP_TITLE } from "@/const";
import { Loader2, Building2, User, Mail, Phone, MapPin, DollarSign } from "lucide-react";

export default function InstallerSignup() {
  const [, setLocation] = useLocation();
  const [formData, setFormData] = useState({
    companyName: "",
    contactName: "",
    email: "",
    phone: "",
    state: "",
    servicePostcodes: "",
    serviceRadius: 50,
    address: "",
    suburb: "",
    postcode: "",
    abn: "",
    website: "",
    maxLeadsPerMonth: 50,
    maxLeadPrice: 70,
    autoAcceptLeads: false,
  });

  const createInstaller = trpc.installers.create.useMutation({
    onSuccess: () => {
      toast.success("Registration successful! We'll contact you shortly.");
      setLocation("/");
    },
    onError: (error) => {
      toast.error(error.message || "Registration failed. Please try again.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Convert postcodes to JSON array
    const postcodes = formData.servicePostcodes
      .split(",")
      .map((p) => p.trim())
      .filter((p) => p.length > 0);
    
    createInstaller.mutate({
      ...formData,
      servicePostcodes: JSON.stringify(postcodes),
    });
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={APP_LOGO} alt={APP_TITLE} className="h-10" />
          </div>
          <Button variant="ghost" onClick={() => setLocation("/")}>
            Back to Home
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 max-w-3xl">
        <Card className="border-2 shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-orange-600">
              Join SolarlyAU
            </CardTitle>
            <CardDescription className="text-lg">
              Start receiving high-quality solar leads today
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Company Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-orange-600" />
                  Company Information
                </h3>

                <div className="grid gap-4">
                  <div>
                    <Label htmlFor="companyName">Company Name *</Label>
                    <Input
                      id="companyName"
                      required
                      value={formData.companyName}
                      onChange={(e) => handleChange("companyName", e.target.value)}
                      placeholder="Solar Solutions Pty Ltd"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="abn">ABN</Label>
                      <Input
                        id="abn"
                        value={formData.abn}
                        onChange={(e) => handleChange("abn", e.target.value)}
                        placeholder="12 345 678 901"
                      />
                    </div>
                    <div>
                      <Label htmlFor="website">Website</Label>
                      <Input
                        id="website"
                        type="url"
                        value={formData.website}
                        onChange={(e) => handleChange("website", e.target.value)}
                        placeholder="https://example.com"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <User className="h-5 w-5 text-orange-600" />
                  Contact Information
                </h3>

                <div className="grid gap-4">
                  <div>
                    <Label htmlFor="contactName">Contact Name *</Label>
                    <Input
                      id="contactName"
                      required
                      value={formData.contactName}
                      onChange={(e) => handleChange("contactName", e.target.value)}
                      placeholder="John Smith"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => handleChange("email", e.target.value)}
                        placeholder="john@example.com"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleChange("phone", e.target.value)}
                        placeholder="0412 345 678"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Service Area */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-orange-600" />
                  Service Area
                </h3>

                <div className="grid gap-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="state">State *</Label>
                      <Select value={formData.state} onValueChange={(value) => handleChange("state", value)}>
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
                      <Label htmlFor="suburb">Suburb</Label>
                      <Input
                        id="suburb"
                        value={formData.suburb}
                        onChange={(e) => handleChange("suburb", e.target.value)}
                        placeholder="Brisbane"
                      />
                    </div>
                    <div>
                      <Label htmlFor="postcode">Postcode</Label>
                      <Input
                        id="postcode"
                        value={formData.postcode}
                        onChange={(e) => handleChange("postcode", e.target.value)}
                        placeholder="4000"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => handleChange("address", e.target.value)}
                      placeholder="123 Main Street"
                    />
                  </div>

                  <div>
                    <Label htmlFor="servicePostcodes">Service Postcodes * (comma-separated)</Label>
                    <Input
                      id="servicePostcodes"
                      required
                      value={formData.servicePostcodes}
                      onChange={(e) => handleChange("servicePostcodes", e.target.value)}
                      placeholder="4000, 4001, 4002, 4003"
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      Enter all postcodes you service, separated by commas
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="serviceRadius">Service Radius (km)</Label>
                    <Input
                      id="serviceRadius"
                      type="number"
                      min="1"
                      max="500"
                      value={formData.serviceRadius}
                      onChange={(e) => handleChange("serviceRadius", parseInt(e.target.value))}
                    />
                  </div>
                </div>
              </div>

              {/* Lead Preferences */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-orange-600" />
                  Lead Preferences
                </h3>

                <div className="grid gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="maxLeadsPerMonth">Max Leads Per Month</Label>
                      <Input
                        id="maxLeadsPerMonth"
                        type="number"
                        min="1"
                        max="1000"
                        value={formData.maxLeadsPerMonth}
                        onChange={(e) => handleChange("maxLeadsPerMonth", parseInt(e.target.value))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="maxLeadPrice">Max Price Per Lead (AUD)</Label>
                      <Input
                        id="maxLeadPrice"
                        type="number"
                        min="1"
                        max="500"
                        value={formData.maxLeadPrice}
                        onChange={(e) => handleChange("maxLeadPrice", parseInt(e.target.value))}
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="autoAcceptLeads"
                      checked={formData.autoAcceptLeads}
                      onCheckedChange={(checked) => handleChange("autoAcceptLeads", checked)}
                    />
                    <Label htmlFor="autoAcceptLeads" className="cursor-pointer">
                      Automatically accept leads that match my criteria
                    </Label>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-orange-600 hover:bg-orange-700 text-lg py-6"
                disabled={createInstaller.isPending}
              >
                {createInstaller.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Registering...
                  </>
                ) : (
                  "Register as Installer"
                )}
              </Button>

              <p className="text-sm text-center text-muted-foreground">
                By registering, you agree to our Terms of Service and Privacy Policy
              </p>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
