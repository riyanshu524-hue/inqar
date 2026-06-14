import { eq, desc, and } from "drizzle-orm";
import {
  notifications,
  Notification,
  InsertNotification,
} from "../drizzle/schema";
import { getDb } from "./db";

// ============================================================================
// NOTIFICATIONS
// ============================================================================

export async function createNotification(notification: InsertNotification) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.insert(notifications).values(notification);
  return result;
}

export async function getUserNotifications(userId: number, limit: number = 20) {
  const db = await getDb();
  if (!db) return [];

  const result = await db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, userId))
    .orderBy(desc(notifications.createdAt))
    .limit(limit);

  return result;
}

export async function getUnreadNotifications(userId: number) {
  const db = await getDb();
  if (!db) return [];

  const result = await db
    .select()
    .from(notifications)
    .where(
      and(
        eq(notifications.userId, userId),
        eq(notifications.isRead, false)
      )
    )
    .orderBy(desc(notifications.createdAt));

  return result;
}

export async function markNotificationAsRead(notificationId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .update(notifications)
    .set({ isRead: true })
    .where(eq(notifications.id, notificationId));

  return result;
}

export async function markAllNotificationsAsRead(userId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .update(notifications)
    .set({ isRead: true })
    .where(eq(notifications.userId, userId));

  return result;
}

export async function deleteNotification(notificationId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .delete(notifications)
    .where(eq(notifications.id, notificationId));

  return result;
}

export async function deleteAllNotifications(userId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .delete(notifications)
    .where(eq(notifications.userId, userId));

  return result;
}

// ============================================================================
// NOTIFICATION HELPERS
// ============================================================================

export async function notifyUserOfLike(
  postId: number,
  postOwnerId: number,
  likerId: number
) {
  return createNotification({
    userId: postOwnerId,
    type: "like",
    actorId: likerId,
    relatedId: postId,
    content: "Someone liked your post",
  });
}

export async function notifyUserOfComment(
  postId: number,
  postOwnerId: number,
  commenterId: number,
  commentText: string
) {
  return createNotification({
    userId: postOwnerId,
    type: "comment",
    actorId: commenterId,
    relatedId: postId,
    content: `New comment: ${commentText.substring(0, 50)}...`,
  });
}

export async function notifyUserOfFollow(
  followerId: number,
  followedUserId: number
) {
  return createNotification({
    userId: followedUserId,
    type: "follow",
    actorId: followerId,
    content: "Someone started following you",
  });
}

export async function notifyUserOfMessage(
  recipientId: number,
  senderId: number,
  messagePreview: string
) {
  return createNotification({
    userId: recipientId,
    type: "message",
    actorId: senderId,
    content: messagePreview.substring(0, 100),
  });
}

export async function notifyUserOfVipStatusChange(
  userId: number,
  status: string
) {
  return createNotification({
    userId,
    type: "vip_status",
    content: `Your VIP status has been updated: ${status}`,
  });
}

export async function notifyUserOfOrderUpdate(
  buyerId: number,
  orderId: number,
  status: string
) {
  return createNotification({
    userId: buyerId,
    type: "order_update",
    relatedId: orderId,
    content: `Your order status has been updated to: ${status}`,
  });
}
