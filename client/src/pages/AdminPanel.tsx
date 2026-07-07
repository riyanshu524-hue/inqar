import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { Users, FileText, CheckCircle, BarChart3, Trash2, Check, Ban } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function AdminPanel() {
  const [selectedTab, setSelectedTab] = useState("users");

  // Fetch real data from database
  const { data: stats, isLoading: statsLoading } = trpc.admin.getDashboardStats.useQuery();
  const { data: users, isLoading: usersLoading, refetch: refetchUsers } = trpc.admin.getAllUsers.useQuery({});
  const { data: posts, isLoading: postsLoading, refetch: refetchPosts } = trpc.admin.getAllPosts.useQuery({});
  const { data: vipRequests, isLoading: vipLoading, refetch: refetchVip } = trpc.admin.getPendingVipApplications.useQuery();
  const { data: listings, isLoading: listingsLoading, refetch: refetchListings } = trpc.admin.getAllMarketplaceListings.useQuery({});

  // Mutations for admin actions
  const deletePostMutation = trpc.admin.deletePost.useMutation({
    onSuccess: () => {
      toast.success("Post deleted");
      refetchPosts();
    },
  });

  const approveVipMutation = trpc.vip.approveApplication.useMutation({
    onSuccess: () => {
      toast.success("VIP application approved");
      refetchVip();
    },
  });

  const rejectVipMutation = trpc.vip.rejectApplication.useMutation({
    onSuccess: () => {
      toast.success("VIP application rejected");
      refetchVip();
    },
  });

  const deleteListingMutation = trpc.admin.deleteMarketplaceListing.useMutation({
    onSuccess: () => {
      toast.success("Listing deleted");
      refetchListings();
    },
  });

  const suspendUserMutation = trpc.admin.suspendUser.useMutation({
    onSuccess: () => {
      toast.success("User suspended");
      refetchUsers();
    },
    onError: (error) => {
      toast.error("Failed to suspend user: " + (error?.message || "Unknown error"));
    },
  });

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8 flex items-center gap-2">
        <BarChart3 className="w-8 h-8" />
        Admin Dashboard
      </h1>

      {/* Stats Cards */}
      {statsLoading ? (
        <div className="flex justify-center py-8">
          <Spinner />
        </div>
      ) : stats ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-6">
            <p className="text-sm text-muted-foreground mb-2">Total Users</p>
            <p className="text-3xl font-bold">{stats.users.totalUsers || 0}</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-muted-foreground mb-2">Total Posts</p>
            <p className="text-3xl font-bold">{stats.posts.totalPosts || 0}</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-muted-foreground mb-2">VIP Users</p>
            <p className="text-3xl font-bold">{stats.vip.totalVips || 0}</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-muted-foreground mb-2">Marketplace Listings</p>
            <p className="text-3xl font-bold">{stats.marketplace.totalListings || 0}</p>
          </Card>
        </div>
      ) : null}

      {/* Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Users
          </TabsTrigger>
          <TabsTrigger value="posts" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Posts
          </TabsTrigger>
          <TabsTrigger value="vip" className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            VIP Requests
          </TabsTrigger>
          <TabsTrigger value="marketplace" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Marketplace
          </TabsTrigger>
        </TabsList>

        {/* Users Tab */}
        <TabsContent value="users">
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">User Management</h2>
            {usersLoading ? (
              <div className="flex justify-center py-8">
                <Spinner />
              </div>
            ) : users && users.length > 0 ? (
              <div className="space-y-3">
                {users.map((user: any) => (
                  <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <p className="font-semibold">{user.name || user.username}</p>
                      <p className="text-sm text-muted-foreground">@{user.username}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {user.role === "admin" && <Badge>Admin</Badge>}
                      {user.role !== "admin" && (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => suspendUserMutation.mutate({ userId: user.id })}
                          disabled={suspendUserMutation.isPending}
                        >
                          <Ban className="w-4 h-4 mr-1" />
                          Suspend
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">No users found</p>
            )}
          </Card>
        </TabsContent>

        {/* Posts Tab */}
        <TabsContent value="posts">
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Post Moderation</h2>
            {postsLoading ? (
              <div className="flex justify-center py-8">
                <Spinner />
              </div>
            ) : posts && posts.length > 0 ? (
              <div className="space-y-3">
                {posts.map((post: any) => (
                  <div key={post.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <p className="font-semibold">{post.authorName || post.authorUsername}</p>
                      <p className="text-sm text-muted-foreground line-clamp-2">{post.caption}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(post.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deletePostMutation.mutate({ postId: post.id })}
                      disabled={deletePostMutation.isPending}
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">No posts to moderate</p>
            )}
          </Card>
        </TabsContent>

        {/* VIP Requests Tab */}
        <TabsContent value="vip">
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Government VIP Applications</h2>
            {vipLoading ? (
              <div className="flex justify-center py-8">
                <Spinner />
              </div>
            ) : vipRequests && vipRequests.length > 0 ? (
              <div className="space-y-3">
                {vipRequests.map((request: any) => (
                  <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <p className="font-semibold">{request.userName || request.userUsername}</p>
                      <p className="text-sm text-muted-foreground">@{request.userUsername}</p>
                      <p className="text-xs text-muted-foreground">{request.documentUrl}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => approveVipMutation.mutate({ applicationId: request.id })}
                        disabled={approveVipMutation.isPending}
                      >
                        <Check className="w-4 h-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => rejectVipMutation.mutate({ applicationId: request.id })}
                        disabled={rejectVipMutation.isPending}
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">No VIP applications pending</p>
            )}
          </Card>
        </TabsContent>

        {/* Marketplace Tab */}
        <TabsContent value="marketplace">
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Marketplace Listings</h2>
            {listingsLoading ? (
              <div className="flex justify-center py-8">
                <Spinner />
              </div>
            ) : listings && listings.length > 0 ? (
              <div className="space-y-3">
                {listings.map((listing: any) => (
                  <div key={listing.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <p className="font-semibold">{listing.title}</p>
                      <p className="text-sm text-muted-foreground">{listing.sellerName || listing.sellerUsername}</p>
                      <p className="text-sm">
                        ${listing.price} • Stock: {listing.stock}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deleteListingMutation.mutate({ listingId: listing.id })}
                      disabled={deleteListingMutation.isPending}
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">No listings to moderate</p>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
