import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Spinner } from "@/components/ui/spinner";
import { Bell, Heart, MessageCircle, Users, Settings } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";

export default function Notifications() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("all");
  const [notificationSettings, setNotificationSettings] = useState({
    likes: true,
    comments: true,
    follows: true,
    messages: true,
    vipUpdates: true,
  });

  const { data: notifications, isLoading } = trpc.notifications.getNotifications.useQuery(
    { limit: 50 },
    { enabled: !!user }
  );

  const markAsReadMutation = trpc.notifications.markAsRead.useMutation();
  const deleteNotificationMutation = trpc.notifications.deleteNotification.useMutation();

  const handleMarkAsRead = (notificationId: number) => {
    markAsReadMutation.mutate({ notificationId });
  };

  const handleDeleteNotification = (notificationId: number) => {
    deleteNotificationMutation.mutate({ notificationId });
  };

  const handleSaveSettings = () => {
    // In a real app, this would save to backend
    console.log("Notification settings saved:", notificationSettings);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "like":
        return <Heart className="w-5 h-5 text-red-500" />;
      case "comment":
        return <MessageCircle className="w-5 h-5 text-blue-500" />;
      case "follow":
        return <Users className="w-5 h-5 text-green-500" />;
      case "message":
        return <MessageCircle className="w-5 h-5 text-purple-500" />;
      default:
        return <Bell className="w-5 h-5" />;
    }
  };

  const filteredNotifications = notifications?.filter((notif: any) => {
    if (activeTab === "all") return true;
    return notif.type === activeTab;
  });

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8 flex items-center gap-2">
        <Bell className="w-8 h-8" />
        Notifications
      </h1>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="like">Likes</TabsTrigger>
          <TabsTrigger value="comment">Comments</TabsTrigger>
          <TabsTrigger value="follow">Follows</TabsTrigger>
          <TabsTrigger value="message">Messages</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Spinner />
            </div>
          ) : filteredNotifications && filteredNotifications.length > 0 ? (
            <div className="space-y-3">
              {filteredNotifications.map((notif: any) => (
                <Card
                  key={notif.id}
                  className={`p-4 flex items-start gap-4 cursor-pointer hover:bg-muted transition-colors ${
                    !notif.isRead ? "bg-blue-50 border-blue-200" : ""
                  }`}
                >
                  <div className="flex-shrink-0 mt-1">{getNotificationIcon(notif.type)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm">{notif.title}</p>
                    <p className="text-sm text-muted-foreground">{notif.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(notif.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    {!notif.isRead && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleMarkAsRead(notif.id)}
                      >
                        Mark read
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteNotification(notif.id)}
                    >
                      ×
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <Bell className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p className="text-muted-foreground">No notifications yet</p>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Notification Settings */}
      <Card className="p-6 mt-8">
        <div className="flex items-center gap-2 mb-6">
          <Settings className="w-5 h-5" />
          <h2 className="text-xl font-bold">Notification Preferences</h2>
        </div>

        <div className="space-y-4">
          {[
            { key: "likes", label: "Likes", description: "Get notified when someone likes your post" },
            { key: "comments", label: "Comments", description: "Get notified when someone comments on your post" },
            { key: "follows", label: "Follows", description: "Get notified when someone follows you" },
            { key: "messages", label: "Messages", description: "Get notified when you receive a message" },
            { key: "vipUpdates", label: "VIP Updates", description: "Get notified about VIP status changes" },
          ].map((setting) => (
            <div key={setting.key} className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-semibold text-sm">{setting.label}</p>
                <p className="text-xs text-muted-foreground">{setting.description}</p>
              </div>
              <input
                type="checkbox"
                checked={notificationSettings[setting.key as keyof typeof notificationSettings]}
                onChange={(e) =>
                  setNotificationSettings((prev) => ({
                    ...prev,
                    [setting.key]: e.target.checked,
                  }))
                }
                className="w-5 h-5 rounded"
              />
            </div>
          ))}
        </div>

        <Button onClick={handleSaveSettings} className="w-full mt-6">
          Save Preferences
        </Button>
      </Card>
    </div>
  );
}
