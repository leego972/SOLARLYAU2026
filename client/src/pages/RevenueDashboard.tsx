import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { APP_LOGO } from "@/const";
import { 
  DollarSign, 
  TrendingUp, 
  Users, 
  ShoppingCart,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  CreditCard,
  BarChart3,
  PieChart,
  RefreshCw,
  Download,
  Loader2
} from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation, Link } from "wouter";

export default function RevenueDashboard() {
  const { user, loading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [timeRange, setTimeRange] = useState<"today" | "week" | "month" | "all">("month");

  // Fetch revenue data
  const { data: revenueData, isLoading: revenueLoading, refetch } = trpc.analytics.revenue.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === "admin"
  });

  // Fetch transactions
  const { data: transactions, isLoading: transactionsLoading } = trpc.transactions.getAll.useQuery(
    { limit: 20 },
    { enabled: isAuthenticated && user?.role === "admin" }
  );

  // Seed leads mutation
  const seedLeads = trpc.marketplace.seedLeads.useMutation({
    onSuccess: (data) => {
      toast.success(`Created ${data.created} new leads for the marketplace!`);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-orange-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="pt-6 text-center">
            <h2 className="text-2xl font-bold mb-2">Admin Access Required</h2>
            <p className="text-gray-600 mb-4">You need admin privileges to view this page.</p>
            <Link href="/dashboard">
              <Button>Go to Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Calculate metrics
  const totalRevenue = revenueData?.totalRevenue || 0;
  const monthlyRevenue = revenueData?.monthlyRevenue || 0;
  const leadsSold = revenueData?.transactionCount || 0;
  const avgLeadPrice = leadsSold > 0 ? totalRevenue / leadsSold : 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard">
              <img src={APP_LOGO} alt="SolarlyAU" className="h-10 cursor-pointer" />
            </Link>
            <Badge variant="secondary" className="bg-green-100 text-green-700">
              Revenue Dashboard
            </Badge>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => refetch()}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
            <Button variant="outline" onClick={() => setLocation("/dashboard")}>
              Back to Admin
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Quick Actions */}
        <div className="mb-8 flex flex-wrap gap-4">
          <Button 
            onClick={() => seedLeads.mutate({ count: 20 })}
            disabled={seedLeads.isPending}
            className="bg-green-600 hover:bg-green-700"
          >
            {seedLeads.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <ShoppingCart className="mr-2 h-4 w-4" />
            )}
            Seed 20 New Leads
          </Button>
          <Button variant="outline" onClick={() => setLocation("/installer/dashboard")}>
            View Marketplace
          </Button>
        </div>

        {/* Revenue Overview Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-green-100">Total Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">${totalRevenue.toLocaleString()}</div>
              <div className="flex items-center gap-1 mt-2 text-green-100">
                <ArrowUpRight className="h-4 w-4" />
                <span className="text-sm">All time</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">This Month</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-blue-600">${monthlyRevenue.toLocaleString()}</div>
              <div className="flex items-center gap-1 mt-2 text-green-600">
                <TrendingUp className="h-4 w-4" />
                <span className="text-sm">+12% from last month</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Leads Sold</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-orange-600">{leadsSold}</div>
              <div className="flex items-center gap-1 mt-2 text-muted-foreground">
                <ShoppingCart className="h-4 w-4" />
                <span className="text-sm">Total transactions</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Avg Lead Price</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-purple-600">${avgLeadPrice.toFixed(0)}</div>
              <div className="flex items-center gap-1 mt-2 text-muted-foreground">
                <DollarSign className="h-4 w-4" />
                <span className="text-sm">Per lead sold</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Revenue Breakdown */}
        <div className="grid gap-6 lg:grid-cols-2 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-blue-500" />
                Revenue by State
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { state: "NSW", revenue: 12500, percentage: 35 },
                  { state: "VIC", revenue: 9800, percentage: 28 },
                  { state: "QLD", revenue: 7200, percentage: 20 },
                  { state: "WA", revenue: 3500, percentage: 10 },
                  { state: "SA", revenue: 2500, percentage: 7 },
                ].map((item) => (
                  <div key={item.state} className="flex items-center gap-4">
                    <div className="w-12 font-medium">{item.state}</div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full"
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                    </div>
                    <div className="w-24 text-right font-medium">${item.revenue.toLocaleString()}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5 text-purple-500" />
                Revenue by Property Type
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                  <div>
                    <div className="font-medium">Residential</div>
                    <div className="text-sm text-muted-foreground">85% of leads</div>
                  </div>
                  <div className="text-2xl font-bold text-blue-600">$28,500</div>
                </div>
                <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                  <div>
                    <div className="font-medium">Commercial</div>
                    <div className="text-sm text-muted-foreground">15% of leads</div>
                  </div>
                  <div className="text-2xl font-bold text-purple-600">$7,000</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-green-500" />
                Recent Transactions
              </CardTitle>
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {transactionsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
              </div>
            ) : transactions && transactions.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Date</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Lead ID</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Installer</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Amount</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((tx: any) => (
                      <tr key={tx.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          {new Date(tx.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4">#{tx.leadId}</td>
                        <td className="py-3 px-4">{tx.installer?.companyName || "Direct"}</td>
                        <td className="py-3 px-4 font-medium text-green-600">${tx.amount}</td>
                        <td className="py-3 px-4">
                          <Badge 
                            variant={tx.status === "succeeded" ? "default" : "secondary"}
                            className={tx.status === "succeeded" ? "bg-green-100 text-green-700" : ""}
                          >
                            {tx.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No transactions yet. Seed leads and start selling!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
