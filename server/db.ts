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
    let username = user.username;
    if (!username) {
      const baseUsername =
        user.email?.split("@")[0] ||
        user.name?.replace(/\s+/g, "") ||
        `user_${user.openId.slice(0, 8)}`;
      username = baseUsername;
    }

    // Ensure email is provided
    const email = user.email || `${user.openId}@inqar.local`;

    const values: InsertUser = {
      openId: user.openId,
      username,
      email,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    // PostgreSQL upsert: insert or update on conflict
    await db
      .insert(users)
      .values(values)
      .onConflictDoUpdate({
        target: users.openId,
        set: updateSet,
      });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db
    .select()
    .from(users)
    .where(eq(users.openId, openId))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(users)
    .where(eq(users.id, id))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getUserByUsername(username: string) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(users)
    .where(eq(users.username, username))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getUserByEmail(email: string) {
  try {
    const db = await getDb();
    if (!db) {
      console.error("[Database] Database not available for getUserByEmail");
      return undefined;
    }

    const result = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    return result.length > 0 ? result[0] : undefined;
  } catch (error) {
    console.error("[Database] Error in getUserByEmail:", error);
    return undefined;
  }
}

export async function createUser(data: Partial<InsertUser> & { email: string; passwordHash: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const crypto = await import("crypto");
  const openId = `email_${crypto.randomUUID()}`;

  const result = await db
    .insert(users)
    .values({
      openId,
      email: data.email,
      name: data.name || data.email.split("@")[0],
      username: data.username || data.email.split("@")[0],
      passwordHash: data.passwordHash,
      role: data.role || "user",
    } as InsertUser)
    .returning();

  return result[0];
}

export async function updateUserProfile(
  userId: number,
  updates: Partial<{
    name: string;
    bio: string;
    avatarUrl: string;
    avatarKey: string;
    isPrivate: boolean;
  }>
) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .update(users)
    .set(updates)
    .where(eq(users.id, userId));

  return result;
}

// ============================================================================
// FOLLOW SYSTEM
// ============================================================================

export async function followUser(followerId: number, followingId: number) {
  const db = await getDb();
  if (!db) return undefined;

  // Prevent self-follow
  if (followerId === followingId) {
    throw new Error("Cannot follow yourself");
  }

  const result = await db.insert(follows).values({
    followerId,
    followingId,
  });

  return result;
}

export async function unfollowUser(followerId: number, followingId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .delete(follows)
    .where(
      and(
        eq(follows.followerId, followerId),
        eq(follows.followingId, followingId)
      )
    );

  return result;
}

export async function isFollowing(
  followerId: number,
  followingId: number
): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  const result = await db
    .select()
    .from(follows)
    .where(
      and(
        eq(follows.followerId, followerId),
        eq(follows.followingId, followingId)
      )
    )
    .limit(1);

  return result.length > 0;
}

export async function getFollowersCount(userId: number): Promise<number> {
  const db = await getDb();
  if (!db) return 0;

  const result = await db
    .select()
    .from(follows)
    .where(eq(follows.followingId, userId));

  return result.length;
}

export async function getFollowingCount(userId: number): Promise<number> {
  const db = await getDb();
  if (!db) return 0;

  const result = await db
    .select()
    .from(follows)
    .where(eq(follows.followerId, userId));

  return result.length;
}

// ============================================================================
// VIP SUBSCRIPTIONS
// ============================================================================

export async function getVipSubscription(
  userId: number
): Promise<VipSubscription | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(vipSubscriptions)
    .where(eq(vipSubscriptions.userId, userId))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function createVipSubscription(
  subscription: InsertVipSubscription
) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.insert(vipSubscriptions).values(subscription);
  return result;
}

export async function updateVipSubscription(
  userId: number,
  updates: Partial<VipSubscription>
) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .update(vipSubscriptions)
    .set(updates)
    .where(eq(vipSubscriptions.userId, userId));

  return result;
}

// ============================================================================
// GOVERNMENT VIP APPLICATIONS
// ============================================================================

export async function getGovernmentVipApplication(
  userId: number
): Promise<GovernmentVipApplication | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(governmentVipApplications)
    .where(eq(governmentVipApplications.userId, userId))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function createGovernmentVipApplication(
  application: InsertGovernmentVipApplication
) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .insert(governmentVipApplications)
    .values(application);
  return result;
}

export async function getPendingGovernmentVipApplications() {
  const db = await getDb();
  if (!db) return [];

  const result = await db
    .select()
    .from(governmentVipApplications)
    .where(eq(governmentVipApplications.status, "pending"));

  return result;
}

export async function approveGovernmentVipApplication(applicationId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .update(governmentVipApplications)
    .set({
      status: "approved",
      approvedAt: new Date(),
    })
    .where(eq(governmentVipApplications.id, applicationId));

  return result;
}

export async function declineGovernmentVipApplication(
  applicationId: number,
  reason: string
) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .update(governmentVipApplications)
    .set({
      status: "declined",
      declinedAt: new Date(),
      declineReason: reason,
    })
    .where(eq(governmentVipApplications.id, applicationId));

  return result;
}
