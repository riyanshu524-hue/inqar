import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Spinner } from "@/components/ui/spinner";
import { Shield, Users, FileText, CheckCircle } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState("overview");

  const { data: stats, isLoading: statsLoading } = trpc.admin.getDashboardStats.useQuery(undefined);
  const { data: pendingVipApps, isLoading: vipAppsLoading } = trpc.admin.getPendingVipApplications.useQuery(undefined);

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Shield className="w-8 h-8 text-red-500" />
        <h1 className="text-4xl font-bold">Admin Panel</h1>
      </div>

      {/* Stats Overview */}
      {statsLoading ? (
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      ) : stats ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-6">
            <p className="text-muted-foreground mb-2">Total Users</p>
            <p className="text-3xl font-bold">{stats.users.totalUsers}</p>
          </Card>
          <Card className="p-6">
            <p className="text-muted-foreground mb-2">Total Posts</p>
            <p className="text-3xl font-bold">{stats.posts.totalPosts}</p>
          </Card>
          <Card className="p-6">
            <p className="text-muted-foreground mb-2">Marketplace Listings</p>
            <p className="text-3xl font-bold">{stats.marketplace.totalListings}</p>
          </Card>
          <Card className="p-6">
            <p className="text-muted-foreground mb-2">VIP Subscribers</p>
            <p className="text-3xl font-bold">{stats.vip.totalVips}</p>
          </Card>
        </div>
      ) : null}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="posts">Posts</TabsTrigger>
          <TabsTrigger value="vip">VIP Applications</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-4">Dashboard Overview</h2>
            <p className="text-muted-foreground">Platform statistics and metrics</p>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-4">User Management</h2>
            <p className="text-muted-foreground">Manage users and accounts</p>
          </Card>
        </TabsContent>

        <TabsContent value="posts">
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-4">Post Moderation</h2>
            <p className="text-muted-foreground">Review and moderate posts</p>
          </Card>
        </TabsContent>

        <TabsContent value="vip">
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-4">VIP Applications</h2>
            {vipAppsLoading ? (
              <div className="flex justify-center py-12">
                <Spinner />
              </div>
            ) : pendingVipApps && pendingVipApps.length > 0 ? (
              <div className="space-y-4">
                {pendingVipApps.map((app: any) => (
                  <Card key={app.id} className="p-4 border-l-4 border-yellow-500">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-bold">User {app.userId}</p>
                        <p className="text-sm text-muted-foreground">Government VIP Application</p>
                        <p className="text-sm mt-2">{app.governmentId}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" className="bg-green-600 hover:bg-green-700">
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Approve
                        </Button>
                        <Button size="sm" variant="destructive">
                          Reject
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No pending applications</p>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
