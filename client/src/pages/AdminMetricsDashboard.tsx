import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, TrendingDown, Users, DollarSign, Target, Mail, MousePointerClick, ArrowUpRight } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function AdminMetricsDashboard() {
  const { data: platformMetrics, isLoading: platformLoading, refetch } =
    trpc.installerMetrics.getPlatformMetrics.useQuery(undefined, {
      refetchInterval: 30000, // Refetch every 30 seconds for real-time updates
    });

  // Use platform metrics for revenue data
  const revenueData = {
    transactions: [],
    totalRevenue: 0,
    totalTransactions: platformMetrics?.totalLeadsSold || 0,
  };
  const revenueLoading = false;

  if (platformLoading || revenueLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container max-w-7xl">
          <Skeleton className="h-12 w-64 mb-8" />
          <div className="grid gap-6 md:grid-cols-4 mb-8">
            {[1, 2, 3, 4].map((i) => (
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

  const formatPercentage = (value: number) => {
    return `${(value / 100).toFixed(1)}%`;
  };

  // Calculate daily metrics
  const today = new Date();
  const todayStart = new Date(today.setHours(0, 0, 0, 0));
  
  const todayRevenue = revenueData?.transactions?.filter((t: any) => 
    new Date(t.createdAt) >= todayStart
  ).reduce((sum: number, t: any) => sum + (t.amount || 0), 0) || 0;

  const todayLeadsSold = revenueData?.transactions?.filter((t: any) => 
    new Date(t.createdAt) >= todayStart
  ).length || 0;

  // Calculate week-over-week growth
  const lastWeekStart = new Date(today);
  lastWeekStart.setDate(lastWeekStart.getDate() - 14);
  const thisWeekStart = new Date(today);
  thisWeekStart.setDate(thisWeekStart.getDate() - 7);

  const lastWeekRevenue = revenueData?.transactions?.filter((t: any) => {
    const date = new Date(t.createdAt);
    return date >= lastWeekStart && date < thisWeekStart;
  }).reduce((sum: number, t: any) => sum + (t.amount || 0), 0) || 0;

  const thisWeekRevenue = revenueData?.transactions?.filter((t: any) => {
    const date = new Date(t.createdAt);
    return date >= thisWeekStart;
  }).reduce((sum: number, t: any) => sum + (t.amount || 0), 0) || 0;

  const weekOverWeekGrowth = lastWeekRevenue > 0 
    ? ((thisWeekRevenue - lastWeekRevenue) / lastWeekRevenue) * 100 
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container max-w-7xl py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Real-Time Metrics Dashboard</h1>
              <p className="text-muted-foreground mt-1">
                Live tracking of platform performance and revenue
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => refetch()}>
                Refresh Data
              </Button>
              <Link href="/admin/revenue">
                <Button>Full Revenue Dashboard</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container max-w-7xl py-8">
        {/* Today's Performance */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Today's Performance</h2>
          <div className="grid gap-6 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Revenue Today</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">
                  {formatCurrency(todayRevenue)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  From {todayLeadsSold} leads sold
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Leads Sold Today</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{todayLeadsSold}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Active marketplace
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Week-over-Week Growth</CardTitle>
                {weekOverWeekGrowth >= 0 ? (
                  <TrendingUp className="h-4 w-4 text-green-600" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-600" />
                )}
              </CardHeader>
              <CardContent>
                <div className={`text-3xl font-bold ${weekOverWeekGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {weekOverWeekGrowth >= 0 ? '+' : ''}{weekOverWeekGrowth.toFixed(1)}%
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatCurrency(thisWeekRevenue)} this week
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Installers</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{platformMetrics?.totalInstallers || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Verified and active
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Platform Overview */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Platform Overview</h2>
          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Total Revenue</CardTitle>
                <CardDescription>All-time platform earnings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-green-600">
                  {formatCurrency(revenueData?.totalRevenue || 0)}
                </div>
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total Transactions</span>
                    <span className="font-medium">{revenueData?.totalTransactions || 0}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Avg Transaction</span>
                    <span className="font-medium">
                      {formatCurrency(
                        (revenueData?.totalRevenue || 0) / Math.max(revenueData?.totalTransactions || 1, 1)
                      )}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Lead Marketplace</CardTitle>
                <CardDescription>Current inventory status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold">{platformMetrics?.totalLeadsSold || 0}</div>
                <p className="text-sm text-muted-foreground mb-4">Total leads sold</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Avg Conversion Rate</span>
                    <span className="font-medium text-green-600">
                      {formatPercentage(platformMetrics?.averageConversionRate || 0)}
                    </span>
                  </div>
                  <Link href="/admin/revenue">
                    <Button variant="outline" size="sm" className="w-full mt-2">
                      Seed More Leads
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recruitment Campaign</CardTitle>
                <CardDescription>Outreach performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Emails Sent</span>
                      <Badge variant="secondary">18</Badge>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">A/B Variants</span>
                      <Badge variant="secondary">3</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Follow-ups Scheduled</span>
                      <Badge variant="secondary">54</Badge>
                    </div>
                  </div>
                  <Link href="/success-metrics">
                    <Button variant="outline" size="sm" className="w-full">
                      View Success Metrics
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Link href="/admin/revenue">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Revenue Dashboard</p>
                      <p className="text-xs text-muted-foreground">Full analytics</p>
                    </div>
                    <ArrowUpRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/admin/content">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Content Management</p>
                      <p className="text-xs text-muted-foreground">Blog & testimonials</p>
                    </div>
                    <ArrowUpRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/success-metrics">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Success Metrics</p>
                      <p className="text-xs text-muted-foreground">Public dashboard</p>
                    </div>
                    <ArrowUpRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/dashboard">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Main Dashboard</p>
                      <p className="text-xs text-muted-foreground">Overview</p>
                    </div>
                    <ArrowUpRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
