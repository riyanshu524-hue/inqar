import { eq, desc, and } from "drizzle-orm";
import {
  posts,
  postLikes,
  postComments,
  postSaves,
  stories,
  storyViews,
  hashtags,
  postHashtags,
  Post,
  InsertPost,
  PostLike,
  InsertPostLike,
  PostComment,
  InsertPostComment,
  Story,
  InsertStory,
  StoryView,
  InsertStoryView,
  Hashtag,
  InsertHashtag,
  PostHashtag,
  InsertPostHashtag,
} from "../drizzle/schema";
import { getDb } from "./db";

// ============================================================================
// POSTS
// ============================================================================

export async function createPost(post: InsertPost) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.insert(posts).values(post);
  return result;
}

export async function getPostById(postId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(posts)
    .where(eq(posts.id, postId))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getUserPosts(userId: number, limit: number = 20) {
  const db = await getDb();
  if (!db) return [];

  const result = await db
    .select()
    .from(posts)
    .where(eq(posts.userId, userId))
    .orderBy(desc(posts.createdAt))
    .limit(limit);

  return result;
}

export async function getFeedPosts(
  userId: number,
  followingIds: number[],
  limit: number = 20
) {
  const db = await getDb();
  if (!db) return [];

  // Get posts from followed users and user's own posts
  const allPostIds = [...followingIds, userId];

  const result = await db
    .select()
    .from(posts)
    .where(eq(posts.userId, allPostIds[0]))
    .orderBy(desc(posts.createdAt))
    .limit(limit);

  // TODO: Implement proper feed algorithm with pagination
  return result;
}

export async function deletePost(postId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.delete(posts).where(eq(posts.id, postId));
  return result;
}

// ============================================================================
// POST LIKES
// ============================================================================

export async function likePost(postId: number, userId: number) {
  const db = await getDb();
  if (!db) return undefined;

  // Check if already liked
  const existing = await db
    .select()
    .from(postLikes)
    .where(and(eq(postLikes.postId, postId), eq(postLikes.userId, userId)))
    .limit(1);

  if (existing.length > 0) {
    throw new Error("Already liked this post");
  }

  const result = await db.insert(postLikes).values({
    postId,
    userId,
  });

  // Update like count
  const currentPost = await getPostById(postId);
  if (currentPost) {
    await db
      .update(posts)
      .set({ likesCount: (currentPost.likesCount || 0) + 1 })
      .where(eq(posts.id, postId));
  }

  return result;
}

export async function unlikePost(postId: number, userId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .delete(postLikes)
    .where(and(eq(postLikes.postId, postId), eq(postLikes.userId, userId)));

  // Update like count
  const currentPost = await getPostById(postId);
  if (currentPost) {
    await db
      .update(posts)
      .set({ likesCount: Math.max(0, (currentPost.likesCount || 0) - 1) })
      .where(eq(posts.id, postId));
  }

  return result;
}

export async function hasUserLikedPost(
  postId: number,
  userId: number
): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  const result = await db
    .select()
    .from(postLikes)
    .where(and(eq(postLikes.postId, postId), eq(postLikes.userId, userId)))
    .limit(1);

  return result.length > 0;
}

export async function getPostLikesCount(postId: number): Promise<number> {
  const db = await getDb();
  if (!db) return 0;

  const result = await db
    .select()
    .from(postLikes)
    .where(eq(postLikes.postId, postId));

  return result.length;
}

// ============================================================================
// POST COMMENTS
// ============================================================================

export async function createComment(comment: InsertPostComment) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.insert(postComments).values(comment);

  // Update comment count
  const currentPost = await getPostById(comment.postId);
  if (currentPost) {
    await db
      .update(posts)
      .set({ commentsCount: (currentPost.commentsCount || 0) + 1 })
      .where(eq(posts.id, comment.postId));
  }

  return result;
}

export async function getPostComments(postId: number) {
  const db = await getDb();
  if (!db) return [];

  const result = await db
    .select()
    .from(postComments)
    .where(eq(postComments.postId, postId))
    .orderBy(desc(postComments.createdAt));

  return result;
}

export async function deleteComment(commentId: number, postId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .delete(postComments)
    .where(eq(postComments.id, commentId));

  // Update comment count
  const currentPost = await getPostById(postId);
  if (currentPost) {
    await db
      .update(posts)
      .set({ commentsCount: Math.max(0, (currentPost.commentsCount || 0) - 1) })
      .where(eq(posts.id, postId));
  }

  return result;
}

// ============================================================================
// POST SAVES
// ============================================================================

export async function savePost(postId: number, userId: number) {
  const db = await getDb();
  if (!db) return undefined;

  // Check if already saved
  const existing = await db
    .select()
    .from(postSaves)
    .where(and(eq(postSaves.postId, postId), eq(postSaves.userId, userId)))
    .limit(1);

  if (existing.length > 0) {
    throw new Error("Already saved this post");
  }

  const result = await db.insert(postSaves).values({
    postId,
    userId,
  });

  // Update save count
  const currentPost = await getPostById(postId);
  if (currentPost) {
    await db
      .update(posts)
      .set({ savesCount: (currentPost.savesCount || 0) + 1 })
      .where(eq(posts.id, postId));
  }

  return result;
}

export async function unsavePost(postId: number, userId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .delete(postSaves)
    .where(and(eq(postSaves.postId, postId), eq(postSaves.userId, userId)));

  // Update save count
  const currentPost = await getPostById(postId);
  if (currentPost) {
    await db
      .update(posts)
      .set({ savesCount: Math.max(0, (currentPost.savesCount || 0) - 1) })
      .where(eq(posts.id, postId));
  }

  return result;
}

export async function hasUserSavedPost(
  postId: number,
  userId: number
): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  const result = await db
    .select()
    .from(postSaves)
    .where(and(eq(postSaves.postId, postId), eq(postSaves.userId, userId)))
    .limit(1);

  return result.length > 0;
}

// ============================================================================
// STORIES
// ============================================================================

export async function createStory(story: InsertStory) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.insert(stories).values(story);
  return result;
}

export async function getUserStories(userId: number) {
  const db = await getDb();
  if (!db) return [];

  const now = new Date();
  const result = await db
    .select()
    .from(stories)
    .where(and(eq(stories.userId, userId), desc(stories.expiresAt)))
    .orderBy(desc(stories.createdAt));

  // Filter out expired stories
  return result.filter((story) => story.expiresAt > now);
}

export async function getStoryById(storyId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(stories)
    .where(eq(stories.id, storyId))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function deleteStory(storyId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.delete(stories).where(eq(stories.id, storyId));
  return result;
}

// ============================================================================
// STORY VIEWS
// ============================================================================

export async function addStoryView(storyId: number, viewerId: number) {
  const db = await getDb();
  if (!db) return undefined;

  // Check if already viewed
  const existing = await db
    .select()
    .from(storyViews)
    .where(
      and(eq(storyViews.storyId, storyId), eq(storyViews.viewerId, viewerId))
    )
    .limit(1);

  if (existing.length > 0) {
    return existing[0]; // Already viewed
  }

  const result = await db.insert(storyViews).values({
    storyId,
    viewerId,
  });

  return result;
}

export async function getStoryViewers(storyId: number) {
  const db = await getDb();
  if (!db) return [];

  const result = await db
    .select()
    .from(storyViews)
    .where(eq(storyViews.storyId, storyId))
    .orderBy(desc(storyViews.viewedAt));

  return result;
}

export async function getStoryViewsCount(storyId: number): Promise<number> {
  const db = await getDb();
  if (!db) return 0;

  const result = await db
    .select()
    .from(storyViews)
    .where(eq(storyViews.storyId, storyId));

  return result.length;
}

// ============================================================================
// HASHTAGS
// ============================================================================

export async function getOrCreateHashtag(tag: string) {
  const db = await getDb();
  if (!db) return undefined;

  const normalizedTag = tag.toLowerCase().replace(/^#/, "");

  const existing = await db
    .select()
    .from(hashtags)
    .where(eq(hashtags.tag, normalizedTag))
    .limit(1);

  if (existing.length > 0) {
    return existing[0];
  }

  const result = await db.insert(hashtags).values({
    tag: normalizedTag,
  });

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

export async function getHashtagByName(tag: string) {
  const db = await getDb();
  if (!db) return undefined;

  const normalizedTag = tag.toLowerCase().replace(/^#/, "");

  const result = await db
    .select()
    .from(hashtags)
    .where(eq(hashtags.tag, normalizedTag))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getPostsByHashtag(hashtagId: number, limit: number = 20) {
  const db = await getDb();
  if (!db) return [];

  const postIds = await db
    .select()
    .from(postHashtags)
    .where(eq(postHashtags.hashtagId, hashtagId));

  if (postIds.length === 0) return [];

  const result = await db
    .select()
    .from(posts)
    .where(eq(posts.id, postIds[0].postId))
    .orderBy(desc(posts.createdAt))
    .limit(limit);

  return result;
}
