import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Heart, MessageCircle, Share2, Bookmark } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useState } from "react";

export default function Feed() {
  const { user, isAuthenticated, loading } = useAuth();
  const [selectedPost, setSelectedPost] = useState<number | null>(null);

  const { data: feedData, isLoading: postsLoading } = trpc.posts.getFeedPosts.useQuery(
    { limit: 20 },
    { enabled: isAuthenticated }
  );

  // Personalized feed: Filter posts from followed users only
  const posts = feedData?.filter((post: any) => post.author?.isFollowed !== false) || [];

  const likePostMutation = trpc.likes.likePost.useMutation();
  const savePostMutation = trpc.saves.savePost.useMutation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <h1 className="text-3xl font-bold">Welcome to INQAR</h1>
        <p className="text-muted-foreground">Sign in to see your feed</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <div className="space-y-6">
        {/* Post Creation Card */}
        <Card className="p-6">
          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500" />
            <div className="flex-1">
              <Button variant="outline" className="w-full justify-start text-muted-foreground">
                What's on your mind?
              </Button>
              <div className="flex gap-2 mt-4">
                <Button variant="ghost" size="sm">
                  📸 Photo
                </Button>
                <Button variant="ghost" size="sm">
                  🎥 Video
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Posts Feed */}
        {postsLoading ? (
          <div className="flex justify-center py-12">
            <Spinner />
          </div>
        ) : posts.length > 0 ? (
          posts.map((post: any) => (
            <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              {/* Post Header */}
              <div className="p-4 border-b flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-rose-500" />
                <div className="flex-1">
                  <p className="font-semibold">User {post.userId}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(post.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Post Content */}
              <div className="p-4">
                <p className="text-foreground mb-3">{post.caption}</p>

                {/* Post Images */}
                {post.imageUrls && post.imageUrls.length > 0 && (
                  <div className="grid grid-cols-2 gap-2 mb-4 rounded-lg overflow-hidden">
                    {post.imageUrls.map((url: string, idx: number) => (
                      <img
                        key={idx}
                        src={url}
                        alt={`Post image ${idx + 1}`}
                        className="w-full h-48 object-cover"
                      />
                    ))}
                  </div>
                )}

                {/* Post Stats */}
                <div className="flex justify-between text-sm text-muted-foreground mb-3 px-2">
                  <span>{post.likesCount || 0} likes</span>
                  <span>{post.commentsCount || 0} comments</span>
                </div>
              </div>

              {/* Post Actions */}
              <div className="border-t p-2 flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex-1 justify-center gap-2"
                  onClick={() => {
                    likePostMutation.mutate({
                      postId: post.id,
                    });
                  }}
                >
                  <Heart className="w-5 h-5" />
                  Like
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex-1 justify-center gap-2"
                  onClick={() => setSelectedPost(post.id)}
                >
                  <MessageCircle className="w-5 h-5" />
                  Comment
                </Button>
                <Button variant="ghost" size="sm" className="flex-1 justify-center gap-2">
                  <Share2 className="w-5 h-5" />
                  Share
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex-1 justify-center gap-2"
                  onClick={() => {
                    savePostMutation.mutate({
                      postId: post.id,
                    });
                  }}
                >
                  <Bookmark className="w-5 h-5" />
                  Save
                </Button>
              </div>
            </Card>
          ))
        ) : (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground">No posts yet. Follow users to see their posts!</p>
          </Card>
        )}
      </div>
    </div>
  );
}
