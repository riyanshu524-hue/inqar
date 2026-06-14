import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { Upload, Check, AlertCircle } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";

export default function ProfileEdit() {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isPrivate, setIsPrivate] = useState(user?.isPrivate || false);

  const updateProfileMutation = trpc.user.updateProfile.useMutation();

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async () => {
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }

    try {
      // Update profile (avatar upload would be handled via file storage endpoint)
      await updateProfileMutation.mutateAsync({
        name: name.trim(),
        bio: bio.trim(),
        isPrivate,
      });

      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error("Failed to update profile");
    }
  };

  const isLoading = updateProfileMutation.isPending;

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Edit Profile</h1>

      <div className="space-y-6">
        {/* Avatar Upload */}
        <Card className="p-6">
          <Label className="text-base font-semibold mb-4 block">Profile Picture</Label>
          <div className="flex gap-6 items-start">
            {/* Avatar Preview */}
            <div className="flex-shrink-0">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center overflow-hidden">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar preview" className="w-full h-full object-cover" />
                ) : null}
              </div>
            </div>

            {/* Upload Input */}
            <div className="flex-1">
              <label className="flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-muted transition-colors">
                <Upload className="w-5 h-5" />
                <span>Click to upload or drag and drop</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </label>
              <p className="text-sm text-muted-foreground mt-2">PNG, JPG, GIF up to 10MB</p>
            </div>
          </div>
        </Card>

        {/* Name */}
        <Card className="p-6">
          <Label htmlFor="name" className="text-base font-semibold mb-2 block">
            Name
          </Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your full name"
            maxLength={50}
          />
          <p className="text-xs text-muted-foreground mt-2">{name.length}/50</p>
        </Card>

        {/* Bio */}
        <Card className="p-6">
          <Label htmlFor="bio" className="text-base font-semibold mb-2 block">
            Bio
          </Label>
          <Textarea
            id="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Tell us about yourself..."
            maxLength={160}
            rows={4}
          />
          <p className="text-xs text-muted-foreground mt-2">{bio.length}/160</p>
        </Card>

        {/* Privacy Settings */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-semibold">Private Account</Label>
              <p className="text-sm text-muted-foreground mt-1">
                Only people you approve can see your posts and follow you
              </p>
            </div>
            <input
              type="checkbox"
              checked={isPrivate}
              onChange={(e) => setIsPrivate(e.target.checked)}
              className="w-5 h-5 rounded"
            />
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button onClick={handleSaveProfile} disabled={isLoading} className="flex-1">
            {isLoading ? (
              <>
                <Spinner className="w-4 h-4 mr-2" />
                Saving...
              </>
            ) : (
              <>
                <Check className="w-4 h-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
          <Button variant="outline" className="flex-1">
            Cancel
          </Button>
        </div>

        {/* Info Message */}
        <Card className="p-4 bg-blue-50 border-blue-200">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-semibold mb-1">Profile Privacy</p>
              <p>Your profile information is visible to all users. Only your posts and followers list are affected by privacy settings.</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
