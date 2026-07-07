import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Crown, CheckCircle, Zap, Shield, AlertCircle, Upload } from "lucide-react";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";

export default function VIPSubscription() {
  const { user } = useAuth();
  const [showGovDialog, setShowGovDialog] = useState(false);
  const [idCardFile, setIdCardFile] = useState<File | null>(null);
  const [govFormData, setGovFormData] = useState({
    firstName: "",
    lastName: "",
    position: "",
    department: "",
    reason: "",
  });

  const { data: vipStatus } = trpc.vip.getSubscription.useQuery(undefined, {
    enabled: !!user,
  });

  const { data: govApplication } = trpc.vip.getGovernmentVipApplication.useQuery(undefined, {
    enabled: !!user,
  });

  const upgradeMutation = trpc.vip.createCheckoutSession.useMutation({
    onSuccess: (data) => {
      if (data.sessionUrl) {
        window.location.href = data.sessionUrl;
        toast.success("Redirecting to payment...");
      }
    },
    onError: (error: any) => {
      toast.error("Failed to start checkout: " + (error?.message || "Unknown error"));
    },
  });

  const applyGovMutation = trpc.vip.submitGovernmentVipApplication.useMutation({
    onSuccess: () => {
      toast.success("Government VIP application submitted! Our team will review it within 24-48 hours.");
      setShowGovDialog(false);
      setIdCardFile(null);
      setGovFormData({
        firstName: "",
        lastName: "",
        position: "",
        department: "",
        reason: "",
      });
    },
    onError: (error: any) => {
      toast.error("Failed to submit application: " + (error?.message || "Unknown error"));
    },
  });

  const handleUpgradeClick = () => {
    if (!user) {
      toast.error("Please log in first");
      return;
    }
    upgradeMutation.mutate({ tier: "regular" });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        return;
      }
      setIdCardFile(file);
    }
  };

  const handleGovSubmit = async () => {
    if (!govFormData.firstName || !govFormData.lastName || !govFormData.position || !govFormData.department) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!idCardFile) {
      toast.error("Please upload your government ID");
      return;
    }

    // For now, use a placeholder URL and key - in production, this would upload to S3
    // and get back the actual URL and key
    const idCardUrl = URL.createObjectURL(idCardFile);
    const idCardKey = `gov-id-${user?.id}-${Date.now()}`;

    applyGovMutation.mutate({
      firstName: govFormData.firstName,
      lastName: govFormData.lastName,
      position: govFormData.position,
      department: govFormData.department,
      reason: govFormData.reason,
      idCardUrl,
      idCardKey,
    });
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-2">INQAR VIP</h1>
        <p className="text-muted-foreground">Unlock premium features and exclusive benefits</p>
      </div>

      {/* Current Status - Show for all users */}
      <Card className="p-6 mb-8 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold mb-1">Current Status</h3>
            <p className="text-muted-foreground">
              {vipStatus?.tier === "government" ? (
                <span className="flex items-center gap-2">
                  <Crown className="w-4 h-4" /> Government VIP Member
                </span>
              ) : vipStatus?.tier === "regular" ? (
                <span className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" /> VIP Member
                </span>
              ) : govApplication?.status === "pending" ? (
                <span className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" /> Government VIP Application Pending
                </span>
              ) : govApplication?.status === "approved" ? (
                <span className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" /> Government VIP Application Approved
                </span>
              ) : govApplication?.status === "declined" ? (
                <span className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" /> Government VIP Application Declined
                </span>
              ) : (
                "Free Member"
              )}
            </p>
          </div>
          {vipStatus?.tier && (
            <Badge className={vipStatus.tier === "government" ? "bg-yellow-500" : "bg-blue-500"}>
              {vipStatus.tier === "government" ? "Government VIP" : "Regular VIP"}
            </Badge>
          )}
          {govApplication?.status === "pending" && (
            <Badge className="bg-orange-500">Pending Review</Badge>
          )}
          {govApplication?.status === "approved" && (
            <Badge className="bg-green-500">Approved</Badge>
          )}
          {govApplication?.status === "declined" && (
            <Badge variant="outline">Declined</Badge>
          )}
        </div>

        {govApplication?.status === "declined" && govApplication?.declineReason && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded text-sm">
            <p className="font-semibold text-red-900">Decline Reason:</p>
            <p className="text-red-700">{govApplication.declineReason}</p>
          </div>
        )}
      </Card>

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
            disabled={vipStatus?.tier === "government" || govApplication?.status === "pending" || applyGovMutation.isPending}
            variant={vipStatus?.tier === "government" ? "outline" : "default"}
            className="w-full"
            size="lg"
          >
            {applyGovMutation.isPending ? "Submitting..." : vipStatus?.tier === "government" ? "Current Plan" : govApplication?.status === "pending" ? "Application Pending" : "Apply Now"}
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
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-sm font-medium">First Name *</label>
                <Input
                  placeholder="First name"
                  value={govFormData.firstName}
                  onChange={(e) => setGovFormData({ ...govFormData, firstName: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Last Name *</label>
                <Input
                  placeholder="Last name"
                  value={govFormData.lastName}
                  onChange={(e) => setGovFormData({ ...govFormData, lastName: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Position/Title *</label>
              <Input
                placeholder="e.g., Minister of Technology"
                value={govFormData.position}
                onChange={(e) => setGovFormData({ ...govFormData, position: e.target.value })}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Department/Ministry *</label>
              <Input
                placeholder="e.g., Ministry of Communications"
                value={govFormData.department}
                onChange={(e) => setGovFormData({ ...govFormData, department: e.target.value })}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Reason/Justification</label>
              <Textarea
                placeholder="Tell us why you need Government VIP status..."
                value={govFormData.reason}
                onChange={(e) => setGovFormData({ ...govFormData, reason: e.target.value })}
                rows={3}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Government ID Upload *</label>
              <div className="border-2 border-dashed rounded-lg p-4 text-center">
                {idCardFile ? (
                  <div className="flex items-center justify-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-sm">{idCardFile.name}</span>
                  </div>
                ) : (
                  <label className="cursor-pointer">
                    <div className="flex flex-col items-center gap-2">
                      <Upload className="w-5 h-5 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Click to upload ID</span>
                    </div>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
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
