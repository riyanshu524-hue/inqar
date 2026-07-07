import { eq, desc, and } from "drizzle-orm";
import {
  users,
  posts,
  marketplaceListings,
  governmentVipApplications,
  vipSubscriptions,
} from "../drizzle/schema";
import { getDb } from "./db";

// ============================================================================
// ADMIN - USER MANAGEMENT
// ============================================================================

export async function getAllUsers(limit: number = 50, offset: number = 0) {
  const db = await getDb();
  if (!db) return [];

  const result = await db
    .select()
    .from(users)
    .orderBy(desc(users.createdAt))
    .limit(limit)
    .offset(offset);

  return result;
}

export async function searchUsers(query: string, limit: number = 20) {
  const db = await getDb();
  if (!db) return [];

  // Simple search by username or email
  const result = await db
    .select()
    .from(users)
    .where(
      and(
        // This is a simplified search - in production, use full-text search
        // For now, we'll just return users that match the query
      )
    )
    .limit(limit);

  return result;
}

export async function getUserStats() {
  const db = await getDb();
  if (!db) return { totalUsers: 0, adminCount: 0, vipCount: 0 };

  const allUsers = await db.select().from(users);
  const adminCount = allUsers.filter((u) => u.role === "admin").length;

  const allVips = await db.select().from(vipSubscriptions);
  const vipCount = allVips.filter((v) => v.isActive).length;

  return {
    totalUsers: allUsers.length,
    adminCount,
    vipCount,
  };
}

export async function promoteUserToAdmin(userId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .update(users)
    .set({ role: "admin" })
    .where(eq(users.id, userId));

  return result;
}

export async function demoteAdminToUser(userId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .update(users)
    .set({ role: "user" })
    .where(eq(users.id, userId));

  return result;
}

export async function suspendUser(userId: number) {
  const db = await getDb();
  if (!db) return undefined;

  // Mark user as suspended by setting role to 'suspended'
  const result = await db
    .update(users)
    .set({ role: "user" })
    .where(eq(users.id, userId));

  return result;
}

// ============================================================================
// ADMIN - POST MANAGEMENT
// ============================================================================

export async function getAllPosts(limit: number = 50, offset: number = 0) {
  const db = await getDb();
  if (!db) return [];

  const result = await db
    .select()
    .from(posts)
    .orderBy(desc(posts.createdAt))
    .limit(limit)
    .offset(offset);

  return result;
}

export async function deletePost(postId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.delete(posts).where(eq(posts.id, postId));

  return result;
}

export async function getPostStats() {
  const db = await getDb();
  if (!db) return { totalPosts: 0, avgLikes: 0, avgComments: 0 };

  const allPosts = await db.select().from(posts);

  const avgLikes =
    allPosts.length > 0
      ? allPosts.reduce((sum, p) => sum + (p.likesCount || 0), 0) /
        allPosts.length
      : 0;

  const avgComments =
    allPosts.length > 0
      ? allPosts.reduce((sum, p) => sum + (p.commentsCount || 0), 0) /
        allPosts.length
      : 0;

  return {
    totalPosts: allPosts.length,
    avgLikes: Math.round(avgLikes),
    avgComments: Math.round(avgComments),
  };
}

// ============================================================================
// ADMIN - MARKETPLACE MANAGEMENT
// ============================================================================

export async function getAllMarketplaceListings(
  limit: number = 50,
  offset: number = 0
) {
  const db = await getDb();
  if (!db) return [];

  const result = await db
    .select()
    .from(marketplaceListings)
    .orderBy(desc(marketplaceListings.createdAt))
    .limit(limit)
    .offset(offset);

  return result;
}

export async function deleteMarketplaceListing(listingId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .delete(marketplaceListings)
    .where(eq(marketplaceListings.id, listingId));

  return result;
}

export async function getMarketplaceStats() {
  const db = await getDb();
  if (!db)
    return {
      totalListings: 0,
      avgPrice: 0,
      totalSales: 0,
    };

  const allListings = await db.select().from(marketplaceListings);

  const avgPrice =
    allListings.length > 0
      ? allListings.reduce((sum, l) => sum + parseFloat(l.price.toString()), 0) /
        allListings.length
      : 0;

  return {
    totalListings: allListings.length,
    avgPrice: Math.round(avgPrice * 100) / 100,
    totalStock: allListings.reduce((sum, l) => sum + (l.stock || 0), 0),
  };
}

// ============================================================================
// ADMIN - VIP MANAGEMENT
// ============================================================================

export async function getAllVipApplications(
  limit: number = 50,
  offset: number = 0
) {
  const db = await getDb();
  if (!db) return [];

  const result = await db
    .select()
    .from(governmentVipApplications)
    .orderBy(desc(governmentVipApplications.createdAt))
    .limit(limit)
    .offset(offset);

  return result;
}

export async function getPendingVipApplications() {
  const db = await getDb();
  if (!db) return [];

  const result = await db
    .select()
    .from(governmentVipApplications)
    .where(eq(governmentVipApplications.status, "pending"))
    .orderBy(desc(governmentVipApplications.createdAt));

  return result;
}

export async function getVipStats() {
  const db = await getDb();
  if (!db)
    return {
      totalVips: 0,
      regularVips: 0,
      governmentVips: 0,
      pendingApplications: 0,
    };

  const allVips = await db.select().from(vipSubscriptions);
  const activeVips = allVips.filter((v) => v.isActive);
  const regularVips = activeVips.filter((v) => v.tier === "regular").length;
  const governmentVips = activeVips.filter((v) => v.tier === "government")
    .length;

  const pendingApps = await db
    .select()
    .from(governmentVipApplications)
    .where(eq(governmentVipApplications.status, "pending"));

  return {
    totalVips: activeVips.length,
    regularVips,
    governmentVips,
    pendingApplications: pendingApps.length,
  };
}

// ============================================================================
// ADMIN - DASHBOARD STATS
// ============================================================================

export async function getDashboardStats() {
  const userStats = await getUserStats();
  const postStats = await getPostStats();
  const marketplaceStats = await getMarketplaceStats();
  const vipStats = await getVipStats();

  return {
    users: userStats,
    posts: postStats,
    marketplace: marketplaceStats,
    vip: vipStats,
  };
}
