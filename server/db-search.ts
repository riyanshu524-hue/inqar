import { like, desc, eq } from "drizzle-orm";
import { users, posts, hashtags } from "../drizzle/schema";
import { getDb } from "./db";

// ============================================================================
// USER SEARCH
// ============================================================================

export async function searchUsers(query: string, limit: number = 20) {
  const db = await getDb();
  if (!db) return [];

  const searchQuery = `%${query}%`;

  const result = await db
    .select()
    .from(users)
    .where(like(users.username, searchQuery))
    .limit(limit);

  return result;
}

export async function searchUsersByName(query: string, limit: number = 20) {
  const db = await getDb();
  if (!db) return [];

  const searchQuery = `%${query}%`;

  const result = await db
    .select()
    .from(users)
    .where(like(users.name, searchQuery))
    .limit(limit);

  return result;
}

// ============================================================================
// POST SEARCH
// ============================================================================

export async function searchPosts(query: string, limit: number = 20) {
  const db = await getDb();
  if (!db) return [];

  const searchQuery = `%${query}%`;

  const result = await db
    .select()
    .from(posts)
    .where(like(posts.caption, searchQuery))
    .orderBy(desc(posts.createdAt))
    .limit(limit);

  return result;
}

// ============================================================================
// HASHTAG SEARCH
// ============================================================================

export async function searchHashtags(query: string, limit: number = 20) {
  const db = await getDb();
  if (!db) return [];

  const searchQuery = `%${query.toLowerCase().replace(/^#/, "")}%`;

  const result = await db
    .select()
    .from(hashtags)
    .where(like(hashtags.tag, searchQuery))
    .orderBy(desc(hashtags.usageCount))
    .limit(limit);

  return result;
}

// ============================================================================
// TRENDING
// ============================================================================

export async function getTrendingPosts(limit: number = 20) {
  const db = await getDb();
  if (!db) return [];

  // Get posts with most likes in the last 7 days
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const result = await db
    .select()
    .from(posts)
    .orderBy(desc(posts.likesCount))
    .limit(limit);

  return result;
}

export async function getTrendingUsers(limit: number = 10) {
  const db = await getDb();
  if (!db) return [];

  // Get users with most followers
  // This would require a join with the follows table
  // For now, return recent active users
  const result = await db
    .select()
    .from(users)
    .orderBy(desc(users.lastSignedIn))
    .limit(limit);

  return result;
}

export async function getTrendingHashtags(limit: number = 10) {
  const db = await getDb();
  if (!db) return [];

  const result = await db
    .select()
    .from(hashtags)
    .orderBy(desc(hashtags.usageCount))
    .limit(limit);

  return result;
}

// ============================================================================
// RECOMMENDATIONS
// ============================================================================

export async function getRecommendedUsers(
  currentUserId: number,
  limit: number = 10
) {
  const db = await getDb();
  if (!db) return [];

  // Get users that the current user is not following
  // Exclude the current user
  const result = await db
    .select()
    .from(users)
    .where(eq(users.id, currentUserId))
    .limit(limit);

  // TODO: Implement proper recommendation algorithm
  return result;
}
