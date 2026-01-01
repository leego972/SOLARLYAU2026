import { Copy, DollarSign, Share2, TrendingUp, Users, CheckCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useState } from "react";

export default function ReferralDashboard() {
  const [copied, setCopied] = useState(false);

  const { data: referralLink, isLoading: linkLoading } = trpc.marketing.getReferralLink.useQuery();
  const { data: stats, isLoading: statsLoading } = trpc.marketing.getReferralStats.useQuery();

  const copyToClipboard = () => {
    if (referralLink?.referralUrl) {
      navigator.clipboard.writeText(referralLink.referralUrl);
      setCopied(true);
      toast.success("Referral link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shareViaEmail = () => {
    const subject = encodeURIComponent("Check out SolarlyAU - Autonomous Solar Lead Generation");
    const body = encodeURIComponent(
      `Hey! I've been using SolarlyAU for my solar installation business and it's been incredible. Their AI generates high-quality leads automatically, and I've seen a huge increase in my close rate.\n\nYou should check it out: ${referralLink?.referralUrl}\n\nIf you sign up through my link, we both get rewarded!`
    );
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  if (linkLoading || statsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading referral dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Referral Dashboard</h1>
          <p className="text-gray-600">
            Earn $50 for every installer you refer! Share your unique link and watch your commissions grow.
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Total Referrals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                <span className="text-3xl font-bold">{stats?.totalReferrals || 0}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-orange-600" />
                <span className="text-3xl font-bold">{stats?.pendingReferrals || 0}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Paid Out</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-3xl font-bold">{stats?.paidReferrals || 0}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Total Earned</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-green-600" />
                <span className="text-3xl font-bold">${stats?.totalEarned || 0}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Referral Link */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Your Referral Link</CardTitle>
            <CardDescription>
              Share this link with other solar installers. When they sign up and make their first purchase, you both get rewarded!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3 mb-4">
              <Input
                value={referralLink?.referralUrl || ""}
                readOnly
                className="font-mono text-sm"
              />
              <Button onClick={copyToClipboard} className="flex-shrink-0">
                {copied ? (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </>
                )}
              </Button>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={shareViaEmail} className="flex-1">
                <Share2 className="w-4 h-4 mr-2" />
                Share via Email
              </Button>
              <Button variant="outline" className="flex-1">
                <Share2 className="w-4 h-4 mr-2" />
                Share on LinkedIn
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* How It Works */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>How It Works</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-blue-600">1</span>
                </div>
                <h4 className="font-semibold mb-2">Share Your Link</h4>
                <p className="text-sm text-gray-600">
                  Send your unique referral link to other solar installers via email, LinkedIn, or social media.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-blue-600">2</span>
                </div>
                <h4 className="font-semibold mb-2">They Sign Up</h4>
                <p className="text-sm text-gray-600">
                  When they create an account and make their first lead purchase, the referral is tracked automatically.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-blue-600">3</span>
                </div>
                <h4 className="font-semibold mb-2">Earn $50</h4>
                <p className="text-sm text-gray-600">
                  You receive $50 commission paid directly to your account. They get $10 off their first purchase!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Referral History */}
        <Card>
          <CardHeader>
            <CardTitle>Referral History</CardTitle>
            <CardDescription>Track all your referrals and their status</CardDescription>
          </CardHeader>
          <CardContent>
            {stats?.referrals && stats.referrals.length > 0 ? (
              <div className="space-y-4">
                {stats.referrals.map((referral) => (
                  <div
                    key={referral.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Users className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-semibold">Installer #{referral.referredInstallerId}</p>
                        <p className="text-sm text-gray-600">
                          Referred on {new Date(referral.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-semibold">${(referral.commissionAmount / 100).toFixed(2)}</p>
                        {referral.paidAt && (
                          <p className="text-xs text-gray-500">
                            Paid {new Date(referral.paidAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      <Badge
                        className={
                          referral.status === "paid"
                            ? "bg-green-100 text-green-800"
                            : referral.status === "pending"
                            ? "bg-orange-100 text-orange-800"
                            : "bg-gray-100 text-gray-800"
                        }
                      >
                        {referral.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h4 className="font-semibold mb-2">No Referrals Yet</h4>
                <p className="text-gray-600 mb-4">
                  Start sharing your referral link to earn $50 for every installer who signs up!
                </p>
                <Button onClick={copyToClipboard}>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Referral Link
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tips Section */}
        <Card className="mt-8 bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900">💡 Pro Tips for More Referrals</CardTitle>
          </CardHeader>
          <CardContent className="text-blue-900">
            <ul className="space-y-2 text-sm">
              <li>✓ Share your success story on LinkedIn with your referral link</li>
              <li>✓ Mention SolarlyAU in solar installer Facebook groups</li>
              <li>✓ Email colleagues who are struggling with lead generation</li>
              <li>✓ Offer to help new installers get started (builds trust)</li>
              <li>✓ Post your results and ROI to attract interest</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
