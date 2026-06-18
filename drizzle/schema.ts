import {
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  varchar,
  boolean,
  numeric,
  json,
  uniqueIndex,
  serial,
} from "drizzle-orm/pg-core";

/**
 * INQAR Database Schema
 * Comprehensive schema for social media, marketplace, and VIP features
 */

// ============================================================================
// USERS & AUTHENTICATION
// ============================================================================

export const users = pgTable(
  "users",
  {
    id: serial("id").primaryKey(),
    openId: varchar("openId", { length: 64 }).notNull().unique(),
    username: varchar("username", { length: 255 }).notNull().unique(),
    email: varchar("email", { length: 320 }).notNull().unique(),
    name: text("name"),
    bio: text("bio"),
    avatarUrl: text("avatarUrl"),
    avatarKey: varchar("avatarKey", { length: 255 }),
    isPrivate: boolean("isPrivate").default(false).notNull(),
    role: pgEnum("role", ["user", "admin"])("role").default("user").notNull(),
    loginMethod: varchar("loginMethod", { length: 64 }),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().notNull(),
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

export const follows = pgTable("follows", {
  id: serial("id").primaryKey(),
  followerId: integer("followerId").notNull(),
  followingId: integer("followingId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Follow = typeof follows.$inferSelect;
export type InsertFollow = typeof follows.$inferInsert;

// ============================================================================
// POSTS & SOCIAL CONTENT
// ============================================================================

export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  caption: text("caption"),
  mediaUrls: json("mediaUrls").$type<string[]>().notNull(),
  mediaKeys: json("mediaKeys").$type<string[]>().notNull(),
  hashtags: json("hashtags").$type<string[]>(),
  location: varchar("location", { length: 255 }),
  likesCount: integer("likesCount").default(0).notNull(),
  commentsCount: integer("commentsCount").default(0).notNull(),
  savesCount: integer("savesCount").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Post = typeof posts.$inferSelect;
export type InsertPost = typeof posts.$inferInsert;

export const postLikes = pgTable("postLikes", {
  id: serial("id").primaryKey(),
  postId: integer("postId").notNull(),
  userId: integer("userId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PostLike = typeof postLikes.$inferSelect;
export type InsertPostLike = typeof postLikes.$inferInsert;

export const postComments = pgTable("postComments", {
  id: serial("id").primaryKey(),
  postId: integer("postId").notNull(),
  userId: integer("userId").notNull(),
  parentCommentId: integer("parentCommentId"),
  content: text("content").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type PostComment = typeof postComments.$inferSelect;
export type InsertPostComment = typeof postComments.$inferInsert;

export const postSaves = pgTable("postSaves", {
  id: serial("id").primaryKey(),
  postId: integer("postId").notNull(),
  userId: integer("userId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PostSave = typeof postSaves.$inferSelect;
export type InsertPostSave = typeof postSaves.$inferInsert;

// ============================================================================
// STORIES (24-HOUR EPHEMERAL CONTENT)
// ============================================================================

export const mediaTypeEnum = pgEnum("mediaType", ["image", "video"]);

export const stories = pgTable("stories", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  mediaUrl: text("mediaUrl").notNull(),
  mediaKey: varchar("mediaKey", { length: 255 }).notNull(),
  mediaType: mediaTypeEnum("mediaType").notNull(),
  caption: text("caption"),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Story = typeof stories.$inferSelect;
export type InsertStory = typeof stories.$inferInsert;

export const storyViews = pgTable("storyViews", {
  id: serial("id").primaryKey(),
  storyId: integer("storyId").notNull(),
  viewerId: integer("viewerId").notNull(),
  viewedAt: timestamp("viewedAt").defaultNow().notNull(),
});

export type StoryView = typeof storyViews.$inferSelect;
export type InsertStoryView = typeof storyViews.$inferInsert;

// ============================================================================
// MARKETPLACE (InQ BAZAR)
// ============================================================================

export const marketplaceListings = pgTable("marketplaceListings", {
  id: serial("id").primaryKey(),
  sellerId: integer("sellerId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 100 }).notNull(),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  imageUrls: json("imageUrls").$type<string[]>().notNull(),
  imageKeys: json("imageKeys").$type<string[]>().notNull(),
  stock: integer("stock").default(0).notNull(),
  rating: numeric("rating", { precision: 3, scale: 2 }).default("0"),
  reviewsCount: integer("reviewsCount").default(0).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type MarketplaceListing = typeof marketplaceListings.$inferSelect;
export type InsertMarketplaceListing = typeof marketplaceListings.$inferInsert;

export const orderStatusEnum = pgEnum("orderStatus", ["pending", "processing", "shipped", "delivered", "cancelled"]);

export const marketplaceOrders = pgTable("marketplaceOrders", {
  id: serial("id").primaryKey(),
  buyerId: integer("buyerId").notNull(),
  sellerId: integer("sellerId").notNull(),
  listingId: integer("listingId").notNull(),
  quantity: integer("quantity").notNull(),
  totalPrice: numeric("totalPrice", { precision: 10, scale: 2 }).notNull(),
  status: orderStatusEnum("status").default("pending").notNull(),
  shippingAddress: json("shippingAddress").$type<Record<string, unknown>>(),
  trackingNumber: varchar("trackingNumber", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type MarketplaceOrder = typeof marketplaceOrders.$inferSelect;
export type InsertMarketplaceOrder = typeof marketplaceOrders.$inferInsert;

export const marketplaceReviews = pgTable("marketplaceReviews", {
  id: serial("id").primaryKey(),
  orderId: integer("orderId").notNull(),
  buyerId: integer("buyerId").notNull(),
  sellerId: integer("sellerId").notNull(),
  listingId: integer("listingId").notNull(),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type MarketplaceReview = typeof marketplaceReviews.$inferSelect;
export type InsertMarketplaceReview = typeof marketplaceReviews.$inferInsert;

// ============================================================================
// DIRECT MESSAGING
// ============================================================================

export const conversations = pgTable("conversations", {
  id: serial("id").primaryKey(),
  user1Id: integer("user1Id").notNull(),
  user2Id: integer("user2Id").notNull(),
  lastMessageAt: timestamp("lastMessageAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Conversation = typeof conversations.$inferSelect;
export type InsertConversation = typeof conversations.$inferInsert;

export const messageMediaTypeEnum = pgEnum("messageMediaType", ["image", "video", "file"]);

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversationId").notNull(),
  senderId: integer("senderId").notNull(),
  content: text("content"),
  mediaUrl: text("mediaUrl"),
  mediaKey: varchar("mediaKey", { length: 255 }),
  mediaType: messageMediaTypeEnum("mediaType"),
  isRead: boolean("isRead").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Message = typeof messages.$inferSelect;
export type InsertMessage = typeof messages.$inferInsert;

// ============================================================================
// VIP SUBSCRIPTIONS
// ============================================================================

export const tierEnum = pgEnum("tier", ["regular", "government"]);

export const vipSubscriptions = pgTable("vipSubscriptions", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull().unique(),
  tier: tierEnum("tier").notNull(),
  stripeCustomerId: varchar("stripeCustomerId", { length: 255 }),
  stripeSubscriptionId: varchar("stripeSubscriptionId", { length: 255 }),
  isActive: boolean("isActive").default(true).notNull(),
  startDate: timestamp("startDate").defaultNow().notNull(),
  renewalDate: timestamp("renewalDate"),
  cancelledAt: timestamp("cancelledAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type VipSubscription = typeof vipSubscriptions.$inferSelect;
export type InsertVipSubscription = typeof vipSubscriptions.$inferInsert;

export const govVipStatusEnum = pgEnum("govVipStatus", ["pending", "approved", "declined"]);

export const governmentVipApplications = pgTable("governmentVipApplications", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull().unique(),
  firstName: varchar("firstName", { length: 255 }).notNull(),
  lastName: varchar("lastName", { length: 255 }).notNull(),
  age: integer("age"),
  dateOfBirth: timestamp("dateOfBirth"),
  position: varchar("position", { length: 255 }).notNull(),
  department: varchar("department", { length: 255 }).notNull(),
  reason: text("reason").notNull(),
  idCardUrl: text("idCardUrl").notNull(),
  idCardKey: varchar("idCardKey", { length: 255 }).notNull(),
  status: govVipStatusEnum("status").default("pending").notNull(),
  approvedAt: timestamp("approvedAt"),
  declinedAt: timestamp("declinedAt"),
  declineReason: text("declineReason"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type GovernmentVipApplication = typeof governmentVipApplications.$inferSelect;
export type InsertGovernmentVipApplication = typeof governmentVipApplications.$inferInsert;

// ============================================================================
// NOTIFICATIONS
// ============================================================================

export const notificationTypeEnum = pgEnum("notificationType", ["like", "comment", "follow", "message", "vip_status", "order_update"]);

export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  type: notificationTypeEnum("type").notNull(),
  actorId: integer("actorId"),
  relatedId: integer("relatedId"),
  content: text("content"),
  isRead: boolean("isRead").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

// ============================================================================
// HASHTAGS & SEARCH
// ============================================================================

export const hashtags = pgTable("hashtags", {
  id: serial("id").primaryKey(),
  tag: varchar("tag", { length: 255 }).notNull().unique(),
  usageCount: integer("usageCount").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Hashtag = typeof hashtags.$inferSelect;
export type InsertHashtag = typeof hashtags.$inferInsert;

export const postHashtags = pgTable("postHashtags", {
  id: serial("id").primaryKey(),
  postId: integer("postId").notNull(),
  hashtagId: integer("hashtagId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PostHashtag = typeof postHashtags.$inferSelect;
export type InsertPostHashtag = typeof postHashtags.$inferInsert;

// ============================================================================
// PAYMENTS & TRANSACTIONS
// ============================================================================

export const paymentStatusEnum = pgEnum("paymentStatus", ["pending", "succeeded", "failed", "cancelled"]);

export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  stripePaymentIntentId: varchar("stripePaymentIntentId", { length: 255 }).notNull().unique(),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).default("USD").notNull(),
  status: paymentStatusEnum("status").default("pending").notNull(),
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Payment = typeof payments.$inferSelect;
export type InsertPayment = typeof payments.$inferInsert;
