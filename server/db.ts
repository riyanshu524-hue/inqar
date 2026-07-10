import { eq, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import {
  InsertUser,
  users,
  follows,
  User,
  Follow,
  InsertFollow,
  vipSubscriptions,
  VipSubscription,
  InsertVipSubscription,
  governmentVipApplications,
  GovernmentVipApplication,
  InsertGovernmentVipApplication,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;
let _client: ReturnType<typeof postgres> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _client = postgres(process.env.DATABASE_URL);
      _db = drizzle(_client);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
      _client = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    // Generate username from email or name if not provided
    const username =
      user.username ||
      (user.name ? user.name.replace(/\s+/g, "_").toLowerCase() : `user_${Date.now()}`);

    await db
      .insert(users)
      .values({
        ...user,
        username,
      })
      .onConflictDoUpdate({
        target: users.openId,
        set: {
          lastSignedIn: new Date(),
        },
      });
  } catch (error) {
    console.error("[Database] Error upserting user:", error);
    throw error;
  }
}

export async function getUser(id: number): Promise<User | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0] || null;
  } catch (error) {
    console.error("[Database] Error getting user:", error);
    return null;
  }
}

export async function getUserByOpenId(openId: string): Promise<User | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
    return result[0] || null;
  } catch (error) {
    console.error("[Database] Error getting user by openId:", error);
    return null;
  }
}

export async function getFollows(userId: number): Promise<Follow[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    return await db.select().from(follows).where(eq(follows.followerId, userId));
  } catch (error) {
    console.error("[Database] Error getting follows:", error);
    return [];
  }
}

export async function addFollow(followerId: number, followingId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;

  try {
    await db.insert(follows).values({
      followerId,
      followingId,
    });
  } catch (error) {
    console.error("[Database] Error adding follow:", error);
  }
}

export async function removeFollow(followerId: number, followingId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;

  try {
    await db
      .delete(follows)
      .where(and(eq(follows.followerId, followerId), eq(follows.followingId, followingId)));
  } catch (error) {
    console.error("[Database] Error removing follow:", error);
  }
}

export async function getVipSubscription(userId: number): Promise<VipSubscription | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = await db
      .select()
      .from(vipSubscriptions)
      .where(eq(vipSubscriptions.userId, userId))
      .limit(1);
    return result[0] || null;
  } catch (error) {
    console.error("[Database] Error getting VIP subscription:", error);
    return null;
  }
}

export async function createVipSubscription(
  data: InsertVipSubscription
): Promise<VipSubscription | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = await db.insert(vipSubscriptions).values(data).returning();
    return result[0] || null;
  } catch (error) {
    console.error("[Database] Error creating VIP subscription:", error);
    return null;
  }
}

export async function getGovernmentVipApplication(
  userId: number
): Promise<GovernmentVipApplication | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = await db
      .select()
      .from(governmentVipApplications)
      .where(eq(governmentVipApplications.userId, userId))
      .limit(1);
    return result[0] || null;
  } catch (error) {
    console.error("[Database] Error getting government VIP application:", error);
    return null;
  }
}

export async function createGovernmentVipApplication(
  data: InsertGovernmentVipApplication
): Promise<GovernmentVipApplication | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = await db
      .insert(governmentVipApplications)
      .values(data)
      .returning();
    return result[0] || null;
  } catch (error) {
    console.error("[Database] Error creating government VIP application:", error);
    return null;
  }
}

export async function getPendingGovernmentVipApplications(): Promise<GovernmentVipApplication[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    return await db
      .select()
      .from(governmentVipApplications)
      .where(eq(governmentVipApplications.status, "pending"));
  } catch (error) {
    console.error("[Database] Error getting pending VIP applications:", error);
    return [];
  }
}

export async function approveGovernmentVipApplication(id: number): Promise<void> {
  const db = await getDb();
  if (!db) return;

  try {
    await db
      .update(governmentVipApplications)
      .set({
        status: "approved",
        approvedAt: new Date(),
      })
      .where(eq(governmentVipApplications.id, id));
  } catch (error) {
    console.error("[Database] Error approving VIP application:", error);
  }
}

export async function declineGovernmentVipApplication(
  id: number,
  reason: string
): Promise<void> {
  const db = await getDb();
  if (!db) return;

  try {
    await db
      .update(governmentVipApplications)
      .set({
        status: "declined",
        declinedAt: new Date(),
        declineReason: reason,
      })
      .where(eq(governmentVipApplications.id, id));
  } catch (error) {
    console.error("[Database] Error declining VIP application:", error);
  }
}

export async function getFollowersCount(userId: number): Promise<number> {
  const db = await getDb();
  if (!db) return 0;

  try {
    const result = await db
      .select()
      .from(follows)
      .where(eq(follows.followingId, userId));
    return result.length;
  } catch (error) {
    console.error("[Database] Error getting followers count:", error);
    return 0;
  }
}

export async function getFollowingCount(userId: number): Promise<number> {
  const db = await getDb();
  if (!db) return 0;

  try {
    const result = await db
      .select()
      .from(follows)
      .where(eq(follows.followerId, userId));
    return result.length;
  } catch (error) {
    console.error("[Database] Error getting following count:", error);
    return 0;
  }
}

export async function updateUserProfile(
  userId: number,
  data: Partial<User>
): Promise<User | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = await db
      .update(users)
      .set(data)
      .where(eq(users.id, userId))
      .returning();
    return result[0] || null;
  } catch (error) {
    console.error("[Database] Error updating user profile:", error);
    return null;
  }
}

export async function updateVipSubscription(
  id: number,
  data: Partial<VipSubscription>
): Promise<VipSubscription | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = await db
      .update(vipSubscriptions)
      .set(data)
      .where(eq(vipSubscriptions.id, id))
      .returning();
    return result[0] || null;
  } catch (error) {
    console.error("[Database] Error updating VIP subscription:", error);
    return null;
  }
}

export async function getUserByUsername(username: string): Promise<User | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1);
    return result[0] || null;
  } catch (error) {
    console.error("[Database] Error getting user by username:", error);
    return null;
  }
}

export async function followUser(followerId: number, followingId: number): Promise<Follow | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = await db
      .insert(follows)
      .values({
        followerId,
        followingId,
      })
      .returning();
    return result[0] || null;
  } catch (error) {
    console.error("[Database] Error following user:", error);
    return null;
  }
}

export async function unfollowUser(followerId: number, followingId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;

  try {
    await db
      .delete(follows)
      .where(and(eq(follows.followerId, followerId), eq(follows.followingId, followingId)));
  } catch (error) {
    console.error("[Database] Error unfollowing user:", error);
  }
}

export async function isFollowing(followerId: number, followingId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  try {
    const result = await db
      .select()
      .from(follows)
      .where(and(eq(follows.followerId, followerId), eq(follows.followingId, followingId)))
      .limit(1);
    return result.length > 0;
  } catch (error) {
    console.error("[Database] Error checking if following:", error);
    return false;
  }
}
