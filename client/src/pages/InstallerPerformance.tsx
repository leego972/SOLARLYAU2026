import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { toast } from "sonner";
import { TrendingUp, DollarSign, Target, Award, CheckCircle2, Clock } from "lucide-react";

export default function InstallerPerformance() {
  const { user, loading: authLoading } = useAuth();
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<{ leadId: number; transactionId: number } | null>(null);
  const [contractValue, setContractValue] = useState("");
  const [closedDate, setClosedDate] = useState(new Date().toISOString().split("T")[0]);

  // Fetch performance data
  const { data: performance, isLoading: perfLoading } = trpc.leadClosures.getMyPerformance.useQuery();
  const { data: closures, isLoading: closuresLoading } = trpc.leadClosures.getMyClosures.useQuery();
  const { data: leaderboard } = trpc.leadClosures.getLeaderboard.useQuery({ limit: 10 });

  // Note: Lead selection for closure reporting would require additional endpoint
  // For now, installers can manually enter lead ID from their purchase history
  const purchasedLeads: any[] = [];

  const reportClosureMutation = trpc.leadClosures.reportClosure.useMutation({
    onSuccess: () => {
      toast.success("Lead closure reported successfully! You'll receive your $40 performance bonus soon.");
      setReportDialogOpen(false);
      setSelectedLead(null);
      setContractValue("");
    },
    onError: (error) => {
      toast.error(`Failed to report closure: ${error.message}`);
    },
  });

  const handleReportClosure = () => {
    if (!selectedLead) return;

    reportClosureMutation.mutate({
      leadId: selectedLead.leadId,
      transactionId: selectedLead.transactionId,
      closedDate: new Date(closedDate),
      contractValue: contractValue ? parseInt(contractValue) * 100 : undefined, // Convert to cents
    });
  };

  if (authLoading || perfLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Login Required</CardTitle>
            <CardDescription>Please log in to view your performance dashboard</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const roi = performance?.roi || 0;
  const conversionRate = performance?.conversionRate || 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Performance Dashboard</h1>
          <p className="text-gray-600">Track your lead conversion success and earnings</p>
        </div>

        {/* Performance Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{performance?.totalLeads || 0}</div>
              <p className="text-xs text-muted-foreground">Leads purchased</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversions</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{performance?.totalClosures || 0}</div>
              <p className="text-xs text-muted-foreground">{conversionRate.toFixed(1)}% conversion rate</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${((performance?.totalRevenue || 0) / 100).toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">From closed deals</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">ROI</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${roi >= 0 ? "text-green-600" : "text-red-600"}`}>
                {roi >= 0 ? "+" : ""}{roi.toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground">Return on investment</p>
            </CardContent>
          </Card>
        </div>

        {/* Bonus Earnings */}
        <Card className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Performance Bonus Earnings
            </CardTitle>
            <CardDescription className="text-orange-100">
              Earn $40 for every lead you close
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold mb-2">
              ${((performance?.totalBonusEarned || 0) / 100).toLocaleString()}
            </div>
            <p className="text-orange-100">Total bonus earned from {performance?.totalClosures || 0} closed deals</p>
          </CardContent>
        </Card>

        {/* Report Closure Button */}
        <Dialog open={reportDialogOpen} onOpenChange={setReportDialogOpen}>
          <DialogTrigger asChild>
            <Button size="lg" className="w-full md:w-auto">
              <CheckCircle2 className="mr-2 h-5 w-5" />
              Report Lead Closure
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Report Lead Closure</DialogTitle>
              <DialogDescription>
                Report a successful sale to earn your $40 performance bonus
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="lead">Select Lead</Label>
                <select
                  id="lead"
                  className="w-full mt-1 p-2 border rounded-md"
                  onChange={(e) => {
                    const [leadId, transactionId] = e.target.value.split("-").map(Number);
                    setSelectedLead({ leadId, transactionId });
                  }}
                >
                  <option value="">Choose a lead...</option>
                  {purchasedLeads?.map((lead: any) => (
                    <option key={lead.id} value={`${lead.id}-${lead.transactionId}`}>
                      {lead.customerName} - {lead.suburb}, {lead.state}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="closedDate">Closure Date</Label>
                <Input
                  id="closedDate"
                  type="date"
                  value={closedDate}
                  onChange={(e) => setClosedDate(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="contractValue">Contract Value (Optional)</Label>
                <Input
                  id="contractValue"
                  type="number"
                  placeholder="e.g., 15000"
                  value={contractValue}
                  onChange={(e) => setContractValue(e.target.value)}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Total installation value in AUD
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setReportDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleReportClosure}
                disabled={!selectedLead || reportClosureMutation.isPending}
              >
                {reportClosureMutation.isPending ? "Reporting..." : "Report Closure"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Recent Closures */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Closures</CardTitle>
            <CardDescription>Your successfully closed leads</CardDescription>
          </CardHeader>
          <CardContent>
            {closuresLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
              </div>
            ) : closures && closures.length > 0 ? (
              <div className="space-y-4">
                {closures.map((closure) => (
                  <div key={closure.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">{closure.customerName}</p>
                      <p className="text-sm text-muted-foreground">
                        {closure.address}, {closure.suburb}, {closure.state}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Closed: {new Date(closure.closedDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      {closure.contractValue && (
                        <p className="font-medium">${(closure.contractValue / 100).toLocaleString()}</p>
                      )}
                      <Badge variant={closure.bonusPaid ? "default" : "secondary"} className="mt-1">
                        {closure.bonusPaid ? "Bonus Paid" : "Pending"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No closures reported yet</p>
                <p className="text-sm mt-2">Report your first successful sale to start earning bonuses!</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Leaderboard */}
        {leaderboard && leaderboard.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Top Performers</CardTitle>
              <CardDescription>See how you rank against other installers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {leaderboard.map((installer, index) => (
                  <div key={installer.installerId} className="flex items-center gap-4 p-3 border rounded-lg">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center font-bold text-orange-600">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{installer.companyName}</p>
                      <p className="text-sm text-muted-foreground">
                        {installer.totalClosures} closures • Avg: ${(installer.avgContractValue / 100).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">
                        ${(installer.totalRevenue / 100).toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground">Total revenue</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
