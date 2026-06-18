import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, Star } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { useState } from "react";

export default function VIP() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const { data: vipStatus } = trpc.vip.getSubscription.useQuery(undefined, { enabled: !!user });

  const upgradeMutation = trpc.vip.createCheckoutSession.useMutation();

  const handleUpgrade = (tier: "regular" | "government") => {
    if (!user) {
      toast.error("Please log in first");
      return;
    }

    if (tier === "government") {
      // Redirect to Government VIP application form
      navigate("/vip-application", { replace: false });
      return;
    }

    setIsLoading(true);
    upgradeMutation.mutate(
      { tier, returnUrl: window.location.origin + "/vip" },
      {
        onSuccess: (session) => {
          if (session?.sessionUrl) {
            window.location.href = session.sessionUrl;
          }
        },
        onError: (error) => {
          toast.error(error.message || "Failed to create checkout session");
          setIsLoading(false);
        },
      }
    );
  };

  const features = {
    regular: [
      "Ad-free experience",
      "Priority support",
      "Exclusive badges",
      "Enhanced analytics",
      "Early access to features",
    ],
    government: [
      "All Regular VIP benefits",
      "Government VIP badge",
      "Verified status",
      "Priority moderation",
      "Direct support channel",
      "Exclusive government community",
    ],
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Crown className="w-8 h-8 text-yellow-500" />
          <h1 className="text-4xl font-bold">INQAR VIP</h1>
        </div>
        <p className="text-xl text-muted-foreground">Unlock exclusive features and benefits</p>
      </div>

      {/* Current Status */}
      {vipStatus && (
        <Card className="p-6 mb-12 bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Current Status</p>
              <p className="text-2xl font-bold">
                {vipStatus.tier === "government"
                  ? "Government VIP"
                  : vipStatus.tier === "regular"
                    ? "Regular VIP"
                    : "Free Member"}
              </p>
            </div>
            {vipStatus.tier && (
              <Badge className="text-lg px-4 py-2">
                <Star className="w-4 h-4 mr-2" />
                Active
              </Badge>
            )}
          </div>
        </Card>
      )}

      {/* VIP Tiers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Regular VIP */}
        <Card className="p-8 border-2 hover:shadow-lg transition-shadow">
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-2">Regular VIP</h2>
            <p className="text-3xl font-bold text-blue-600">
              $9.99<span className="text-lg text-muted-foreground">/month</span>
            </p>
          </div>

          <div className="space-y-4 mb-8">
            {features.regular.map((feature, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <Check className="w-5 h-5 text-green-500" />
                <span>{feature}</span>
              </div>
            ))}
          </div>

          <Button
            className="w-full"
            onClick={() => handleUpgrade("regular")}
            disabled={vipStatus?.tier === "regular" || isLoading}
          >
            {isLoading ? "Processing..." : vipStatus?.tier === "regular" ? "Current Plan" : "Upgrade Now"}
          </Button>
        </Card>

        {/* Government VIP */}
        <Card className="p-8 border-2 border-yellow-500 relative hover:shadow-lg transition-shadow">
          <Badge className="absolute top-4 right-4 bg-yellow-500">
            <Crown className="w-3 h-3 mr-1" />
            Premium
          </Badge>

          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-2">Government VIP</h2>
            <p className="text-3xl font-bold text-yellow-600">
              $24.99<span className="text-lg text-muted-foreground">/month</span>
            </p>
            <p className="text-sm text-muted-foreground mt-2">Requires verification</p>
          </div>

          <div className="space-y-4 mb-8">
            {features.government.map((feature, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <Check className="w-5 h-5 text-green-500" />
                <span>{feature}</span>
              </div>
            ))}
          </div>

          <Button
            className="w-full bg-yellow-600 hover:bg-yellow-700"
            onClick={() => handleUpgrade("government")}
            disabled={vipStatus?.tier === "government"}
          >
            {vipStatus?.tier === "government" ? "Current Plan" : "Apply for Government VIP"}
          </Button>
        </Card>
      </div>

      {/* Government VIP Application Info */}
      <Card className="p-6 mt-12 bg-blue-50 border-blue-200">
        <h3 className="font-bold mb-2">Government VIP Verification</h3>
        <p className="text-sm text-muted-foreground">
          Government VIP requires verification through official channels. After subscribing, you'll be guided through the
          verification process. Once approved, you'll receive your Government VIP badge and exclusive benefits.
        </p>
      </Card>
    </div>
  );
}
