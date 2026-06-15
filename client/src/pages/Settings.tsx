import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Spinner } from "@/components/ui/spinner";
import { ArrowLeft, Lock, Bell, Eye, Users, Trash2, HelpCircle, LogOut } from "lucide-react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function Settings() {
  const [location, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState("account");

  // Fetch user data
  const { data: user, isLoading } = trpc.auth.me.useQuery();
  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      toast.success("Logged out successfully");
      navigate("/");
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/profile")}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-3xl font-bold">Settings</h1>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6 w-full justify-start">
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="help">Help</TabsTrigger>
        </TabsList>

        {/* Account Tab */}
        <TabsContent value="account" className="space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Account Information</h2>
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Username</Label>
                <Input value={user?.username || ""} disabled className="mt-2" />
              </div>
              <div>
                <Label className="text-sm font-medium">Email</Label>
                <Input value={user?.email || ""} disabled className="mt-2" />
              </div>
              <div>
                <Label className="text-sm font-medium">Name</Label>
                <Input value={user?.name || ""} disabled className="mt-2" />
              </div>
              <Button className="w-full">Edit Profile</Button>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Account Type</h2>
            <p className="text-sm text-muted-foreground mb-4">
              You are currently using a {user?.role === "admin" ? "Admin" : "Regular"} account.
            </p>
            <div className="space-y-2">
              <p className="text-sm font-medium">Account created: {new Date(user?.createdAt || "").toLocaleDateString()}</p>
              <p className="text-sm font-medium">Last signed in: {new Date(user?.lastSignedIn || "").toLocaleDateString()}</p>
            </div>
          </Card>
        </TabsContent>

        {/* Privacy Tab */}
        <TabsContent value="privacy" className="space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Privacy Controls
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Private Account</p>
                  <p className="text-sm text-muted-foreground">Make your account private to control who sees your posts</p>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Allow Messages from Anyone</p>
                  <p className="text-sm text-muted-foreground">Let anyone send you direct messages</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Show Online Status</p>
                  <p className="text-sm text-muted-foreground">Let others see when you're online</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Allow Story Replies</p>
                  <p className="text-sm text-muted-foreground">Let followers reply to your stories</p>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Users className="w-5 h-5" />
              Blocked Users
            </h2>
            <p className="text-sm text-muted-foreground mb-4">You haven't blocked anyone yet</p>
            <Button variant="outline" className="w-full">Manage Blocked Users</Button>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notification Preferences
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Likes & Comments</p>
                  <p className="text-sm text-muted-foreground">Get notified when someone likes or comments on your posts</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">New Followers</p>
                  <p className="text-sm text-muted-foreground">Get notified when someone follows you</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Direct Messages</p>
                  <p className="text-sm text-muted-foreground">Get notified when you receive new messages</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Marketplace Updates</p>
                  <p className="text-sm text-muted-foreground">Get notified about orders and marketplace activity</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Email Notifications</p>
                  <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                </div>
                <Switch />
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Lock className="w-5 h-5" />
              Security Settings
            </h2>
            <div className="space-y-4">
              <Button variant="outline" className="w-full justify-start">
                Change Password
              </Button>
              <Button variant="outline" className="w-full justify-start">
                Two-Factor Authentication
              </Button>
              <Button variant="outline" className="w-full justify-start">
                Active Sessions
              </Button>
              <Button variant="outline" className="w-full justify-start">
                Login Activity
              </Button>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Danger Zone</h2>
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-start text-orange-600">
                <Trash2 className="w-4 h-4 mr-2" />
                Download Your Data
              </Button>
              <Button variant="destructive" className="w-full justify-start">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Account
              </Button>
            </div>
          </Card>
        </TabsContent>

        {/* Help Tab */}
        <TabsContent value="help" className="space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <HelpCircle className="w-5 h-5" />
              Help & Support
            </h2>
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                Help Center
              </Button>
              <Button variant="outline" className="w-full justify-start">
                Report a Problem
              </Button>
              <Button variant="outline" className="w-full justify-start">
                Community Guidelines
              </Button>
              <Button variant="outline" className="w-full justify-start">
                Terms of Service
              </Button>
              <Button variant="outline" className="w-full justify-start">
                Privacy Policy
              </Button>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">About INQAR</h2>
            <p className="text-sm text-muted-foreground mb-4">
              INQAR is a premium social media and marketplace platform combining stunning content sharing, intelligent marketplace, and exclusive VIP experiences.
            </p>
            <p className="text-xs text-muted-foreground">Version 1.0.0 • © 2026 INQAR. All rights reserved.</p>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Logout Button */}
      <div className="mt-8">
        <Button
          variant="outline"
          className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50"
          onClick={() => logoutMutation.mutate()}
          disabled={logoutMutation.isPending}
        >
          <LogOut className="w-4 h-4 mr-2" />
          {logoutMutation.isPending ? "Logging out..." : "Log Out"}
        </Button>
      </div>
    </div>
  );
}
