import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { ShoppingCart, Plus } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function Marketplace() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: listings, isLoading } = trpc.marketplace.getByCategory.useQuery({
    category: selectedCategory || "all",
    limit: 20,
  });

  const categories = ["Electronics", "Fashion", "Home", "Art", "Books", "Services"];

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">InQ Bazar</h1>
          <p className="text-muted-foreground">Discover amazing products from our community</p>
        </div>
        <Button className="gap-2">
          <Plus className="w-5 h-5" />
          Sell Something
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="mb-8 space-y-4">
        <Input placeholder="Search products..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />

        <div className="flex gap-2 flex-wrap">
          <Button
            variant={selectedCategory === null ? "default" : "outline"}
            onClick={() => setSelectedCategory(null)}
          >
            All
          </Button>
          {categories.map((cat) => (
            <Button
              key={cat}
              variant={selectedCategory === cat ? "default" : "outline"}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </Button>
          ))}
        </div>
      </div>

      {/* Listings Grid */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      ) : listings && listings.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {listings.map((listing: any) => (
            <Card key={listing.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
              <div className="aspect-square bg-gradient-to-br from-amber-400 to-orange-500 mb-3" />
              <div className="p-4">
                <h3 className="font-semibold line-clamp-2 mb-2">{listing.title}</h3>
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{listing.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold">${listing.price}</span>
                  <Button variant="ghost" size="sm">
                    <ShoppingCart className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">No products found</p>
        </Card>
      )}
    </div>
  );
}
