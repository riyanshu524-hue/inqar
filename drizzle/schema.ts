import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  boolean,
  decimal,
  json,
  longtext,
  uniqueIndex,
} from "drizzle-orm/mysql-core";

/**
 * INQAR Database Schema
 * Comprehensive schema for social media, marketplace, and VIP features
 */

// ============================================================================
// USERS & AUTHENTICATION
// ============================================================================

export const users = mysqlTable(
  "users",
  {
    id: int("id").autoincrement().primaryKey(),
    openId: varchar("openId", { length: 64 }).notNull().unique(),
    username: varchar("username", { length: 255 }).notNull().unique(),
    email: varchar("email", { length: 320 }).notNull().unique(),
    name: text("name"),
    bio: text("bio"),
    avatarUrl: text("avatarUrl"),
    avatarKey: varchar("avatarKey", { length: 255 }),
    isPrivate: boolean("isPrivate").default(false).notNull(),
    role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
    loginMethod: varchar("loginMethod", { length: 64 }),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
    lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
  },
  (table) => ({
    usernameIdx: uniqueIndex("username_idx").on(table.username),
    emailIdx: uniqueIndex("email_idx").on(table.email),
  })
);

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ============================================================================
// FOLLOW SYSTEM
// ============================================================================

export const follows = mysqlTable("follows", {
  id: int("id").autoincrement().primaryKey(),
  followerId: int("followerId").notNull(),
  followingId: int("followingId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Follow = typeof follows.$inferSelect;
export type InsertFollow = typeof follows.$inferInsert;

// ============================================================================
// POSTS & SOCIAL CONTENT
// ============================================================================

export const posts = mysqlTable("posts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  caption: text("caption"),
  mediaUrls: json("mediaUrls").$type<string[]>().notNull(),
  mediaKeys: json("mediaKeys").$type<string[]>().notNull(),
  hashtags: json("hashtags").$type<string[]>(),
  location: varchar("location", { length: 255 }),
  likesCount: int("likesCount").default(0).notNull(),
  commentsCount: int("commentsCount").default(0).notNull(),
  savesCount: int("savesCount").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Post = typeof posts.$inferSelect;
export type InsertPost = typeof posts.$inferInsert;

export const postLikes = mysqlTable("postLikes", {
  id: int("id").autoincrement().primaryKey(),
  postId: int("postId").notNull(),
  userId: int("userId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PostLike = typeof postLikes.$inferSelect;
export type InsertPostLike = typeof postLikes.$inferInsert;

export const postComments = mysqlTable("postComments", {
  id: int("id").autoincrement().primaryKey(),
  postId: int("postId").notNull(),
  userId: int("userId").notNull(),
  parentCommentId: int("parentCommentId"),
  content: text("content").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PostComment = typeof postComments.$inferSelect;
export type InsertPostComment = typeof postComments.$inferInsert;

export const postSaves = mysqlTable("postSaves", {
  id: int("id").autoincrement().primaryKey(),
  postId: int("postId").notNull(),
  userId: int("userId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PostSave = typeof postSaves.$inferSelect;
export type InsertPostSave = typeof postSaves.$inferInsert;

// ============================================================================
// STORIES (24-HOUR EPHEMERAL CONTENT)
// ============================================================================

export const stories = mysqlTable("stories", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  mediaUrl: text("mediaUrl").notNull(),
  mediaKey: varchar("mediaKey", { length: 255 }).notNull(),
  mediaType: mysqlEnum("mediaType", ["image", "video"]).notNull(),
  caption: text("caption"),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Story = typeof stories.$inferSelect;
export type InsertStory = typeof stories.$inferInsert;

export const storyViews = mysqlTable("storyViews", {
  id: int("id").autoincrement().primaryKey(),
  storyId: int("storyId").notNull(),
  viewerId: int("viewerId").notNull(),
  viewedAt: timestamp("viewedAt").defaultNow().notNull(),
});

export type StoryView = typeof storyViews.$inferSelect;
export type InsertStoryView = typeof storyViews.$inferInsert;

// ============================================================================
// MARKETPLACE (InQ BAZAR)
// ============================================================================

export const marketplaceListings = mysqlTable("marketplaceListings", {
  id: int("id").autoincrement().primaryKey(),
  sellerId: int("sellerId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 100 }).notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  imageUrls: json("imageUrls").$type<string[]>().notNull(),
  imageKeys: json("imageKeys").$type<string[]>().notNull(),
  stock: int("stock").default(0).notNull(),
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0"),
  reviewsCount: int("reviewsCount").default(0).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type MarketplaceListing = typeof marketplaceListings.$inferSelect;
export type InsertMarketplaceListing = typeof marketplaceListings.$inferInsert;

export const marketplaceOrders = mysqlTable("marketplaceOrders", {
  id: int("id").autoincrement().primaryKey(),
  buyerId: int("buyerId").notNull(),
  sellerId: int("sellerId").notNull(),
  listingId: int("listingId").notNull(),
  quantity: int("quantity").notNull(),
  totalPrice: decimal("totalPrice", { precision: 10, scale: 2 }).notNull(),
  status: mysqlEnum("status", ["pending", "processing", "shipped", "delivered", "cancelled"]).default("pending").notNull(),
  shippingAddress: json("shippingAddress").$type<Record<string, unknown>>(),
  trackingNumber: varchar("trackingNumber", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type MarketplaceOrder = typeof marketplaceOrders.$inferSelect;
export type InsertMarketplaceOrder = typeof marketplaceOrders.$inferInsert;

export const marketplaceReviews = mysqlTable("marketplaceReviews", {
  id: int("id").autoincrement().primaryKey(),
  orderId: int("orderId").notNull(),
  buyerId: int("buyerId").notNull(),
  sellerId: int("sellerId").notNull(),
  listingId: int("listingId").notNull(),
  rating: int("rating").notNull(),
  comment: text("comment"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type MarketplaceReview = typeof marketplaceReviews.$inferSelect;
export type InsertMarketplaceReview = typeof marketplaceReviews.$inferInsert;

// ============================================================================
// DIRECT MESSAGING
// ============================================================================

export const conversations = mysqlTable("conversations", {
  id: int("id").autoincrement().primaryKey(),
  user1Id: int("user1Id").notNull(),
  user2Id: int("user2Id").notNull(),
  lastMessageAt: timestamp("lastMessageAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Conversation = typeof conversations.$inferSelect;
export type InsertConversation = typeof conversations.$inferInsert;

export const messages = mysqlTable("messages", {
  id: int("id").autoincrement().primaryKey(),
  conversationId: int("conversationId").notNull(),
  senderId: int("senderId").notNull(),
  content: text("content"),
  mediaUrl: text("mediaUrl"),
  mediaKey: varchar("mediaKey", { length: 255 }),
  mediaType: mysqlEnum("mediaType", ["image", "video", "file"]),
  isRead: boolean("isRead").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Message = typeof messages.$inferSelect;
export type InsertMessage = typeof messages.$inferInsert;

// ============================================================================
// VIP SUBSCRIPTIONS
// ============================================================================

export const vipSubscriptions = mysqlTable("vipSubscriptions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  tier: mysqlEnum("tier", ["regular", "government"]).notNull(),
  stripeCustomerId: varchar("stripeCustomerId", { length: 255 }),
  stripeSubscriptionId: varchar("stripeSubscriptionId", { length: 255 }),
  isActive: boolean("isActive").default(true).notNull(),
  startDate: timestamp("startDate").defaultNow().notNull(),
  renewalDate: timestamp("renewalDate"),
  cancelledAt: timestamp("cancelledAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type VipSubscription = typeof vipSubscriptions.$inferSelect;
export type InsertVipSubscription = typeof vipSubscriptions.$inferInsert;

export const governmentVipApplications = mysqlTable("governmentVipApplications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  firstName: varchar("firstName", { length: 255 }).notNull(),
  lastName: varchar("lastName", { length: 255 }).notNull(),
  age: int("age"),
  dateOfBirth: timestamp("dateOfBirth"),
  position: varchar("position", { length: 255 }).notNull(),
  department: varchar("department", { length: 255 }).notNull(),
  reason: text("reason").notNull(),
  idCardUrl: text("idCardUrl").notNull(),
  idCardKey: varchar("idCardKey", { length: 255 }).notNull(),
  status: mysqlEnum("status", ["pending", "approved", "declined"]).default("pending").notNull(),
  approvedAt: timestamp("approvedAt"),
  declinedAt: timestamp("declinedAt"),
  declineReason: text("declineReason"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type GovernmentVipApplication = typeof governmentVipApplications.$inferSelect;
export type InsertGovernmentVipApplication = typeof governmentVipApplications.$inferInsert;

// ============================================================================
// NOTIFICATIONS
// ============================================================================

export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  type: mysqlEnum("type", ["like", "comment", "follow", "message", "vip_status", "order_update"]).notNull(),
  actorId: int("actorId"),
  relatedId: int("relatedId"),
  content: text("content"),
  isRead: boolean("isRead").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

// ============================================================================
// HASHTAGS & SEARCH
// ============================================================================

export const hashtags = mysqlTable("hashtags", {
  id: int("id").autoincrement().primaryKey(),
  tag: varchar("tag", { length: 255 }).notNull().unique(),
  usageCount: int("usageCount").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Hashtag = typeof hashtags.$inferSelect;
export type InsertHashtag = typeof hashtags.$inferInsert;

export const postHashtags = mysqlTable("postHashtags", {
  id: int("id").autoincrement().primaryKey(),
  postId: int("postId").notNull(),
  hashtagId: int("hashtagId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PostHashtag = typeof postHashtags.$inferSelect;
export type InsertPostHashtag = typeof postHashtags.$inferInsert;

// ============================================================================
// PAYMENTS & TRANSACTIONS
// ============================================================================

export const payments = mysqlTable("payments", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  stripePaymentIntentId: varchar("stripePaymentIntentId", { length: 255 }).notNull().unique(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).default("USD").notNull(),
  status: mysqlEnum("status", ["pending", "succeeded", "failed", "cancelled"]).default("pending").notNull(),
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Payment = typeof payments.$inferSelect;
export type InsertPayment = typeof payments.$inferInsert;