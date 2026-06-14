import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Lock, Shield, Eye, EyeOff } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";

export default function PrivacySettings() {
  const { user } = useAuth();
  const [isPrivate, setIsPrivate] = useState(user?.isPrivate || false);
  const [allowComments, setAllowComments] = useState(true);
  const [allowMessages, setAllowMessages] = useState(true);

  const updatePrivacyMutation = trpc.user.updateProfile.useMutation();

  const handlePrivacyToggle = async () => {
    try {
      await updatePrivacyMutation.mutateAsync({
        name: user?.name || "",
        bio: user?.bio || "",
        isPrivate: !isPrivate,
      });
      setIsPrivate(!isPrivate);
      toast.success(`Account is now ${!isPrivate ? "public" : "private"}`);
    } catch (error) {
      toast.error("Failed to update privacy settings");
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8 flex items-center gap-2">
        <Lock className="w-8 h-8" />
        Privacy & Safety
      </h1>

      {/* Private Account Toggle */}
      <Card className="p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Private Account
            </h2>
            <p className="text-sm text-muted-foreground">
              When your account is private, people must request permission to follow you. Only approved followers can see your posts and stories.
            </p>
          </div>
          <button
            onClick={handlePrivacyToggle}
            disabled={updatePrivacyMutation.isPending}
            className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors flex-shrink-0 ${
              isPrivate ? "bg-blue-600" : "bg-gray-300"
            }`}
          >
            <span
              className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                isPrivate ? "translate-x-7" : "translate-x-1"
              }`}
            />
          </button>
        </div>
      </Card>

      {/* Comment Settings */}
      <Card className="p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold mb-1">Allow Comments</h2>
            <p className="text-sm text-muted-foreground">
              Let others comment on your posts
            </p>
          </div>
          <button
            onClick={() => setAllowComments(!allowComments)}
            className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors flex-shrink-0 ${
              allowComments ? "bg-blue-600" : "bg-gray-300"
            }`}
          >
            <span
              className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                allowComments ? "translate-x-7" : "translate-x-1"
              }`}
            />
          </button>
        </div>
      </Card>

      {/* Message Settings */}
      <Card className="p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold mb-1">Allow Direct Messages</h2>
            <p className="text-sm text-muted-foreground">
              Let anyone send you direct messages
            </p>
          </div>
          <button
            onClick={() => setAllowMessages(!allowMessages)}
            className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors flex-shrink-0 ${
              allowMessages ? "bg-blue-600" : "bg-gray-300"
            }`}
          >
            <span
              className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                allowMessages ? "translate-x-7" : "translate-x-1"
              }`}
            />
          </button>
        </div>
      </Card>

      {/* Visibility Settings */}
      <Card className="p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Eye className="w-5 h-5" />
          Visibility
        </h2>
        <div className="space-y-3">
          <div className="flex items-center p-3 border rounded-lg">
            <input type="radio" name="visibility" defaultChecked className="mr-3" />
            <div>
              <p className="font-semibold text-sm">Visible to Everyone</p>
              <p className="text-xs text-muted-foreground">Your profile appears in search and explore</p>
            </div>
          </div>
          <div className="flex items-center p-3 border rounded-lg">
            <input type="radio" name="visibility" className="mr-3" />
            <div>
              <p className="font-semibold text-sm">Visible to Followers Only</p>
              <p className="text-xs text-muted-foreground">Only your followers can find your profile</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Blocked Users */}
      <Card className="p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Blocked Users</h2>
        <div className="text-center py-8">
          <EyeOff className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-muted-foreground">You haven't blocked anyone</p>
        </div>
      </Card>

      {/* Info Card */}
      <Card className="p-4 bg-blue-50 border-blue-200">
        <div className="text-sm text-blue-800">
          <p className="font-semibold mb-2">🔒 Privacy Tips</p>
          <ul className="space-y-1 text-xs">
            <li>• Private accounts require approval for new followers</li>
            <li>• Only approved followers can see your posts and stories</li>
            <li>• Your profile and username are always visible to everyone</li>
            <li>• You can block users to prevent them from seeing your content</li>
            <li>• Adjust comment and message settings to control interactions</li>
          </ul>
        </div>
      </Card>
    </div>
  );
}
