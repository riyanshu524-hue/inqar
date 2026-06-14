import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Search, Flame } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function Explore() {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: trendingPosts, isLoading: trendingLoading } = trpc.explore.getTrendingPosts.useQuery({
    limit: 12,
  });

  const { data: searchResults, isLoading: searchLoading } = trpc.search.globalSearch.useQuery(
    { query: searchQuery },
    { enabled: searchQuery.length > 0 }
  );

  const allResults = searchResults ? [...searchResults.posts, ...searchResults.users, ...searchResults.hashtags] : [];

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      {/* Search Bar */}
      <div className="mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search posts, users, or hashtags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Search Results */}
      {searchQuery ? (
        <div>
          <h2 className="text-2xl font-bold mb-6">Search Results</h2>
          {searchLoading ? (
            <div className="flex justify-center py-12">
              <Spinner />
            </div>
          ) : allResults.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {allResults.map((result: any) => (
                <Card key={result.id} className="p-4 hover:shadow-lg transition-shadow cursor-pointer">
                  <div className="aspect-square bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg mb-3" />
                  <h3 className="font-semibold truncate">{result.title || result.name || result.tag}</h3>
                  <p className="text-sm text-muted-foreground truncate">
                    {result.description || result.bio || ""}
                  </p>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">No results found</p>
            </Card>
          )}
        </div>
      ) : (
        <div>
          {/* Trending Section */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-6">
              <Flame className="w-6 h-6 text-orange-500" />
              <h2 className="text-2xl font-bold">Trending Now</h2>
            </div>

            {trendingLoading ? (
              <div className="flex justify-center py-12">
                <Spinner />
              </div>
            ) : trendingPosts && trendingPosts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {trendingPosts.map((post: any) => (
                  <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                    <div className="aspect-square bg-gradient-to-br from-pink-400 to-rose-500 mb-3" />
                    <div className="p-4">
                      <p className="font-semibold line-clamp-2 mb-2">{post.caption}</p>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>❤️ {post.likesCount || 0}</span>
                        <span>💬 {post.commentsCount || 0}</span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-12 text-center">
                <p className="text-muted-foreground">No trending posts yet</p>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
