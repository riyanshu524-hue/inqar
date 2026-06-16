import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Crown, CheckCircle, Zap, Shield, AlertCircle } from "lucide-react";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";

export default function VIPSubscription() {
  const { user } = useAuth();
  const [showGovDialog, setShowGovDialog] = useState(false);
  const [govFormData, setGovFormData] = useState({
    governmentId: "",
    position: "",
    department: "",
    justification: "",
  });

  const { data: vipStatus, isLoading } = trpc.vip.getSubscription.useQuery(undefined, {
    enabled: !!user,
  });

  const upgradeMutation = trpc.vip.createCheckoutSession.useMutation({
    onSuccess: (data) => {
      if (data.sessionUrl) {
        window.open(data.sessionUrl, "_blank");
        toast.success("Redirecting to payment...");
      }
    },
    onError: (error: any) => {
      toast.error("Failed to start checkout: " + (error?.message || "Unknown error"));
    },
  });

  const applyGovMutation = trpc.vip.createCheckoutSession.useMutation({
    onSuccess: () => {
      toast.success("Government VIP application submitted!");
      setShowGovDialog(false);
      setGovFormData({ governmentId: "", position: "", department: "", justification: "" });
    },
    onError: (error) => {
      toast.error("Failed to submit application: " + error.message);
    },
  });

  const handleUpgradeClick = () => {
    if (!user) {
      toast.error("Please log in first");
      return;
    }
    upgradeMutation.mutate({ tier: "regular" });
  };

  const handleGovSubmit = () => {
    if (!govFormData.governmentId || !govFormData.position || !govFormData.department) {
      toast.error("Please fill in all required fields");
      return;
    }
    // First create checkout, then apply for government VIP after payment
    applyGovMutation.mutate({ tier: "government" });
  };

  if (isLoading) {
    return <div className="flex justify-center py-12">Loading...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-2">INQAR VIP</h1>
        <p className="text-muted-foreground">Unlock premium features and exclusive benefits</p>
      </div>

      {/* Current Status */}
      {vipStatus && (
        <Card className="p-6 mb-8 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-1">Current Status</h3>
              <p className="text-muted-foreground">
                {vipStatus.tier === "government" ? (
                  <span className="flex items-center gap-2">
                    <Crown className="w-4 h-4" /> Government VIP Member
                  </span>
                ) : vipStatus.tier === "regular" ? (
                  <span className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" /> VIP Member
                  </span>
                ) : (
                  "Free Member"
                )}
              </p>
            </div>
            {vipStatus.tier && (
              <Badge className={vipStatus.tier === "government" ? "bg-yellow-500" : "bg-blue-500"}>
                {vipStatus.tier === "government" ? "Government VIP" : "Regular VIP"}
              </Badge>
            )}
          </div>
        </Card>
      )}

      {/* VIP Tiers */}
      <div className="grid md:grid-cols-2 gap-8 mb-12">
        {/* Regular VIP */}
        <Card className="p-8 border-2 hover:border-blue-500 transition-colors">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-6 h-6 text-blue-500" />
            <h2 className="text-2xl font-bold">Regular VIP</h2>
          </div>
          <p className="text-3xl font-bold mb-2">$9.99<span className="text-lg text-muted-foreground">/month</span></p>
          <p className="text-muted-foreground mb-6">Premium features for content creators</p>

          <ul className="space-y-3 mb-8">
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Priority customer support</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Verified VIP badge on profile</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Advanced analytics dashboard</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Exclusive marketplace features</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Ad-free browsing</span>
            </li>
          </ul>

          <Button
            onClick={handleUpgradeClick}
            disabled={vipStatus?.tier === "regular" || upgradeMutation.isPending}
            className="w-full"
            size="lg"
          >
            {upgradeMutation.isPending ? "Processing..." : vipStatus?.tier === "regular" ? "Current Plan" : "Upgrade Now"}
          </Button>
        </Card>

        {/* Government VIP */}
        <Card className="p-8 border-2 border-yellow-500 relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-yellow-500 text-white px-4 py-1 text-sm font-semibold">
            PREMIUM
          </div>
          <div className="flex items-center gap-2 mb-4">
            <Crown className="w-6 h-6 text-yellow-500" />
            <h2 className="text-2xl font-bold">Government VIP</h2>
          </div>
          <p className="text-3xl font-bold mb-2">Verified<span className="text-lg text-muted-foreground"> Only</span></p>
          <p className="text-muted-foreground mb-6">For verified government officials and public figures</p>

          <ul className="space-y-3 mb-8">
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>All Regular VIP features</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Government VIP badge</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Official verification status</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Dedicated account manager</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Custom profile branding</span>
            </li>
          </ul>

          <Button
            onClick={() => setShowGovDialog(true)}
            disabled={vipStatus?.tier === "government" || applyGovMutation.isPending}
            variant={vipStatus?.tier === "government" ? "outline" : "default"}
            className="w-full"
            size="lg"
          >
            {applyGovMutation.isPending ? "Submitting..." : vipStatus?.tier === "government" ? "Current Plan" : "Apply Now"}
          </Button>
        </Card>
      </div>

      {/* Government VIP Application Dialog */}
      <Dialog open={showGovDialog} onOpenChange={setShowGovDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Apply for Government VIP</DialogTitle>
            <DialogDescription>
              Provide your government credentials for verification. Our team will review your application within 24-48 hours.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Government ID Number</label>
              <Input
                placeholder="e.g., GOV-2024-001234"
                value={govFormData.governmentId}
                onChange={(e) => setGovFormData({ ...govFormData, governmentId: e.target.value })}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Position/Title</label>
              <Input
                placeholder="e.g., Minister of Technology"
                value={govFormData.position}
                onChange={(e) => setGovFormData({ ...govFormData, position: e.target.value })}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Department/Ministry</label>
              <Input
                placeholder="e.g., Ministry of Communications"
                value={govFormData.department}
                onChange={(e) => setGovFormData({ ...govFormData, department: e.target.value })}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Justification (Optional)</label>
              <Textarea
                placeholder="Tell us why you need Government VIP status..."
                value={govFormData.justification}
                onChange={(e) => setGovFormData({ ...govFormData, justification: e.target.value })}
                rows={4}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowGovDialog(false)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleGovSubmit} disabled={applyGovMutation.isPending} className="flex-1">
                {applyGovMutation.isPending ? "Submitting..." : "Submit Application"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Benefits Section */}
      <Card className="p-8 bg-gradient-to-r from-purple-50 to-blue-50">
        <h3 className="text-2xl font-bold mb-6">Why Choose INQAR VIP?</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="flex gap-4">
            <Shield className="w-6 h-6 text-purple-500 flex-shrink-0 mt-1" />
            <div>
              <h4 className="font-semibold mb-1">Verified Status</h4>
              <p className="text-sm text-muted-foreground">Get a verified badge to build trust with your audience</p>
            </div>
          </div>
          <div className="flex gap-4">
            <Zap className="w-6 h-6 text-blue-500 flex-shrink-0 mt-1" />
            <div>
              <h4 className="font-semibold mb-1">Premium Analytics</h4>
              <p className="text-sm text-muted-foreground">Track detailed insights about your audience and content</p>
            </div>
          </div>
          <div className="flex gap-4">
            <Crown className="w-6 h-6 text-yellow-500 flex-shrink-0 mt-1" />
            <div>
              <h4 className="font-semibold mb-1">Priority Support</h4>
              <p className="text-sm text-muted-foreground">Get faster responses from our dedicated support team</p>
            </div>
          </div>
          <div className="flex gap-4">
            <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
            <div>
              <h4 className="font-semibold mb-1">Exclusive Features</h4>
              <p className="text-sm text-muted-foreground">Access premium tools not available to free users</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
