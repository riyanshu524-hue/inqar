import { eq, desc, and, or } from "drizzle-orm";
import {
  conversations,
  messages,
  Conversation,
  InsertConversation,
  Message,
  InsertMessage,
} from "../drizzle/schema";
import { getDb } from "./db";

// ============================================================================
// CONVERSATIONS
// ============================================================================

export async function createConversation(conversation: InsertConversation) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.insert(conversations).values(conversation);
  return result;
}

export async function getConversationById(conversationId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(conversations)
    .where(eq(conversations.id, conversationId))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getUserConversations(userId: number, limit: number = 20) {
  const db = await getDb();
  if (!db) return [];

  const result = await db
    .select()
    .from(conversations)
    .where(
      or(
        eq(conversations.user1Id, userId),
        eq(conversations.user2Id, userId)
      )
    )
    .orderBy(desc(conversations.lastMessageAt))
    .limit(limit);

  return result;
}

export async function getConversationBetween(
  userId1: number,
  userId2: number
) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(conversations)
    .where(
      or(
        and(
          eq(conversations.user1Id, userId1),
          eq(conversations.user2Id, userId2)
        ),
        and(
          eq(conversations.user1Id, userId2),
          eq(conversations.user2Id, userId1)
        )
      )
    )
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function updateConversationLastMessage(
  conversationId: number,
  lastMessageAt: Date
) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .update(conversations)
    .set({ lastMessageAt })
    .where(eq(conversations.id, conversationId));

  return result;
}

// ============================================================================
// MESSAGES
// ============================================================================

export async function createMessage(message: InsertMessage) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.insert(messages).values(message);

  // Update conversation's last message timestamp
  await updateConversationLastMessage(message.conversationId, new Date());

  return result;
}

export async function getConversationMessages(
  conversationId: number,
  limit: number = 50
) {
  const db = await getDb();
  if (!db) return [];

  const result = await db
    .select()
    .from(messages)
    .where(eq(messages.conversationId, conversationId))
    .orderBy(desc(messages.createdAt))
    .limit(limit);

  return result.reverse(); // Return in chronological order
}

export async function getMessageById(messageId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(messages)
    .where(eq(messages.id, messageId))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function deleteMessage(messageId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.delete(messages).where(eq(messages.id, messageId));
  return result;
}

export async function updateMessage(
  messageId: number,
  updates: Partial<Message>
) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .update(messages)
    .set(updates)
    .where(eq(messages.id, messageId));

  return result;
}
