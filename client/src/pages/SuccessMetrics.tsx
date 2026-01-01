import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, Users, DollarSign, Target, Clock, Award } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function SuccessMetrics() {
  const { data: platformMetrics, isLoading: platformLoading } =
    trpc.installerMetrics.getPlatformMetrics.useQuery();
  const { data: installerMetrics, isLoading: installersLoading } =
    trpc.installerMetrics.getPublicMetrics.useQuery();

  if (platformLoading || installersLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12">
        <div className="container max-w-6xl">
          <Skeleton className="h-12 w-64 mb-8" />
          <div className="grid gap-6 md:grid-cols-3 mb-12">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat("en-AU", {
      style: "currency",
      currency: "AUD",
      minimumFractionDigits: 0,
    }).format(cents / 100);
  };

  const formatROI = (roi: number) => {
    return `${(roi / 100).toFixed(1)}x`;
  };

  const formatConversionRate = (rate: number) => {
    return `${(rate / 100).toFixed(1)}%`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
        <div className="container max-w-6xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Real Results from Real Installers
          </h1>
          <p className="text-xl text-blue-100 mb-8">
            See how solar installers across Australia are growing their business with SolarlyAU
          </p>
          <div className="flex gap-4">
            <Link href="/installer/signup">
              <Button size="lg" variant="secondary">
                Start Your Free Trial
              </Button>
            </Link>
            <Link href="/">
              <Button size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white/10">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Platform Stats */}
      <div className="container max-w-6xl py-12">
        <h2 className="text-3xl font-bold mb-8 text-center">Platform Performance</h2>
        <div className="grid gap-6 md:grid-cols-3 mb-16">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Installers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{platformMetrics?.totalInstallers || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Growing network across Australia
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Leads Sold</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{platformMetrics?.totalLeadsSold || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">
                High-quality, verified leads
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Conversion Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {formatConversionRate(platformMetrics?.averageConversionRate || 0)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                2-3x higher than industry average
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Top Performers */}
        <h2 className="text-3xl font-bold mb-8">Top Performing Installers</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {installerMetrics && installerMetrics.length > 0 ? (
            installerMetrics.map((metric) => (
              <Card key={metric.installerId} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{metric.companyName || "Anonymous Installer"}</CardTitle>
                      <CardDescription>{metric.state}</CardDescription>
                    </div>
                    <Badge variant="secondary">
                      <Award className="h-3 w-3 mr-1" />
                      Top Performer
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Conversion Rate</p>
                      <p className="text-2xl font-bold text-green-600">
                        {formatConversionRate(metric.conversionRate || 0)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">ROI</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {formatROI(metric.roi || 0)}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 border-t space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Leads Purchased</span>
                      <span className="font-medium">{metric.totalLeadsPurchased}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Leads Converted</span>
                      <span className="font-medium">{metric.totalLeadsConverted}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Avg Deal Size</span>
                      <span className="font-medium">
                        {formatCurrency(metric.averageDealSize || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Avg Time to Close</span>
                      <span className="font-medium">
                        {Math.round((metric.averageTimeToClose || 0) / 24)} days
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-muted-foreground mb-4">
                Be the first to share your success story!
              </p>
              <Link href="/installer/signup">
                <Button>Get Started</Button>
              </Link>
            </div>
          )}
        </div>

        {/* CTA Section */}
        <div className="mt-16 bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg p-8 md:p-12 text-white text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Join These Top Performers?</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Get your first lead completely free. No credit card required, no commitment.
            See the quality for yourself.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/installer/signup">
              <Button size="lg" variant="secondary">
                Claim Your Free Lead
              </Button>
            </Link>
            <Link href="/">
              <Button size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white/10">
                Learn How It Works
              </Button>
            </Link>
          </div>
          <p className="text-sm text-blue-200 mt-6">
            Join {platformMetrics?.totalInstallers || 0}+ installers already growing with SolarlyAU
          </p>
        </div>
      </div>
    </div>
  );
}
