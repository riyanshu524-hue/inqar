import { eq, desc, and } from "drizzle-orm";
import {
  marketplaceListings,
  marketplaceOrders,
  marketplaceReviews,
  MarketplaceListing,
  InsertMarketplaceListing,
  MarketplaceOrder,
  InsertMarketplaceOrder,
  MarketplaceReview,
  InsertMarketplaceReview,
} from "../drizzle/schema";
import { getDb } from "./db";

// ============================================================================
// MARKETPLACE LISTINGS
// ============================================================================

export async function createListing(listing: InsertMarketplaceListing) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.insert(marketplaceListings).values(listing);
  return result;
}

export async function getListingById(listingId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(marketplaceListings)
    .where(eq(marketplaceListings.id, listingId))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getSellerListings(sellerId: number, limit: number = 20) {
  const db = await getDb();
  if (!db) return [];

  const result = await db
    .select()
    .from(marketplaceListings)
    .where(eq(marketplaceListings.sellerId, sellerId))
    .orderBy(desc(marketplaceListings.createdAt))
    .limit(limit);

  return result;
}

export async function getListingsByCategory(
  category: string,
  limit: number = 20
) {
  const db = await getDb();
  if (!db) return [];

  const result = await db
    .select()
    .from(marketplaceListings)
    .where(eq(marketplaceListings.category, category))
    .orderBy(desc(marketplaceListings.createdAt))
    .limit(limit);

  return result;
}

export async function updateListing(
  listingId: number,
  updates: Partial<MarketplaceListing>
) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .update(marketplaceListings)
    .set(updates)
    .where(eq(marketplaceListings.id, listingId));

  return result;
}

export async function deleteListing(listingId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .delete(marketplaceListings)
    .where(eq(marketplaceListings.id, listingId));

  return result;
}

// ============================================================================
// MARKETPLACE ORDERS
// ============================================================================

export async function createOrder(order: InsertMarketplaceOrder) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.insert(marketplaceOrders).values(order);
  return result;
}

export async function getOrderById(orderId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(marketplaceOrders)
    .where(eq(marketplaceOrders.id, orderId))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getBuyerOrders(buyerId: number, limit: number = 20) {
  const db = await getDb();
  if (!db) return [];

  const result = await db
    .select()
    .from(marketplaceOrders)
    .where(eq(marketplaceOrders.buyerId, buyerId))
    .orderBy(desc(marketplaceOrders.createdAt))
    .limit(limit);

  return result;
}

export async function getSellerOrders(sellerId: number, limit: number = 20) {
  const db = await getDb();
  if (!db) return [];

  const result = await db
    .select()
    .from(marketplaceOrders)
    .where(eq(marketplaceOrders.sellerId, sellerId))
    .orderBy(desc(marketplaceOrders.createdAt))
    .limit(limit);

  return result;
}

export async function updateOrderStatus(
  orderId: number,
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled"
) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .update(marketplaceOrders)
    .set({ status })
    .where(eq(marketplaceOrders.id, orderId));

  return result;
}

// ============================================================================
// MARKETPLACE REVIEWS
// ============================================================================

export async function createReview(review: InsertMarketplaceReview) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.insert(marketplaceReviews).values(review);

  // Update listing rating
  const listing = await getListingById(review.listingId);
  if (listing) {
    const allReviews = await db
      .select()
      .from(marketplaceReviews)
      .where(eq(marketplaceReviews.listingId, review.listingId));

  const avgRating =
    allReviews.reduce((sum, r) => sum + (r.rating || 0), 0) /
    allReviews.length;

    await updateListing(review.listingId, {
      rating: avgRating.toString(),
      reviewsCount: allReviews.length,
    });
  }

  return result;
}

export async function getListingReviews(listingId: number) {
  const db = await getDb();
  if (!db) return [];

  const result = await db
    .select()
    .from(marketplaceReviews)
    .where(eq(marketplaceReviews.listingId, listingId))
    .orderBy(desc(marketplaceReviews.createdAt));

  return result;
}

export async function getSellerReviews(sellerId: number) {
  const db = await getDb();
  if (!db) return [];

  const listings = await getSellerListings(sellerId, 1000);
  const listingIds = listings.map((l) => l.id);

  if (listingIds.length === 0) return [];

  const result = await db
    .select()
    .from(marketplaceReviews)
    .where(eq(marketplaceReviews.listingId, listingIds[0]))
    .orderBy(desc(marketplaceReviews.createdAt));

  return result;
}

export async function deleteReview(reviewId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .delete(marketplaceReviews)
    .where(eq(marketplaceReviews.id, reviewId));

  return result;
}

// ============================================================================
// MARKETPLACE STATS
// ============================================================================

export async function getSellerStats(sellerId: number) {
  const db = await getDb();
  if (!db) return null;

  const listings = await getSellerListings(sellerId, 1000);
  const orders = await getSellerOrders(sellerId, 1000);
  const reviews = await getSellerReviews(sellerId);

  const totalSales = orders
    .filter((o) => o.status === "delivered")
    .reduce((sum, o) => sum + (parseFloat(o.totalPrice) || 0), 0);

  const avgRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length
      : 0;

  return {
    totalListings: listings.length,
    totalOrders: orders.length,
    totalSales,
    avgRating,
    reviewCount: reviews.length,
  };
}
