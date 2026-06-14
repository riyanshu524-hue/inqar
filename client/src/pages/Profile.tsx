import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { Heart, MessageCircle, Crown, CheckCircle } from "lucide-react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";

export default function Profile() {
  const [, navigate] = useLocation();
  const { user: currentUser } = useAuth();

  const { data: userProfile, isLoading } = trpc.user.getProfile.useQuery(undefined, {
    enabled: !!currentUser,
  });

  const { data: vipStatus } = trpc.vip.getSubscription.useQuery(undefined, {
    enabled: !!currentUser,
  });

  const { data: userPosts } = trpc.posts.getUserPosts.useQuery(
    { userId: userProfile?.id || 0 },
    { enabled: !!userProfile }
  );

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner />
      </div>
    );
  }

  if (!userProfile) {
    return <div className="text-center py-12">User not found</div>;
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {/* Profile Header */}
      <Card className="p-8 mb-8">
        <div className="flex gap-8">
          {/* Avatar */}
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex-shrink-0" />

          {/* Profile Info */}
          <div className="flex-1">
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h1 className="text-3xl font-bold">{userProfile.name || userProfile.username}</h1>
                  {vipStatus?.tier === "government" && (
                    <Badge className="bg-yellow-500 text-white">
                      <Crown className="w-3 h-3 mr-1" />
                      Government VIP
                    </Badge>
                  )}
                  {vipStatus?.tier === "regular" && (
                    <Badge className="bg-blue-500 text-white">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      VIP
                    </Badge>
                  )}
                </div>
                <p className="text-muted-foreground">@{userProfile.username}</p>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => navigate("/profile/edit")}>Edit Profile</Button>
              </div>
            </div>

            <p className="mb-4">{userProfile.bio}</p>

            {/* Stats */}
            <div className="flex gap-6">
              <div>
                <p className="font-bold text-lg">{userPosts?.length || 0}</p>
                <p className="text-sm text-muted-foreground">Posts</p>
              </div>
              <div>
                <p className="font-bold text-lg">{userProfile.followersCount || 0}</p>
                <p className="text-sm text-muted-foreground">Followers</p>
              </div>
              <div>
                <p className="font-bold text-lg">{userProfile.followingCount || 0}</p>
                <p className="text-sm text-muted-foreground">Following</p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Posts Grid */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Posts</h2>
        {userPosts && userPosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {userPosts.map((post: any) => (
              <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group">
                <div className="aspect-square bg-gradient-to-br from-pink-400 to-rose-500 relative">
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-4 opacity-0 group-hover:opacity-100">
                    <div className="flex items-center gap-1 text-white">
                      <Heart className="w-5 h-5" />
                      <span>{post.likesCount || 0}</span>
                    </div>
                    <div className="flex items-center gap-1 text-white">
                      <MessageCircle className="w-5 h-5" />
                      <span>{post.commentsCount || 0}</span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground">No posts yet</p>
          </Card>
        )}
      </div>
    </div>
  );
}
