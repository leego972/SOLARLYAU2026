import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { AlertCircle, CheckCircle, DollarSign, Eye, EyeOff, Loader2, Pause, Play, Plus, TrendingUp, Building2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { toast } from "sonner";

export default function GoogleAdsDashboard() {
  const { user, loading: authLoading } = useAuth();
  const [budgetAmount, setBudgetAmount] = useState("1000");
  const [isCreatingCampaign, setIsCreatingCampaign] = useState(false);
  const [selectedClientAccount, setSelectedClientAccount] = useState<string | null>(null);

  // Check if Google Ads is configured
  const { data: isConfigured, isLoading: configLoading } = trpc.googleAds.isConfigured.useQuery();

  // Get campaigns
  const { data: campaigns, isLoading: campaignsLoading, refetch: refetchCampaigns } = trpc.googleAds.getCampaigns.useQuery();

  // Get current budget
  const { data: currentBudget, isLoading: budgetLoading, refetch: refetchBudget } = trpc.googleAds.getCurrentBudget.useQuery();

  // Get performance summary
  const { data: performance, isLoading: performanceLoading } = trpc.googleAds.getPerformanceSummary.useQuery();

  // Get client accounts
  const { data: clientAccountsData, isLoading: clientAccountsLoading } = trpc.googleAds.getClientAccounts.useQuery();

  // Get selected client account
  const { data: selectedAccountData, isLoading: selectedAccountLoading } = trpc.googleAds.getSelectedClientAccount.useQuery();

  // Set client account mutation
  const utils = trpc.useUtils();
  const setClientAccountMutation = trpc.googleAds.setClientAccount.useMutation({
    onSuccess: () => {
      toast.success("Client account selected successfully!");
      // Refetch the selected account data
      utils.googleAds.getSelectedClientAccount.invalidate();
    },
    onError: (error) => {
      toast.error(`Failed to select client account: ${error.message}`);
    },
  });

  // Mutations
  const approveBudgetMutation = trpc.googleAds.approveBudget.useMutation({
    onSuccess: () => {
      toast.success("Budget approved successfully!");
      refetchBudget();
    },
    onError: (error) => {
      toast.error(`Failed to approve budget: ${error.message}`);
    },
  });

  const createCampaignMutation = trpc.googleAds.createCampaign.useMutation({
    onSuccess: () => {
      toast.success("Campaign created successfully!");
      refetchCampaigns();
      setIsCreatingCampaign(false);
    },
    onError: (error) => {
      toast.error(`Failed to create campaign: ${error.message}`);
      setIsCreatingCampaign(false);
    },
  });

  const enableCampaignMutation = trpc.googleAds.enableCampaign.useMutation({
    onSuccess: () => {
      toast.success("Campaign enabled!");
      refetchCampaigns();
    },
    onError: (error) => {
      toast.error(`Failed to enable campaign: ${error.message}`);
    },
  });

  const pauseCampaignMutation = trpc.googleAds.pauseCampaign.useMutation({
    onSuccess: () => {
      toast.success("Campaign paused!");
      refetchCampaigns();
    },
    onError: (error) => {
      toast.error(`Failed to pause campaign: ${error.message}`);
    },
  });

  const handleApproveBudget = () => {
    const amount = parseInt(budgetAmount);
    if (isNaN(amount) || amount < 100) {
      toast.error("Budget must be at least $100");
      return;
    }
    approveBudgetMutation.mutate({ amount });
  };

  const handleCreateCampaign = () => {
    console.log('[GoogleAdsDashboard] handleCreateCampaign called');
    console.log('[GoogleAdsDashboard] currentBudget:', currentBudget);
    console.log('[GoogleAdsDashboard] selectedAccountData:', selectedAccountData);
    
    if (!currentBudget || !currentBudget.budget) {
      toast.error("Please approve a budget first");
      return;
    }
    if (!selectedAccountData?.clientAccountId) {
      toast.error("Please select a client account first");
      return;
    }
    setIsCreatingCampaign(true);
    toast.info("Creating campaign... This may take a moment.");
    createCampaignMutation.mutate({ monthlyBudget: currentBudget.budget });
  };

  const handleToggleCampaign = (campaignId: number, currentStatus: string) => {
    if (currentStatus === 'active') {
      pauseCampaignMutation.mutate({ id: campaignId });
    } else {
      enableCampaignMutation.mutate({ id: campaignId });
    }
  };

  if (authLoading || configLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (!user || user.role !== 'admin') {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
          <AlertCircle className="w-16 h-16 text-destructive" />
          <h2 className="text-2xl font-bold">Access Denied</h2>
          <p className="text-muted-foreground">Only administrators can access this page.</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!isConfigured) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
          <AlertCircle className="w-16 h-16 text-warning" />
          <h2 className="text-2xl font-bold">Google Ads Not Configured</h2>
          <p className="text-muted-foreground">Google Ads API credentials are not set up.</p>
          <p className="text-sm text-muted-foreground">Contact support to configure Google Ads integration.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Google Ads Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Monitor and control your autonomous advertising campaigns
          </p>
        </div>

        {/* Client Account Selector */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Client Account Selection
            </CardTitle>
            <CardDescription>
              Your Google Ads account is a Manager Account (MCC). Select which client account to use for campaign creation.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {clientAccountsLoading || selectedAccountLoading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm text-muted-foreground">Loading client accounts...</span>
              </div>
            ) : clientAccountsData?.accounts && clientAccountsData.accounts.length > 0 ? (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Label htmlFor="client-account" className="min-w-[120px]">
                    Select Account:
                  </Label>
                  <Select
                    value={selectedAccountData?.clientAccountId || ""}
                    onValueChange={(value) => {
                      setClientAccountMutation.mutate({ clientAccountId: value });
                    }}
                  >
                    <SelectTrigger id="client-account" className="w-full max-w-md">
                      <SelectValue placeholder="Choose a client account" />
                    </SelectTrigger>
                    <SelectContent>
                      {clientAccountsData.accounts.map((account) => (
                        <SelectItem key={account.id} value={account.id}>
                          {account.name} ({account.id}) - {account.currency}
                          {account.testAccount && " [TEST]"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {selectedAccountData?.clientAccountId && (
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    <span>
                      Client account selected. Campaigns will be created in this account.
                    </span>
                  </div>
                )}
                {!selectedAccountData?.clientAccountId && (
                  <div className="flex items-center gap-2 text-sm text-amber-600">
                    <AlertCircle className="h-4 w-4" />
                    <span>
                      Please select a client account before creating campaigns.
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2 text-sm text-amber-600">
                <AlertCircle className="h-4 w-4" />
                <span>
                  No client accounts found. Create a client account in Google Ads first.
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Performance Summary */}
        {performance && (
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Spend</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${performance.cost.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">Last 30 days</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Impressions</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{performance.impressions.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">Ad views</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Clicks</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{performance.clicks.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  {performance.impressions > 0
                    ? `${((performance.clicks / performance.impressions) * 100).toFixed(2)}% CTR`
                    : "0% CTR"}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Conversions</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{performance.conversions}</div>
                <p className="text-xs text-muted-foreground">
                  {performance.cost > 0 && performance.conversions > 0
                    ? `$${(performance.cost / performance.conversions).toFixed(2)} CPA`
                    : "No conversions yet"}
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Conversion Tracking Setup */}
        <Card className="border-orange-200 bg-orange-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-600" />
              Conversion Tracking Setup Required
            </CardTitle>
            <CardDescription>
              Set up conversion tracking to measure quote submissions from your ads
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <p className="text-sm font-medium">Follow these steps to complete setup:</p>
              <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                <li>
                  Go to{" "}
                  <a
                    href="https://ads.google.com/aw/conversions"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline font-medium"
                  >
                    Google Ads Conversions
                  </a>
                </li>
                <li>Click "+ New conversion action"</li>
                <li>Select "Website" as the conversion source</li>
                <li>Category: "Lead" or "Submit lead form"</li>
                <li>Conversion name: "Solar Quote Submission"</li>
                <li>Value: "Use different values for each conversion"</li>
                <li>Count: "One" (recommended)</li>
                <li>Click "Create and continue"</li>
                <li>
                  Copy your conversion label from the tracking code (looks like: <code className="bg-muted px-1 py-0.5 rounded">AbC123XyZ</code>)
                </li>
                <li>
                  Update <code className="bg-muted px-1 py-0.5 rounded">client/src/pages/QuoteThankYou.tsx</code> line 22 with your label
                </li>
                <li>Save and deploy - the system will auto-update</li>
              </ol>
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm font-medium text-blue-900 mb-1">💡 Why this is important:</p>
                <p className="text-sm text-blue-800">
                  Conversion tracking lets Google Ads optimize your campaigns for actual quote submissions, not just clicks.
                  This dramatically improves your cost per lead and ROI.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Budget Management */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Budget</CardTitle>
            <CardDescription>
              Approve monthly advertising budget to enable campaign creation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {currentBudget && currentBudget.budget ? (
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">${currentBudget.budget.toLocaleString()} AUD / month</p>
                  <p className="text-sm text-muted-foreground">
                    Budget approved
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Daily limit: ${(currentBudget.budget / 30).toFixed(2)}
                  </p>
                </div>
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="budget">Monthly Budget (AUD)</Label>
                  <Input
                    id="budget"
                    type="number"
                    min="100"
                    step="100"
                    value={budgetAmount}
                    onChange={(e) => setBudgetAmount(e.target.value)}
                    placeholder="1000"
                  />
                  <p className="text-sm text-muted-foreground">
                    Recommended: $1,000 - $5,000 per month
                  </p>
                </div>
                <Button
                  onClick={handleApproveBudget}
                  disabled={approveBudgetMutation.isPending}
                >
                  {approveBudgetMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Approve Budget
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Campaigns */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Active Campaigns</CardTitle>
              <CardDescription>
                Manage your Google Ads campaigns
              </CardDescription>
            </div>
            <Button
              onClick={() => {
                console.log('Button clicked!');
                handleCreateCampaign();
              }}
              disabled={isCreatingCampaign || createCampaignMutation.isPending}
            >
              {(isCreatingCampaign || createCampaignMutation.isPending) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Plus className="mr-2 h-4 w-4" />
              Create Campaign
            </Button>
          </CardHeader>
          <CardContent>
            {campaignsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : campaigns && campaigns.length > 0 ? (
              <div className="space-y-4">
                {campaigns.map((campaign) => (
                  <div
                    key={campaign.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex-1">
                      <h3 className="font-medium">{campaign.name}</h3>
                      <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                        <span>Budget: ${campaign.dailyBudget}/day</span>
                        <span className={campaign.status === 'active' ? 'text-green-600' : 'text-yellow-600'}>
                          {campaign.status}
                        </span>
                      </div>
                      {campaign.googleCampaignId && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Campaign ID: {campaign.googleCampaignId}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleCampaign(campaign.id, campaign.status)}
                      disabled={enableCampaignMutation.isPending || pauseCampaignMutation.isPending}
                    >
                      {(enableCampaignMutation.isPending || pauseCampaignMutation.isPending) && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      {campaign.status === 'active' ? (
                        <>
                          <Pause className="mr-2 h-4 w-4" />
                          Pause
                        </>
                      ) : (
                        <>
                          <Play className="mr-2 h-4 w-4" />
                          Enable
                        </>
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>No campaigns yet. Create your first campaign to get started!</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="bg-muted/50">
          <CardHeader>
            <CardTitle className="text-lg">How It Works</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>• <strong>Budget Approval:</strong> Set and approve your monthly advertising budget</p>
            <p>• <strong>Campaign Creation:</strong> AI generates optimized campaigns with targeted keywords and ad copy</p>
            <p>• <strong>Automatic Optimization:</strong> System adjusts bids every 6 hours based on performance</p>
            <p>• <strong>Safety Controls:</strong> Campaigns pause automatically when daily limits are reached</p>
            <p>• <strong>Performance Tracking:</strong> Monitor impressions, clicks, and conversions in real-time</p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
