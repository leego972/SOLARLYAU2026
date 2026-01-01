import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DollarSign,
  Users,
  FileText,
  TrendingUp,
  Activity,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";
import { Link } from "wouter";

export default function Dashboard() {
  const { user, loading } = useAuth();
  const { data: analytics, isLoading: analyticsLoading } = trpc.analytics.dashboard.useQuery();
  const { data: recentActivities } = trpc.agent.getRecentActivities.useQuery({ limit: 10 });
  const { data: pendingOffers } = trpc.offers.getPending.useQuery();
  const { data: newLeads } = trpc.leads.getNew.useQuery();

  if (loading || analyticsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Activity className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-destructive" />
              Access Denied
            </CardTitle>
            <CardDescription>You need admin privileges to access this dashboard.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const stats = [
    {
      title: "Total Revenue",
      value: `$${analytics?.revenue?.totalRevenue?.toFixed(2) || "0.00"}`,
      description: `${analytics?.revenue?.transactionCount || 0} transactions`,
      icon: DollarSign,
      trend: "+12.5%",
    },
    {
      title: "Monthly Revenue",
      value: `$${analytics?.revenue?.monthlyRevenue?.toFixed(2) || "0.00"}`,
      description: "Last 30 days",
      icon: TrendingUp,
      trend: "+8.2%",
    },
    {
      title: "Total Leads",
      value: analytics?.leads?.total || 0,
      description: `${analytics?.leads?.sold || 0} sold, ${analytics?.leads?.new || 0} new`,
      icon: FileText,
      trend: `${analytics?.leads?.averageQuality || 0}/100 avg quality`,
    },
    {
      title: "Active Installers",
      value: analytics?.installers?.active || 0,
      description: `${analytics?.installers?.verified || 0} verified`,
      icon: Users,
      trend: `${analytics?.installers?.total || 0} total`,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Solar Lead AI Dashboard</h1>
              <p className="text-muted-foreground mt-1">
                Autonomous lead generation and distribution system
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="gap-1">
                <Activity className="w-3 h-3 animate-pulse" />
                System Active
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-8">
        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
                <p className="text-xs text-green-600 mt-1">{stat.trend}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="leads" className="space-y-4">
          <TabsList>
            <TabsTrigger value="leads">Leads</TabsTrigger>
            <TabsTrigger value="offers">Offers</TabsTrigger>
            <TabsTrigger value="installers">Installers</TabsTrigger>
            <TabsTrigger value="advertising">Advertising</TabsTrigger>
            <TabsTrigger value="activity">AI Activity</TabsTrigger>
          </TabsList>

          {/* Leads Tab */}
          <TabsContent value="leads" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>New Leads</CardTitle>
                    <CardDescription>
                      Recently generated leads awaiting distribution
                    </CardDescription>
                  </div>
                  <Link href="/leads">
                    <Button variant="outline" size="sm">
                      View All
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {newLeads && newLeads.length > 0 ? (
                    newLeads.slice(0, 5).map((lead) => (
                      <div
                        key={lead.id}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex-1">
                          <div className="font-medium">{lead.customerName}</div>
                          <div className="text-sm text-muted-foreground">
                            {lead.suburb}, {lead.state} {lead.postcode}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            Quality: {lead.qualityScore}/100 • ${lead.basePrice}
                          </div>
                        </div>
                        <Badge variant={lead.status === "new" ? "default" : "secondary"}>
                          {lead.status}
                        </Badge>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>No new leads available</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Offers Tab */}
          <TabsContent value="offers" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Pending Offers</CardTitle>
                    <CardDescription>Offers awaiting installer response</CardDescription>
                  </div>
                  <Link href="/offers">
                    <Button variant="outline" size="sm">
                      View All
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {pendingOffers && pendingOffers.length > 0 ? (
                    pendingOffers.slice(0, 5).map((offer) => (
                      <div
                        key={offer.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="font-medium">Offer #{offer.id}</div>
                          <div className="text-sm text-muted-foreground">
                            Lead #{offer.leadId} • Installer #{offer.installerId}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            ${offer.offerPrice} • {offer.distance}km away
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">
                            <Clock className="w-3 h-3 mr-1" />
                            Pending
                          </Badge>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <CheckCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>No pending offers</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Installers Tab */}
          <TabsContent value="installers" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Installer Management</CardTitle>
                    <CardDescription>Manage solar installation companies</CardDescription>
                  </div>
                  <Link href="/installers">
                    <Button variant="outline" size="sm">
                      View All
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Total Installers</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {analytics?.installers?.total || 0}
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Active</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-600">
                        {analytics?.installers?.active || 0}
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Verified</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-blue-600">
                        {analytics?.installers?.verified || 0}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Advertising Tab */}
          <TabsContent value="advertising" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Autonomous Advertising Performance</CardTitle>
                <CardDescription>
                  Google Ads campaigns running automatically with monthly budget approval
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Budget Status */}
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="p-4 border rounded-lg">
                      <div className="text-sm text-muted-foreground mb-1">Current Month Budget</div>
                      <div className="text-2xl font-bold">$3,000</div>
                      <div className="text-xs text-muted-foreground mt-1">Approved</div>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <div className="text-sm text-muted-foreground mb-1">Spent This Month</div>
                      <div className="text-2xl font-bold">$0.00</div>
                      <div className="text-xs text-green-600 mt-1">0% of budget</div>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <div className="text-sm text-muted-foreground mb-1">Leads Generated</div>
                      <div className="text-2xl font-bold">0</div>
                      <div className="text-xs text-muted-foreground mt-1">$0.00 cost per lead</div>
                    </div>
                  </div>

                  {/* Setup Instructions */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-blue-600" />
                      Google Ads Not Configured
                    </h3>
                    <p className="text-gray-700 mb-4">
                      Your autonomous advertising system is ready but needs Google Ads API credentials to start running campaigns.
                    </p>
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Next Steps:</p>
                      <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
                        <li>Follow the setup guide in GOOGLE_ADS_SETUP_GUIDE.md</li>
                        <li>Add your Google Ads API credentials to Settings → Secrets</li>
                        <li>Approve your first monthly budget</li>
                        <li>System will automatically create and optimize campaigns</li>
                      </ol>
                    </div>
                    <Button className="mt-4" variant="default">
                      View Setup Guide
                    </Button>
                  </div>

                  {/* Features List */}
                  <div>
                    <h3 className="font-semibold mb-3">Autonomous Features</h3>
                    <div className="grid md:grid-cols-2 gap-3">
                      <div className="flex items-start gap-2 p-3 border rounded">
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <div className="font-medium text-sm">AI-Generated Ad Copy</div>
                          <div className="text-xs text-muted-foreground">10 headline + 4 description variations</div>
                        </div>
                      </div>
                      <div className="flex items-start gap-2 p-3 border rounded">
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <div className="font-medium text-sm">Hourly Bid Optimization</div>
                          <div className="text-xs text-muted-foreground">Automatic bid adjustments based on performance</div>
                        </div>
                      </div>
                      <div className="flex items-start gap-2 p-3 border rounded">
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <div className="font-medium text-sm">Auto-Pause Underperformers</div>
                          <div className="text-xs text-muted-foreground">Pauses keywords costing &gt;$30 per lead</div>
                        </div>
                      </div>
                      <div className="flex items-start gap-2 p-3 border rounded">
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <div className="font-medium text-sm">Monthly Budget Approval</div>
                          <div className="text-xs text-muted-foreground">You only approve budget once per month</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI Activity Tab */}
          <TabsContent value="activity" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent AI Activity</CardTitle>
                <CardDescription>Autonomous system operations log</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentActivities && recentActivities.length > 0 ? (
                    recentActivities.map((activity) => (
                      <div
                        key={activity.id}
                        className="flex items-start gap-3 p-3 border rounded-lg"
                      >
                        <div
                          className={`p-2 rounded-full ${
                            activity.status === "success"
                              ? "bg-green-100 text-green-600"
                              : activity.status === "failed"
                              ? "bg-red-100 text-red-600"
                              : "bg-yellow-100 text-yellow-600"
                          }`}
                        >
                          {activity.status === "success" ? (
                            <CheckCircle className="w-4 h-4" />
                          ) : activity.status === "failed" ? (
                            <XCircle className="w-4 h-4" />
                          ) : (
                            <AlertCircle className="w-4 h-4" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">{activity.description}</div>
                          <div className="text-sm text-muted-foreground mt-1">
                            {activity.activityType.replace(/_/g, " ")} •{" "}
                            {new Date(activity.startedAt).toLocaleString()}
                          </div>
                          {activity.metadata && (
                            <div className="text-xs text-muted-foreground mt-1">
                              Leads: {activity.leadsGenerated} generated, {activity.leadsQualified}{" "}
                              qualified • Offers: {activity.offersCreated}
                            </div>
                          )}
                        </div>
                        <Badge
                          variant={
                            activity.status === "success"
                              ? "default"
                              : activity.status === "failed"
                              ? "destructive"
                              : "secondary"
                          }
                        >
                          {activity.status}
                        </Badge>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Activity className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>No recent activity</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
